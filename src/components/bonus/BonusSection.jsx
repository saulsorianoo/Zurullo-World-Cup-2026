import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { Star, Lock, CheckCircle, Trophy, Award, Footprints } from 'lucide-react';
import { TEAMS } from '../../data/teams';
import useAuthStore from '../../store/authStore';

const BONUS_START = '2026-06-11T22:00:00Z'; // Primer partido del Mundial

export default function BonusSection() {
  const { user, profile } = useAuthStore();
  const [bonus, setBonus] = useState({ championId: '', runnerUpId: '', topScorerName: '', topScorerTeamId: '' });
  const [actualBonus, setActualBonus] = useState(null); // Admin-set results
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const locked = new Date() >= new Date(BONUS_START);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'bonus', user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setBonus({
          championId:     data.championId || '',
          runnerUpId:     data.runnerUpId || '',
          topScorerName:  data.topScorerName || '',
          topScorerTeamId: data.topScorerTeamId || '',
        });
      }
    });

    // Load actual results (set by admin)
    const actualUnsub = onSnapshot(doc(db, 'config', 'bonusResults'), (snap) => {
      if (snap.exists()) setActualBonus(snap.data());
    });

    return () => { unsub(); actualUnsub(); };
  }, [user]);

  const saveBonus = async () => {
    if (!user || locked) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'bonus', user.uid), {
        userId:          user.uid,
        username:        profile?.username || user.email,
        ...bonus,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const teamOptions = TEAMS.map(t => (
    <option key={t.id} value={t.id}>{t.flag} {t.name}</option>
  ));

  const getBonusStatus = (predicted, actual, type) => {
    if (!actualBonus || !actual) return null;
    if (type === 'name') {
      return predicted?.trim().toLowerCase() === actual?.trim().toLowerCase() 
        ? 'correct' : 'wrong';
    }
    return predicted === actual ? 'correct' : 'wrong';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <div className="flex items-center gap-3 mb-2">
          <Star className="text-purple-400" size={28} />
          <h2 className="section-title">Predicciones Bonus</h2>
        </div>
        <p className="text-white/60 text-sm">
          Haz tus predicciones antes del inicio del torneo. 
          Se bloquean automáticamente al empezar el primer partido.
        </p>
        
        {locked && (
          <div className="mt-3 flex items-center gap-2 text-orange-400 text-sm 
                          bg-orange-400/10 rounded-lg px-3 py-2">
            <Lock size={14} />
            Las predicciones bonus están cerradas desde el inicio del torneo
          </div>
        )}
      </div>

      {user ? (
        <div className="space-y-4">
          {/* Campeón del Mundo */}
          <BonusCard
            icon={<Trophy className="text-yellow-400" size={24} />}
            title="Selección Campeona del Mundo"
            points={10}
            pointColor="text-yellow-400"
            status={getBonusStatus(bonus.championId, actualBonus?.championId)}
          >
            <select
              value={bonus.championId}
              onChange={(e) => setBonus(b => ({ ...b, championId: e.target.value }))}
              disabled={locked}
              className="input-field w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="">Selecciona el campeón...</option>
              {teamOptions}
            </select>
          </BonusCard>

          {/* Subcampeón */}
          <BonusCard
            icon={<Award className="text-gray-300" size={24} />}
            title="Selección Subcampeona"
            points={5}
            pointColor="text-gray-300"
            status={getBonusStatus(bonus.runnerUpId, actualBonus?.runnerUpId)}
          >
            <select
              value={bonus.runnerUpId}
              onChange={(e) => setBonus(b => ({ ...b, runnerUpId: e.target.value }))}
              disabled={locked}
              className="input-field w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="">Selecciona el subcampeón...</option>
              {teamOptions}
            </select>
          </BonusCard>

          {/* Bota de Oro */}
          <BonusCard
            icon={<Footprints className="text-amber-600" size={24} />}
            title="Bota de Oro / Máximo Goleador"
            points={5}
            pointColor="text-amber-600"
            status={getBonusStatus(bonus.topScorerName, actualBonus?.topScorerName, 'name')}
          >
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Nombre del jugador (ej: Mbappé)"
                value={bonus.topScorerName}
                onChange={(e) => setBonus(b => ({ ...b, topScorerName: e.target.value }))}
                disabled={locked}
                className="input-field flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
              />
              <select
                value={bonus.topScorerTeamId}
                onChange={(e) => setBonus(b => ({ ...b, topScorerTeamId: e.target.value }))}
                disabled={locked}
                className="input-field w-36 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="">País...</option>
                {teamOptions}
              </select>
            </div>
          </BonusCard>

          {/* Save Button */}
          {!locked && (
            <button
              onClick={saveBonus}
              disabled={saving}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
              ) : saved ? (
                <>
                  <CheckCircle size={16} />
                  ¡Guardado!
                </>
              ) : (
                <>
                  <Star size={16} />
                  Guardar Predicciones Bonus
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="glass-card p-10 text-center">
          <Star size={48} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/50">Inicia sesión para hacer tus predicciones bonus</p>
        </div>
      )}
    </div>
  );
}

function BonusCard({ icon, title, points, pointColor, status, children }) {
  return (
    <div className={`glass-card p-5 transition-all duration-300
                     ${status === 'correct' ? 'border-green-500/40 bg-green-500/5' : ''}
                     ${status === 'wrong' ? 'border-red-500/40 bg-red-500/5' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <div className="font-semibold text-white">{title}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status === 'correct' && <span className="text-green-400 text-xl">✅</span>}
          {status === 'wrong' && <span className="text-red-400 text-xl">❌</span>}
          <div className={`${pointColor} font-display text-2xl`}>+{points}</div>
          <div className="text-white/40 text-xs">pts</div>
        </div>
      </div>
      {children}
    </div>
  );
}
