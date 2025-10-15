/**
 * Family Member Card Texture Library
 *
 * Universal patterns that adapt to any user-chosen color.
 * Each pattern automatically adjusts opacity and blend based on color lightness.
 */

export type TexturePatternId =
  | 'sparkle-bubbles'
  | 'minimalist-dots'
  | 'playful-mix'
  | 'fall'
  | 'halloween'
  | 'winter'
  | 'christmas';

export interface TexturePattern {
  id: TexturePatternId;
  name: string;
  description: string;
  vibe: string;
  getSvg: (accentFade: string, neutralSoft: string, neutralBold: string) => string;
}

const svgToDataUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

export const texturePatterns: Record<TexturePatternId, TexturePattern> = {
  'sparkle-bubbles': {
    id: 'sparkle-bubbles',
    name: 'Sparkle Bubbles',
    description: 'Friendly bubbles with gentle sparkles',
    vibe: 'Warm, approachable, perfect for families',
    getSvg: (accentFade: string, neutralSoft: string, neutralBold: string) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" opacity="0.85">
        <defs>
          <radialGradient id="bubble-grad">
            <stop offset="0%" stop-color="${accentFade}" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="${accentFade}" stop-opacity="0"/>
          </radialGradient>
        </defs>

        <!-- Large gentle bubbles -->
        <circle cx="45" cy="60" r="28" fill="url(#bubble-grad)"/>
        <circle cx="155" cy="130" r="35" fill="url(#bubble-grad)" opacity="0.8"/>
        <circle cx="110" cy="45" r="22" fill="url(#bubble-grad)" opacity="0.9"/>

        <!-- Medium bubbles with ring -->
        <circle cx="75" cy="145" r="18" fill="url(#bubble-grad)" opacity="0.85"/>
        <circle cx="75" cy="145" r="18" fill="none" stroke="${neutralSoft}" stroke-width="1.5" opacity="0.3"/>
        <circle cx="170" cy="70" r="20" fill="url(#bubble-grad)" opacity="0.75"/>
        <circle cx="170" cy="70" r="20" fill="none" stroke="${neutralSoft}" stroke-width="1.5" opacity="0.25"/>

        <!-- Small sparkle bubbles -->
        <circle cx="30" cy="120" r="10" fill="${neutralSoft}" opacity="0.5"/>
        <circle cx="140" cy="25" r="12" fill="${accentFade}" opacity="0.6"/>
        <circle cx="95" cy="175" r="14" fill="${neutralSoft}" opacity="0.45"/>
        <circle cx="185" cy="160" r="11" fill="${accentFade}" opacity="0.5"/>

        <!-- Tiny accent dots -->
        <circle cx="60" cy="30" r="4" fill="${accentFade}" opacity="0.7"/>
        <circle cx="125" cy="90" r="5" fill="${neutralBold}" opacity="0.4"/>
        <circle cx="40" cy="180" r="4" fill="${accentFade}" opacity="0.65"/>
        <circle cx="180" cy="105" r="5" fill="${neutralSoft}" opacity="0.5"/>

        <!-- Subtle connecting curves -->
        <path d="M45,60 Q80,40 110,45" stroke="${neutralSoft}" stroke-width="1" fill="none" opacity="0.2"/>
        <path d="M155,130 Q130,100 110,45" stroke="${neutralSoft}" stroke-width="0.8" fill="none" opacity="0.15"/>
      </svg>
    `
  },

  'minimalist-dots': {
    id: 'minimalist-dots',
    name: 'Minimalist Dots',
    description: 'Clean dots with circular accents',
    vibe: 'Professional, understated, never distracting',
    getSvg: (accentFade: string, neutralSoft: string, neutralBold: string) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" opacity="0.8">
        <defs>
          <pattern id="dot-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="${neutralSoft}" opacity="0.6"/>
          </pattern>
        </defs>

        <!-- Dot grid background -->
        <rect width="200" height="200" fill="url(#dot-pattern)"/>

        <!-- Accent circles -->
        <circle cx="60" cy="60" r="25" fill="none" stroke="${accentFade}" stroke-width="1.5" opacity="0.4"/>
        <circle cx="140" cy="140" r="30" fill="none" stroke="${accentFade}" stroke-width="1.5" opacity="0.35"/>
        <circle cx="100" cy="100" r="15" fill="${neutralBold}" opacity="0.3"/>

        <!-- Small accent rings -->
        <circle cx="40" cy="160" r="12" fill="none" stroke="${neutralSoft}" stroke-width="1.2" opacity="0.4"/>
        <circle cx="160" cy="40" r="14" fill="none" stroke="${accentFade}" stroke-width="1.2" opacity="0.35"/>
      </svg>
    `
  },

  'fall': {
    id: 'fall',
    name: 'Fall',
    description: 'Autumn leaves and harvest vibes',
    vibe: 'Cozy, warm, seasonal',
    getSvg: (accentFade: string, neutralSoft: string, neutralBold: string) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" opacity="0.85">
        <!-- Falling leaves -->
        <g opacity="0.4">
          <!-- Maple leaf shapes (simplified) -->
          <path d="M30,40 L35,50 L40,40 L35,45 L35,55 L30,50 Z" fill="${accentFade}" transform="rotate(15 35 47.5)"/>
          <path d="M150,70 L155,80 L160,70 L155,75 L155,85 L150,80 Z" fill="${neutralBold}" transform="rotate(-25 155 77.5)"/>
          <path d="M90,130 L95,140 L100,130 L95,135 L95,145 L90,140 Z" fill="${accentFade}" transform="rotate(45 95 137.5)"/>
          <path d="M170,150 L175,160 L180,150 L175,155 L175,165 L170,160 Z" fill="${neutralSoft}" transform="rotate(-10 175 157.5)"/>
        </g>

        <!-- Acorns -->
        <g opacity="0.35">
          <ellipse cx="60" cy="90" rx="4" ry="5" fill="${neutralBold}"/>
          <rect x="58" y="85" width="4" height="3" fill="${accentFade}" rx="1"/>

          <ellipse cx="140" cy="120" rx="4" ry="5" fill="${neutralBold}"/>
          <rect x="138" y="115" width="4" height="3" fill="${accentFade}" rx="1"/>
        </g>

        <!-- Swirling wind paths -->
        <path d="M0,60 Q40,50 70,65 T150,60" stroke="${neutralSoft}" stroke-width="1.5" fill="none" opacity="0.3" stroke-dasharray="5 5"/>
        <path d="M20,140 Q60,130 100,145 T190,135" stroke="${accentFade}" stroke-width="1.2" fill="none" opacity="0.25" stroke-dasharray="5 5"/>

        <!-- Small dots (seeds) -->
        <circle cx="50" cy="180" r="2" fill="${neutralBold}" opacity="0.4"/>
        <circle cx="120" cy="30" r="2" fill="${accentFade}" opacity="0.4"/>
        <circle cx="180" cy="100" r="2" fill="${neutralSoft}" opacity="0.3"/>
      </svg>
    `
  },

  'halloween': {
    id: 'halloween',
    name: 'Halloween',
    description: 'Spooky bats, spiders, and magic',
    vibe: 'Playful, mysterious, festive',
    getSvg: (accentFade: string, neutralSoft: string, neutralBold: string) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" opacity="0.85">
        <!-- Bats (improved) -->
        <g opacity="0.45">
          <!-- Bat 1 -->
          <g transform="translate(40, 50)">
            <ellipse cx="0" cy="0" rx="3" ry="2" fill="${neutralBold}"/>
            <path d="M-3,-1 Q-8,-3 -10,-1 Q-8,1 -3,0" fill="${neutralBold}"/>
            <path d="M3,-1 Q8,-3 10,-1 Q8,1 3,0" fill="${neutralBold}"/>
            <circle cx="-1" cy="-0.5" r="0.5" fill="rgba(0,0,0,0.3)"/>
            <circle cx="1" cy="-0.5" r="0.5" fill="rgba(0,0,0,0.3)"/>
          </g>

          <!-- Bat 2 -->
          <g transform="translate(160, 90)">
            <ellipse cx="0" cy="0" rx="4" ry="2.5" fill="${accentFade}"/>
            <path d="M-4,-1 Q-10,-4 -13,-1 Q-10,2 -4,0" fill="${accentFade}"/>
            <path d="M4,-1 Q10,-4 13,-1 Q10,2 4,0" fill="${accentFade}"/>
          </g>

          <!-- Bat 3 -->
          <g transform="translate(100, 30)">
            <ellipse cx="0" cy="0" rx="2.5" ry="1.5" fill="${neutralSoft}"/>
            <path d="M-2.5,-0.5 Q-6,-2 -8,-0.5 Q-6,1 -2.5,0" fill="${neutralSoft}"/>
            <path d="M2.5,-0.5 Q6,-2 8,-0.5 Q6,1 2.5,0" fill="${neutralSoft}"/>
          </g>
        </g>

        <!-- Spiders and webs -->
        <g opacity="0.4">
          <!-- Spider 1 with legs -->
          <g transform="translate(70, 140)">
            <ellipse cx="0" cy="0" rx="4" ry="3" fill="${neutralBold}"/>
            <circle cx="0" cy="-1" r="2.5" fill="${neutralBold}"/>
            <!-- Legs -->
            <path d="M-2,-2 L-6,-5 M-1,-3 L-4,-7 M1,-3 L4,-7 M2,-2 L6,-5" stroke="${neutralBold}" stroke-width="0.8" fill="none"/>
            <path d="M-2,2 L-6,5 M-1,3 L-4,7 M1,3 L4,7 M2,2 L6,5" stroke="${neutralBold}" stroke-width="0.8" fill="none"/>
          </g>

          <!-- Spider web corner -->
          <g transform="translate(180, 30)">
            <path d="M0,0 L15,0 M0,0 L12,8 M0,0 L8,12 M0,0 L0,15" stroke="${neutralSoft}" stroke-width="0.8" fill="none"/>
            <path d="M3,0 Q3,3 0,3 M6,0 Q6,6 0,6 M9,0 Q9,9 0,9" stroke="${neutralSoft}" stroke-width="0.6" fill="none"/>
          </g>
        </g>

        <!-- Pumpkins (simplified) -->
        <g opacity="0.4">
          <g transform="translate(30, 170)">
            <ellipse cx="0" cy="0" rx="8" ry="7" fill="${accentFade}"/>
            <path d="M-3,-7 L0,-10 L3,-7" stroke="${neutralBold}" stroke-width="1.5" fill="none"/>
            <path d="M-5,-2 L-5,2 M0,-3 L0,3 M5,-2 L5,2" stroke="${neutralBold}" stroke-width="1" opacity="0.5"/>
          </g>
        </g>

        <!-- Ghosts (improved) -->
        <g opacity="0.35">
          <g transform="translate(130, 160)">
            <ellipse cx="0" cy="-5" rx="6" ry="7" fill="${neutralSoft}"/>
            <path d="M-6,2 Q-6,5 -4,6 Q-2,5 0,6 Q2,5 4,6 Q6,5 6,2 L6,-2" fill="${neutralSoft}"/>
            <circle cx="-2" cy="-7" r="1" fill="rgba(0,0,0,0.3)"/>
            <circle cx="2" cy="-7" r="1" fill="rgba(0,0,0,0.3)"/>
          </g>
        </g>

        <!-- Stars and sparkles -->
        <g opacity="0.45">
          <path d="M120,70 L122,76 L128,76 L123,80 L125,86 L120,82 L115,86 L117,80 L112,76 L118,76 Z" fill="${accentFade}"/>
          <path d="M50,100 L52,106 L58,106 L53,110 L55,116 L50,112 L45,116 L47,110 L42,106 L48,106 Z" fill="${neutralBold}"/>

          <!-- Small sparkles -->
          <circle cx="170" cy="130" r="2" fill="${accentFade}" opacity="0.6"/>
          <circle cx="90" cy="60" r="2" fill="${neutralSoft}" opacity="0.6"/>
          <circle cx="40" cy="120" r="1.5" fill="${neutralBold}" opacity="0.5"/>
        </g>

        <!-- Wispy magic trails -->
        <path d="M10,80 Q50,70 80,85 T150,75" stroke="${neutralSoft}" stroke-width="1.2" fill="none" opacity="0.25" stroke-dasharray="8 8"/>
        <path d="M30,130 Q70,120 110,135 T190,125" stroke="${accentFade}" stroke-width="1" fill="none" opacity="0.2" stroke-dasharray="8 8"/>

        <!-- Crescent moons -->
        <g opacity="0.35">
          <path d="M185,160 A10,10 0 1,0 185,180 A8,8 0 1,1 185,160" fill="${neutralBold}"/>
          <path d="M15,40 A7,7 0 1,0 15,54 A5,5 0 1,1 15,40" fill="${accentFade}"/>
        </g>

        <!-- Tiny tombstones -->
        <g opacity="0.3">
          <rect x="165" y="185" width="8" height="10" rx="2" fill="${neutralBold}"/>
          <rect x="145" y="188" width="6" height="8" rx="1.5" fill="${neutralSoft}"/>
        </g>
      </svg>
    `
  },

  'winter': {
    id: 'winter',
    name: 'Winter',
    description: 'Snowflakes and frosty patterns',
    vibe: 'Cool, peaceful, elegant',
    getSvg: (accentFade: string, neutralSoft: string, neutralBold: string) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" opacity="0.85">
        <!-- Snowflakes -->
        <g opacity="0.4">
          <!-- Snowflake 1 -->
          <g transform="translate(50, 50)">
            <line x1="0" y1="-10" x2="0" y2="10" stroke="${accentFade}" stroke-width="1"/>
            <line x1="-10" y1="0" x2="10" y2="0" stroke="${accentFade}" stroke-width="1"/>
            <line x1="-7" y1="-7" x2="7" y2="7" stroke="${accentFade}" stroke-width="0.8"/>
            <line x1="-7" y1="7" x2="7" y2="-7" stroke="${accentFade}" stroke-width="0.8"/>
          </g>

          <!-- Snowflake 2 -->
          <g transform="translate(150, 100)">
            <line x1="0" y1="-12" x2="0" y2="12" stroke="${neutralBold}" stroke-width="1"/>
            <line x1="-12" y1="0" x2="12" y2="0" stroke="${neutralBold}" stroke-width="1"/>
            <line x1="-8" y1="-8" x2="8" y2="8" stroke="${neutralBold}" stroke-width="0.8"/>
            <line x1="-8" y1="8" x2="8" y2="-8" stroke="${neutralBold}" stroke-width="0.8"/>
          </g>

          <!-- Snowflake 3 -->
          <g transform="translate(100, 160)">
            <line x1="0" y1="-9" x2="0" y2="9" stroke="${neutralSoft}" stroke-width="1"/>
            <line x1="-9" y1="0" x2="9" y2="0" stroke="${neutralSoft}" stroke-width="1"/>
            <line x1="-6" y1="-6" x2="6" y2="6" stroke="${neutralSoft}" stroke-width="0.8"/>
            <line x1="-6" y1="6" x2="6" y2="-6" stroke="${neutralSoft}" stroke-width="0.8"/>
          </g>
        </g>

        <!-- Ice crystals (small) -->
        <g opacity="0.35">
          <circle cx="30" cy="120" r="3" fill="${accentFade}"/>
          <circle cx="170" cy="60" r="3" fill="${neutralBold}"/>
          <circle cx="120" cy="40" r="2.5" fill="${neutralSoft}"/>
          <circle cx="70" cy="180" r="2.5" fill="${accentFade}"/>
          <circle cx="180" cy="150" r="3" fill="${neutralSoft}"/>
        </g>

        <!-- Frost patterns (curved lines) -->
        <path d="M20,80 Q60,75 90,90" stroke="${neutralSoft}" stroke-width="1" fill="none" opacity="0.25"/>
        <path d="M110,130 Q140,125 170,140" stroke="${accentFade}" stroke-width="1" fill="none" opacity="0.25"/>
        <path d="M10,150 Q40,145 70,155" stroke="${neutralBold}" stroke-width="0.8" fill="none" opacity="0.2"/>

        <!-- Snow dots falling -->
        <circle cx="40" cy="30" r="2" fill="${neutralSoft}" opacity="0.5"/>
        <circle cx="130" cy="80" r="2" fill="${accentFade}" opacity="0.45"/>
        <circle cx="160" cy="180" r="2" fill="${neutralBold}" opacity="0.4"/>
        <circle cx="90" cy="110" r="1.5" fill="${neutralSoft}" opacity="0.45"/>
      </svg>
    `
  },

  'christmas': {
    id: 'christmas',
    name: 'Christmas',
    description: 'Festive ornaments and stars',
    vibe: 'Joyful, celebratory, magical',
    getSvg: (accentFade: string, neutralSoft: string, neutralBold: string) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" opacity="0.82">
        <!-- Ornaments (baubles) -->
        <g opacity="0.4">
          <circle cx="50" cy="60" r="12" fill="${accentFade}" stroke="${neutralBold}" stroke-width="0.5"/>
          <rect x="48" y="48" width="4" height="6" fill="${neutralBold}" rx="1"/>

          <circle cx="150" cy="120" r="15" fill="${neutralSoft}" stroke="${accentFade}" stroke-width="0.5"/>
          <rect x="148" y="105" width="4" height="8" fill="${accentFade}" rx="1"/>

          <circle cx="100" cy="170" r="10" fill="${neutralBold}" stroke="${neutralSoft}" stroke-width="0.5"/>
          <rect x="98" y="160" width="4" height="5" fill="${neutralSoft}" rx="1"/>
        </g>

        <!-- Stars -->
        <g opacity="0.45">
          <path d="M120,30 L123,40 L133,40 L125,46 L128,56 L120,50 L112,56 L115,46 L107,40 L117,40 Z" fill="${accentFade}"/>
          <path d="M40,140 L42,147 L49,147 L43,151 L45,158 L40,154 L35,158 L37,151 L31,147 L38,147 Z" fill="${neutralBold}"/>
          <path d="M170,70 L172,77 L179,77 L173,81 L175,88 L170,84 L165,88 L167,81 L161,77 L168,77 Z" fill="${neutralSoft}"/>
        </g>

        <!-- Candy canes (simplified hooks) -->
        <g opacity="0.35">
          <path d="M180,140 Q185,145 185,150 L185,165" stroke="${accentFade}" stroke-width="2.5" fill="none"/>
          <path d="M65,90 Q70,95 70,100 L70,110" stroke="${neutralBold}" stroke-width="2" fill="none"/>
        </g>

        <!-- Sparkles -->
        <g opacity="0.4">
          <path d="M30,30 L32,34 L36,34 L33,37 L34,41 L30,38 L26,41 L27,37 L24,34 L28,34 Z" fill="${accentFade}"/>
          <path d="M160,160 L162,164 L166,164 L163,167 L164,171 L160,168 L156,171 L157,167 L154,164 L158,164 Z" fill="${neutralSoft}"/>
          <circle cx="90" cy="50" r="2" fill="${neutralBold}" opacity="0.6"/>
          <circle cx="140" cy="180" r="2" fill="${accentFade}" opacity="0.6"/>
        </g>

        <!-- Garland curves -->
        <path d="M10,100 Q50,90 90,100 T170,100" stroke="${neutralSoft}" stroke-width="1.5" fill="none" opacity="0.3" stroke-dasharray="8 4"/>
        <path d="M30,140 Q70,130 110,140 T190,140" stroke="${accentFade}" stroke-width="1.2" fill="none" opacity="0.25" stroke-dasharray="8 4"/>
      </svg>
    `
  },

  'playful-mix': {
    id: 'playful-mix',
    name: 'Playful Mix',
    description: 'Bubbles, stars, and confetti',
    vibe: 'Fun, energetic, celebratory',
    getSvg: (accentFade: string, neutralSoft: string, neutralBold: string) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" opacity="0.82">
        <!-- Bubbles -->
        <circle cx="50" cy="50" r="20" fill="${accentFade}" opacity="0.4"/>
        <circle cx="150" cy="140" r="25" fill="${accentFade}" opacity="0.35"/>
        <circle cx="100" cy="180" r="18" fill="${neutralSoft}" opacity="0.4"/>

        <!-- Stars -->
        <path d="M120,35 L123,42 L130,42 L125,47 L127,54 L120,49 L113,54 L115,47 L110,42 L117,42 Z"
              fill="${neutralBold}" opacity="0.45"/>
        <path d="M70,160 L72,165 L77,165 L73,169 L75,174 L70,170 L65,174 L67,169 L63,165 L68,165 Z"
              fill="${accentFade}" opacity="0.5"/>
        <path d="M180,80 L182,85 L187,85 L183,89 L185,94 L180,90 L175,94 L177,89 L173,85 L178,85 Z"
              fill="${neutralSoft}" opacity="0.45"/>

        <!-- Confetti pieces -->
        <rect x="30" y="120" width="8" height="8" fill="${accentFade}" opacity="0.5" transform="rotate(25 34 124)"/>
        <rect x="160" y="60" width="10" height="10" fill="${neutralSoft}" opacity="0.5" transform="rotate(-20 165 65)"/>
        <rect x="90" y="90" width="7" height="7" fill="${neutralBold}" opacity="0.45" transform="rotate(45 93.5 93.5)"/>

        <!-- Small accents -->
        <circle cx="180" cy="120" r="6" fill="${neutralBold}" opacity="0.4"/>
        <circle cx="40" cy="180" r="7" fill="${accentFade}" opacity="0.45"/>
        <circle cx="100" cy="20" r="5" fill="${neutralSoft}" opacity="0.5"/>
        <circle cx="20" cy="90" r="6" fill="${accentFade}" opacity="0.4"/>
      </svg>
    `
  }
};

export const defaultTexturePattern: TexturePatternId = 'sparkle-bubbles';

/**
 * Get texture SVG data URL for a given pattern and colors
 */
export function getTextureDataUrl(
  patternId: TexturePatternId,
  accentFade: string,
  neutralSoft: string,
  neutralBold: string
): string {
  const pattern = texturePatterns[patternId] || texturePatterns[defaultTexturePattern];
  const svg = pattern.getSvg(accentFade, neutralSoft, neutralBold);
  return svgToDataUrl(svg);
}

/**
 * Get all available texture patterns for selection UI
 */
export function getTexturePatternList() {
  return Object.values(texturePatterns);
}
