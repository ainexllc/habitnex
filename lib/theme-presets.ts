export type ThemeMode = 'light' | 'dark';
export type ThemeAppearance = 'light' | 'dark';

export type ThemePresetId =
  | 'solstice'
  | 'tidal'
  | 'evergreen'
  | 'pastel'
  | 'emberLounge'
  | 'midnight'
  | 'midnightNeon'
  | 'aurora'
  | 'ainex'
;

export interface ThemePalette {
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceMuted: string;
  panel: string;
  panelGradient: string;
  panelRing: string;
  card: string;
  cardHover: string;
  border: string;
  borderMuted: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
  accentContrast: string;
  accentGradient: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  ring: string;
  shadow: string;
  glass: string;
  nav: string;
  navHover: string;
  navActive: string;
  pill: string;
}

export interface ThemePresetDefinition {
  id: ThemePresetId;
  name: string;
  description: string;
  previewGradient: string;
  appearance: ThemeAppearance;
  palettes: Record<ThemeMode, ThemePalette>;
}

export type FontId =
  | 'sora'
  | 'plusJakarta'
  | 'spaceGrotesk'
  | 'dmSans'
  | 'manrope'
  | 'outfit'
  | 'urbanist'
  | 'redHatDisplay'
  | 'workSans'
  | 'lora';

export interface FontDefinition {
  id: FontId;
  name: string;
  role: string;
  importUrl: string;
  body: string;
  display: string;
  sample: string;
}

export interface ThemePreference {
  mode: ThemeMode;
  preset: ThemePresetId;
  font: FontId;
}

const createPalette = (seed: Partial<ThemePalette>): ThemePalette => ({
  background: '#f5f5f5',
  backgroundAlt: '#e5e7eb',
  surface: '#ffffff',
  surfaceMuted: '#f2f4f8',
  panel: '#e2e8f0',
  panelGradient: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(226,232,240,0.85) 100%)',
  panelRing: 'rgba(148,163,184,0.35)',
  card: '#ffffff',
  cardHover: '#f9fafb',
  border: 'rgba(148,163,184,0.35)',
  borderMuted: 'rgba(203,213,225,0.35)',
  textPrimary: '#0f172a',
  textSecondary: '#334155',
  textMuted: '#64748b',
  accent: '#2563eb',
  accentSoft: '#60a5fa',
  accentContrast: '#ffffff',
  accentGradient: 'linear-gradient(135deg, rgba(37,99,235,0.9) 0%, rgba(96,165,250,0.85) 100%)',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#0ea5e9',
  ring: seed.panelRing ?? 'rgba(37,99,235,0.35)',
  shadow: seed.shadow ?? '0 32px 90px -45px rgba(15,23,42,0.25)',
  glass: seed.glass ?? 'rgba(255,255,255,0.45)',
  nav: '#ffffff',
  navHover: 'rgba(37,99,235,0.15)',
  navActive: 'rgba(37,99,235,0.25)',
  pill: 'rgba(37,99,235,0.2)',
  ...seed,
});

export const themePresets: Record<ThemePresetId, ThemePresetDefinition> = {
  solstice: {
    id: 'solstice',
    name: 'Solstice Glass',
    description: 'Sunrise neutrals, frosted glass cards, and warm streak celebrations.',
    previewGradient: 'linear-gradient(135deg, #ffb174 0%, #ff7a18 100%)',
    appearance: 'light',
    palettes: {
      light: createPalette({
        background: '#fff7f0',
        backgroundAlt: '#ffeede',
        surface: 'rgba(255,255,255,0.95)',
        surfaceMuted: 'rgba(255,244,234,0.9)',
        panel: 'rgba(255,222,202,0.72)',
        panelGradient: 'linear-gradient(180deg, rgba(255,250,244,0.9) 0%, rgba(255,229,210,0.82) 45%, rgba(255,215,193,0.8) 100%)',
        panelRing: 'rgba(242,153,74,0.32)',
        border: 'rgba(240,173,103,0.28)',
        borderMuted: 'rgba(250,205,151,0.22)',
        textPrimary: '#2f1b10',
        textSecondary: '#5a3723',
        textMuted: '#8a5940',
        accent: '#f97316',
        accentSoft: '#fb923c',
        accentContrast: '#fff9f3',
        accentGradient: 'linear-gradient(135deg, rgba(249,115,22,0.88) 0%, rgba(253,186,116,0.78) 100%)',
        nav: 'rgba(255,240,226,0.85)',
        navHover: 'rgba(249,115,22,0.16)',
        navActive: 'rgba(249,115,22,0.26)',
        pill: 'rgba(249,115,22,0.22)',
        shadow: '0 45px 120px -60px rgba(241,153,66,0.45)',
        glass: 'rgba(255,255,255,0.6)',
      }),
      dark: createPalette({
        background: '#1f1b2a',
        backgroundAlt: '#271f36',
        surface: 'rgba(42,32,58,0.92)',
        surfaceMuted: 'rgba(50,39,67,0.88)',
        panel: 'rgba(58,42,76,0.78)',
        panelGradient: 'linear-gradient(200deg, rgba(28,22,45,0.9) 0%, rgba(97,53,62,0.72) 55%, rgba(24,20,36,0.9) 100%)',
        panelRing: 'rgba(251,146,83,0.32)',
        card: 'rgba(33,27,48,0.92)',
        cardHover: 'rgba(29,24,42,0.96)',
        border: 'rgba(248,166,107,0.24)',
        borderMuted: 'rgba(138,111,150,0.22)',
        textPrimary: '#f9ede0',
        textSecondary: '#f4c9a5',
        textMuted: '#caa48c',
        accent: '#fb923c',
        accentSoft: '#fbbf24',
        accentContrast: '#201422',
        accentGradient: 'linear-gradient(140deg, rgba(249,115,22,0.85) 0%, rgba(253,186,116,0.75) 100%)',
        nav: 'rgba(33,23,44,0.82)',
        navHover: 'rgba(249,115,22,0.24)',
        navActive: 'rgba(249,115,22,0.34)',
        pill: 'rgba(249,115,22,0.28)',
        shadow: '0 48px 160px -64px rgba(0,0,0,0.6)',
        glass: 'rgba(249,115,22,0.22)',
      }),
    },
  },
  tidal: {
    id: 'tidal',
    name: 'Tidal Breeze',
    description: 'Coastal gradients, pill controls, and frothy dividers.',
    previewGradient: 'linear-gradient(135deg, #5eead4 0%, #0ea5e9 100%)',
    appearance: 'light',
    palettes: {
      light: createPalette({
        background: '#f3f8fb',
        backgroundAlt: '#e5f1f8',
        surface: 'rgba(255,255,255,0.96)',
        surfaceMuted: 'rgba(238,247,252,0.88)',
        panel: 'rgba(208,233,248,0.82)',
        panelGradient: 'linear-gradient(185deg, rgba(243,249,253,0.95) 0%, rgba(215,235,249,0.88) 55%, rgba(201,229,244,0.84) 100%)',
        panelRing: 'rgba(34,197,233,0.28)',
        border: 'rgba(14,165,233,0.24)',
        borderMuted: 'rgba(125,211,252,0.2)',
        textPrimary: '#0f2133',
        textSecondary: '#1f4460',
        textMuted: '#467190',
        accent: '#0ea5e9',
        accentSoft: '#38bdf8',
        accentContrast: '#f5fbff',
        accentGradient: 'linear-gradient(135deg, rgba(14,165,233,0.85) 0%, rgba(45,212,191,0.8) 100%)',
        nav: 'rgba(229,243,250,0.85)',
        navHover: 'rgba(14,165,233,0.16)',
        navActive: 'rgba(14,165,233,0.26)',
        pill: 'rgba(14,165,233,0.2)',
        glass: 'rgba(255,255,255,0.55)',
        shadow: '0 40px 140px -60px rgba(15,76,129,0.35)',
      }),
      dark: createPalette({
        background: '#041620',
        backgroundAlt: '#09202b',
        surface: 'rgba(10,32,45,0.9)',
        surfaceMuted: 'rgba(12,38,54,0.86)',
        panel: 'rgba(14,52,72,0.82)',
        panelGradient: 'linear-gradient(205deg, rgba(5,19,32,0.92) 0%, rgba(14,102,126,0.7) 55%, rgba(3,17,27,0.92) 100%)',
        panelRing: 'rgba(56,189,248,0.28)',
        card: 'rgba(9,28,41,0.92)',
        cardHover: 'rgba(7,23,34,0.96)',
        border: 'rgba(45,212,191,0.22)',
        borderMuted: 'rgba(56,189,248,0.18)',
        textPrimary: '#d9f5ff',
        textSecondary: '#a9def7',
        textMuted: '#79c2e4',
        accent: '#38bdf8',
        accentSoft: '#5eead4',
        accentContrast: '#041217',
        accentGradient: 'linear-gradient(150deg, rgba(56,189,248,0.85) 0%, rgba(94,234,212,0.75) 100%)',
        nav: 'rgba(4,23,32,0.78)',
        navHover: 'rgba(56,189,248,0.22)',
        navActive: 'rgba(56,189,248,0.3)',
        pill: 'rgba(56,189,248,0.24)',
        shadow: '0 48px 160px -60px rgba(0,0,0,0.55)',
        glass: 'rgba(94,234,212,0.18)',
      }),
    },
  },
  evergreen: {
    id: 'evergreen',
    name: 'Evergreen Atlas',
    description: 'Organic textures and botanical gradients for holistic families.',
    previewGradient: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
    appearance: 'light',
    palettes: {
      light: createPalette({
        background: '#f2f7f3',
        backgroundAlt: '#e5f0ea',
        surface: 'rgba(255,255,255,0.95)',
        surfaceMuted: 'rgba(242,249,244,0.9)',
        panel: 'rgba(210,232,219,0.78)',
        panelGradient: 'linear-gradient(190deg, rgba(242,249,244,0.95) 0%, rgba(214,234,221,0.88) 55%, rgba(204,228,214,0.82) 100%)',
        panelRing: 'rgba(34,197,94,0.26)',
        border: 'rgba(34,197,94,0.24)',
        borderMuted: 'rgba(74,222,128,0.16)',
        textPrimary: '#1a2c21',
        textSecondary: '#32513c',
        textMuted: '#51725a',
        accent: '#2f9d62',
        accentSoft: '#4ade80',
        accentContrast: '#f4fbf7',
        accentGradient: 'linear-gradient(135deg, rgba(47,157,98,0.9) 0%, rgba(74,222,128,0.8) 100%)',
        nav: 'rgba(233,245,236,0.86)',
        navHover: 'rgba(34,197,94,0.18)',
        navActive: 'rgba(52,211,153,0.26)',
        pill: 'rgba(34,197,94,0.2)',
        glass: 'rgba(255,255,255,0.55)',
        shadow: '0 40px 140px -60px rgba(28,83,66,0.35)',
      }),
      dark: createPalette({
        background: '#0d1712',
        backgroundAlt: '#13241a',
        surface: 'rgba(16,29,23,0.92)',
        surfaceMuted: 'rgba(19,36,27,0.88)',
        panel: 'rgba(21,49,36,0.8)',
        panelGradient: 'linear-gradient(205deg, rgba(8,16,12,0.92) 0%, rgba(28,73,49,0.72) 55%, rgba(6,14,10,0.92) 100%)',
        panelRing: 'rgba(34,197,94,0.3)',
        card: 'rgba(13,26,20,0.92)',
        cardHover: 'rgba(11,22,17,0.96)',
        border: 'rgba(74,222,128,0.22)',
        borderMuted: 'rgba(34,197,94,0.18)',
        textPrimary: '#e3ffe9',
        textSecondary: '#bdfcd0',
        textMuted: '#8defb0',
        accent: '#4ade80',
        accentSoft: '#86efac',
        accentContrast: '#07150d',
        accentGradient: 'linear-gradient(140deg, rgba(74,222,128,0.85) 0%, rgba(45,212,191,0.75) 100%)',
        nav: 'rgba(7,16,12,0.82)',
        navHover: 'rgba(74,222,128,0.22)',
        navActive: 'rgba(45,212,191,0.3)',
        pill: 'rgba(74,222,128,0.24)',
        glass: 'rgba(74,222,128,0.2)',
        shadow: '0 48px 160px -64px rgba(0,0,0,0.55)',
      }),
    },
  },
  pastel: {
    id: 'pastel',
    name: 'Pastel Parade',
    description: 'Rounded tiles, confetti textures, and playful gradients.',
    previewGradient: 'linear-gradient(135deg, #f472b6 0%, #60a5fa 100%)',
    appearance: 'light',
    palettes: {
      light: createPalette({
        background: '#fdf2fb',
        backgroundAlt: '#f8e5ff',
        surface: 'rgba(255,255,255,0.96)',
        surfaceMuted: 'rgba(250,236,255,0.9)',
        panel: 'rgba(244,220,252,0.78)',
        panelGradient: 'linear-gradient(195deg, rgba(253,242,255,0.95) 0%, rgba(244,218,252,0.88) 55%, rgba(236,206,250,0.84) 100%)',
        panelRing: 'rgba(236,72,153,0.28)',
        border: 'rgba(236,72,153,0.22)',
        borderMuted: 'rgba(244,114,182,0.2)',
        textPrimary: '#341b3c',
        textSecondary: '#5b2c63',
        textMuted: '#8a4f93',
        accent: '#ec4899',
        accentSoft: '#c084fc',
        accentContrast: '#fff8fb',
        accentGradient: 'linear-gradient(135deg, rgba(236,72,153,0.9) 0%, rgba(192,132,252,0.85) 100%)',
        nav: 'rgba(249,233,255,0.86)',
        navHover: 'rgba(236,72,153,0.16)',
        navActive: 'rgba(236,72,153,0.26)',
        pill: 'rgba(236,72,153,0.22)',
        glass: 'rgba(255,255,255,0.55)',
        shadow: '0 42px 150px -60px rgba(148,64,172,0.3)',
      }),
      dark: createPalette({
        background: '#1b0f24',
        backgroundAlt: '#251330',
        surface: 'rgba(30,16,42,0.92)',
        surfaceMuted: 'rgba(35,18,48,0.88)',
        panel: 'rgba(42,20,58,0.78)',
        panelGradient: 'linear-gradient(210deg, rgba(18,8,30,0.92) 0%, rgba(88,35,105,0.7) 55%, rgba(14,6,24,0.92) 100%)',
        panelRing: 'rgba(236,72,153,0.32)',
        card: 'rgba(24,12,34,0.92)',
        cardHover: 'rgba(21,10,30,0.96)',
        border: 'rgba(244,114,182,0.24)',
        borderMuted: 'rgba(192,132,252,0.18)',
        textPrimary: '#fde9ff',
        textSecondary: '#f8cfff',
        textMuted: '#e8b4ff',
        accent: '#f472b6',
        accentSoft: '#c084fc',
        accentContrast: '#240a29',
        accentGradient: 'linear-gradient(145deg, rgba(244,114,182,0.88) 0%, rgba(192,132,252,0.78) 100%)',
        nav: 'rgba(19,8,28,0.82)',
        navHover: 'rgba(244,114,182,0.24)',
        navActive: 'rgba(192,132,252,0.28)',
        pill: 'rgba(244,114,182,0.24)',
        glass: 'rgba(244,114,182,0.2)',
        shadow: '0 50px 170px -70px rgba(0,0,0,0.6)',
      }),
    },
  },
  emberLounge: {
    id: 'emberLounge',
    name: 'Ember Lounge',
    description: 'Charcoal panels with neon streak celebrations.',
    previewGradient: 'linear-gradient(135deg, #ff7a18 0%, #8b5cf6 100%)',
    appearance: 'dark',
    palettes: {
      light: createPalette({
        background: '#f6f5f9',
        backgroundAlt: '#edeaf4',
        surface: 'rgba(255,255,255,0.96)',
        surfaceMuted: 'rgba(244,242,252,0.9)',
        panel: 'rgba(228,220,244,0.75)',
        panelGradient: 'linear-gradient(200deg, rgba(247,245,255,0.95) 0%, rgba(228,217,243,0.86) 50%, rgba(215,205,235,0.82) 100%)',
        panelRing: 'rgba(192,132,252,0.3)',
        border: 'rgba(107,70,193,0.18)',
        borderMuted: 'rgba(168,134,236,0.18)',
        textPrimary: '#211b2f',
        textSecondary: '#3f2d54',
        textMuted: '#6b5685',
        accent: '#f97316',
        accentSoft: '#fbbf24',
        accentContrast: '#fff9f6',
        accentGradient: 'linear-gradient(135deg, rgba(249,115,22,0.9) 0%, rgba(236,72,153,0.85) 100%)',
        nav: 'rgba(239,235,251,0.85)',
        navHover: 'rgba(249,115,22,0.16)',
        navActive: 'rgba(236,72,153,0.22)',
        pill: 'rgba(249,115,22,0.2)',
        glass: 'rgba(255,255,255,0.55)',
        shadow: '0 45px 160px -60px rgba(63,32,87,0.25)',
      }),
      dark: createPalette({
        background: '#0f0a15',
        backgroundAlt: '#160f24',
        surface: 'rgba(26,18,36,0.92)',
        surfaceMuted: 'rgba(32,21,46,0.88)',
        panel: 'rgba(40,22,54,0.78)',
        panelGradient: 'linear-gradient(215deg, rgba(14,8,24,0.92) 0%, rgba(74,26,56,0.75) 55%, rgba(11,6,20,0.92) 100%)',
        panelRing: 'rgba(249,115,22,0.32)',
        card: 'rgba(23,14,33,0.92)',
        cardHover: 'rgba(20,12,29,0.96)',
        border: 'rgba(236,72,153,0.22)',
        borderMuted: 'rgba(94,63,133,0.2)',
        textPrimary: '#fde5ff',
        textSecondary: '#fbcfe8',
        textMuted: '#e8b8ff',
        accent: '#fb7185',
        accentSoft: '#f97316',
        accentContrast: '#210813',
        accentGradient: 'linear-gradient(140deg, rgba(251,113,133,0.9) 0%, rgba(249,115,22,0.8) 100%)',
        nav: 'rgba(20,12,30,0.82)',
        navHover: 'rgba(251,113,133,0.2)',
        navActive: 'rgba(249,115,22,0.28)',
        pill: 'rgba(251,113,133,0.28)',
        glass: 'rgba(249,115,22,0.22)',
        shadow: '0 50px 180px -70px rgba(0,0,0,0.65)',
      }),
    },
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Orbit',
    description: 'Radial dashboards with orbiting avatars and cobalt gradients.',
    previewGradient: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
    appearance: 'dark',
    palettes: {
      light: createPalette({
        background: '#eef2ff',
        backgroundAlt: '#dce7ff',
        surface: 'rgba(255,255,255,0.96)',
        surfaceMuted: 'rgba(236,242,255,0.9)',
        panel: 'rgba(214,226,255,0.8)',
        panelGradient: 'linear-gradient(190deg, rgba(238,242,255,0.95) 0%, rgba(216,229,255,0.88) 55%, rgba(203,220,255,0.84) 100%)',
        panelRing: 'rgba(37,99,235,0.32)',
        border: 'rgba(59,130,246,0.26)',
        borderMuted: 'rgba(96,165,250,0.2)',
        textPrimary: '#0f1c3d',
        textSecondary: '#20386f',
        textMuted: '#4760a8',
        accent: '#2563eb',
        accentSoft: '#3b82f6',
        accentContrast: '#f5f7ff',
        accentGradient: 'linear-gradient(135deg, rgba(37,99,235,0.9) 0%, rgba(14,165,233,0.8) 100%)',
        nav: 'rgba(229,237,255,0.86)',
        navHover: 'rgba(37,99,235,0.18)',
        navActive: 'rgba(59,130,246,0.26)',
        pill: 'rgba(59,130,246,0.22)',
        glass: 'rgba(255,255,255,0.55)',
        shadow: '0 42px 150px -66px rgba(37,64,160,0.35)',
      }),
      dark: createPalette({
        background: '#050817',
        backgroundAlt: '#0b1327',
        surface: 'rgba(15,24,45,0.92)',
        surfaceMuted: 'rgba(18,30,52,0.88)',
        panel: 'rgba(21,38,68,0.8)',
        panelGradient: 'linear-gradient(210deg, rgba(5,9,24,0.92) 0%, rgba(32,60,110,0.72) 55%, rgba(4,9,20,0.92) 100%)',
        panelRing: 'rgba(59,130,246,0.32)',
        card: 'rgba(11,20,41,0.92)',
        cardHover: 'rgba(9,17,36,0.96)',
        border: 'rgba(96,165,250,0.24)',
        borderMuted: 'rgba(37,99,235,0.18)',
        textPrimary: '#e2eaff',
        textSecondary: '#c7d4ff',
        textMuted: '#9ab7ff',
        accent: '#60a5fa',
        accentSoft: '#38bdf8',
        accentContrast: '#06122b',
        accentGradient: 'linear-gradient(145deg, rgba(96,165,250,0.88) 0%, rgba(37,99,235,0.78) 100%)',
        nav: 'rgba(6,12,28,0.82)',
        navHover: 'rgba(59,130,246,0.22)',
        navActive: 'rgba(96,165,250,0.3)',
        pill: 'rgba(59,130,246,0.26)',
        glass: 'rgba(59,130,246,0.2)',
        shadow: '0 48px 170px -70px rgba(0,0,0,0.6)',
      }),
    },
  },
  midnightNeon: {
    id: 'midnightNeon',
    name: 'Midnight Neon',
    description: 'Synthwave dashboards with neon azure and magenta pulses.',
    previewGradient: 'linear-gradient(135deg, #22d3ee 0%, #a855f7 55%, #ec4899 100%)',
    appearance: 'dark',
    palettes: {
      light: createPalette({
        background: '#f4f6ff',
        backgroundAlt: '#e9edff',
        surface: 'rgba(255,255,255,0.96)',
        surfaceMuted: 'rgba(243,248,255,0.9)',
        panel: 'rgba(224,234,255,0.8)',
        panelGradient: 'linear-gradient(200deg, rgba(244,247,255,0.95) 0%, rgba(224,234,255,0.88) 55%, rgba(212,226,255,0.84) 100%)',
        panelRing: 'rgba(168,85,247,0.28)',
        border: 'rgba(34,211,238,0.24)',
        borderMuted: 'rgba(244,114,182,0.2)',
        textPrimary: '#1a2240',
        textSecondary: '#333d6c',
        textMuted: '#5d6799',
        accent: '#a855f7',
        accentSoft: '#22d3ee',
        accentContrast: '#f5f2ff',
        accentGradient: 'linear-gradient(135deg, rgba(34,211,238,0.9) 0%, rgba(168,85,247,0.85) 60%, rgba(236,72,153,0.8) 100%)',
        nav: 'rgba(230,238,255,0.86)',
        navHover: 'rgba(168,85,247,0.16)',
        navActive: 'rgba(34,211,238,0.24)',
        pill: 'rgba(168,85,247,0.2)',
        glass: 'rgba(255,255,255,0.55)',
        shadow: '0 42px 150px -60px rgba(57,42,115,0.32)',
      }),
      dark: createPalette({
        background: '#040014',
        backgroundAlt: '#0a0520',
        surface: 'rgba(16,10,36,0.92)',
        surfaceMuted: 'rgba(22,15,44,0.88)',
        panel: 'rgba(28,18,58,0.8)',
        panelGradient: 'linear-gradient(220deg, rgba(6,2,20,0.94) 0%, rgba(45,23,78,0.75) 55%, rgba(4,1,16,0.94) 100%)',
        panelRing: 'rgba(168,85,247,0.35)',
        card: 'rgba(18,12,40,0.92)',
        cardHover: 'rgba(15,9,32,0.96)',
        border: 'rgba(236,72,153,0.24)',
        borderMuted: 'rgba(34,211,238,0.18)',
        textPrimary: '#f5e9ff',
        textSecondary: '#d8c4ff',
        textMuted: '#b39bff',
        accent: '#22d3ee',
        accentSoft: '#f472b6',
        accentContrast: '#120327',
        accentGradient: 'linear-gradient(150deg, rgba(34,211,238,0.88) 0%, rgba(168,85,247,0.8) 55%, rgba(236,72,153,0.78) 100%)',
        nav: 'rgba(11,6,30,0.82)',
        navHover: 'rgba(34,211,238,0.24)',
        navActive: 'rgba(168,85,247,0.3)',
        pill: 'rgba(34,211,238,0.28)',
        glass: 'rgba(168,85,247,0.24)',
        shadow: '0 54px 180px -72px rgba(0,0,0,0.68)',
      }),
    },
  },
  aurora: {
    id: 'aurora',
    name: 'Aurora Horizon',
    description: 'Luminous polar gradients with glass panels and teal-violet highlights.',
    previewGradient: 'linear-gradient(135deg, #14b8a6 0%, #818cf8 50%, #a855f7 100%)',
    appearance: 'dark',
    palettes: {
      light: createPalette({
        background: '#f3f7ff',
        backgroundAlt: '#eaf3ff',
        surface: 'rgba(255,255,255,0.96)',
        surfaceMuted: 'rgba(243,249,255,0.9)',
        panel: 'rgba(222,236,255,0.78)',
        panelGradient: 'linear-gradient(200deg, rgba(243,249,255,0.95) 0%, rgba(219,239,255,0.88) 45%, rgba(210,235,255,0.84) 100%)',
        panelRing: 'rgba(94,234,212,0.3)',
        border: 'rgba(96,165,250,0.26)',
        borderMuted: 'rgba(165,180,252,0.2)',
        textPrimary: '#12263c',
        textSecondary: '#27466b',
        textMuted: '#4f6f90',
        accent: '#38bdf8',
        accentSoft: '#5eead4',
        accentContrast: '#f4fbff',
        accentGradient: 'linear-gradient(135deg, rgba(56,189,248,0.9) 0%, rgba(94,234,212,0.85) 100%)',
        nav: 'rgba(229,243,255,0.86)',
        navHover: 'rgba(56,189,248,0.18)',
        navActive: 'rgba(94,234,212,0.24)',
        pill: 'rgba(56,189,248,0.22)',
        glass: 'rgba(255,255,255,0.58)',
        shadow: '0 46px 160px -62px rgba(45,115,201,0.32)',
      }),
      dark: createPalette({
        background: '#05071b',
        backgroundAlt: '#0c1127',
        surface: 'rgba(16,25,45,0.92)',
        surfaceMuted: 'rgba(20,32,58,0.88)',
        panel: 'rgba(25,41,68,0.8)',
        panelGradient: 'linear-gradient(215deg, rgba(6,10,28,0.92) 0%, rgba(41,70,109,0.72) 55%, rgba(5,8,20,0.92) 100%)',
        panelRing: 'rgba(94,234,212,0.32)',
        card: 'rgba(13,23,44,0.92)',
        cardHover: 'rgba(11,19,38,0.96)',
        border: 'rgba(96,165,250,0.24)',
        borderMuted: 'rgba(56,189,248,0.2)',
        textPrimary: '#d9f6ff',
        textSecondary: '#bdefff',
        textMuted: '#8cdcf5',
        accent: '#5eead4',
        accentSoft: '#818cf8',
        accentContrast: '#03121f',
        accentGradient: 'linear-gradient(150deg, rgba(94,234,212,0.88) 0%, rgba(129,140,248,0.78) 100%)',
        nav: 'rgba(6,14,30,0.82)',
        navHover: 'rgba(94,234,212,0.22)',
        navActive: 'rgba(129,140,248,0.28)',
        pill: 'rgba(94,234,212,0.24)',
        glass: 'rgba(94,234,212,0.2)',
        shadow: '0 52px 178px -70px rgba(0,0,0,0.62)',
      }),
    },
  },
  ainex: {
    id: 'ainex',
    name: 'Ainex Pulse',
    description: 'High-contrast midnight canvas with molten orange accents and subtle ember glow.',
    previewGradient: 'linear-gradient(135deg, #ff6b1a 0%, #1f2937 60%, #0b0f1c 100%)',
    appearance: 'dark',
    palettes: {
      light: createPalette({
        background: '#fff5ed',
        backgroundAlt: '#ffe6d2',
        surface: 'rgba(255,255,255,0.95)',
        surfaceMuted: 'rgba(255,245,235,0.92)',
        panel: 'rgba(255,231,210,0.82)',
        panelGradient: 'linear-gradient(200deg, rgba(255,249,242,0.95) 0%, rgba(255,235,217,0.88) 55%, rgba(255,223,196,0.84) 100%)',
        panelRing: 'rgba(249,115,22,0.25)',
        border: 'rgba(249,115,22,0.16)',
        borderMuted: 'rgba(255,178,107,0.18)',
        textPrimary: '#1f2937',
        textSecondary: '#334155',
        textMuted: '#64748b',
        accent: '#f97316',
        accentSoft: '#fb923c',
        accentContrast: '#fff7ed',
        accentGradient: 'linear-gradient(135deg, rgba(249,115,22,0.92) 0%, rgba(255,159,64,0.84) 55%, rgba(255,108,26,0.9) 100%)',
        nav: 'rgba(255,242,230,0.9)',
        navHover: 'rgba(249,115,22,0.13)',
        navActive: 'rgba(249,115,22,0.24)',
        pill: 'rgba(249,115,22,0.2)',
        glass: 'rgba(255,255,255,0.58)',
        shadow: '0 38px 120px -62px rgba(249,115,22,0.32)',
      }),
      dark: createPalette({
        background: '#0b1020',
        backgroundAlt: '#111a2d',
        surface: 'rgba(17,24,39,0.94)',
        surfaceMuted: 'rgba(20,31,49,0.9)',
        panel: 'rgba(18,29,47,0.88)',
        panelGradient: 'linear-gradient(215deg, rgba(13,22,38,0.96) 0%, rgba(5,9,17,0.94) 55%, rgba(9,13,22,0.98) 100%)',
        panelRing: 'rgba(249,115,22,0.4)',
        card: 'rgba(24,35,54,0.94)',
        cardHover: 'rgba(28,41,63,0.96)',
        border: 'rgba(255,255,255,0.08)',
        borderMuted: 'rgba(148,163,184,0.12)',
        textPrimary: '#f8fafc',
        textSecondary: '#e2e8f0',
        textMuted: '#94a3b8',
        accent: '#fb923c',
        accentSoft: '#f97316',
        accentContrast: '#1f2937',
        accentGradient: 'linear-gradient(135deg, rgba(249,115,22,0.95) 0%, rgba(255,145,48,0.85) 45%, rgba(255,101,20,0.88) 100%)',
        success: '#34d399',
        warning: '#fbbf24',
        danger: '#f87171',
        info: '#38bdf8',
        ring: 'rgba(249,115,22,0.45)',
        shadow: '0 48px 160px -70px rgba(8,12,24,0.8)',
        glass: 'rgba(249,115,22,0.15)',
        nav: 'rgba(12,19,35,0.9)',
        navHover: 'rgba(249,115,22,0.22)',
        navActive: 'rgba(249,115,22,0.32)',
        pill: 'rgba(249,115,22,0.26)',
      }),
    },
  },
};

const fontCatalog: Record<FontId, FontDefinition> = {
  sora: {
    id: 'sora',
    name: 'Sora',
    role: 'Hero & logotype',
    importUrl: 'https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap',
    body: '"Sora", "Inter", system-ui, sans-serif',
    display: '"Sora", "Inter", system-ui, sans-serif',
    sample: 'Sora keeps milestones bold.',
  },
  plusJakarta: {
    id: 'plusJakarta',
    name: 'Plus Jakarta Sans',
    role: 'Primary UI',
    importUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
    body: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
    display: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
    sample: 'Next habit check-in starts now.',
  },
  spaceGrotesk: {
    id: 'spaceGrotesk',
    name: 'Space Grotesk',
    role: 'Numeric data',
    importUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap',
    body: '"Inter", system-ui, sans-serif',
    display: '"Space Grotesk", "Inter", system-ui, sans-serif',
    sample: '78% completion over 14 days.',
  },
  dmSans: {
    id: 'dmSans',
    name: 'DM Sans',
    role: 'Controls & buttons',
    importUrl: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap',
    body: '"DM Sans", "Inter", system-ui, sans-serif',
    display: '"DM Sans", "Inter", system-ui, sans-serif',
    sample: 'Tap to celebrate streaks.',
  },
  manrope: {
    id: 'manrope',
    name: 'Manrope',
    role: 'Body copy',
    importUrl: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap',
    body: '"Manrope", "Inter", system-ui, sans-serif',
    display: '"Manrope", "Inter", system-ui, sans-serif',
    sample: 'Habit stories stay legible.',
  },
  outfit: {
    id: 'outfit',
    name: 'Outfit',
    role: 'Headers / cards',
    importUrl: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap',
    body: '"Inter", system-ui, sans-serif',
    display: '"Outfit", "Inter", system-ui, sans-serif',
    sample: 'Card stacks feel friendly.',
  },
  urbanist: {
    id: 'urbanist',
    name: 'Urbanist',
    role: 'Mobile-first UI',
    importUrl: 'https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700&display=swap',
    body: '"Urbanist", "Inter", system-ui, sans-serif',
    display: '"Urbanist", "Inter", system-ui, sans-serif',
    sample: 'Compact layouts breathe easier.',
  },
  redHatDisplay: {
    id: 'redHatDisplay',
    name: 'Red Hat Display',
    role: 'Celebrations',
    importUrl: 'https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@400;500;600;700&display=swap',
    body: '"Inter", system-ui, sans-serif',
    display: '"Red Hat Display", "Inter", system-ui, sans-serif',
    sample: 'Celebrate every milestone.',
  },
  workSans: {
    id: 'workSans',
    name: 'Work Sans',
    role: 'Supplementary text',
    importUrl: 'https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700&display=swap',
    body: '"Work Sans", "Inter", system-ui, sans-serif',
    display: '"Work Sans", "Inter", system-ui, sans-serif',
    sample: 'Secondary details stay clear.',
  },
  lora: {
    id: 'lora',
    name: 'Lora',
    role: 'Editorial notes',
    importUrl: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap',
    body: '"Inter", system-ui, sans-serif',
    display: '"Lora", "Georgia", serif',
    sample: 'Reflective prompts feel thoughtful.',
  },
};

export const themeFonts = fontCatalog;
export const fontList = Object.values(themeFonts);

export const defaultThemePreference: ThemePreference = {
  preset: 'tidal',
  font: 'plusJakarta',
  mode: themePresets.tidal.appearance,
};

export const themePresetIds = Object.keys(themePresets) as ThemePresetId[];

export const themeList = themePresetIds.map((id) => {
  const { name, description, previewGradient, appearance } = themePresets[id];
  return { id, name, description, previewGradient, appearance };
});

export const resolvePalette = (preset: ThemePresetId, overrideMode?: ThemeMode): ThemePalette => {
  const fallbackTheme = themePresets[defaultThemePreference.preset];
  const selected = themePresets[preset] ?? fallbackTheme;
  const targetMode = overrideMode ?? selected.appearance ?? defaultThemePreference.mode;
  const palette = selected.palettes[targetMode] ?? selected.palettes[selected.appearance] ?? selected.palettes.light;
  return palette ?? fallbackTheme.palettes[fallbackTheme.appearance];
};

export const resolveFont = (font: FontId): FontDefinition => {
  return themeFonts[font] ?? themeFonts[defaultThemePreference.font];
};

export const getFontImportLinks = (font: FontId): string[] => {
  const fontDef = resolveFont(font);
  return [fontDef.importUrl];
};
