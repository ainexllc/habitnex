'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { ProfileImage } from '@/components/ui/ProfileImage';
import { Star, Trophy } from 'lucide-react';

const MEMBER_COLORS = [
  '#FF6B6B', // Coral Red
  '#4ECDC4', // Turquoise
  '#FFD93D', // Golden Yellow
  '#A78BFA', // Purple
  '#34D399', // Emerald Green
];

const TEXTURE_OPTIONS = [
  {
    id: 'option1',
    name: 'Playful Bubbles',
    description: 'Floating bubbles with soft circles',
    getSvg: (accentFade: string, neutralSoft: string) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <defs>
          <radialGradient id="bubble1">
            <stop offset="0%" stop-color="${accentFade}" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="${accentFade}" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <!-- Large bubbles -->
        <circle cx="40" cy="50" r="25" fill="url(#bubble1)" opacity="0.6"/>
        <circle cx="160" cy="140" r="30" fill="url(#bubble1)" opacity="0.5"/>
        <circle cx="120" cy="60" r="20" fill="url(#bubble1)" opacity="0.7"/>
        <!-- Medium bubbles -->
        <circle cx="70" cy="150" r="15" fill="${neutralSoft}" opacity="0.4"/>
        <circle cx="180" cy="70" r="18" fill="${neutralSoft}" opacity="0.5"/>
        <!-- Small floating bubbles -->
        <circle cx="30" cy="120" r="8" fill="${accentFade}" opacity="0.6"/>
        <circle cx="150" cy="30" r="10" fill="${accentFade}" opacity="0.5"/>
        <circle cx="90" cy="180" r="12" fill="${neutralSoft}" opacity="0.4"/>
      </svg>
    `
  },
  {
    id: 'option2',
    name: 'Confetti Party',
    description: 'Celebratory confetti pieces scattered around',
    getSvg: (accentFade: string, neutralSoft: string) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <!-- Confetti squares -->
        <rect x="30" y="40" width="12" height="12" fill="#FFD93D" opacity="0.6" transform="rotate(25 36 46)"/>
        <rect x="140" y="80" width="15" height="15" fill="#FF6B6B" opacity="0.5" transform="rotate(-20 147.5 87.5)"/>
        <rect x="90" y="160" width="10" height="10" fill="#4ECDC4" opacity="0.6" transform="rotate(45 95 165)"/>
        <!-- Confetti rectangles -->
        <rect x="160" y="30" width="8" height="20" fill="#A78BFA" opacity="0.5" transform="rotate(60 164 40)"/>
        <rect x="50" y="140" width="8" height="18" fill="#34D399" opacity="0.6" transform="rotate(-30 54 149)"/>
        <!-- Confetti circles -->
        <circle cx="120" cy="50" r="6" fill="#FF6B6B" opacity="0.6"/>
        <circle cx="70" cy="100" r="8" fill="#FFD93D" opacity="0.5"/>
        <circle cx="180" cy="150" r="7" fill="#4ECDC4" opacity="0.6"/>
        <!-- Streamers -->
        <path d="M20,20 Q40,60 30,100 T40,160" stroke="${accentFade}" stroke-width="2" fill="none" opacity="0.4"/>
        <path d="M180,30 Q160,80 170,130 T160,180" stroke="${neutralSoft}" stroke-width="2" fill="none" opacity="0.3"/>
      </svg>
    `
  },
  {
    id: 'option3',
    name: 'Sparkle Magic',
    description: 'Twinkling stars and sparkles',
    getSvg: (accentFade: string, neutralSoft: string) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <!-- Large 4-point stars -->
        <path d="M50,40 L53,50 L63,50 L55,57 L58,67 L50,60 L42,67 L45,57 L37,50 L47,50 Z"
              fill="${accentFade}" opacity="0.6"/>
        <path d="M150,130 L153,140 L163,140 L155,147 L158,157 L150,150 L142,157 L145,147 L137,140 L147,140 Z"
              fill="${accentFade}" opacity="0.5"/>
        <!-- Medium sparkles -->
        <path d="M120,60 L122,64 L126,64 L123,67 L125,71 L120,68 L115,71 L117,67 L114,64 L118,64 Z"
              fill="${neutralSoft}" opacity="0.7"/>
        <path d="M80,150 L82,154 L86,154 L83,157 L85,161 L80,158 L75,161 L77,157 L74,154 L78,154 Z"
              fill="${neutralSoft}" opacity="0.6"/>
        <!-- Small twinkles -->
        <circle cx="30" cy="100" r="3" fill="#FFD93D" opacity="0.8">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="170" cy="70" r="2" fill="#4ECDC4" opacity="0.7">
          <animate attributeName="opacity" values="0.2;0.7;0.2" dur="3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="100" cy="180" r="2.5" fill="#FF6B6B" opacity="0.6">
          <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2.5s" repeatCount="indefinite"/>
        </circle>
        <!-- Plus signs for extra sparkle -->
        <path d="M180,40 L180,48 M176,44 L184,44" stroke="#A78BFA" stroke-width="2" opacity="0.5"/>
        <path d="M40,160 L40,168 M36,164 L44,164" stroke="#34D399" stroke-width="2" opacity="0.6"/>
      </svg>
    `
  },
  {
    id: 'option4',
    name: 'Wavy Lines',
    description: 'Smooth flowing wave patterns',
    getSvg: (accentFade: string, neutralSoft: string) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <!-- Large flowing waves -->
        <path d="M-20,60 Q40,40 80,60 T200,60"
              stroke="${accentFade}" stroke-width="2" fill="none" opacity="0.4"/>
        <path d="M-20,100 Q40,80 80,100 T200,100"
              stroke="${neutralSoft}" stroke-width="2" fill="none" opacity="0.5"/>
        <path d="M-20,140 Q40,120 80,140 T200,140"
              stroke="${accentFade}" stroke-width="2" fill="none" opacity="0.3"/>
        <!-- Smaller accent waves -->
        <path d="M30,30 Q70,20 110,30"
              stroke="#4ECDC4" stroke-width="1.5" fill="none" opacity="0.4"/>
        <path d="M100,180 Q140,170 180,180"
              stroke="#FFD93D" stroke-width="1.5" fill="none" opacity="0.4"/>
        <!-- Dots along the waves -->
        <circle cx="60" cy="55" r="3" fill="${accentFade}" opacity="0.6"/>
        <circle cx="140" cy="55" r="3" fill="${accentFade}" opacity="0.5"/>
        <circle cx="60" cy="95" r="3" fill="${neutralSoft}" opacity="0.6"/>
        <circle cx="140" cy="95" r="3" fill="${neutralSoft}" opacity="0.5"/>
      </svg>
    `
  },
  {
    id: 'option5',
    name: 'Geometric Shapes',
    description: 'Modern triangles and hexagons',
    getSvg: (accentFade: string, neutralSoft: string) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <!-- Triangles -->
        <polygon points="40,30 50,50 30,50" fill="#4ECDC4" opacity="0.4"/>
        <polygon points="160,140 175,165 145,165" fill="#FFD93D" opacity="0.5"/>
        <polygon points="100,170 110,185 90,185" fill="#FF6B6B" opacity="0.4"/>
        <!-- Hexagons (simplified) -->
        <polygon points="150,50 160,45 170,50 170,60 160,65 150,60"
                 fill="${accentFade}" opacity="0.5" stroke="${accentFade}" stroke-width="1"/>
        <polygon points="60,120 70,115 80,120 80,130 70,135 60,130"
                 fill="${neutralSoft}" opacity="0.6" stroke="${neutralSoft}" stroke-width="1"/>
        <!-- Small accent shapes -->
        <circle cx="120" cy="40" r="4" fill="#A78BFA" opacity="0.6"/>
        <rect x="35" y="145" width="8" height="8" fill="#34D399" opacity="0.5" transform="rotate(45 39 149)"/>
        <polygon points="180,100 185,105 180,110 175,105" fill="#FF6B6B" opacity="0.5"/>
        <!-- Outline shapes for depth -->
        <circle cx="80" cy="60" r="15" fill="none" stroke="${accentFade}" stroke-width="1.5" opacity="0.3"/>
        <rect x="130" y="150" width="25" height="25" fill="none" stroke="${neutralSoft}" stroke-width="1.5" opacity="0.3" transform="rotate(15 142.5 162.5)"/>
      </svg>
    `
  }
];

const parseHexColor = (hexColor: string) => {
  let hex = hexColor.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((char) => char + char).join('');
  }
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16)
  };
};

const colorToRgba = (hexColor: string, alpha: number) => {
  const { r, g, b } = parseHexColor(hexColor);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const svgToDataUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

const isLightColor = (color: string): boolean => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
};

export default function TextureTestPage() {
  const [selectedTexture, setSelectedTexture] = useState('option1');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Member Card Texture Options
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Choose your favorite texture pattern for family member cards. Each color shows the same texture.
        </p>

        {/* Texture Selector */}
        <div className="mb-8 flex gap-4 flex-wrap">
          {TEXTURE_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedTexture(option.id)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                selectedTexture === option.id
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md'
              }`}
            >
              {option.name}
            </button>
          ))}
        </div>

        {/* Description */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {TEXTURE_OPTIONS.find(o => o.id === selectedTexture)?.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {TEXTURE_OPTIONS.find(o => o.id === selectedTexture)?.description}
          </p>
        </div>

        {/* Member Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MEMBER_COLORS.map((color, index) => {
            const isLight = isLightColor(color);
            const textColor = isLight ? 'text-gray-900' : 'text-white';
            const mutedTextColor = isLight ? 'text-gray-700' : 'text-gray-200';
            const borderColor = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
            const accentFade = colorToRgba(color, isLight ? 0.18 : 0.28);
            const neutralSoft = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.12)';
            const gradientLayer = `linear-gradient(to bottom, ${color}E6 0%, ${color}99 40%, ${color}4D 70%, ${color}1A 90%, transparent 100%)`;

            const currentOption = TEXTURE_OPTIONS.find(o => o.id === selectedTexture);
            const textureSvg = currentOption?.getSvg(accentFade, neutralSoft) || '';
            const textureDataUrl = svgToDataUrl(textureSvg);

            const cardStyle = {
              backgroundImage: `${textureDataUrl}, ${gradientLayer}`,
              backgroundColor: 'transparent',
              border: `2px solid ${borderColor}`,
              backgroundBlendMode: 'overlay, normal' as const,
              backgroundSize: '220px 220px, cover',
              backgroundRepeat: 'repeat, no-repeat' as const,
              backgroundPosition: 'center, center'
            };

            return (
              <Card
                key={index}
                className="relative overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] rounded-3xl"
                style={cardStyle}
              >
                <CardHeader className="pb-2 p-3 pt-2">
                  <div className="flex flex-col items-center text-center mb-2">
                    <div className="relative mb-2">
                      <ProfileImage
                        name={`Member ${index + 1}`}
                        color={color}
                        size={64}
                        showBorder={true}
                        borderColor={isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'}
                        className="shadow-md"
                        fontWeight="bold"
                      />
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1">
                          <div className="w-7 h-7 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md animate-pulse">
                            <Star className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className={`font-bold text-xl leading-tight ${textColor}`} style={{
                        fontFamily: '"Henny Penny", cursive',
                        textShadow: isLight ? '0 1px 2px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.3)'
                      }}>
                        Member {index + 1}
                      </h3>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-2 pt-0">
                  <div className="space-y-1.5">
                    {[1, 2, 3].map((habitNum) => (
                      <div
                        key={habitNum}
                        className="relative p-2 rounded-lg transition-all duration-200 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm border border-white/20 dark:border-gray-700/20"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium text-sm ${textColor}`}>
                            Sample Habit {habitNum}
                          </h4>
                          <div className="flex gap-2">
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="mt-4 pt-4 border-t border-white/20 dark:border-gray-700/20">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className={`font-bold text-xl ${textColor}`}>5</div>
                        <div className={`text-xs ${mutedTextColor}`}>Streak</div>
                      </div>
                      <div>
                        <div className={`font-bold text-xl ${textColor}`}>12</div>
                        <div className={`text-xs ${mutedTextColor}`}>Done</div>
                      </div>
                      <div>
                        <div className={`font-bold text-xl ${textColor}`}>3</div>
                        <div className={`text-xs ${mutedTextColor}`}>Rewards</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Link to implementation */}
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            📍 Current Implementation Location
          </h3>
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            <code className="bg-blue-100 dark:bg-blue-950 px-2 py-1 rounded">
              components/family/FamilyMemberZone.tsx
            </code>
            <br/>
            Lines 279-329: <code className="bg-blue-100 dark:bg-blue-950 px-2 py-1 rounded mt-2 inline-block">
              textureLayers useMemo
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
