import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { 
  Settings, RefreshCw, Check, Users, Trophy,
  Target, DollarSign, Database, Zap, Edit3, Save, X
} from 'lucide-react';
import { MATCHES } from '../data/matches';
import { getTeamById, TEAMS } from '../data/teams';
import { ROULETTE_TEAMS } from '../data/teams';
import { calcMatchPoints, calcQualifierBonus, isKnockoutPhase } from '../lib/scoring';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const { isAdmin } = useAuthStore();
  const navigate    = useNavigate();
  const [tab, setTab]         = useState('matches');
  const [profiles, setProfiles]   = useState([]);
  const [firestoreMatches, setFirestoreMatches] = useState({});
  const [editingMatch, setEditingMatch]   = useState(null);
  const [resultInput, setResultInput]     = useState({ home: '', away: '', qualifierId: '' });
  const [bonusResults, setBonusResults]   = useState({ championId: '', runnerUpId: '', topScorerName: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]   = useState('');

  useEffect(() => {
    if (!isAdmin()) navigate('/');
  }, []);

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, 'profiles'), (snap) => {
      setProfiles(snap.docs.map(d => d.data()));
    });
    const unsub2 = onSnapshot(collection(db, 'matches'), (snap) => {
      const data = {};
      snap.docs.forEach(d => { data[d.id] = d.data(); });
      setFirestoreMatches(data);
    });
    onSnapshot(doc(db, 'config', 'bonusResults'), (snap) => {
      if (snap.exists()) setBonusResults(snap.data());
    });
    return () => { unsub1(); unsub2(); };
  }, []);

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  // Save match result + recalculate all predictions for this match
  const saveMatchResult = async (matchId) => {
    if (!resultInput.home && resultInput.home !== 0) return;
    setSaving(true);
    try {
      const home = parseInt(resultInput.home);
      const away = parseInt(resultInput.away);
      const qualifierId = resultInput.qualifierId || null;
      const matchPhase = MATCHES.find(m => m.id === matchId)?.phase;
      const isKnockout = isKnockoutPhase(matchPhase);

      // Update match document
      await setDoc(doc(db, 'matches', matchId), {
        id: matchId,
        homeScore: home,
        awayScore: away,
        qualifierTeamId: qualifierId,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      // Recalculate points for all predictions of this match
      const predSnap = await import('firebase/firestore').then(({ getDocs, query, where, collection: col }) => 
        getDocs(query(col(db, 'predictions'), where('matchId', '==', matchId)))
      );

      const batch = writeBatch(db);
      const userPointUpdates = {};

      predSnap.forEach(predDoc => {
        const pred = predDoc.data();
        const { points, color } = calcMatchPoints(
          { home: pred.home, away: pred.away },
          { home, away }
        );
        const bonus = isKnockout ? calcQualifierBonus(pred.qualifierId, qualifierId) : 0;
        const totalPts = points + bonus;

        batch.update(predDoc.ref, {
          pointsEarned: totalPts,
          colorResult: color,
          qualifierBonus: bonus,
        });

        if (!userPointUpdates[pred.userId]) userPointUpdates[pred.userId] = 0;
        // We'll need to recalculate total from scratch — just set per-match here
        userPointUpdates[pred.userId] = (userPointUpdates[pred.userId] || 0) + totalPts;
      });

      await batch.commit();

      // Update matchPoints for each user (sum all their predictions)
      await recalcAllUsersMatchPoints();

      setEditingMatch(null);
      showMsg(`✅ Resultado guardado: ${home}-${away}`);
    } finally {
      setSaving(false);
    }
  };

  const recalcAllUsersMatchPoints = async () => {
    const { getDocs, collection: col } = await import('firebase/firestore');
    const predsSnap = await getDocs(col(db, 'predictions'));
    const userPts = {};
    predsSnap.forEach(d => {
      const pred = d.data();
      if (pred.pointsEarned) {
        userPts[pred.userId] = (userPts[pred.userId] || 0) + pred.pointsEarned;
      }
    });

    const profSnap = await getDocs(col(db, 'profiles'));
    const batch2 = writeBatch(db);
    profSnap.forEach(d => {
      const p = d.data();
      const matchPts  = userPts[p.uid] || 0;
      const bonusPts  = p.bonusPoints  || 0;
      const routePts  = p.rouletteGoals || 0;
      batch2.update(d.ref, {
        matchPoints: matchPts,
        totalPoints: matchPts + bonusPts + routePts,
      });
    });
    await batch2.commit();
  };

  // Update roulette goals for a user
  const updateRouletteGoals = async (uid, newGoals) => {
    const profile = profiles.find(p => p.uid === uid);
    if (!profile) return;
    const goals = parseInt(newGoals);
    await updateDoc(doc(db, 'profiles', uid), {
      rouletteGoals: goals,
      totalPoints: (profile.matchPoints || 0) + (profile.bonusPoints || 0) + goals,
    });
    showMsg('✅ Goles de ruleta actualizados');
  };

  // Mark payment
  const togglePayment = async (uid, current) => {
    await updateDoc(doc(db, 'profiles', uid), { entryPaid: !current });
    showMsg(!current ? '✅ Pago marcado' : '❌ Pago desmarcado');
  };

  // Set bonus results
  const saveBonusResults = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'config', 'bonusResults'), {
        ...bonusResults,
        updatedAt: new Date().toISOString(),
      });
      // Recalculate bonus points for all users
      const { getDocs, collection: col } = await import('firebase/firestore');
      const bonusSnap = await getDocs(col(db, 'bonus'));
      const batch = writeBatch(db);
      bonusSnap.forEach(d => {
        const b = d.data();
        const champion  = b.championId === bonusResults.championId ? 10 : 0;
        const runnerUp  = b.runnerUpId === bonusResults.runnerUpId ? 5 : 0;
        const topScorer = b.topScorerName?.trim().toLowerCase() === bonusResults.topScorerName?.trim().toLowerCase() ? 5 : 0;
        const total = champion + runnerUp + topScorer;
        batch.update(doc(db, 'profiles', b.userId), {
          bonusPoints: total,
        });
      });
      await batch.commit();
      await recalcAllUsersMatchPoints();
      showMsg('✅ Resultados bonus guardados y puntos recalculados');
    } finally {
      setSaving(false);
    }
  };

  // Seed all 104 matches to Firestore
  const seedMatches = async () => {
    setSaving(true);
    try {
      const batch = writeBatch(db);
      MATCHES.forEach(m => {
        batch.set(doc(db, 'matches', m.id), { id: m.id, phase: m.phase, group: m.group || null });
      });
      await batch.commit();
      showMsg(`✅ ${MATCHES.length} partidos inicializados en Firestore`);
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: 'matches',  label: 'Resultados', icon: Trophy },
    { id: 'users',    label: 'Usuarios',   icon: Users  },
    { id: 'bonus',    label: 'Bonus',      icon: Target },
    { id: 'roulette', label: 'Ruleta',     icon: Zap    },
    { id: 'setup',    label: 'Setup',      icon: Database },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="glass-card p-6 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20">
        <div className="flex items-center gap-3">
          <Settings className="text-red-400" size={28} />
          <div>
            <h1 className="section-title">Panel de Administración</h1>
            <p className="text-white/50 text-sm">Gestiona resultados, usuarios y puntuación</p>
          </div>
        </div>
      </div>

      {/* Success message */}
      {msg && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 
                        rounded-xl px-4 py-3 text-sm animate-slide-in">
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium 
                        whitespace-nowrap transition-all
                        ${tab === id 
                          ? 'bg-yellow-400 text-dark-900 font-bold' 
                          : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* === TAB: MATCHES === */}
      {tab === 'matches' && (
        <div className="space-y-3">
          <p className="text-white/50 text-sm">
            Introduce el resultado real de cada partido. Los puntos se calculan automáticamente.
          </p>
          {MATCHES.map(match => {
            const fsMatch = firestoreMatches[match.id] || {};
            const hasResult = fsMatch.homeScore !== undefined;
            const isEditing = editingMatch === match.id;
            const homeTeam = getTeamById(match.home);
            const awayTeam = getTeamById(match.away);

            return (
              <div key={match.id} className={`glass-card p-4 ${hasResult ? 'border-green-500/20' : ''}`}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  {/* Match info */}
                  <div className="flex items-center gap-3">
                    <span className="text-white/40 text-xs w-16 shrink-0">{match.date}</span>
                    <span className="text-lg">
                      {homeTeam?.flag || '🏳️'} {homeTeam?.name || match.home}
                    </span>
                    <span className="text-white/40">vs</span>
                    <span className="text-lg">
                      {awayTeam?.name || match.away} {awayTeam?.flag || '🏳️'}
                    </span>
                  </div>

                  {/* Result & Edit */}
                  <div className="flex items-center gap-2">
                    {hasResult && !isEditing && (
                      <span className="font-display text-xl text-green-400">
                        {fsMatch.homeScore} - {fsMatch.awayScore}
                      </span>
                    )}
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <input
                          type="number" min="0" max="20"
                          placeholder="L"
                          value={resultInput.home}
                          onChange={e => setResultInput(p => ({ ...p, home: e.target.value }))}
                          className="w-12 h-9 text-center input-field text-sm px-1"
                        />
                        <span className="text-white/40">-</span>
                        <input
                          type="number" min="0" max="20"
                          placeholder="V"
                          value={resultInput.away}
                          onChange={e => setResultInput(p => ({ ...p, away: e.target.value }))}
                          className="w-12 h-9 text-center input-field text-sm px-1"
                        />
                        {isKnockoutPhase(match.phase) && (
                          <select
                            value={resultInput.qualifierId}
                            onChange={e => setResultInput(p => ({ ...p, qualifierId: e.target.value }))}
                            className="input-field text-sm h-9 py-0"
                          >
                            <option value="">Clasifica...</option>
                            {homeTeam && <option value={homeTeam.id}>{homeTeam.flag} {homeTeam.name}</option>}
                            {awayTeam && <option value={awayTeam.id}>{awayTeam.flag} {awayTeam.name}</option>}
                          </select>
                        )}
                        <button
                          onClick={() => saveMatchResult(match.id)}
                          disabled={saving}
                          className="btn-primary text-xs py-1.5 px-3"
                        >
                          <Save size={13} />
                        </button>
                        <button
                          onClick={() => setEditingMatch(null)}
                          className="btn-secondary text-xs py-1.5 px-2"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingMatch(match.id);
                          setResultInput({
                            home: fsMatch.homeScore ?? '',
                            away: fsMatch.awayScore ?? '',
                            qualifierId: fsMatch.qualifierTeamId || '',
                          });
                        }}
                        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                      >
                        <Edit3 size={12} />
                        {hasResult ? 'Editar' : 'Resultado'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* === TAB: USERS === */}
      {tab === 'users' && (
        <div className="glass-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr className="bg-white/3">
                <th>Usuario</th>
                <th className="text-center">Pagado</th>
                <th className="text-center">Pts Partidos</th>
                <th className="text-center">Pts Bonus</th>
                <th className="text-center">Goles Ruleta</th>
                <th className="text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map(p => (
                <tr key={p.uid}>
                  <td>
                    <div className="font-medium text-white">{p.username}</div>
                    <div className="text-white/40 text-xs">{p.email}</div>
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => togglePayment(p.uid, p.entryPaid)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all
                                  ${p.entryPaid 
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}
                    >
                      {p.entryPaid ? '✓ Pagado' : '✗ Pendiente'}
                    </button>
                  </td>
                  <td className="text-center text-white">{p.matchPoints || 0}</td>
                  <td className="text-center text-white">{p.bonusPoints || 0}</td>
                  <td className="text-center">
                    <input
                      type="number"
                      min="0"
                      defaultValue={p.rouletteGoals || 0}
                      onBlur={(e) => updateRouletteGoals(p.uid, e.target.value)}
                      className="w-16 text-center input-field text-sm py-1"
                    />
                  </td>
                  <td className="text-center font-display text-xl text-yellow-400">
                    {p.totalPoints || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* === TAB: BONUS === */}
      {tab === 'bonus' && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-semibold text-white">Resultados reales de Bonus</h3>
          <div>
            <label className="block text-sm text-white/60 mb-1">Campeón del Mundo</label>
            <select
              value={bonusResults.championId || ''}
              onChange={e => setBonusResults(b => ({ ...b, championId: e.target.value }))}
              className="input-field w-full"
            >
              <option value="">Sin definir</option>
              {TEAMS.map(t => <option key={t.id} value={t.id}>{t.flag} {t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Subcampeón</label>
            <select
              value={bonusResults.runnerUpId || ''}
              onChange={e => setBonusResults(b => ({ ...b, runnerUpId: e.target.value }))}
              className="input-field w-full"
            >
              <option value="">Sin definir</option>
              {TEAMS.map(t => <option key={t.id} value={t.id}>{t.flag} {t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Bota de Oro (nombre exacto)</label>
            <input
              type="text"
              value={bonusResults.topScorerName || ''}
              onChange={e => setBonusResults(b => ({ ...b, topScorerName: e.target.value }))}
              placeholder="Ej: Mbappé"
              className="input-field w-full"
            />
          </div>
          <button onClick={saveBonusResults} disabled={saving} className="btn-primary flex items-center gap-2">
            <Save size={16} />
            Guardar y Recalcular Puntos
          </button>
        </div>
      )}

      {/* === TAB: ROULETTE === */}
      {tab === 'roulette' && (
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-4">
              Actualizar Goles de Selecciones (Manual)
            </h3>
            <p className="text-white/50 text-sm mb-4">
              También puedes actualizar los goles directamente en la pestaña "Usuarios". 
              Aquí puedes actualizar por selección de la ruleta.
            </p>
            {ROULETTE_TEAMS.map(team => {
              const owner = profiles.find(p => p.rouletteTeamId === team.id);
              return (
                <div key={team.id} className="flex items-center gap-3 py-2 border-b border-white/5">
                  <span className="text-2xl">{team.flag}</span>
                  <span className="text-white/80 flex-1">{team.name}</span>
                  {owner ? (
                    <>
                      <span className="text-white/50 text-sm">→ {owner.username}</span>
                      <input
                        type="number"
                        min="0"
                        defaultValue={owner.rouletteGoals || 0}
                        onBlur={(e) => updateRouletteGoals(owner.uid, e.target.value)}
                        className="w-16 text-center input-field text-sm py-1"
                      />
                      <span className="text-white/30 text-xs">goles</span>
                    </>
                  ) : (
                    <span className="text-white/30 text-xs">Sin asignar</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* === TAB: SETUP === */}
      {tab === 'setup' && (
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-semibold text-white">Inicialización de Base de Datos</h3>
          <p className="text-white/50 text-sm">
            Ejecuta esto una vez para crear los documentos de los 104 partidos en Firestore.
          </p>
          <button
            onClick={seedMatches}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            <Database size={16} />
            {saving ? 'Inicializando...' : `Inicializar ${MATCHES.length} Partidos en Firestore`}
          </button>

          <div className="mt-4 p-4 bg-white/3 rounded-xl text-sm text-white/50">
            <div className="font-semibold text-white/70 mb-2">Variables de entorno necesarias:</div>
            <pre className="text-xs text-green-400">
{`VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FDO_API_KEY=... (football-data.org)`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
