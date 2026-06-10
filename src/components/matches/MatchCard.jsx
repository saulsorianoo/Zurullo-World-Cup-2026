import { useState, useEffect } from 'react';
import { Lock, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import { db } from '../../lib/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { isMatchLocked } from '../../data/matches';
import { getTeamById } from '../../data/teams';
import { isKnockoutPhase, getColorClass, PHASE_LABELS } from '../../lib/scoring';
import useAuthStore from '../../store/authStore';
import PredictionGrid from './PredictionGrid';

export default function MatchCard({ match, allProfiles, predictions }) {
  const { user, profile } = useAuthStore();
  const [myPred, setMyPred] = useState({ home: '', away: '', qualifierId: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const locked = isMatchLocked(match.kickoff);
  const hasResult = match.homeScore !== undefined && match.homeScore !== null;
  const homeTeam = getTeamById(match.home);
  const awayTeam = getTeamById(match.away);
  const isKnockout = isKnockoutPhase(match.phase);

  // Load own prediction
  useEffect(() => {
    if (!user) return;
    const predKey = predictions?.[user.uid];
    if (predKey) {
      setMyPred({
        home: predKey.home !== undefined ? String(predKey.home) : '',
        away: predKey.away !== undefined ? String(predKey.away) : '',
        qualifierId: predKey.qualifierId || '',
      });
    }
  }, [predictions, user]);

  const savePrediction = async () => {
    if (!user || locked) return;
    if (myPred.home === '' || myPred.away === '') return;
    setSaving(true);
    try {
      const predRef = doc(db, 'predictions', `${match.id}_${user.uid}`);
      await setDoc(predRef, {
        matchId:     match.id,
        userId:      user.uid,
        username:    profile?.username || user.email,
        home:        parseInt(myPred.home),
        away:        parseInt(myPred.away),
        qualifierId: myPred.qualifierId || null,
        updatedAt:   new Date().toISOString(),
      }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const phaseLabel = PHASE_LABELS[match.phase] || match.phase;
  const isTBD = match.home === 'TBD' || match.away === 'TBD';

  return (
    <div className={`glass-card overflow-hidden transition-all duration-300 
                     ${hasResult ? 'border-white/15' : ''}`}>
      
      {/* Match Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="badge badge-phase">
              {match.group ? `Grupo ${match.group}` : phaseLabel}
            </span>
            <span className="text-white/40 text-xs">
              🏟️ {match.city}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-white/50 text-xs">
            <Clock size={12} />
            {new Date(match.kickoff).toLocaleTimeString('es-ES', { 
              hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' 
            })} CET
            {locked && <Lock size={12} className="text-orange-400 ml-1" />}
          </div>
        </div>

        {/* Teams & Score */}
        <div className="flex items-center justify-between gap-4">
          {/* Home Team */}
          <div className="flex-1 flex items-center gap-3">
            {homeTeam?.iso2 ? (
              <img 
                src={`https://flagcdn.com/w40/${homeTeam.iso2}.png`} 
                srcSet={`https://flagcdn.com/w80/${homeTeam.iso2}.png 2x`}
                alt={homeTeam.name} 
                className="w-8 rounded-[2px] shadow-sm"
              />
            ) : (
              <span className="text-3xl">{homeTeam?.flag || '🏳️'}</span>
            )}
            <div>
              <div className="font-semibold text-white text-sm sm:text-base">
                {homeTeam?.name || match.home}
              </div>
              <div className="text-white/40 text-xs">{homeTeam?.id}</div>
            </div>
          </div>

          {/* Score / VS */}
          <div className="flex flex-col items-center gap-1">
            {hasResult ? (
              <div className="flex items-center gap-2">
                <span className="text-3xl font-display text-white">{match.homeScore}</span>
                <span className="text-white/30 font-display text-2xl">-</span>
                <span className="text-3xl font-display text-white">{match.awayScore}</span>
              </div>
            ) : (
              <div className="text-white/40 font-display text-xl tracking-widest">VS</div>
            )}
            {isTBD && (
              <div className="text-white/30 text-xs">Por definir</div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex-1 flex items-center gap-3 justify-end text-right">
            <div>
              <div className="font-semibold text-white text-sm sm:text-base">
                {awayTeam?.name || match.away}
              </div>
              <div className="text-white/40 text-xs">{awayTeam?.id}</div>
            </div>
            {awayTeam?.iso2 ? (
              <img 
                src={`https://flagcdn.com/w40/${awayTeam.iso2}.png`} 
                srcSet={`https://flagcdn.com/w80/${awayTeam.iso2}.png 2x`}
                alt={awayTeam.name} 
                className="w-8 rounded-[2px] shadow-sm"
              />
            ) : (
              <span className="text-3xl">{awayTeam?.flag || '🏳️'}</span>
            )}
          </div>
        </div>

        {/* Qualifier info (knockout phases) */}
        {isKnockout && match.qualifierTeamId && (
          <div className="mt-3 flex items-center justify-center gap-2 
                          bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
            <span className="text-blue-400 text-xs">✅ Clasifica:</span>
            <span className="text-white text-sm font-semibold">
              {getTeamById(match.qualifierTeamId)?.flag} {getTeamById(match.qualifierTeamId)?.name}
            </span>
          </div>
        )}
      </div>

      {/* My Prediction */}
      {user && !isTBD && (
        <div className="border-t border-white/5 px-4 py-3 bg-white/2">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-white/50 font-medium">Tu pronóstico</div>
            
            <div className="flex items-center gap-2">
              {/* Home score input */}
              <input
                type="number"
                min="0"
                max="20"
                value={myPred.home}
                onChange={(e) => setMyPred(p => ({ ...p, home: e.target.value }))}
                onBlur={savePrediction}
                disabled={locked}
                placeholder="0"
                className="score-input"
              />
              <span className="text-white/30 font-bold">-</span>
              {/* Away score input */}
              <input
                type="number"
                min="0"
                max="20"
                value={myPred.away}
                onChange={(e) => setMyPred(p => ({ ...p, away: e.target.value }))}
                onBlur={savePrediction}
                disabled={locked}
                placeholder="0"
                className="score-input"
              />

              {/* Qualifier selector (knockout) */}
              {isKnockout && (
                <select
                  value={myPred.qualifierId}
                  onChange={(e) => {
                    setMyPred(p => ({ ...p, qualifierId: e.target.value }));
                    setTimeout(savePrediction, 100);
                  }}
                  disabled={locked}
                  className="ml-2 input-field text-sm py-1.5 px-3 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <option value="">¿Quién clasifica?</option>
                  {homeTeam && <option value={homeTeam.id}>{homeTeam.flag} {homeTeam.name}</option>}
                  {awayTeam && <option value={awayTeam.id}>{awayTeam.flag} {awayTeam.name}</option>}
                </select>
              )}

              {/* Save button */}
              {!locked && (
                <button
                  onClick={savePrediction}
                  disabled={saving || myPred.home === '' || myPred.away === ''}
                  className={`btn-primary text-xs py-2 px-3 disabled:opacity-40 transition-colors duration-300
                              ${saved ? '!bg-green-500 !text-white !border-green-400' : ''}`}
                >
                  {saving ? '...' : saved ? '¡Guardado!' : <CheckCircle size={14} />}
                </button>
              )}
              {locked && (
                <span className="text-orange-400/70 text-xs flex items-center gap-1">
                  <Lock size={12} /> Cerrado
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expand for all predictions */}
      {predictions && (
        <div className="border-t border-white/5">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between px-4 py-2.5 
                       text-white/50 hover:text-white/80 hover:bg-white/3 
                       text-xs transition-all duration-200"
          >
            <span>Ver pronósticos de todos ({Object.keys(predictions).length})</span>
            <ChevronRight 
              size={14} 
              className={`transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
            />
          </button>
          
          {expanded && (
            <div className="px-4 pb-3">
              <PredictionGrid
                predictions={predictions}
                allProfiles={allProfiles}
                hasResult={hasResult}
                realResult={hasResult ? { home: match.homeScore, away: match.awayScore } : null}
                isKnockout={isKnockout}
                realQualifierId={match.qualifierTeamId}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
