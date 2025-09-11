'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, Shuffle, Copy, Check, Eye, Smile, User, ShirtIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { theme } from '@/lib/theme';

interface AvataaarsConfig {
  seed: string;
  eyes?: string;
  eyebrows?: string;
  mouth?: string;
  topType?: string;
  skinColor?: string;
  hairColor?: string;
  backgroundColor?: string;
  flip?: boolean;
  rotate?: number;
  scale?: number;
}

interface AvataaarsAvatarBuilderProps {
  initialData?: Partial<AvataaarsConfig>;
  onSave?: (data: AvataaarsConfig & { avatarUrl: string }) => void;
  onCancel?: () => void;
  className?: string;
}

// Avataaars-specific feature options
const eyeOptions = [
  'close', 'cry', 'default', 'dizzy', 'eyeRoll', 'happy', 'hearts',
  'side', 'squint', 'surprised', 'wink', 'winkWacky'
];

const eyebrowOptions = [
  'angry', 'angryNatural', 'default', 'defaultNatural', 'flatNatural',
  'raisedExcited', 'raisedExcitedNatural', 'sadConcerned',
  'sadConcernedNatural', 'unibrowNatural', 'upDown', 'upDownNatural'
];

const mouthOptions = [
  'concerned', 'default', 'disbelief', 'eating', 'grimace', 'sad',
  'screamOpen', 'serious', 'smile', 'tongue', 'twinkle', 'vomit'
];

const topTypeOptions = [
  'NoHair',
  'LongHairBigHair', 'LongHairBob', 'LongHairBun', 'LongHairCurly', 'LongHairCurvy',
  'LongHairDreads', 'LongHairFrida', 'LongHairFro', 'LongHairFroBand',
  'LongHairNotTooLong', 'LongHairShavedSides', 'LongHairMiaWallace', 'LongHairStraight',
  'LongHairStraight2', 'LongHairStraightStrand',
  'ShortHairDreads01', 'ShortHairDreads02', 'ShortHairFrizzle', 'ShortHairShaggyMullet',
  'ShortHairShortCurly', 'ShortHairShortFlat', 'ShortHairShortRound', 'ShortHairShortWaved',
  'ShortHairSides', 'ShortHairTheCaesar', 'ShortHairTheCaesarSidePart',
  'Hat', 'Hijab', 'Turban', 'WinterHat1', 'WinterHat2', 'WinterHat3', 'WinterHat4'
];

// Adventurer only supports mustache as facial hair feature

const clothingOptions = [
  { value: 'blazerShirt', label: 'Blazer & Shirt', emoji: '👔' },
  { value: 'blazerSweater', label: 'Blazer & Sweater', emoji: '🧥' },
  { value: 'collarSweater', label: 'Collar Sweater', emoji: '👕' },
  { value: 'graphicShirt', label: 'Graphic Shirt', emoji: '👕' },
  { value: 'hoodie', label: 'Hoodie', emoji: '🧣' },
  { value: 'overall', label: 'Overall', emoji: '👔' },
  { value: 'shirtCrewNeck', label: 'Crew Neck', emoji: '👕' },
  { value: 'shirtScoopNeck', label: 'Scoop Neck', emoji: '👕' },
  { value: 'shirtVNeck', label: 'V-Neck', emoji: '👕' },
];

const colorOptions = [
  { value: 'Black', label: 'Black', hex: '#262E33' },
  { value: 'Auburn', label: 'Auburn', hex: '#A55728' },
  { value: 'Blonde', label: 'Blonde', hex: '#B58143' },
  { value: 'BlondeGolden', label: 'Golden Blonde', hex: '#D6B370' },
  { value: 'Brown', label: 'Brown', hex: '#724133' },
  { value: 'BrownDark', label: 'Dark Brown', hex: '#4A2C2A' },
  { value: 'PastelPink', label: 'Pastel Pink', hex: '#F59797' },
  { value: 'Platinum', label: 'Platinum', hex: '#ECDCBF' },
  { value: 'Red', label: 'Red', hex: '#C93305' },
  { value: 'SilverGray', label: 'Silver Gray', hex: '#E8E1E1' },
];

const skinColorOptions = [
  { value: 'Tanned', label: 'Tanned', hex: '#FD9841' },
  { value: 'Yellow', label: 'Yellow', hex: '#F8D25C' },
  { value: 'Pale', label: 'Pale', hex: '#FDBCB4' },
  { value: 'Light', label: 'Light', hex: '#EDB98A' },
  { value: 'Brown', label: 'Brown', hex: '#D08B5B' },
  { value: 'DarkBrown', label: 'Dark Brown', hex: '#AE5D29' },
  { value: 'Black', label: 'Black', hex: '#614335' },
];

const clothingColorOptions = [
  { value: 'Black', label: 'Black', hex: '#262E33' },
  { value: 'Blue01', label: 'Blue', hex: '#65C9FF' },
  { value: 'Blue02', label: 'Dark Blue', hex: '#5199E4' },
  { value: 'Blue03', label: 'Navy', hex: '#25557C' },
  { value: 'Gray01', label: 'Light Gray', hex: '#E6E6E6' },
  { value: 'Gray02', label: 'Gray', hex: '#929598' },
  { value: 'Heather', label: 'Heather', hex: '#3C4F5C' },
  { value: 'PastelBlue', label: 'Pastel Blue', hex: '#B1E2FF' },
  { value: 'PastelGreen', label: 'Pastel Green', hex: '#A7FFC4' },
  { value: 'PastelOrange', label: 'Pastel Orange', hex: '#FFDEB5' },
  { value: 'PastelRed', label: 'Pastel Red', hex: '#FFAFB9' },
  { value: 'PastelYellow', label: 'Pastel Yellow', hex: '#FFFFB1' },
  { value: 'Pink', label: 'Pink', hex: '#FF488E' },
  { value: 'Red', label: 'Red', hex: '#FF5722' },
  { value: 'White', label: 'White', hex: '#FFFFFF' },
];

const backgroundColorOptions = [
  { value: 'transparent', label: 'Transparent', hex: 'transparent' },
  { value: 'Blue01', label: 'Light Blue', hex: '#E0F2FE' },
  { value: 'Blue02', label: 'Blue', hex: '#BAE6FD' },
  { value: 'Blue03', label: 'Dark Blue', hex: '#93C5FD' },
  { value: 'Green01', label: 'Light Green', hex: '#DCFCE7' },
  { value: 'Green02', label: 'Green', hex: '#BBF7D0' },
  { value: 'Orange01', label: 'Light Orange', hex: '#FED7AA' },
  { value: 'Orange02', label: 'Orange', hex: '#FDBA74' },
  { value: 'Pink01', label: 'Light Pink', hex: '#FCE7F3' },
  { value: 'Pink02', label: 'Pink', hex: '#F9A8D4' },
  { value: 'Purple01', label: 'Light Purple', hex: '#EDE9FE' },
  { value: 'Purple02', label: 'Purple', hex: '#DDD6FE' },
  { value: 'Yellow01', label: 'Light Yellow', hex: '#FEF3C7' },
  { value: 'Yellow02', label: 'Yellow', hex: '#FDE68A' },
];

export function AvataaarsAvatarBuilder({
  initialData = {},
  onSave,
  onCancel,
  className
}: AvataaarsAvatarBuilderProps) {
  // State
  const [config, setConfig] = useState<AvataaarsConfig>({
    seed: initialData.seed || `avatar-${Date.now()}`,
    eyes: initialData.eyes || '',
    eyebrows: initialData.eyebrows || '',
    mouth: initialData.mouth || '',
    topType: initialData.topType || '',
    skinColor: initialData.skinColor || '',
    hairColor: initialData.hairColor || '',
    backgroundColor: initialData.backgroundColor || 'transparent',
    flip: initialData.flip || false,
    rotate: initialData.rotate || 0,
    scale: initialData.scale || 100,
  });

  const [expandedSections, setExpandedSections] = useState<string[]>(['facial']);
  const [copied, setCopied] = useState(false);
  
  // Thumbnail URL cache - these URLs never change for the same option+type
  const thumbnailUrlCache = useMemo(() => new Map<string, string>(), []);
  
  // Generate thumbnail URL for feature previews with aggressive caching
  const getThumbnailUrl = useCallback((option: string, type: 'eyes' | 'eyebrows' | 'mouth' | 'topType') => {
    const cacheKey = `${type}-${option}`;
    
    if (thumbnailUrlCache.has(cacheKey)) {
      return thumbnailUrlCache.get(cacheKey)!;
    }
    
    const params = new URLSearchParams();
    params.set('seed', 'thumbnail-preview');
    params.set('size', '64');
    
    // Set default options for consistent rendering
    params.set('skinColor', 'EDB98A');
    params.set('eyes', 'default');
    params.set('eyebrows', 'default');
    params.set('mouth', 'smile');
    
    // For non-topType previews, set neutral topType
    if (type !== 'topType') {
      params.set('topType', 'NoHair');
    }
    
    // Set the specific feature
    if (type === 'eyes') params.set('eyes', option);
    if (type === 'eyebrows') params.set('eyebrows', option);
    if (type === 'mouth') params.set('mouth', option);
    if (type === 'topType') {
      params.set('topType', option);
      // Set hair color for hair types
      if (option.includes('Hair') && option !== 'NoHair') {
        params.set('hairColor', '724133');
      }
    }
    
    const url = `https://api.dicebear.com/9.x/adventurer/svg?${params.toString()}`;
    
    // Cache the URL
    thumbnailUrlCache.set(cacheKey, url);
    
    return url;
  }, [thumbnailUrlCache]);
  
  // Preload thumbnails for better performance
  useEffect(() => {
    // Preload first few thumbnails of each type for instant display
    const preloadUrls = [
      ...eyeOptions.slice(0, 4).map(option => getThumbnailUrl(option, 'eyes')),
      ...eyebrowOptions.slice(0, 4).map(option => getThumbnailUrl(option, 'eyebrows')),
      ...mouthOptions.slice(0, 4).map(option => getThumbnailUrl(option, 'mouth')),
      ...topTypeOptions.slice(0, 4).map(option => getThumbnailUrl(option, 'topType')),
    ];
    
    // Preload images in background with staggered timing
    preloadUrls.forEach((url, index) => {
      setTimeout(() => {
        const img = new Image();
        img.src = url;
        img.onerror = () => console.warn('Failed to preload:', url);
      }, index * 100); // Stagger by 100ms each
    });
  }, [getThumbnailUrl]);

  // Generate avatar URL
  const avatarUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set('seed', config.seed || 'default');
    
    if (config.eyes) params.set('eyes', config.eyes.toLowerCase());
    if (config.eyebrows) params.set('eyebrows', config.eyebrows.toLowerCase());
    if (config.mouth) params.set('mouth', config.mouth.toLowerCase());
    if (config.topType) params.set('topType', config.topType);
    
    if (config.skinColor) params.set('skinColor', config.skinColor.replace('#', ''));
    if (config.hairColor) params.set('hairColor', config.hairColor.replace('#', ''));
    
    if (config.backgroundColor && config.backgroundColor !== 'transparent') {
      params.set('backgroundColor', config.backgroundColor.replace('#', ''));
    }
    
    if (config.flip) params.set('flip', 'true');
    if (config.rotate && config.rotate > 0) params.set('rotate', String(config.rotate));
    if (config.scale && config.scale !== 100) params.set('scale', String(config.scale / 100));
    
    return `https://api.dicebear.com/9.x/adventurer/svg?${params.toString()}`;
  }, [config]);

  // Update config helper
  const updateConfig = useCallback((updates: Partial<AvataaarsConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  // Toggle section
  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Random avatar
  const randomizeAvatar = () => {
    updateConfig({
      seed: Math.random().toString(36).substring(2, 15),
      eyes: Math.random() > 0.3 ? eyeOptions[Math.floor(Math.random() * eyeOptions.length)] : '',
      eyebrows: Math.random() > 0.3 ? eyebrowOptions[Math.floor(Math.random() * eyebrowOptions.length)] : '',
      mouth: Math.random() > 0.3 ? mouthOptions[Math.floor(Math.random() * mouthOptions.length)] : '',
      topType: Math.random() > 0.3 ? topTypeOptions[Math.floor(Math.random() * topTypeOptions.length)] : '',
      skinColor: skinColorOptions[Math.floor(Math.random() * skinColorOptions.length)].hex,
      hairColor: colorOptions[Math.floor(Math.random() * colorOptions.length)].hex,
      backgroundColor: backgroundColorOptions[Math.floor(Math.random() * backgroundColorOptions.length)].hex,
    });
  };

  // Reset to initial
  const resetAvatar = () => {
    setConfig({
      seed: initialData.seed || `avatar-${Date.now()}`,
      eyes: initialData.eyes || '',
      eyebrows: initialData.eyebrows || '',
      mouth: initialData.mouth || '',
      topType: initialData.topType || '',
      skinColor: initialData.skinColor || '',
      hairColor: initialData.hairColor || '',
      backgroundColor: initialData.backgroundColor || 'transparent',
      flip: initialData.flip || false,
      rotate: initialData.rotate || 0,
      scale: initialData.scale || 100,
    });
  };

  // Copy URL
  const copyUrl = () => {
    navigator.clipboard.writeText(avatarUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Save
  const handleSave = () => {
    onSave?.({ ...config, avatarUrl });
  };



  return (
    <div className={cn("flex flex-col lg:flex-row gap-6 h-full", className)}>
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
                  backgroundColor: config.backgroundColor === 'transparent' 
                    ? 'transparent' 
                    : config.backgroundColor || 'transparent'
                }}
                onError={(e) => {
                  console.error('Avatar failed to load:', avatarUrl);
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={randomizeAvatar}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg flex items-center justify-center gap-2",
                  theme.components.button.primary,
                  "text-white font-medium"
                )}
              >
                <Shuffle className="w-4 h-4" />
                Randomize
              </button>
              <button
                type="button"
                onClick={resetAvatar}
                className={cn(
                  "px-3 py-2 rounded-lg",
                  theme.surface.primary,
                  theme.border.default,
                  "border"
                )}
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            
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
        {/* Facial Features Panel */}
        <div className={cn("rounded-lg border", theme.border.default)}>
          <button
            type="button"
            onClick={() => toggleSection('facial')}
            className={cn(
              "w-full px-4 py-3 flex items-center justify-between",
              theme.surface.secondary,
              "hover:bg-opacity-80 transition-colors"
            )}
          >
            <span className="font-medium flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Facial Features
            </span>
            {expandedSections.includes('facial') ? <ChevronUp /> : <ChevronDown />}
          </button>
          
          {expandedSections.includes('facial') && (
            <div className="p-4 space-y-4">
              {/* Eyes */}
              <div>
                <label className="text-sm font-medium mb-2 block">Eyes</label>
                <div className="grid grid-cols-8 gap-2">
                  <button
                    type="button"
                    onClick={() => updateConfig({ eyes: '' })}
                    className={cn(
                      "p-2 rounded-lg border-2 transition-all relative aspect-square",
                      !config.eyes
                        ? "border-blue-500 ring-2 ring-blue-300"
                        : "border-gray-300 hover:border-gray-400"
                    )}
                    title="Random"
                  >
                    <div className="text-xs text-center">Random</div>
                  </button>
                  {eyeOptions.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => updateConfig({ eyes: option })}
                      className={cn(
                        "p-1 rounded-lg border-2 transition-all relative aspect-square",
                        config.eyes === option
                          ? "border-blue-500 ring-2 ring-blue-300"
                          : "border-gray-300 hover:border-gray-400"
                      )}
                      title={option}
                    >
                      <img 
                        src={getThumbnailUrl(option, 'eyes')}
                        alt={option}
                        className="w-full h-full object-cover rounded"
                        loading="lazy"
                        onError={(e) => {
                          // Try to reload the image once before showing fallback
                          const img = e.currentTarget;
                          if (!img.dataset.retried) {
                            img.dataset.retried = 'true';
                            const originalSrc = img.src;
                            console.warn('Thumbnail failed, retrying:', originalSrc);
                            setTimeout(() => {
                              if (img && img.src) {
                                img.src = originalSrc + '&retry=' + Date.now();
                              }
                            }, 500);
                          } else {
                            console.warn('Thumbnail failed after retry:', img.src);
                            img.style.display = 'none';
                            img.nextElementSibling?.classList.remove('hidden');
                          }
                        }}
                        onLoad={(e) => {
                          // Image loaded successfully, ensure fallback is hidden
                          e.currentTarget.nextElementSibling?.classList.add('hidden');
                        }}
                      />
                      <div className="hidden text-xs text-center absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
                        👁️
                      </div>
                      {config.eyes === option && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Eyebrows */}
              <div>
                <label className="text-sm font-medium mb-2 block">Eyebrows</label>
                <div className="grid grid-cols-8 gap-2">
                  <button
                    type="button"
                    onClick={() => updateConfig({ eyebrows: '' })}
                    className={cn(
                      "p-2 rounded-lg border-2 transition-all relative aspect-square",
                      !config.eyebrows
                        ? "border-blue-500 ring-2 ring-blue-300"
                        : "border-gray-300 hover:border-gray-400"
                    )}
                    title="Random"
                  >
                    <div className="text-xs text-center">Random</div>
                  </button>
                  {eyebrowOptions.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => updateConfig({ eyebrows: option })}
                      className={cn(
                        "p-1 rounded-lg border-2 transition-all relative aspect-square",
                        config.eyebrows === option
                          ? "border-blue-500 ring-2 ring-blue-300"
                          : "border-gray-300 hover:border-gray-400"
                      )}
                      title={option}
                    >
                      <img 
                        src={getThumbnailUrl(option, 'eyebrows')}
                        alt={option}
                        className="w-full h-full object-cover rounded"
                        loading="lazy"
                        onError={(e) => {
                          // Try to reload the image once before showing fallback
                          const img = e.currentTarget;
                          if (!img.dataset.retried) {
                            img.dataset.retried = 'true';
                            const originalSrc = img.src;
                            console.warn('Thumbnail failed, retrying:', originalSrc);
                            setTimeout(() => {
                              if (img && img.src) {
                                img.src = originalSrc + '&retry=' + Date.now();
                              }
                            }, 500);
                          } else {
                            console.warn('Thumbnail failed after retry:', img.src);
                            img.style.display = 'none';
                            img.nextElementSibling?.classList.remove('hidden');
                          }
                        }}
                        onLoad={(e) => {
                          e.currentTarget.nextElementSibling?.classList.add('hidden');
                        }}
                      />
                      <div className="hidden text-xs text-center absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
                        🤨
                      </div>
                      {config.eyebrows === option && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mouth */}
              <div>
                <label className="text-sm font-medium mb-2 block">Mouth</label>
                <div className="grid grid-cols-8 gap-2">
                  <button
                    type="button"
                    onClick={() => updateConfig({ mouth: '' })}
                    className={cn(
                      "p-2 rounded-lg border-2 transition-all relative aspect-square",
                      !config.mouth
                        ? "border-blue-500 ring-2 ring-blue-300"
                        : "border-gray-300 hover:border-gray-400"
                    )}
                    title="Random"
                  >
                    <div className="text-xs text-center">Random</div>
                  </button>
                  {mouthOptions.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => updateConfig({ mouth: option })}
                      className={cn(
                        "p-1 rounded-lg border-2 transition-all relative aspect-square",
                        config.mouth === option
                          ? "border-blue-500 ring-2 ring-blue-300"
                          : "border-gray-300 hover:border-gray-400"
                      )}
                      title={option}
                    >
                      <img 
                        src={getThumbnailUrl(option, 'mouth')}
                        alt={option}
                        className="w-full h-full object-cover rounded"
                        loading="lazy"
                        onError={(e) => {
                          // Try to reload the image once before showing fallback
                          const img = e.currentTarget;
                          if (!img.dataset.retried) {
                            img.dataset.retried = 'true';
                            const originalSrc = img.src;
                            console.warn('Thumbnail failed, retrying:', originalSrc);
                            setTimeout(() => {
                              if (img && img.src) {
                                img.src = originalSrc + '&retry=' + Date.now();
                              }
                            }, 500);
                          } else {
                            console.warn('Thumbnail failed after retry:', img.src);
                            img.style.display = 'none';
                            img.nextElementSibling?.classList.remove('hidden');
                          }
                        }}
                        onLoad={(e) => {
                          e.currentTarget.nextElementSibling?.classList.add('hidden');
                        }}
                      />
                      <div className="hidden text-xs text-center absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
                        😊
                      </div>
                      {config.mouth === option && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hair Style */}
              <div>
                <label className="text-sm font-medium mb-2 block">Hair Style</label>
                <div className="grid grid-cols-8 gap-2">
                  <button
                    type="button"
                    onClick={() => updateConfig({ topType: '' })}
                    className={cn(
                      "p-2 rounded-lg border-2 transition-all relative aspect-square",
                      !config.topType
                        ? "border-blue-500 ring-2 ring-blue-300"
                        : "border-gray-300 hover:border-gray-400"
                    )}
                    title="Random"
                  >
                    <div className="text-xs text-center">Random</div>
                  </button>
                  {topTypeOptions.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => updateConfig({ topType: option })}
                      className={cn(
                        "p-1 rounded-lg border-2 transition-all relative aspect-square",
                        config.topType === option
                          ? "border-blue-500 ring-2 ring-blue-300"
                          : "border-gray-300 hover:border-gray-400"
                      )}
                      title={option}
                    >
                      <img
                        src={getThumbnailUrl(option, 'topType')}
                        alt={option}
                        className="w-full h-full object-cover rounded"
                        loading="lazy"
                        onError={(e) => {
                          // Try to reload the image once before showing fallback
                          const img = e.currentTarget;
                          if (!img.dataset.retried) {
                            img.dataset.retried = 'true';
                            const originalSrc = img.src;
                            console.warn('Thumbnail failed, retrying:', originalSrc);
                            setTimeout(() => {
                              if (img && img.src) {
                                img.src = originalSrc + '&retry=' + Date.now();
                              }
                            }, 500);
                          } else {
                            console.warn('Thumbnail failed after retry:', img.src);
                            img.style.display = 'none';
                            img.nextElementSibling?.classList.remove('hidden');
                          }
                        }}
                        onLoad={(e) => {
                          e.currentTarget.nextElementSibling?.classList.add('hidden');
                        }}
                      />
                      <div className="hidden text-xs text-center absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
                        💇
                      </div>
                      {config.topType === option && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Colors Panel */}
        <div className={cn("rounded-lg border", theme.border.default)}>
          <button
            type="button"
            onClick={() => toggleSection('colors')}
            className={cn(
              "w-full px-4 py-3 flex items-center justify-between",
              theme.surface.secondary,
              "hover:bg-opacity-80 transition-colors"
            )}
          >
            <span className="font-medium">🎨 Colors</span>
            {expandedSections.includes('colors') ? <ChevronUp /> : <ChevronDown />}
          </button>
          
          {expandedSections.includes('colors') && (
            <div className="p-4 space-y-4">
              {/* Skin Color */}
              <div>
                <label className="text-sm font-medium mb-2 block">Skin Color</label>
                <div className="flex flex-wrap gap-2">
                  {skinColorOptions.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => updateConfig({ skinColor: color.hex })}
                      className={cn(
                        "p-3 rounded-lg border-2 transition-all relative",
                        config.skinColor === color.hex
                          ? "border-blue-500 ring-2 ring-blue-300"
                          : "border-gray-300 hover:border-gray-400"
                      )}
                      style={{ backgroundColor: color.hex }}
                      title={color.label}
                    >
                      {config.skinColor === color.hex && (
                        <Check className="w-4 h-4 text-white drop-shadow-md" />
                      )}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => updateConfig({ skinColor: '' })}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all relative",
                      !config.skinColor
                        ? "border-blue-500 ring-2 ring-blue-300"
                        : "border-gray-300 hover:border-gray-400"
                    )}
                    style={{ 
                      background: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                      backgroundSize: '10px 10px',
                      backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px'
                    }}
                    title="Random"
                  >
                    {!config.skinColor && (
                      <Check className="w-4 h-4 text-gray-800 drop-shadow-md" />
                    )}
                  </button>
                </div>
              </div>

              {/* Hair Color */}
              <div>
                <label className="text-sm font-medium mb-2 block">Hair Color</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => updateConfig({ hairColor: color.hex })}
                      className={cn(
                        "p-3 rounded-lg border-2 transition-all relative",
                        config.hairColor === color.hex
                          ? "border-blue-500 ring-2 ring-blue-300"
                          : "border-gray-300 hover:border-gray-400"
                      )}
                      style={{ backgroundColor: color.hex }}
                      title={color.label}
                    >
                      {config.hairColor === color.hex && (
                        <Check className="w-4 h-4 text-white drop-shadow-md" />
                      )}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => updateConfig({ hairColor: '' })}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all relative",
                      !config.hairColor
                        ? "border-blue-500 ring-2 ring-blue-300"
                        : "border-gray-300 hover:border-gray-400"
                    )}
                    style={{ 
                      background: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                      backgroundSize: '10px 10px',
                      backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px'
                    }}
                    title="Random"
                  >
                    {!config.hairColor && (
                      <Check className="w-4 h-4 text-gray-800 drop-shadow-md" />
                    )}
                  </button>
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="text-sm font-medium mb-2 block">Background Color</label>
                <div className="flex flex-wrap gap-2">
                  {backgroundColorOptions.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => updateConfig({ backgroundColor: color.hex })}
                      className={cn(
                        "p-3 rounded-lg border-2 transition-all relative",
                        config.backgroundColor === color.hex
                          ? "border-blue-500 ring-2 ring-blue-300"
                          : "border-gray-300 hover:border-gray-400"
                      )}
                      style={{ 
                        backgroundColor: color.hex === 'transparent' ? 'white' : color.hex,
                        backgroundImage: color.hex === 'transparent'
                          ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                          : undefined,
                        backgroundSize: color.hex === 'transparent' ? '10px 10px' : undefined,
                        backgroundPosition: color.hex === 'transparent' ? '0 0, 0 5px, 5px -5px, -5px 0px' : undefined,
                      }}
                      title={color.label}
                    >
                      {config.backgroundColor === color.hex && (
                        <Check className="w-4 h-4 text-gray-800 drop-shadow-md" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>


        {/* Advanced Options Panel */}
        <div className={cn("rounded-lg border", theme.border.default)}>
          <button
            type="button"
            onClick={() => toggleSection('advanced')}
            className={cn(
              "w-full px-4 py-3 flex items-center justify-between",
              theme.surface.secondary,
              "hover:bg-opacity-80 transition-colors"
            )}
          >
            <span className="font-medium">⚙️ Advanced Options</span>
            {expandedSections.includes('advanced') ? <ChevronUp /> : <ChevronDown />}
          </button>
          
          {expandedSections.includes('advanced') && (
            <div className="p-4 space-y-4">
              {/* Seed */}
              <div>
                <label className="text-sm font-medium mb-2 block">Seed</label>
                <input
                  type="text"
                  value={config.seed}
                  onChange={(e) => updateConfig({ seed: e.target.value })}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg",
                    theme.surface.primary,
                    theme.border.default,
                    "border"
                  )}
                />
              </div>

              {/* Flip */}
              <div className="flex items-center justify-between">
                <span className="text-sm">Flip Horizontal</span>
                <button
                  type="button"
                  onClick={() => updateConfig({ flip: !config.flip })}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    config.flip ? "bg-blue-500" : "bg-gray-300"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                    config.flip ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>

              {/* Rotate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Rotate</span>
                  <span className="text-sm text-gray-500">{config.rotate}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={config.rotate}
                  onChange={(e) => updateConfig({ rotate: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Scale */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Scale</span>
                  <span className="text-sm text-gray-500">{config.scale}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={config.scale}
                  onChange={(e) => updateConfig({ scale: Number(e.target.value) })}
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
