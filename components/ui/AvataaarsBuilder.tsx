'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { theme } from '@/lib/theme';

interface AvataaarsBuilderProps {
  initialSeed?: string;
  onChange?: (seed: string, options?: any) => void;
  className?: string;
}

// Avatar options for Avataaars style
const avatarOptions = {
  accessories: [
    { value: 'blank', label: 'None' },
    { value: 'kurt', label: 'Kurt' },
    { value: 'prescription01', label: 'Prescription 01' },
    { value: 'prescription02', label: 'Prescription 02' },
    { value: 'round', label: 'Round' },
    { value: 'sunglasses', label: 'Sunglasses' },
    { value: 'wayfarers', label: 'Wayfarers' },
  ],
  eyebrow: [
    { value: 'default', label: 'Default' },
    { value: 'angry', label: 'Angry 😠' },
    { value: 'angryNatural', label: 'Angry Natural' },
    { value: 'defaultNatural', label: 'Natural' },
    { value: 'flatNatural', label: 'Flat' },
    { value: 'frownNatural', label: 'Frown 😟' },
    { value: 'raisedExcited', label: 'Excited 😃' },
    { value: 'raisedExcitedNatural', label: 'Excited Natural' },
    { value: 'sadConcerned', label: 'Sad 😢' },
    { value: 'sadConcernedNatural', label: 'Sad Natural' },
    { value: 'unibrowNatural', label: 'Unibrow' },
    { value: 'upDown', label: 'Up Down 🤨' },
    { value: 'upDownNatural', label: 'Up Down Natural' },
  ],
  eyes: [
    { value: 'close', label: 'Closed 😌' },
    { value: 'cry', label: 'Crying 😭' },
    { value: 'default', label: 'Default' },
    { value: 'dizzy', label: 'Dizzy 😵' },
    { value: 'eyeRoll', label: 'Eye Roll 🙄' },
    { value: 'happy', label: 'Happy 😊' },
    { value: 'hearts', label: 'Hearts 😍' },
    { value: 'side', label: 'Side 👀' },
    { value: 'squint', label: 'Squint 😑' },
    { value: 'surprised', label: 'Surprised 😲' },
    { value: 'wink', label: 'Wink 😉' },
    { value: 'winkWacky', label: 'Wacky Wink 😜' },
  ],
  mouth: [
    { value: 'concerned', label: 'Concerned 😟' },
    { value: 'default', label: 'Default' },
    { value: 'disbelief', label: 'Disbelief 😒' },
    { value: 'eating', label: 'Eating 😋' },
    { value: 'grimace', label: 'Grimace 😬' },
    { value: 'sad', label: 'Sad 😢' },
    { value: 'screamOpen', label: 'Scream 😱' },
    { value: 'serious', label: 'Serious 😐' },
    { value: 'smile', label: 'Smile 😊' },
    { value: 'tongue', label: 'Tongue 😛' },
    { value: 'twinkle', label: 'Twinkle ✨' },
    { value: 'vomit', label: 'Vomit 🤮' },
  ],
  top: [
    { value: 'no', label: 'Bald' },
    { value: 'bigHair', label: 'Big Hair' },
    { value: 'bob', label: 'Bob' },
    { value: 'bun', label: 'Bun' },
    { value: 'curly', label: 'Curly' },
    { value: 'curvy', label: 'Curvy' },
    { value: 'dreads', label: 'Dreads' },
    { value: 'frida', label: 'Frida' },
    { value: 'fro', label: 'Afro' },
    { value: 'froBand', label: 'Afro + Band' },
    { value: 'hat', label: 'Hat' },
    { value: 'hijab', label: 'Hijab' },
    { value: 'longButNotTooLong', label: 'Long' },
    { value: 'miaWallace', label: 'Mia Wallace' },
    { value: 'shavedSides', label: 'Shaved Sides' },
    { value: 'shortCurly', label: 'Short Curly' },
    { value: 'shortFlat', label: 'Short Flat' },
    { value: 'shortRound', label: 'Short Round' },
    { value: 'shortWaved', label: 'Short Waved' },
    { value: 'sides', label: 'Sides' },
    { value: 'straight01', label: 'Straight' },
    { value: 'straight02', label: 'Straight Alt' },
    { value: 'straightAndStrand', label: 'Straight + Strand' },
    { value: 'turban', label: 'Turban' },
    { value: 'winterHat1', label: 'Winter Hat 1' },
    { value: 'winterHat2', label: 'Winter Hat 2' },
    { value: 'winterHat3', label: 'Winter Hat 3' },
    { value: 'winterHat4', label: 'Winter Hat 4' },
  ],
  hairColor: [
    { value: 'auburn', label: 'Auburn' },
    { value: 'black', label: 'Black' },
    { value: 'blonde', label: 'Blonde' },
    { value: 'blondeGolden', label: 'Golden Blonde' },
    { value: 'brown', label: 'Brown' },
    { value: 'brownDark', label: 'Dark Brown' },
    { value: 'gray', label: 'Gray' },
    { value: 'platinum', label: 'Platinum' },
    { value: 'red', label: 'Red' },
    { value: 'silverGray', label: 'Silver' },
  ],
  facialHair: [
    { value: 'blank', label: 'None' },
    { value: 'beardLight', label: 'Light Beard' },
    { value: 'beardMajestic', label: 'Majestic Beard' },
    { value: 'beardMedium', label: 'Medium Beard' },
    { value: 'goatee', label: 'Goatee' },
    { value: 'moustacheFancy', label: 'Fancy Moustache' },
    { value: 'moustacheMagnum', label: 'Magnum' },
  ],
  clothing: [
    { value: 'blazerAndShirt', label: 'Blazer & Shirt' },
    { value: 'blazerAndSweater', label: 'Blazer & Sweater' },
    { value: 'collarAndSweater', label: 'Collar & Sweater' },
    { value: 'graphicShirt', label: 'Graphic Shirt' },
    { value: 'hoodie', label: 'Hoodie' },
    { value: 'overall', label: 'Overall' },
    { value: 'shirtCrewNeck', label: 'Crew Neck' },
    { value: 'shirtScoopNeck', label: 'Scoop Neck' },
    { value: 'shirtVNeck', label: 'V-Neck' },
  ],
  clothingColor: [
    { value: 'black', label: 'Black' },
    { value: 'blue01', label: 'Blue' },
    { value: 'blue02', label: 'Light Blue' },
    { value: 'blue03', label: 'Dark Blue' },
    { value: 'gray01', label: 'Light Gray' },
    { value: 'gray02', label: 'Dark Gray' },
    { value: 'heather', label: 'Heather' },
    { value: 'pastelBlue', label: 'Pastel Blue' },
    { value: 'pastelGreen', label: 'Pastel Green' },
    { value: 'pastelOrange', label: 'Pastel Orange' },
    { value: 'pastelRed', label: 'Pastel Red' },
    { value: 'pastelYellow', label: 'Pastel Yellow' },
    { value: 'pink', label: 'Pink' },
    { value: 'red', label: 'Red' },
    { value: 'white', label: 'White' },
  ],
  skinColor: [
    { value: 'tanned', label: 'Tanned' },
    { value: 'yellow', label: 'Yellow' },
    { value: 'pale', label: 'Pale' },
    { value: 'light', label: 'Light' },
    { value: 'brown', label: 'Brown' },
    { value: 'darkBrown', label: 'Dark Brown' },
    { value: 'black', label: 'Black' },
  ],
};

export function AvataaarsBuilder({
  initialSeed = 'default',
  onChange,
  className
}: AvataaarsBuilderProps) {
  const [seed, setSeed] = useState(initialSeed);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['expression']);
  
  // Avatar customization state
  const [options, setOptions] = useState({
    accessories: 'blank',
    eyebrow: 'default',
    eyes: 'default',
    mouth: 'smile',
    top: 'shortFlat',
    hairColor: 'brown',
    facialHair: 'blank',
    facialHairColor: 'brown',
    clothing: 'shirtCrewNeck',
    clothingColor: 'blue01',
    skinColor: 'light',
  });

  // Generate random avatar
  const handleRandomize = useCallback(() => {
    const randomSeed = Math.random().toString(36).substring(2, 15);
    setSeed(randomSeed);
    onChange?.(randomSeed, options);
  }, [options, onChange]);

  // Reset to defaults
  const handleReset = useCallback(() => {
    const defaultOptions = {
      accessories: 'blank',
      eyebrow: 'default',
      eyes: 'default',
      mouth: 'smile',
      top: 'shortFlat',
      hairColor: 'brown',
      facialHair: 'blank',
      facialHairColor: 'brown',
      clothing: 'shirtCrewNeck',
      clothingColor: 'blue01',
      skinColor: 'light',
    };
    setOptions(defaultOptions);
    setSeed(initialSeed);
    onChange?.(initialSeed, defaultOptions);
  }, [initialSeed, onChange]);

  // Update option
  const updateOption = useCallback((key: string, value: string) => {
    setOptions(prev => {
      const newOptions = { ...prev, [key]: value };
      onChange?.(seed, newOptions);
      return newOptions;
    });
  }, [seed, onChange]);

  // Toggle section
  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Generate avatar URL
  const avatarUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set('seed', seed);
    
    // Add all customization options
    Object.entries(options).forEach(([key, value]) => {
      if (value && value !== 'blank') {
        params.set(key, value);
      }
    });
    
    const url = `https://api.dicebear.com/9.x/avataaars/svg?${params.toString()}`;
    console.log('Avataaars URL:', url);
    console.log('Avataaars options:', options);
    return url;
  }, [seed, options]);

  // Reset loading state when URL changes
  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
  }, [avatarUrl]);

  // Notify parent on mount
  useEffect(() => {
    onChange?.(seed, options);
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Avatar Preview */}
      <div className={cn(
        "rounded-lg p-6 text-center",
        theme.surface.secondary,
        theme.border.default,
        "border"
      )}>
        <div className="mx-auto mb-4 relative" style={{ width: '120px', height: '120px' }}>
          {(imageLoading || imageError) && (
            <div className="absolute inset-0 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <span className="text-gray-400">
                {imageError ? 'Failed to load' : 'Loading...'}
              </span>
            </div>
          )}
          {!imageError && (
            <img 
              src={avatarUrl}
              alt="Avatar preview"
              className="w-full h-full rounded-full border-2 border-gray-300 dark:border-gray-600"
              style={{ 
                display: imageLoading ? 'none' : 'block'
              }}
              onLoad={() => {
                setImageLoading(false);
                setImageError(false);
              }}
              onError={() => {
                console.error('Failed to load avatar from:', avatarUrl);
                setImageLoading(false);
                setImageError(true);
              }}
            />
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className={cn(
              "p-2 rounded-lg transition-colors",
              theme.text.primary,
              theme.surface.hover
            )}
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={handleRandomize}
            className={cn(
              "px-4 py-2 rounded-lg transition-colors flex items-center gap-2",
              theme.components.button.primary,
              "text-white font-medium"
            )}
          >
            <Shuffle className="w-4 h-4" />
            Generate Random
          </button>
        </div>
      </div>

      {/* Customization Options */}
      <div className="space-y-2">
        {/* Expression Section */}
        <div className={cn("rounded-lg border", theme.border.default)}>
          <button
            type="button"
            onClick={() => toggleSection('expression')}
            className={cn(
              "w-full px-4 py-3 flex items-center justify-between",
              theme.surface.secondary,
              theme.text.primary,
              "hover:bg-opacity-80 transition-colors"
            )}
          >
            <span className="font-medium">Expression & Features</span>
            {expandedSections.includes('expression') ? <ChevronUp /> : <ChevronDown />}
          </button>
          {expandedSections.includes('expression') && (
            <div className="p-4 space-y-4">
              {/* Eyes */}
              <div>
                <label className="text-sm font-medium mb-2 block">Eyes</label>
                <select
                  value={options.eyes}
                  onChange={(e) => updateOption('eyes', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg",
                    theme.surface.primary,
                    theme.border.default,
                    theme.text.primary,
                    "border"
                  )}
                >
                  {avatarOptions.eyes.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Eyebrows */}
              <div>
                <label className="text-sm font-medium mb-2 block">Eyebrows</label>
                <select
                  value={options.eyebrow}
                  onChange={(e) => updateOption('eyebrow', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg",
                    theme.surface.primary,
                    theme.border.default,
                    theme.text.primary,
                    "border"
                  )}
                >
                  {avatarOptions.eyebrow.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Mouth */}
              <div>
                <label className="text-sm font-medium mb-2 block">Mouth</label>
                <select
                  value={options.mouth}
                  onChange={(e) => updateOption('mouth', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg",
                    theme.surface.primary,
                    theme.border.default,
                    theme.text.primary,
                    "border"
                  )}
                >
                  {avatarOptions.mouth.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Skin Color */}
              <div>
                <label className="text-sm font-medium mb-2 block">Skin Color</label>
                <div className="grid grid-cols-7 gap-2">
                  {avatarOptions.skinColor.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateOption('skinColor', opt.value)}
                      className={cn(
                        "p-2 rounded-lg border-2 text-xs",
                        options.skinColor === opt.value
                          ? 'border-blue-500 ring-2 ring-blue-300'
                          : 'border-gray-300'
                      )}
                      title={opt.label}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hair Section */}
        <div className={cn("rounded-lg border", theme.border.default)}>
          <button
            type="button"
            onClick={() => toggleSection('hair')}
            className={cn(
              "w-full px-4 py-3 flex items-center justify-between",
              theme.surface.secondary,
              theme.text.primary,
              "hover:bg-opacity-80 transition-colors"
            )}
          >
            <span className="font-medium">Hair & Accessories</span>
            {expandedSections.includes('hair') ? <ChevronUp /> : <ChevronDown />}
          </button>
          {expandedSections.includes('hair') && (
            <div className="p-4 space-y-4">
              {/* Hair Style */}
              <div>
                <label className="text-sm font-medium mb-2 block">Hair Style</label>
                <select
                  value={options.top}
                  onChange={(e) => updateOption('top', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg",
                    theme.surface.primary,
                    theme.border.default,
                    theme.text.primary,
                    "border"
                  )}
                >
                  {avatarOptions.top.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Hair Color */}
              <div>
                <label className="text-sm font-medium mb-2 block">Hair Color</label>
                <div className="grid grid-cols-5 gap-2">
                  {avatarOptions.hairColor.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateOption('hairColor', opt.value)}
                      className={cn(
                        "p-2 rounded-lg border-2 text-xs",
                        options.hairColor === opt.value
                          ? 'border-blue-500 ring-2 ring-blue-300'
                          : 'border-gray-300'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Facial Hair */}
              <div>
                <label className="text-sm font-medium mb-2 block">Facial Hair</label>
                <select
                  value={options.facialHair}
                  onChange={(e) => updateOption('facialHair', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg",
                    theme.surface.primary,
                    theme.border.default,
                    theme.text.primary,
                    "border"
                  )}
                >
                  {avatarOptions.facialHair.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Accessories */}
              <div>
                <label className="text-sm font-medium mb-2 block">Accessories</label>
                <select
                  value={options.accessories}
                  onChange={(e) => updateOption('accessories', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg",
                    theme.surface.primary,
                    theme.border.default,
                    theme.text.primary,
                    "border"
                  )}
                >
                  {avatarOptions.accessories.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Clothing Section */}
        <div className={cn("rounded-lg border", theme.border.default)}>
          <button
            type="button"
            onClick={() => toggleSection('clothing')}
            className={cn(
              "w-full px-4 py-3 flex items-center justify-between",
              theme.surface.secondary,
              theme.text.primary,
              "hover:bg-opacity-80 transition-colors"
            )}
          >
            <span className="font-medium">Clothing</span>
            {expandedSections.includes('clothing') ? <ChevronUp /> : <ChevronDown />}
          </button>
          {expandedSections.includes('clothing') && (
            <div className="p-4 space-y-4">
              {/* Clothing Style */}
              <div>
                <label className="text-sm font-medium mb-2 block">Style</label>
                <select
                  value={options.clothing}
                  onChange={(e) => updateOption('clothing', e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg",
                    theme.surface.primary,
                    theme.border.default,
                    theme.text.primary,
                    "border"
                  )}
                >
                  {avatarOptions.clothing.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Clothing Color */}
              <div>
                <label className="text-sm font-medium mb-2 block">Color</label>
                <div className="grid grid-cols-5 gap-2">
                  {avatarOptions.clothingColor.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateOption('clothingColor', opt.value)}
                      className={cn(
                        "p-2 rounded-lg border-2 text-xs",
                        options.clothingColor === opt.value
                          ? 'border-blue-500 ring-2 ring-blue-300'
                          : 'border-gray-300'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
