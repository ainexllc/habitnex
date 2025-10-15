'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { ProfileImage } from '@/components/ui/ProfileImage';
import { Star, Palette } from 'lucide-react';

const TEST_COLORS = [
  // Vibrant colors
  { name: 'Coral Red', hex: '#FF6B6B' },
  { name: 'Turquoise', hex: '#4ECDC4' },
  { name: 'Golden Yellow', hex: '#FFD93D' },
  { name: 'Purple', hex: '#A78BFA' },
  { name: 'Emerald', hex: '#34D399' },
  // Pastels
  { name: 'Soft Pink', hex: '#FFB6C1' },
  { name: 'Baby Blue', hex: '#89CFF0' },
  { name: 'Mint', hex: '#98FB98' },
  { name: 'Lavender', hex: '#E6E6FA' },
  { name: 'Peach', hex: '#FFDAB9' },
  // Deep colors
  { name: 'Navy', hex: '#1E3A8A' },
  { name: 'Forest Green', hex: '#065F46' },
  { name: 'Burgundy', hex: '#7C2D3C' },
  { name: 'Teal', hex: '#115E59' },
  { name: 'Plum', hex: '#6B21A8' },
];

const PATTERN_OPTIONS = [
  {
    id: 'recommended',
    name: '⭐ Recommended: Soft Sparkle Bubbles',
    description: 'Perfect balance of playfulness and elegance. Works with any color.',
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
  {
    id: 'minimal',
    name: 'Minimalist Dots',
    description: 'Clean and subtle. Great for professional look.',
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
      </svg>
    `
  },
  {
    id: 'organic',
    name: 'Organic Flow',
    description: 'Natural flowing shapes. Calming and harmonious.',
    getSvg: (accentFade: string, neutralSoft: string, neutralBold: string) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" opacity="0.8">
        <!-- Flowing curves -->
        <path d="M-10,70 Q50,50 90,70 T200,70"
              stroke="${neutralSoft}" stroke-width="2" fill="none" opacity="0.5"/>
        <path d="M-10,110 Q50,90 90,110 T200,110"
              stroke="${accentFade}" stroke-width="2" fill="none" opacity="0.4"/>
        <path d="M-10,150 Q50,130 90,150 T200,150"
              stroke="${neutralSoft}" stroke-width="1.5" fill="none" opacity="0.45"/>

        <!-- Organic blobs -->
        <ellipse cx="40" cy="40" rx="25" ry="20" fill="${accentFade}" opacity="0.3" transform="rotate(25 40 40)"/>
        <ellipse cx="160" cy="170" rx="30" ry="22" fill="${neutralSoft}" opacity="0.35" transform="rotate(-15 160 170)"/>
        <ellipse cx="120" cy="50" rx="18" ry="24" fill="${accentFade}" opacity="0.28" transform="rotate(45 120 50)"/>

        <!-- Dots along curves -->
        <circle cx="60" cy="65" r="3" fill="${accentFade}" opacity="0.6"/>
        <circle cx="140" cy="65" r="3" fill="${accentFade}" opacity="0.5"/>
        <circle cx="60" cy="105" r="3" fill="${neutralBold}" opacity="0.5"/>
        <circle cx="140" cy="105" r="3" fill="${neutralBold}" opacity="0.45"/>
      </svg>
    `
  },
  {
    id: 'playful',
    name: 'Playful Mix',
    description: 'Fun and energetic. Perfect for kids and families.',
    getSvg: (accentFade: string, neutralSoft: string, neutralBold: string) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" opacity="0.82">
        <!-- Bubbles -->
        <circle cx="50" cy="50" r="20" fill="${accentFade}" opacity="0.4"/>
        <circle cx="150" cy="140" r="25" fill="${accentFade}" opacity="0.35"/>

        <!-- Stars -->
        <path d="M120,35 L123,42 L130,42 L125,47 L127,54 L120,49 L113,54 L115,47 L110,42 L117,42 Z"
              fill="${neutralBold}" opacity="0.45"/>
        <path d="M70,160 L72,165 L77,165 L73,169 L75,174 L70,170 L65,174 L67,169 L63,165 L68,165 Z"
              fill="${accentFade}" opacity="0.5"/>

        <!-- Confetti pieces -->
        <rect x="30" y="120" width="8" height="8" fill="${accentFade}" opacity="0.5" transform="rotate(25 34 124)"/>
        <rect x="160" y="60" width="10" height="10" fill="${neutralSoft}" opacity="0.5" transform="rotate(-20 165 65)"/>
        <rect x="90" y="180" width="7" height="7" fill="${accentFade}" opacity="0.45" transform="rotate(45 93.5 183.5)"/>

        <!-- Small accents -->
        <circle cx="180" cy="100" r="6" fill="${neutralBold}" opacity="0.4"/>
        <circle cx="40" cy="180" r="7" fill="${accentFade}" opacity="0.45"/>
        <circle cx="100" cy="20" r="5" fill="${neutralSoft}" opacity="0.5"/>
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

export default function UniversalTexturePage() {
  const [selectedPattern, setSelectedPattern] = useState('recommended');
  const [customColor, setCustomColor] = useState('#FF6B6B');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <Palette className="w-10 h-10" />
            Universal Pattern Tester
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            One pattern that works beautifully with ANY color your users choose
          </p>
        </div>

        {/* Pattern Selector */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Choose Pattern Style:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PATTERN_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedPattern(option.id)}
                className={`p-4 rounded-xl font-medium transition-all text-left ${
                  selectedPattern === option.id
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md'
                }`}
              >
                <div className="font-bold mb-1">{option.name}</div>
                <div className={`text-sm ${selectedPattern === option.id ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                  {option.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Color Picker */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Test with Your Own Color:
          </h3>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="w-20 h-20 rounded-lg cursor-pointer"
            />
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Current Color:</div>
              <div className="font-mono text-lg font-bold text-gray-900 dark:text-white">{customColor}</div>
            </div>
          </div>
        </div>

        {/* Custom Color Preview */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Custom Color:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[customColor, customColor].map((color, idx) => {
              const isLight = isLightColor(color);
              const textColor = isLight ? 'text-gray-900' : 'text-white';
              const borderColor = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
              const accentFade = colorToRgba(color, isLight ? 0.18 : 0.28);
              const neutralSoft = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.12)';
              const neutralBold = isLight ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.18)';
              const gradientLayer = `linear-gradient(to bottom, ${color}E6 0%, ${color}99 40%, ${color}4D 70%, ${color}1A 90%, transparent 100%)`;

              const currentOption = PATTERN_OPTIONS.find(o => o.id === selectedPattern);
              const textureSvg = currentOption?.getSvg(accentFade, neutralSoft, neutralBold) || '';
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
                  key={idx}
                  className="relative overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] rounded-3xl"
                  style={cardStyle}
                >
                  <CardHeader className="pb-2 p-4">
                    <div className="flex flex-col items-center text-center mb-2">
                      <ProfileImage
                        name="Your Member"
                        color={color}
                        size={80}
                        showBorder={true}
                        borderColor={isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'}
                        className="shadow-md mb-3"
                        fontWeight="bold"
                      />
                      <h3 className={`font-bold text-2xl ${textColor}`} style={{
                        fontFamily: '"Henny Penny", cursive',
                        textShadow: isLight ? '0 1px 2px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.3)'
                      }}>
                        {idx === 0 ? 'Light Mode' : 'Dark Mode'}
                      </h3>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3">
                    {[1, 2, 3].map((habit) => (
                      <div key={habit} className="p-3 mb-2 rounded-lg bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm border border-white/20">
                        <h4 className={`font-medium ${textColor}`}>Sample Habit {habit}</h4>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Test with All Colors */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Works with ALL Colors:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {TEST_COLORS.map((colorInfo) => {
              const isLight = isLightColor(colorInfo.hex);
              const textColor = isLight ? 'text-gray-900' : 'text-white';
              const borderColor = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
              const accentFade = colorToRgba(colorInfo.hex, isLight ? 0.18 : 0.28);
              const neutralSoft = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.12)';
              const neutralBold = isLight ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.18)';
              const gradientLayer = `linear-gradient(to bottom, ${colorInfo.hex}E6 0%, ${colorInfo.hex}99 40%, ${colorInfo.hex}4D 70%, ${colorInfo.hex}1A 90%, transparent 100%)`;

              const currentOption = PATTERN_OPTIONS.find(o => o.id === selectedPattern);
              const textureSvg = currentOption?.getSvg(accentFade, neutralSoft, neutralBold) || '';
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
                  key={colorInfo.hex}
                  className="relative overflow-hidden transition-all duration-300 hover:shadow-xl rounded-2xl"
                  style={cardStyle}
                >
                  <CardContent className="p-4">
                    <ProfileImage
                      name={colorInfo.name}
                      color={colorInfo.hex}
                      size={48}
                      showBorder={true}
                      borderColor={isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'}
                      className="mx-auto mb-2"
                    />
                    <h4 className={`text-center text-xs font-semibold ${textColor}`}>
                      {colorInfo.name}
                    </h4>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Implementation Note */}
        <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
            <Star className="w-5 h-5" />
            Ready to Implement
          </h3>
          <p className="text-green-800 dark:text-green-200 text-sm mb-2">
            The <strong>{PATTERN_OPTIONS.find(o => o.id === selectedPattern)?.name}</strong> pattern adapts perfectly to any color.
          </p>
          <p className="text-green-700 dark:text-green-300 text-xs">
            It automatically adjusts opacity and blend modes based on whether the color is light or dark!
          </p>
        </div>
      </div>
    </div>
  );
}
