import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { calcPrizePool } from '../lib/scoring';
import { Gift, DollarSign, Users, Trophy, Star, Zap } from 'lucide-react';

import useDataStore from '../store/dataStore';

export default function PrizesPage() {
  const { profiles, loading } = useDataStore();
  
  if (loading && profiles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-2 border-yellow-400/30 border-t-yellow-400 
                        rounded-full animate-spin" />
      </div>
    );
  }

  const totalCount = profiles.length;
  const prizes     = calcPrizePool(totalCount);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header */}
      <div className="glass-card p-6 bg-gradient-to-r from-green-500/10 to-teal-500/10 border-green-500/20">
        <div className="flex items-center gap-3">
          <Gift className="text-green-400" size={28} />
          <div>
            <h1 className="section-title">💰 Bote y Premios</h1>
            <p className="text-white/50 text-sm">
              Cuota de entrada: 10€ por jugador
            </p>
          </div>
        </div>
      </div>

      {/* Prize Pool Card */}
      <div className="glass-card p-8 bg-gradient-to-br from-yellow-400/15 to-orange-500/10 
                      border-yellow-400/30 text-center animate-pulse-gold">
        <DollarSign className="text-yellow-400 mx-auto mb-2" size={48} />
        <div className="font-display text-6xl text-yellow-400 mb-1">{prizes.total}€</div>
        <div className="text-white/60 text-lg">BOTE TOTAL</div>
        <div className="flex items-center justify-center gap-2 mt-2 text-sm text-white/40">
          <Users size={14} />
          {totalCount} jugadores inscritos
        </div>
      </div>

      {/* Prize Distribution */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-6 text-center border-yellow-400/30 
                        bg-gradient-to-b from-yellow-400/10 to-transparent">
          <div className="text-4xl mb-2">🥇</div>
          <div className="font-display text-4xl text-yellow-400">{prizes.first}€</div>
          <div className="text-white/60 text-sm mt-1">Primer Lugar</div>
          <div className="text-yellow-400/60 text-xs mt-1">50% del bote</div>
        </div>
        
        <div className="glass-card p-6 text-center border-gray-400/30 
                        bg-gradient-to-b from-gray-400/10 to-transparent">
          <div className="text-4xl mb-2">🥈</div>
          <div className="font-display text-4xl text-gray-300">{prizes.second}€</div>
          <div className="text-white/60 text-sm mt-1">Segundo Lugar</div>
          <div className="text-gray-400/60 text-xs mt-1">30% del bote</div>
        </div>
        
        <div className="glass-card p-6 text-center border-amber-700/30 
                        bg-gradient-to-b from-amber-700/10 to-transparent">
          <div className="text-4xl mb-2">🥉</div>
          <div className="font-display text-4xl text-amber-600">{prizes.third}€</div>
          <div className="text-white/60 text-sm mt-1">Tercer Lugar</div>
          <div className="text-amber-700/60 text-xs mt-1">20% del bote</div>
        </div>
      </div>

      {/* Scoring system */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <Star className="text-yellow-400" size={18} />
          Sistema de Puntuación
        </h2>
        
        <div className="space-y-3">
          <ScoreRow color="green" pts={3} label="Acierto Perfecto" desc="Marcador exacto del partido" />
          <ScoreRow color="yellow" pts={1} label="Acierto de Tendencia" desc="Ganador/empate correcto, goles fallados" />
          <ScoreRow color="red" pts={0} label="Error Total" desc="No aciertas ni ganador ni empate" />
          
          <div className="border-t border-white/10 pt-3">
            <ScoreRow color="blue" pts="+1" label="Bono Clasificado" desc="Aciertas quién pasa en eliminatorias" />
          </div>

          <div className="border-t border-white/10 pt-3 space-y-2">
            <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Bonus especiales</div>
            <ScoreRow color="gold" pts={+10} label="Campeón del Mundo" desc="Predicción de inicio de torneo" />
            <ScoreRow color="gold" pts={+5} label="Subcampeón" desc="Predicción de inicio de torneo" />
            <ScoreRow color="gold" pts={+5} label="Bota de Oro" desc="Máximo goleador del torneo" />
          </div>

          <div className="border-t border-white/10 pt-3">
            <div className="text-white/50 text-xs uppercase tracking-wider mb-2">Ruleta especial</div>
            <ScoreRow color="red" pts="+1" label="Por cada gol de tu selección" desc="Goles marcados durante todo el torneo" />
          </div>
        </div>
      </div>

      {/* Rules */}
      <div className="glass-card p-6">
        <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
          <Zap className="text-orange-400" size={18} />
          Reglas Especiales
        </h2>
        <ul className="space-y-2 text-white/60 text-sm">
          <li className="flex gap-2">
            <span className="text-yellow-400">⏰</span>
            <span>Las apuestas se bloquean automáticamente en el momento exacto del inicio de cada partido</span>
          </li>
          <li className="flex gap-2">
            <span className="text-yellow-400">🔒</span>
            <span>Las predicciones bonus se cierran al inicio del primer partido del torneo</span>
          </li>
          <li className="flex gap-2">
            <span className="text-yellow-400">⚖️</span>
            <span>En eliminatorias, la puntuación base se calcula con el resultado de los 90 minutos reglamentarios (sin prórroga ni penaltis)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-yellow-400">🎡</span>
            <span>La ruleta se asigna aleatoriamente una sola vez antes del torneo por el administrador</span>
          </li>
          <li className="flex gap-2">
            <span className="text-yellow-400">💰</span>
            <span>Cuota de 10€ por jugador. Sin pago confirmado, no se cuenta en el bote de premios</span>
          </li>
        </ul>
      </div>

      {/* Player list */}
      {profiles.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
            <Users className="text-blue-400" size={18} />
            Jugadores Registrados ({profiles.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {profiles.map(p => (
              <div key={p.uid} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center 
                                font-bold text-xs">
                  {(p.username || 'U')[0].toUpperCase()}
                </div>
                <span className="text-white/80 text-sm truncate">{p.username}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreRow({ color, pts, label, desc }) {
  const colors = {
    green:  'bg-green-500/20 text-green-400 border-green-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    red:    'bg-red-500/20 text-red-400 border-red-500/30',
    blue:   'bg-blue-500/20 text-blue-400 border-blue-500/30',
    gold:   'bg-yellow-400/20 text-yellow-400 border-yellow-400/30',
  };
  return (
    <div className="flex items-center gap-3">
      <div className={`w-12 h-8 rounded-lg border flex items-center justify-center 
                       font-display text-sm font-bold shrink-0 ${colors[color]}`}>
        {pts}
      </div>
      <div>
        <div className="text-white text-sm font-medium">{label}</div>
        <div className="text-white/40 text-xs">{desc}</div>
      </div>
    </div>
  );
}
