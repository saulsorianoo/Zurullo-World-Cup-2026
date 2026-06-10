/**
 * Lógica de puntuación para Zurullo World Cup 2026
 * 
 * PUNTUACIÓN BASE:
 *  - 3 puntos (Verde):   Marcador exacto
 *  - 1 punto  (Amarillo): Tendencia correcta (ganador o empate)
 *  - 0 puntos (Rojo):    Error total
 * 
 * BONO ELIMINATORIAS:
 *  - +1 punto si aciertas quién clasifica (en fases elim.)
 * 
 * BONUS ESPECIALES:
 *  - +10 si aciertas el Campeón
 *  - +5  si aciertas el Subcampeón
 *  - +5  si aciertas el Bota de Oro / Máximo Goleador
 * 
 * RULETA:
 *  - +1 por cada gol que marque la selección asignada
 */

/**
 * Determina la tendencia de un resultado
 * @returns 'home' | 'away' | 'draw'
 */
export function getTendency(home, away) {
  if (home > away) return 'home';
  if (away > home) return 'away';
  return 'draw';
}

/**
 * Calcula puntos y color para un pronóstico de partido
 * @param {object} prediction  { home: number, away: number }
 * @param {object} realResult  { home: number, away: number }
 * @returns {{ points: number, color: 'green'|'yellow'|'red' }}
 */
export function calcMatchPoints(prediction, realResult) {
  const { home: pH, away: pA } = prediction;
  const { home: rH, away: rA } = realResult;

  // Acierto perfecto (marcador exacto)
  if (pH === rH && pA === rA) {
    return { points: 3, color: 'green' };
  }

  // Acierto de tendencia (ganador o empate correcto)
  if (getTendency(pH, pA) === getTendency(rH, rA)) {
    return { points: 1, color: 'yellow' };
  }

  // Error total
  return { points: 0, color: 'red' };
}

/**
 * Calcula el bono por acertar al clasificado en fases eliminatorias
 * @param {string} predictedQualifierId
 * @param {string} realQualifierId
 * @returns {number} 0 o 1
 */
export function calcQualifierBonus(predictedQualifierId, realQualifierId) {
  if (!predictedQualifierId || !realQualifierId) return 0;
  return predictedQualifierId === realQualifierId ? 1 : 0;
}

/**
 * Calcula puntos del Bonus especial de inicio de torneo
 * @param {object} bonus  { championId, runnerUpId, topScorerName }
 * @param {object} actual { championId, runnerUpId, topScorerName }
 * @returns {{ champion: number, runnerUp: number, topScorer: number, total: number }}
 */
export function calcBonusPoints(bonus, actual) {
  const champion  = bonus.championId   && actual.championId   && bonus.championId  === actual.championId  ? 10 : 0;
  const runnerUp  = bonus.runnerUpId   && actual.runnerUpId   && bonus.runnerUpId  === actual.runnerUpId  ? 5  : 0;
  const topScorer = bonus.topScorerName && actual.topScorerName &&
    bonus.topScorerName.trim().toLowerCase() === actual.topScorerName.trim().toLowerCase() ? 5 : 0;

  return {
    champion,
    runnerUp,
    topScorer,
    total: champion + runnerUp + topScorer,
  };
}

/**
 * Calcula el total de puntos de un usuario en la clasificación
 * @param {object} user { matchPoints, bonusPoints, rouletteGoals }
 * @returns {number}
 */
export function calcTotalPoints(user) {
  return (user.matchPoints || 0) + (user.bonusPoints || 0) + (user.rouletteGoals || 0);
}

/**
 * Calcula el bote total y el reparto de premios
 * @param {number} userCount   Número de usuarios registrados
 * @param {number} entryFee    Cuota de entrada (por defecto 10€)
 * @returns {{ total: number, first: number, second: number, third: number }}
 */
export function calcPrizePool(userCount, entryFee = 10) {
  const total  = userCount * entryFee;
  return {
    total,
    first:  Math.round(total * 0.50),
    second: Math.round(total * 0.30),
    third:  Math.round(total * 0.20),
  };
}

/**
 * Devuelve la clase CSS de color según el resultado
 * @param {'green'|'yellow'|'red'|null} color
 */
export function getColorClass(color) {
  switch (color) {
    case 'green':  return 'cell-green';
    case 'yellow': return 'cell-yellow';
    case 'red':    return 'cell-red';
    default:       return 'cell-pending';
  }
}

/**
 * Fases eliminatorias (requieren pronóstico de clasificado)
 */
export const KNOCKOUT_PHASES = ['round_of_16', 'quarter', 'semi', 'third_place', 'final'];

export function isKnockoutPhase(phase) {
  return KNOCKOUT_PHASES.includes(phase);
}

/**
 * Nombres de fase en español
 */
export const PHASE_LABELS = {
  group:        'Fase de Grupos',
  round_of_16:  'Octavos de Final',
  quarter:      'Cuartos de Final',
  semi:         'Semifinal',
  third_place:  'Tercer y Cuarto Puesto',
  final:        'GRAN FINAL',
};
