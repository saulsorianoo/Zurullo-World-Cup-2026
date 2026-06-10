import React, { useState, useMemo } from 'react';
import useDataStore from '../store/dataStore';
import { MATCHES, groupMatchesByDate } from '../data/matches';
import { PHASE_LABELS } from '../lib/scoring';
import MatchCard from '../components/matches/MatchCard';
import { Calendar, Filter, Search } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const PHASES = [
  { value: 'all',         label: 'Todos' },
  { value: 'group',       label: 'Grupos' },
  { value: 'round_of_16', label: 'Octavos' },
  { value: 'quarter',     label: 'Cuartos' },
  { value: 'semi',        label: 'Semis' },
  { value: 'final',       label: 'Final' },
];

export default function Home() {
  const { matchesData: matchData, predictions, profilesMap: profiles, loading } = useDataStore();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Merge static match data with Firestore results
  const enrichedMatches = useMemo(() => {
    return MATCHES.map(m => ({
      ...m,
      ...(matchData[m.id] || {}),
    }));
  }, [matchData]);

  // Filter matches
  const filteredMatches = useMemo(() => {
    return enrichedMatches.filter(m => {
      const matchesPhase = filter === 'all' || m.phase === filter;
      const matchesSearch = !search || 
        m.home?.toLowerCase().includes(search.toLowerCase()) ||
        m.away?.toLowerCase().includes(search.toLowerCase()) ||
        m.city?.toLowerCase().includes(search.toLowerCase());
      return matchesPhase && matchesSearch;
    });
  }, [enrichedMatches, filter, search]);

  const grouped = groupMatchesByDate(filteredMatches);
  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Hero Banner */}
      <div className="glass-card p-6 bg-gradient-to-r from-dark-600/50 to-dark-500/30 
                      border-yellow-400/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="text-[200px] font-display text-white leading-none text-center 
                          select-none -mt-10">2026</div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-4xl">⚽</span>
            <div>
              <h1 className="font-display text-3xl sm:text-4xl tracking-wider text-white">
                ZURULLO WORLD CUP
              </h1>
              <div className="text-yellow-400 font-bold tracking-widest text-sm">
                FIFA WORLD CUP 2026 • USA · CAN · MEX
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="badge badge-gold">🏆 104 Partidos</div>
            <div className="badge badge-phase">📅 11 Jun – 19 Jul 2026</div>
            <div className="badge" style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', borderColor: 'rgba(52,211,153,0.3)' }}>
              ⚡ En Tiempo Real
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Buscar equipo o ciudad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field w-full pl-9"
          />
        </div>
        
        {/* Phase filter */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {PHASES.map(p => (
            <button
              key={p.value}
              onClick={() => setFilter(p.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                          ${filter === p.value 
                            ? 'bg-yellow-400 text-dark-900 font-bold' 
                            : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Matches grouped by date */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-yellow-400/30 border-t-yellow-400 
                          rounded-full animate-spin" />
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <Search size={48} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/50">No se encontraron partidos con ese filtro</p>
        </div>
      ) : (
        sortedDates.map(date => (
          <div key={date} className="space-y-3">
            {/* Date header */}
            <div className="flex items-center gap-3 sticky top-16 z-10 
                            bg-dark-900/90 backdrop-blur-sm py-2 rounded-lg px-1">
              <Calendar size={16} className="text-yellow-400" />
              <h2 className="font-bold text-white">
                {format(new Date(date + 'T12:00:00'), "EEEE, d 'de' MMMM yyyy", { locale: es })}
              </h2>
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/40 text-xs">
                {grouped[date].length} partido{grouped[date].length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Match cards for this date */}
            {grouped[date].map(match => (
              <MatchCard
                key={match.id}
                match={match}
                allProfiles={profiles}
                predictions={predictions[match.id] || {}}
              />
            ))}
          </div>
        ))
      )}
    </div>
  );
}
