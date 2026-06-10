// Selecciones del Mundial 2026 — Grupos CORRECTOS
// IDs: Códigos FIFA estándar de 3 letras

export const GROUPS = {
  A: ['MEX', 'RSA', 'KOR', 'CZE'],
  B: ['CAN', 'BIH', 'QAT', 'SUI'],
  C: ['BRA', 'MAR', 'HTI', 'SCO'],
  D: ['USA', 'PAR', 'AUS', 'TUR'],
  E: ['GER', 'CUW', 'CIV', 'ECU'],
  F: ['NED', 'JPN', 'SWE', 'TUN'],
  G: ['BEL', 'EGY', 'IRN', 'NZL'],
  H: ['ESP', 'CPV', 'KSA', 'URY'],
  I: ['FRA', 'SEN', 'IRQ', 'NOR'],
  J: ['ARG', 'ALG', 'AUT', 'JOR'],
  K: ['POR', 'COD', 'UZB', 'COL'],
  L: ['ENG', 'CRO', 'GHA', 'PAN'],
};

export const TEAMS = [
  // === GRUPO A ===
  { id: 'MEX', name: 'México',          flag: '🇲🇽', group: 'A', confederation: 'CONCACAF' },
  { id: 'RSA', name: 'Sudáfrica',        flag: '🇿🇦', group: 'A', confederation: 'CAF' },
  { id: 'KOR', name: 'Corea del Sur',    flag: '🇰🇷', group: 'A', confederation: 'AFC' },
  { id: 'CZE', name: 'República Checa',  flag: '🇨🇿', group: 'A', confederation: 'UEFA' },

  // === GRUPO B ===
  { id: 'CAN', name: 'Canadá',              flag: '🇨🇦', group: 'B', confederation: 'CONCACAF' },
  { id: 'BIH', name: 'Bosnia y Herzegovina', flag: '🇧🇦', group: 'B', confederation: 'UEFA' },
  { id: 'QAT', name: 'Catar',               flag: '🇶🇦', group: 'B', confederation: 'AFC' },
  { id: 'SUI', name: 'Suiza',               flag: '🇨🇭', group: 'B', confederation: 'UEFA' },

  // === GRUPO C ===
  { id: 'BRA', name: 'Brasil',    flag: '🇧🇷', group: 'C', confederation: 'CONMEBOL' },
  { id: 'MAR', name: 'Marruecos', flag: '🇲🇦', group: 'C', confederation: 'CAF' },
  { id: 'HTI', name: 'Haití',     flag: '🇭🇹', group: 'C', confederation: 'CONCACAF' },
  { id: 'SCO', name: 'Escocia',   flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', group: 'C', confederation: 'UEFA' },

  // === GRUPO D ===
  { id: 'USA', name: 'Estados Unidos', flag: '🇺🇸', group: 'D', confederation: 'CONCACAF' },
  { id: 'PAR', name: 'Paraguay',       flag: '🇵🇾', group: 'D', confederation: 'CONMEBOL' },
  { id: 'AUS', name: 'Australia',      flag: '🇦🇺', group: 'D', confederation: 'AFC' },
  { id: 'TUR', name: 'Turquía',        flag: '🇹🇷', group: 'D', confederation: 'UEFA' },

  // === GRUPO E ===
  { id: 'GER', name: 'Alemania',       flag: '🇩🇪', group: 'E', confederation: 'UEFA' },
  { id: 'CUW', name: 'Curazao',        flag: '🇨🇼', group: 'E', confederation: 'CONCACAF' },
  { id: 'CIV', name: 'Costa de Marfil',flag: '🇨🇮', group: 'E', confederation: 'CAF' },
  { id: 'ECU', name: 'Ecuador',        flag: '🇪🇨', group: 'E', confederation: 'CONMEBOL' },

  // === GRUPO F ===
  { id: 'NED', name: 'Países Bajos', flag: '🇳🇱', group: 'F', confederation: 'UEFA' },
  { id: 'JPN', name: 'Japón',        flag: '🇯🇵', group: 'F', confederation: 'AFC' },
  { id: 'SWE', name: 'Suecia',       flag: '🇸🇪', group: 'F', confederation: 'UEFA' },
  { id: 'TUN', name: 'Túnez',        flag: '🇹🇳', group: 'F', confederation: 'CAF' },

  // === GRUPO G ===
  { id: 'BEL', name: 'Bélgica',     flag: '🇧🇪', group: 'G', confederation: 'UEFA' },
  { id: 'EGY', name: 'Egipto',      flag: '🇪🇬', group: 'G', confederation: 'CAF' },
  { id: 'IRN', name: 'Irán',        flag: '🇮🇷', group: 'G', confederation: 'AFC' },
  { id: 'NZL', name: 'Nueva Zelanda',flag: '🇳🇿', group: 'G', confederation: 'OFC' },

  // === GRUPO H ===
  { id: 'ESP', name: 'España',        flag: '🇪🇸', group: 'H', confederation: 'UEFA' },
  { id: 'CPV', name: 'Cabo Verde',    flag: '🇨🇻', group: 'H', confederation: 'CAF' },
  { id: 'KSA', name: 'Arabia Saudita',flag: '🇸🇦', group: 'H', confederation: 'AFC' },
  { id: 'URY', name: 'Uruguay',       flag: '🇺🇾', group: 'H', confederation: 'CONMEBOL' },

  // === GRUPO I ===
  { id: 'FRA', name: 'Francia',  flag: '🇫🇷', group: 'I', confederation: 'UEFA' },
  { id: 'SEN', name: 'Senegal',  flag: '🇸🇳', group: 'I', confederation: 'CAF' },
  { id: 'IRQ', name: 'Irak',     flag: '🇮🇶', group: 'I', confederation: 'AFC' },
  { id: 'NOR', name: 'Noruega',  flag: '🇳🇴', group: 'I', confederation: 'UEFA' },

  // === GRUPO J ===
  { id: 'ARG', name: 'Argentina', flag: '🇦🇷', group: 'J', confederation: 'CONMEBOL' },
  { id: 'ALG', name: 'Argelia',   flag: '🇩🇿', group: 'J', confederation: 'CAF' },
  { id: 'AUT', name: 'Austria',   flag: '🇦🇹', group: 'J', confederation: 'UEFA' },
  { id: 'JOR', name: 'Jordania',  flag: '🇯🇴', group: 'J', confederation: 'AFC' },

  // === GRUPO K ===
  { id: 'POR', name: 'Portugal',  flag: '🇵🇹', group: 'K', confederation: 'UEFA' },
  { id: 'COD', name: 'RD Congo',  flag: '🇨🇩', group: 'K', confederation: 'CAF' },
  { id: 'UZB', name: 'Uzbekistán',flag: '🇺🇿', group: 'K', confederation: 'AFC' },
  { id: 'COL', name: 'Colombia',  flag: '🇨🇴', group: 'K', confederation: 'CONMEBOL' },

  // === GRUPO L ===
  { id: 'ENG', name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'L', confederation: 'UEFA' },
  { id: 'CRO', name: 'Croacia',    flag: '🇭🇷', group: 'L', confederation: 'UEFA' },
  { id: 'GHA', name: 'Ghana',      flag: '🇬🇭', group: 'L', confederation: 'CAF' },
  { id: 'PAN', name: 'Panamá',     flag: '🇵🇦', group: 'L', confederation: 'CONCACAF' },
];

// Pool exclusivo para la Ruleta de las Peores Selecciones
// (Todos clasificados al Mundial pero con pocas expectativas)
export const ROULETTE_TEAMS = [
  { id: 'HTI', name: 'Haití',              flag: '🇭🇹' },
  { id: 'UZB', name: 'Uzbekistán',          flag: '🇺🇿' },
  { id: 'SWE', name: 'Suecia',              flag: '🇸🇪' },
  { id: 'KSA', name: 'Arabia Saudita',      flag: '🇸🇦' },
  { id: 'NZL', name: 'Nueva Zelanda',       flag: '🇳🇿' },
  { id: 'TUN', name: 'Túnez',               flag: '🇹🇳' },
  { id: 'CPV', name: 'Cabo Verde',          flag: '🇨🇻' },
  { id: 'QAT', name: 'Catar',               flag: '🇶🇦' },
  { id: 'IRQ', name: 'Irak',                flag: '🇮🇶' },
  { id: 'GHA', name: 'Ghana',               flag: '🇬🇭' },
  { id: 'CUW', name: 'Curazao',             flag: '🇨🇼' },
  { id: 'JOR', name: 'Jordania',            flag: '🇯🇴' },
  { id: 'RSA', name: 'Sudáfrica',           flag: '🇿🇦' },
  { id: 'BIH', name: 'Bosnia y Herzegovina',flag: '🇧🇦' },
];

export const getTeamById = (id) =>
  TEAMS.find(t => t.id === id) || ROULETTE_TEAMS.find(t => t.id === id);
