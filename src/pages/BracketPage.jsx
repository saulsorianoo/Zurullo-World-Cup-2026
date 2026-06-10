import { MATCHES } from '../data/matches';
import useDataStore from '../store/dataStore';
import { TEAMS } from '../data/teams';
import { Trophy } from 'lucide-react';

// Organizar IDs por lado
const LEFT_BRACKET = {
  R32: ['R32_1', 'R32_2', 'R32_3', 'R32_4', 'R32_5', 'R32_6', 'R32_7', 'R32_8'],
  R16: ['R16_1', 'R16_2', 'R16_3', 'R16_4'],
  QF:  ['QF1', 'QF2'],
  SF:  ['SF1'],
};

const RIGHT_BRACKET = {
  SF:  ['SF2'],
  QF:  ['QF3', 'QF4'],
  R16: ['R16_5', 'R16_6', 'R16_7', 'R16_8'],
  R32: ['R32_9', 'R32_10', 'R32_11', 'R32_12', 'R32_13', 'R32_14', 'R32_15', 'R32_16'],
};

const FINAL_MATCH = 'FINAL';
const THIRD_PLACE = '3RD';

const MatchNode = ({ matchId, align = 'left' }) => {
  const { matchesData } = useDataStore();
  
  const getMatchData = (id) => {
    const baseMatch = MATCHES.find(m => m.id === id);
    const liveData = matchesData[id] || {};
    return { ...baseMatch, ...liveData };
  };

  const match = getMatchData(matchId);
  if (!match) return null;

  const homeTeam = TEAMS.find(t => t.id === match.home) || { name: match.home, flag: '⚽' };
  const awayTeam = TEAMS.find(t => t.id === match.away) || { name: match.away, flag: '⚽' };

  const hasResult = typeof match.homeScore === 'number' && typeof match.awayScore === 'number';
  const isTBD = match.home === 'TBD' || match.away === 'TBD';

  return (
    <div className={`bracket-match align-${align}`}>
      <div className="bracket-team">
        <span className="bracket-flag">
          {homeTeam?.iso2 ? (
            <img src={`https://flagcdn.com/w20/${homeTeam.iso2}.png`} alt={homeTeam.name} className="w-5 rounded-[2px]" />
          ) : homeTeam.flag}
        </span>
        <span className="bracket-name">{isTBD ? 'Por definir' : homeTeam.name}</span>
        {hasResult && <span className="bracket-score">{match.homeScore}</span>}
      </div>
      <div className="bracket-team border-t border-white/5">
        <span className="bracket-flag">
          {awayTeam?.iso2 ? (
            <img src={`https://flagcdn.com/w20/${awayTeam.iso2}.png`} alt={awayTeam.name} className="w-5 rounded-[2px]" />
          ) : awayTeam.flag}
        </span>
        <span className="bracket-name">{isTBD ? 'Por definir' : awayTeam.name}</span>
        {hasResult && <span className="bracket-score">{match.awayScore}</span>}
      </div>
    </div>
  );
};

const RoundColumn = ({ title, matches, align }) => (
  <div className="bracket-column">
    <h3 className="bracket-round-title">{title}</h3>
    <div className="bracket-matches">
      {matches.map(id => (
        <div key={id} className="bracket-node">
          <MatchNode matchId={id} align={align} />
        </div>
      ))}
    </div>
  </div>
);

export default function BracketPage() {

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-8">
      <div className="glass-card p-6 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/20 mb-8 text-center">
        <h1 className="section-title text-3xl mb-2 flex items-center justify-center gap-3">
          <Trophy className="text-yellow-400" size={32} />
          Eliminatorias Mundial 2026
        </h1>
        <p className="text-white/50 text-sm">El camino hacia la gloria. Desliza hacia los lados para ver el cuadro completo.</p>
      </div>

      <div className="bracket-container glass-card p-8 overflow-x-auto">
        <div className="bracket-wrapper">
          {/* LADO IZQUIERDO */}
          <RoundColumn title="Dieciseisavos" matches={LEFT_BRACKET.R32} align="left" />
          <RoundColumn title="Octavos"       matches={LEFT_BRACKET.R16} align="left" />
          <RoundColumn title="Cuartos"       matches={LEFT_BRACKET.QF}  align="left" />
          <RoundColumn title="Semifinal"     matches={LEFT_BRACKET.SF}  align="left" />

          {/* FINAL (Centro) */}
          <div className="bracket-column bracket-center">
            <h3 className="bracket-round-title text-yellow-400 text-lg font-bold">GRAN FINAL</h3>
            <div className="bracket-node final-node">
              <MatchNode matchId={FINAL_MATCH} align="center" />
            </div>

            <h3 className="bracket-round-title text-amber-600 text-sm font-bold mt-12">Tercer y Cuarto Puesto</h3>
            <div className="bracket-node third-place-node opacity-80">
              <MatchNode matchId={THIRD_PLACE} align="center" />
            </div>
          </div>

          {/* LADO DERECHO */}
          <RoundColumn title="Semifinal"     matches={RIGHT_BRACKET.SF}  align="right" />
          <RoundColumn title="Cuartos"       matches={RIGHT_BRACKET.QF}  align="right" />
          <RoundColumn title="Octavos"       matches={RIGHT_BRACKET.R16} align="right" />
          <RoundColumn title="Dieciseisavos" matches={RIGHT_BRACKET.R32} align="right" />
        </div>
      </div>
    </div>
  );
}
