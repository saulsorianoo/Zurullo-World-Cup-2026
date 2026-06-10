import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Trophy, Medal, TrendingUp } from 'lucide-react';
import { calcPrizePool } from '../../lib/scoring';

import useDataStore from '../../store/dataStore';

const MEDALS = ['🥇', '🥈', '🥉'];
const PODIUM_CLASSES = ['podium-1', 'podium-2', 'podium-3'];

export default function Leaderboard({ showPrizes = false }) {
  const { profiles, loading } = useDataStore();

  // Calculate prize pool based on ALL registered users (10€ each)
  const prizes = calcPrizePool(profiles.length);

  if (loading && profiles.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-yellow-400/30 border-t-yellow-400 
                        rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Prize Banner */}
      {showPrizes && (
        <div className="glass-card p-6 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 
                        border-yellow-400/20 animate-pulse-gold">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Trophy className="text-yellow-400" size={32} />
              <div>
                <div className="text-yellow-400 font-bold text-lg">
                  🏆 BOTE TOTAL: {prizes.total}€
                </div>
                <div className="text-white/60 text-sm">
                  {profiles.length} jugadores × 10€
                </div>
              </div>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <div className="text-2xl font-display text-yellow-400">{prizes.first}€</div>
                <div className="text-xs text-white/50">🥇 1er Lugar (50%)</div>
              </div>
              <div>
                <div className="text-2xl font-display text-gray-300">{prizes.second}€</div>
                <div className="text-xs text-white/50">🥈 2º Lugar (30%)</div>
              </div>
              <div>
                <div className="text-2xl font-display text-amber-600">{prizes.third}€</div>
                <div className="text-xs text-white/50">🥉 3er Lugar (20%)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr className="bg-white/3">
                <th className="w-12">#</th>
                <th>Jugador</th>
                <th className="text-center hidden sm:table-cell">Partidos</th>
                <th className="text-center hidden md:table-cell">Bonus</th>
                <th className="text-center hidden md:table-cell">Ruleta</th>
                <th className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp size={12} />
                    Total
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p, index) => {
                const isPodium = index < 3;
                return (
                  <tr
                    key={p.uid}
                    className={`transition-colors ${isPodium ? 'border-l-2' : ''} 
                                ${index === 0 ? 'border-yellow-400' : ''}
                                ${index === 1 ? 'border-gray-400' : ''}
                                ${index === 2 ? 'border-amber-700' : ''}`}
                  >
                    <td>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
                                       ${isPodium ? PODIUM_CLASSES[index] + ' border' : 'text-white/40'}`}>
                        {isPodium ? MEDALS[index] : index + 1}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center 
                                         font-bold text-sm
                                         ${isPodium 
                                           ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-dark-900' 
                                           : 'bg-white/10 text-white'}`}>
                          {(p.username || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">
                            {p.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center hidden sm:table-cell">
                      <span className="text-white/70 font-semibold">
                        {p.matchPoints || 0}
                      </span>
                    </td>
                    <td className="text-center hidden md:table-cell">
                      <span className="text-white/70 font-semibold">
                        {p.bonusPoints || 0}
                      </span>
                    </td>
                    <td className="text-center hidden md:table-cell">
                      <span className="text-white/70 font-semibold">
                        {p.rouletteGoals || 0}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`text-xl font-display font-bold
                                        ${index === 0 ? 'text-yellow-400' : ''}
                                        ${index === 1 ? 'text-gray-300' : ''}
                                        ${index === 2 ? 'text-amber-600' : ''}
                                        ${index > 2 ? 'text-white' : ''}`}>
                        {p.totalPoints || 0}
                      </span>
                      <div className="text-white/30 text-xs">pts</div>
                    </td>
                  </tr>
                );
              })}
              {profiles.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-white/30 py-10">
                    No hay jugadores registrados aún
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Points legend */}
      <div className="grid grid-cols-3 gap-3">
        <div className="cell-green rounded-xl p-3 text-center">
          <div className="text-lg font-display">3 pts</div>
          <div className="text-xs opacity-80">Marcador exacto</div>
        </div>
        <div className="cell-yellow rounded-xl p-3 text-center">
          <div className="text-lg font-display">1 pt</div>
          <div className="text-xs opacity-80">Tendencia correcta</div>
        </div>
        <div className="cell-red rounded-xl p-3 text-center">
          <div className="text-lg font-display">0 pts</div>
          <div className="text-xs opacity-80">Error total</div>
        </div>
      </div>
    </div>
  );
}
