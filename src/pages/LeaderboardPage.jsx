import React from 'react';
import { Trophy } from 'lucide-react';
import Leaderboard from '../components/leaderboard/Leaderboard';

export default function LeaderboardPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="glass-card p-6 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 border-yellow-400/20">
        <div className="flex items-center gap-3">
          <Trophy className="text-yellow-400" size={28} />
          <div>
            <h1 className="section-title">Clasificación General</h1>
            <p className="text-white/50 text-sm">
              Puntuación en tiempo real · Partidos + Bonus + Ruleta
            </p>
          </div>
        </div>
      </div>
      
      <Leaderboard showPrizes={true} />
    </div>
  );
}
