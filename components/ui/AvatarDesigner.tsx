'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, Shuffle, Copy, Check, Dice1 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { theme } from '@/lib/theme';

interface AvatarDesignerProps {
  initialData?: {
    seed?: string;
    skinColor?: string;
    hairColor?: string;
    backgroundColor?: string;
    hairProbability?: number;
    glassesProbability?: number;
    featuresProbability?: number;
    earringsProbability?: number;
    flip?: boolean;
    rotate?: number;
    scale?: number;
  };
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

// Predefined color options
const skinColors = [
  { label: 'Light', value: 'FDBCB4', emoji: '🏻' },
  { label: 'Medium Light', value: 'F1C27D', emoji: '🏼' },
  { label: 'Medium', value: 'E0AC69', emoji: '🏽' },
  { label: 'Medium Dark', value: 'C68642', emoji: '🏾' },
  { label: 'Dark', value: '8D5524', emoji: '🏿' },
  { label: 'Deep', value: '5A3A31', emoji: '✨' },
];

const hairColors = [
  { label: 'Black', value: '2C1B18', emoji: '⚫' },
  { label: 'Dark Brown', value: '4A2C2A', emoji: '🟤' },
  { label: 'Brown', value: '724133', emoji: '🟫' },
  { label: 'Light Brown', value: 'A55728', emoji: '🧡' },
  { label: 'Blonde', value: 'B58143', emoji: '💛' },
  { label: 'Red', value: 'C93305', emoji: '🔴' },
  { label: 'Gray', value: 'B7B7B7', emoji: '⚪' },
  { label: 'White', value: 'E8E1E1', emoji: '⚪' },
  { label: 'Pink', value: 'FF69B4', emoji: '💗' },
  { label: 'Blue', value: '4169E1', emoji: '💙' },
];

const backgroundColors = [
  { label: 'None', value: 'transparent', emoji: '◻️' },
  { label: 'White', value: 'FFFFFF', emoji: '⚪' },
  { label: 'Light Blue', value: 'E0F2FE', emoji: '🟦' },
  { label: 'Light Green', value: 'DCFCE7', emoji: '🟩' },
  { label: 'Light Yellow', value: 'FEF3C7', emoji: '🟨' },
  { label: 'Light Pink', value: 'FCE7F3', emoji: '💕' },
  { label: 'Light Purple', value: 'EDE9FE', emoji: '🟪' },
  { label: 'Light Gray', value: 'F3F4F6', emoji: '⬜' },
];

export function AvatarDesigner({
  initialData = {},
  onSave,
  onCancel
}: AvatarDesignerProps) {
  // State
  const [seed, setSeed] = useState(initialData.seed || 'avatar-' + Date.now());
  const [skinColor, setSkinColor] = useState(initialData.skinColor || '');
  const [hairColor, setHairColor] = useState(initialData.hairColor || '');
  const [backgroundColor, setBackgroundColor] = useState(initialData.backgroundColor || 'transparent');
  const [hairProbability, setHairProbability] = useState(initialData.hairProbability ?? 100);
  const [glassesProbability, setGlassesProbability] = useState(initialData.glassesProbability ?? 50);
  const [featuresProbability, setFeaturesProbability] = useState(initialData.featuresProbability ?? 10);
  const [earringsProbability, setEarringsProbability] = useState(initialData.earringsProbability ?? 30);
  const [flip, setFlip] = useState(initialData.flip ?? false);
  const [rotate, setRotate] = useState(initialData.rotate ?? 0);
  const [scale, setScale] = useState(initialData.scale ?? 100);
  
  const [expandedPanels, setExpandedPanels] = useState<string[]>(['colors']);
  const [copied, setCopied] = useState(false);
  const [customSkinColor, setCustomSkinColor] = useState('');
  const [customHairColor, setCustomHairColor] = useState('');
  const [showCustomSkin, setShowCustomSkin] = useState(false);
  const [showCustomHair, setShowCustomHair] = useState(false);

  // Generate avatar URL
  const avatarUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set('seed', seed);
    
    if (skinColor) params.set('skinColor', skinColor);
    if (hairColor) params.set('hairColor', hairColor);
    if (backgroundColor && backgroundColor !== 'transparent') {
      params.set('backgroundColor', backgroundColor);
    }
    
    // Only add probabilities if they differ from defaults
    if (hairProbability !== 100) params.set('hairProbability', String(hairProbability / 100));
    if (glassesProbability !== 50) params.set('glassesProbability', String(glassesProbability / 100));
    if (featuresProbability !== 10) params.set('featuresProbability', String(featuresProbability / 100));
    if (earringsProbability !== 30) params.set('earringsProbability', String(earringsProbability / 100));
    
    if (flip) params.set('flip', 'true');
    if (rotate > 0) params.set('rotate', String(rotate));
    if (scale !== 100) params.set('scale', String(scale / 100));
    
    return `https://api.dicebear.com/9.x/adventurer/svg?${params.toString()}`;
  }, [seed, skinColor, hairColor, backgroundColor, hairProbability, glassesProbability, 
      featuresProbability, earringsProbability, flip, rotate, scale]);

  // Toggle panel
  const togglePanel = (panel: string) => {
    setExpandedPanels(prev => 
      prev.includes(panel) 
        ? prev.filter(p => p !== panel)
        : [...prev, panel]
    );
  };

  // Random seed
  const randomizeSeed = () => {
    setSeed(Math.random().toString(36).substring(2, 15));
  };

  // Random all
  const randomizeAll = () => {
    randomizeSeed();
    setSkinColor(skinColors[Math.floor(Math.random() * skinColors.length)].value);
    setHairColor(hairColors[Math.floor(Math.random() * hairColors.length)].value);
    setBackgroundColor(backgroundColors[Math.floor(Math.random() * backgroundColors.length)].value);
    setHairProbability(Math.floor(Math.random() * 100));
    setGlassesProbability(Math.floor(Math.random() * 100));
    setFeaturesProbability(Math.floor(Math.random() * 100));
    setEarringsProbability(Math.floor(Math.random() * 100));
    setFlip(Math.random() > 0.5);
    setRotate(Math.floor(Math.random() * 360));
    setScale(50 + Math.floor(Math.random() * 100));
  };

  // Random colors only
  const randomizeColors = () => {
    setSkinColor(skinColors[Math.floor(Math.random() * skinColors.length)].value);
    setHairColor(hairColors[Math.floor(Math.random() * hairColors.length)].value);
    setBackgroundColor(backgroundColors[Math.floor(Math.random() * backgroundColors.length)].value);
  };

  // Reset
  const reset = () => {
    setSeed(initialData.seed || 'avatar-' + Date.now());
    setSkinColor(initialData.skinColor || '');
    setHairColor(initialData.hairColor || '');
    setBackgroundColor(initialData.backgroundColor || 'transparent');
    setHairProbability(initialData.hairProbability ?? 100);
    setGlassesProbability(initialData.glassesProbability ?? 50);
    setFeaturesProbability(initialData.featuresProbability ?? 10);
    setEarringsProbability(initialData.earringsProbability ?? 30);
    setFlip(initialData.flip ?? false);
    setRotate(initialData.rotate ?? 0);
    setScale(initialData.scale ?? 100);
  };

  // Copy URL
  const copyUrl = () => {
    navigator.clipboard.writeText(avatarUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Save
  const handleSave = () => {
    onSave?.({
      seed,
      skinColor,
      hairColor,
      backgroundColor,
      hairProbability,
      glassesProbability,
      featuresProbability,
      earringsProbability,
      flip,
      rotate,
      scale,
      avatarUrl
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        randomizeAll();
      } else if (e.key === 'z' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        reset();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Left: Preview */}
      <div className="lg:w-1/3 flex flex-col items-center">
        <div className={cn(
          "rounded-lg p-6 w-full",
          theme.surface.secondary,
          theme.border.default,
          "border"
        )}>
          {/* Avatar Preview */}
          <div className="flex justify-center mb-4">
            <div 
              className="rounded-full overflow-hidden border-4 border-gray-300 dark:border-gray-600"
              style={{ width: '200px', height: '200px' }}
            >
              <img 
                src={avatarUrl}
                alt="Avatar preview"
                className="w-full h-full"
                style={{ 
                  backgroundColor: backgroundColor === 'transparent' 
                    ? 'transparent' 
                    : `#${backgroundColor}`
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={randomizeAll}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg flex items-center justify-center gap-2",
                  theme.components.button.primary,
                  "text-white font-medium"
                )}
              >
                <Shuffle className="w-4 h-4" />
                Random All
              </button>
              <button
                type="button"
                onClick={reset}
                className={cn(
                  "px-3 py-2 rounded-lg",
                  theme.surface.primary,
                  theme.border.default,
                  "border"
                )}
                title="Reset (Cmd+Z)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            
            <button
              type="button"
              onClick={randomizeColors}
              className={cn(
                "w-full px-3 py-2 rounded-lg text-sm",
                theme.surface.primary,
                theme.border.default,
                "border"
              )}
            >
              🎨 Surprise Colors
            </button>

            {/* Copy URL */}
            <button
              type="button"
              onClick={copyUrl}
              className={cn(
                "w-full px-3 py-2 rounded-lg text-xs flex items-center justify-center gap-2",
                theme.surface.primary,
                theme.border.default,
                "border"
              )}
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy Avatar URL
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right: Customization Panels */}
      <div className="lg:w-2/3 space-y-2 overflow-y-auto">
        {/* Colors Panel */}
        <div className={cn("rounded-lg border", theme.border.default)}>
          <button
            type="button"
            onClick={() => togglePanel('colors')}
            className={cn(
              "w-full px-4 py-3 flex items-center justify-between",
              theme.surface.secondary,
              "hover:bg-opacity-80 transition-colors"
            )}
          >
            <span className="font-medium">🎨 Colors</span>
            {expandedPanels.includes('colors') ? <ChevronUp /> : <ChevronDown />}
          </button>
          
          {expandedPanels.includes('colors') && (
            <div className="p-4 space-y-4">
              {/* Skin Color */}
              <div>
                <label className="text-sm font-medium mb-2 block">Skin Color</label>
                <div className="flex flex-wrap gap-2">
                  {skinColors.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setSkinColor(color.value)}
                      className={cn(
                        "p-3 rounded-lg border-2 transition-all relative",
                        skinColor === color.value
                          ? "border-blue-500 ring-2 ring-blue-300"
                          : "border-gray-300 hover:border-gray-400"
                      )}
                      style={{ backgroundColor: `#${color.value}` }}
                      title={color.label}
                    >
                      <span className="text-white text-xs drop-shadow-md">{color.emoji}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowCustomSkin(!showCustomSkin)}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all",
                      "border-gray-300 hover:border-gray-400",
                      "flex items-center justify-center"
                    )}
                  >
                    🎨
                  </button>
                </div>
                {showCustomSkin && (
                  <input
                    type="text"
                    placeholder="Hex color (e.g., FF6B6B)"
                    value={customSkinColor}
                    onChange={(e) => {
                      setCustomSkinColor(e.target.value);
                      if (e.target.value.length === 6) {
                        setSkinColor(e.target.value.replace('#', ''));
                      }
                    }}
                    className={cn(
                      "mt-2 w-full px-3 py-2 rounded-lg",
                      theme.surface.primary,
                      theme.border.default,
                      "border"
                    )}
                  />
                )}
              </div>

              {/* Hair Color */}
              <div>
                <label className="text-sm font-medium mb-2 block">Hair Color</label>
                <div className="flex flex-wrap gap-2">
                  {hairColors.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setHairColor(color.value)}
                      className={cn(
                        "p-3 rounded-lg border-2 transition-all relative",
                        hairColor === color.value
                          ? "border-blue-500 ring-2 ring-blue-300"
                          : "border-gray-300 hover:border-gray-400"
                      )}
                      style={{ backgroundColor: `#${color.value}` }}
                      title={color.label}
                    >
                      <span className="text-white text-xs drop-shadow-md">{color.emoji}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowCustomHair(!showCustomHair)}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all",
                      "border-gray-300 hover:border-gray-400",
                      "flex items-center justify-center"
                    )}
                  >
                    🎨
                  </button>
                </div>
                {showCustomHair && (
                  <input
                    type="text"
                    placeholder="Hex color (e.g., FF6B6B)"
                    value={customHairColor}
                    onChange={(e) => {
                      setCustomHairColor(e.target.value);
                      if (e.target.value.length === 6) {
                        setHairColor(e.target.value.replace('#', ''));
                      }
                    }}
                    className={cn(
                      "mt-2 w-full px-3 py-2 rounded-lg",
                      theme.surface.primary,
                      theme.border.default,
                      "border"
                    )}
                  />
                )}
              </div>

              {/* Background Color */}
              <div>
                <label className="text-sm font-medium mb-2 block">Background Color</label>
                <div className="flex flex-wrap gap-2">
                  {backgroundColors.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setBackgroundColor(color.value)}
                      className={cn(
                        "p-3 rounded-lg border-2 transition-all relative",
                        backgroundColor === color.value
                          ? "border-blue-500 ring-2 ring-blue-300"
                          : "border-gray-300 hover:border-gray-400"
                      )}
                      style={{ 
                        backgroundColor: color.value === 'transparent' 
                          ? 'white' 
                          : `#${color.value}`,
                        backgroundImage: color.value === 'transparent'
                          ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                          : undefined,
                        backgroundSize: color.value === 'transparent' ? '10px 10px' : undefined,
                        backgroundPosition: color.value === 'transparent' ? '0 0, 0 5px, 5px -5px, -5px 0px' : undefined,
                      }}
                      title={color.label}
                    >
                      <span className="text-xs">{color.emoji}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feature Probabilities Panel */}
        <div className={cn("rounded-lg border", theme.border.default)}>
          <button
            type="button"
            onClick={() => togglePanel('features')}
            className={cn(
              "w-full px-4 py-3 flex items-center justify-between",
              theme.surface.secondary,
              "hover:bg-opacity-80 transition-colors"
            )}
          >
            <span className="font-medium">✨ Feature Probabilities</span>
            {expandedPanels.includes('features') ? <ChevronUp /> : <ChevronDown />}
          </button>
          
          {expandedPanels.includes('features') && (
            <div className="p-4 space-y-4">
              {/* Hair */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Hair</span>
                  <span className="text-sm text-gray-500">{hairProbability}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={hairProbability}
                  onChange={(e) => setHairProbability(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Glasses */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Glasses</span>
                  <span className="text-sm text-gray-500">{glassesProbability}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={glassesProbability}
                  onChange={(e) => setGlassesProbability(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Features */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Extra Features</span>
                  <span className="text-sm text-gray-500">{featuresProbability}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={featuresProbability}
                  onChange={(e) => setFeaturesProbability(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Earrings */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Earrings</span>
                  <span className="text-sm text-gray-500">{earringsProbability}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={earringsProbability}
                  onChange={(e) => setEarringsProbability(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Seed & Transform Panel */}
        <div className={cn("rounded-lg border", theme.border.default)}>
          <button
            type="button"
            onClick={() => togglePanel('transform')}
            className={cn(
              "w-full px-4 py-3 flex items-center justify-between",
              theme.surface.secondary,
              "hover:bg-opacity-80 transition-colors"
            )}
          >
            <span className="font-medium">🎲 Seed & Transform</span>
            {expandedPanels.includes('transform') ? <ChevronUp /> : <ChevronDown />}
          </button>
          
          {expandedPanels.includes('transform') && (
            <div className="p-4 space-y-4">
              {/* Seed */}
              <div>
                <label className="text-sm font-medium mb-2 block">Seed</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-lg",
                      theme.surface.primary,
                      theme.border.default,
                      "border"
                    )}
                  />
                  <button
                    type="button"
                    onClick={randomizeSeed}
                    className={cn(
                      "px-3 py-2 rounded-lg",
                      theme.surface.primary,
                      theme.border.default,
                      "border"
                    )}
                  >
                    <Dice1 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Flip */}
              <div className="flex items-center justify-between">
                <span className="text-sm">Flip Horizontal</span>
                <button
                  type="button"
                  onClick={() => setFlip(!flip)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    flip ? "bg-blue-500" : "bg-gray-300"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                    flip ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>

              {/* Rotate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Rotate</span>
                  <span className="text-sm text-gray-500">{rotate}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={rotate}
                  onChange={(e) => setRotate(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Scale */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Scale</span>
                  <span className="text-sm text-gray-500">{scale}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Save/Cancel Buttons */}
        <div className="flex gap-2 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={cn(
                "flex-1 px-4 py-2 rounded-lg",
                theme.surface.primary,
                theme.border.default,
                "border"
              )}
            >
              Cancel
            </button>
          )}
          {onSave && (
            <button
              type="button"
              onClick={handleSave}
              className={cn(
                "flex-1 px-4 py-2 rounded-lg",
                theme.components.button.primary,
                "text-white font-medium"
              )}
            >
              Save Avatar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
