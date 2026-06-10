/**
 * Servicio de sincronización con la API de FIFA (football-data.org)
 * Actualiza resultados automáticamente en Firestore
 */

import { db } from './firebase';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { calcMatchPoints, calcQualifierBonus, isKnockoutPhase } from './scoring';

const FDO_API_KEY = import.meta.env.VITE_FDO_API_KEY;
const FDO_BASE    = 'https://api.football-data.org/v4';
const WC_2026_ID  = 2000; // ID del Mundial 2026 en football-data.org

// Mapa de IDs de football-data.org → nuestros IDs de equipo
const FDO_TEAM_MAP = {
  762:  'MEX', 815: 'RSA',  732: 'KOR', 798: 'CZE',
  759:  'CAN', 789: 'BIH',  779: 'QAT', 770: 'SUI',
  764:  'BRA', 1009:'MAR',  2017:'HTI', 728: 'SCO',
  765:  'USA', 793: 'PAR',  758: 'AUS', 803: 'TUR',
  759:  'GER', 2015:'CUW',  892: 'CIV', 780: 'ECU',
  784:  'NED', 796: 'JPN',  802: 'SWE', 803: 'TUN',
  805:  'BEL', 782: 'EGY',  794: 'IRN', 2006:'NZL',
  760:  'ESP', 2016:'CPV',  763: 'KSA', 769: 'URY',
  773:  'FRA', 801: 'SEN',  793: 'IRQ', 761: 'NOR',
  762:  'ARG', 1007:'ALG',  785: 'AUT', 2018:'JOR',
  765:  'POR', 1009:'COD',  2019:'UZB', 783: 'COL',
  770:  'ENG', 799: 'CRO',  782: 'GHA', 790: 'PAN',
};

/**
 * Obtiene los resultados del Mundial 2026 desde football-data.org
 * Solo usa esto si tienes API key configurada
 */
export async function fetchFIFAResults() {
  if (!FDO_API_KEY || FDO_API_KEY === 'tu_api_key_football_data_org') {
    console.warn('⚠️ API key de football-data.org no configurada');
    return null;
  }

  try {
    const response = await fetch(`${FDO_BASE}/competitions/${WC_2026_ID}/matches`, {
      headers: { 'X-Auth-Token': FDO_API_KEY }
    });
    
    if (!response.ok) throw new Error(`FIFA API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching FIFA results:', error);
    return null;
  }
}

/**
 * Sincroniza los resultados de los partidos terminados con Firestore
 * Solo actualiza partidos con estado FINISHED
 */
export async function syncResultsToFirestore() {
  const data = await fetchFIFAResults();
  if (!data?.matches) return { synced: 0, error: 'Sin datos de API' };

  const finishedMatches = data.matches.filter(m => m.status === 'FINISHED');
  const batch = writeBatch(db);
  let synced = 0;

  for (const match of finishedMatches) {
    const homeId = FDO_TEAM_MAP[match.homeTeam.id];
    const awayId = FDO_TEAM_MAP[match.awayTeam.id];
    
    if (!homeId || !awayId) continue;

    // Buscar nuestro ID de partido por equipos
    // (Simplificado: usar fecha + equipos como clave)
    const matchDate = match.utcDate.split('T')[0];
    const firestoreId = `${homeId}_${awayId}_${matchDate}`;
    
    const homeScore = match.score.fullTime.home;
    const awayScore = match.score.fullTime.away;

    batch.set(doc(db, 'matches_results', firestoreId), {
      homeTeamId: homeId,
      awayTeamId: awayId,
      homeScore,
      awayScore,
      date: matchDate,
      status: 'FINISHED',
      source: 'football-data.org',
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    synced++;
  }

  await batch.commit();
  return { synced, total: finishedMatches.length };
}

/**
 * Hook de React para usar resultados en tiempo real
 * Importar en el componente que necesite los resultados live
 */
export async function getLiveMatches() {
  if (!FDO_API_KEY || FDO_API_KEY === 'tu_api_key_football_data_org') {
    return [];
  }

  try {
    const response = await fetch(
      `${FDO_BASE}/competitions/${WC_2026_ID}/matches?status=IN_PLAY`,
      { headers: { 'X-Auth-Token': FDO_API_KEY } }
    );
    const data = await response.json();
    return data.matches || [];
  } catch {
    return [];
  }
}
