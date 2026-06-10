import { useState, useEffect, useRef } from 'react';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { Shuffle, Target, Zap } from 'lucide-react';
import { ROULETTE_TEAMS } from '../../data/teams';
import useAuthStore from '../../store/authStore';
import useDataStore from '../../store/dataStore';

export default function RouletteSection() {
  const { user, profile } = useAuthStore();
  const { profiles, profilesMap } = useDataStore();
  const [spinning, setSpinning] = useState(false);
  const [spinDeg, setSpinDeg] = useState(0);

  const assigned = {};
  profiles.forEach(p => { if (p.rouletteTeamId) assigned[p.uid] = p.rouletteTeamId; });
  const assignedIds = Object.values(assigned);
  const availableTeams = ROULETTE_TEAMS.filter(t => !assignedIds.includes(t.id));

  const myTeamId = profile?.rouletteTeamId;

  const spinMyRoulette = async () => {
    if (spinning || myTeamId || !user) return;

    // Calcular equipos disponibles
    if (availableTeams.length === 0) {
      alert("Lo sentimos, no quedan selecciones disponibles en la ruleta.");
      return;
    }

    setSpinning(true);

    // Pick random available team
    const randomTeam = availableTeams[Math.floor(Math.random() * availableTeams.length)];
    const teamIndex = availableTeams.findIndex(t => t.id === randomTeam.id);

    // Calcular el ángulo para que se pare justo en ese equipo
    // El puntero está arriba (0 grados). Cada equipo está en angle = (360 / N) * i.
    // Para que el equipo 'i' quede arriba, hay que girar la ruleta a 360 - angle.
    const sliceAngle = 360 / availableTeams.length;
    const targetAngle = 360 - (sliceAngle * teamIndex);
    
    // Girar 5 vueltas completas (1800 grados) + el ángulo objetivo
    // Como spinDeg guarda el giro acumulado, cogemos su base
    const currentBase = spinDeg - (spinDeg % 360);
    const newDeg = currentBase + 1800 + targetAngle;
    
    setSpinDeg(newDeg);

    // Esperar a que termine la animación
    await new Promise(r => setTimeout(r, 4000));

    // Guardar en Firestore solo para el usuario actual
    await updateDoc(doc(db, 'profiles', user.uid), {
      rouletteTeamId: randomTeam.id,
      rouletteGoals: 0,
    });
    
    setSpinning(false);
  };

  const getRouletteTeam = (teamId) => 
    ROULETTE_TEAMS.find(t => t.id === teamId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 bg-gradient-to-r from-red-500/10 to-pink-500/10 border-red-500/20">
        <div className="flex items-center gap-3 mb-2">
          <Shuffle className="text-red-400" size={28} />
          <h2 className="section-title">Ruleta de las Peores Selecciones</h2>
        </div>
        <p className="text-white/60 text-sm">
          Gira la ruleta para recibir aleatoriamente una de las selecciones más débiles. 
          Por cada gol que marque tu selección en el Mundial, sumarás <strong className="text-white">+1 punto</strong> en 
          la clasificación general.
        </p>
      </div>

      {/* Roulette Wheel */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-64 h-64">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 z-10">
            <div className="w-0 h-0 border-l-8 border-r-8 border-b-16 
                            border-l-transparent border-r-transparent border-b-yellow-400
                            drop-shadow-lg" style={{ borderBottomWidth: '20px' }} />
          </div>

          {/* Wheel */}
          <div
            className="w-64 h-64 rounded-full border-4 border-white/20 relative overflow-hidden
                        shadow-[0_0_40px_rgba(255,100,100,0.3)]"
            style={{
              transform: `rotate(${spinDeg}deg)`,
              transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            }}
          >
            {availableTeams.map((team, i) => {
              const angle = (360 / availableTeams.length) * i;
              const hue = (i * (360 / availableTeams.length)) % 360;
              return (
                <div
                  key={team.id}
                  className="absolute inset-0 flex items-start justify-center pt-4"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: 'center center',
                  }}
                >
                  <div
                    className="w-1/2 h-1/2 flex flex-col items-center justify-start pt-1"
                    style={{
                      background: `hsl(${hue}, 60%, 25%)`,
                      clipPath: `polygon(50% 0%, 50% 100%, 100% 50%)`,
                    }}
                  >
                  </div>
                  <span
                    className="absolute text-sm font-bold drop-shadow-md"
                    style={{
                      transform: `rotate(${angle + 90}deg)`,
                      top: '15%',
                      left: '50%',
                    }}
                  >
                    {team.flag}
                  </span>
                </div>
              );
            })}
            {/* Center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-dark-800 border-2 border-white/20 
                              flex items-center justify-center text-2xl z-20">
                ⚽
              </div>
            </div>
          </div>
        </div>

        {/* Spin Button */}
        {!user ? (
          <div className="badge badge-phase text-sm py-2 px-4">
            Inicia sesión para girar la ruleta
          </div>
        ) : myTeamId ? (
          <div className="badge badge-gold text-sm py-2 px-4 flex flex-col items-center gap-1">
            <span className="font-bold">¡Ya tienes tu selección!</span>
            <span className="text-lg">
              {getRouletteTeam(myTeamId)?.flag} {getRouletteTeam(myTeamId)?.name}
            </span>
          </div>
        ) : (
          <button
            onClick={spinMyRoulette}
            disabled={spinning}
            className="btn-primary flex items-center gap-2 text-lg px-8 py-3 animate-pulse-gold hover:scale-105 transition-transform"
          >
            <Zap size={20} />
            {spinning ? '¡Girando...!' : '🎡 TIRAR MI RULETA'}
          </button>
        )}
      </div>

      {/* Assignments Table */}
      {Object.keys(assigned).length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
            <Target className="text-red-400" size={18} />
            <h3 className="font-semibold text-white">Asignaciones</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr className="bg-white/3">
                  <th>Jugador</th>
                  <th>Selección Asignada</th>
                  <th className="text-center">Goles</th>
                  <th className="text-center">Puntos Ruleta</th>
                </tr>
              </thead>
              <tbody>
                {profiles
                  .filter(p => p.rouletteTeamId)
                  .sort((a, b) => (b.rouletteGoals || 0) - (a.rouletteGoals || 0))
                  .map(p => {
                    const team = getRouletteTeam(p.rouletteTeamId);
                    return (
                      <tr key={p.uid}>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center 
                                            justify-center font-bold text-sm">
                              {(p.username || 'U')[0].toUpperCase()}
                            </div>
                            <span className="font-medium text-white">{p.username}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{team?.flag}</span>
                            <span className="font-semibold text-white">{team?.name}</span>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className="text-white font-bold text-lg">
                            ⚽ {p.rouletteGoals || 0}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className="text-red-400 font-display text-xl">
                            +{p.rouletteGoals || 0}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pool of teams */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Shuffle size={16} className="text-red-400" />
          Pool de Selecciones ({availableTeams.length} equipos disponibles)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {availableTeams.map(team => (
            <div
              key={team.id}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10"
            >
              <span className="text-xl">{team.flag}</span>
              <span className="text-sm text-white/80">{team.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
