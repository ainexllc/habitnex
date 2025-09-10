'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { SketchPicker } from 'react-color';
import { ChevronDown, RotateCcw, Undo2, Redo2, Shuffle } from 'lucide-react';
import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
import { DiceBearAvatar, avatarConfigToDiceBearOptions } from './DiceBearAvatar';
import type { AvatarConfig } from '@/types/family';
import { cn } from '@/lib/utils';
import { theme } from '@/lib/theme';
// Available options for adventurer style
const AVATAR_OPTIONS = {
  hair: [
    { value: '', label: 'No Hair', emoji: '🎯' },
    { value: 'short01', label: 'Short 01', emoji: '✂️' },
    { value: 'short02', label: 'Short 02', emoji: '✂️' },
    { value: 'short03', label: 'Short 03', emoji: '✂️' },
    { value: 'short04', label: 'Short 04', emoji: '✂️' },
    { value: 'short05', label: 'Short 05', emoji: '✂️' },
    { value: 'short06', label: 'Short 06', emoji: '✂️' },
    { value: 'short07', label: 'Short 07', emoji: '✂️' },
    { value: 'short08', label: 'Short 08', emoji: '✂️' },
    { value: 'short09', label: 'Short 09', emoji: '✂️' },
    { value: 'short10', label: 'Short 10', emoji: '✂️' },
    { value: 'short11', label: 'Short 11', emoji: '✂️' },
    { value: 'short12', label: 'Short 12', emoji: '✂️' },
    { value: 'short13', label: 'Short 13', emoji: '✂️' },
    { value: 'short14', label: 'Short 14', emoji: '✂️' },
    { value: 'short15', label: 'Short 15', emoji: '✂️' },
    { value: 'short16', label: 'Short 16', emoji: '✂️' },
    { value: 'short17', label: 'Short 17', emoji: '✂️' },
    { value: 'short18', label: 'Short 18', emoji: '✂️' },
    { value: 'short19', label: 'Short 19', emoji: '✂️' },
    { value: 'short20', label: 'Short 20', emoji: '✂️' },
    { value: 'long01', label: 'Long 01', emoji: '💇' },
    { value: 'long02', label: 'Long 02', emoji: '💇' },
    { value: 'long03', label: 'Long 03', emoji: '💇' },
    { value: 'long04', label: 'Long 04', emoji: '💇' },
    { value: 'long05', label: 'Long 05', emoji: '💇' },
    { value: 'long06', label: 'Long 06', emoji: '💇' },
    { value: 'long07', label: 'Long 07', emoji: '💇' },
    { value: 'long08', label: 'Long 08', emoji: '💇' },
    { value: 'long09', label: 'Long 09', emoji: '💇' },
    { value: 'long10', label: 'Long 10', emoji: '💇' },
    { value: 'long11', label: 'Long 11', emoji: '💇' },
    { value: 'long12', label: 'Long 12', emoji: '💇' },
    { value: 'long13', label: 'Long 13', emoji: '💇' },
    { value: 'long14', label: 'Long 14', emoji: '💇' },
    { value: 'long15', label: 'Long 15', emoji: '💇' },
    { value: 'long16', label: 'Long 16', emoji: '💇' },
    { value: 'long17', label: 'Long 17', emoji: '💇' },
    { value: 'long18', label: 'Long 18', emoji: '💇' },
    { value: 'long19', label: 'Long 19', emoji: '💇' },
    { value: 'long20', label: 'Long 20', emoji: '💇' },
    { value: 'long21', label: 'Long 21', emoji: '💇' },
    { value: 'long22', label: 'Long 22', emoji: '💇' },
    { value: 'long23', label: 'Long 23', emoji: '💇' },
    { value: 'long24', label: 'Long 24', emoji: '💇' },
    { value: 'long25', label: 'Long 25', emoji: '💇' },
    { value: 'long26', label: 'Long 26', emoji: '💇' },
  ],
  
  hairColor: [
    { value: 'Auburn', label: 'Auburn', color: '#A55728' },
    { value: 'Black', label: 'Black', color: '#2C1B18' },
    { value: 'Blonde', label: 'Blonde', color: '#B58143' },
    { value: 'BlondeGolden', label: 'Golden', color: '#D6B370' },
    { value: 'Brown', label: 'Brown', color: '#724133' },
    { value: 'BrownDark', label: 'Dark Brown', color: '#4A312C' },
    { value: 'PastelPink', label: 'Pink', color: '#F59797' },
    { value: 'Blue', label: 'Blue', color: '#000EFF' },
    { value: 'Platinum', label: 'Platinum', color: '#ECDCBF' },
    { value: 'Red', label: 'Red', color: '#C93305' },
    { value: 'SilverGray', label: 'Silver', color: '#E8E1E1' },
  ],
  
  eyeType: [
    { value: 'Close', label: 'Closed' },
    { value: 'Cry', label: 'Crying' },
    { value: 'Default', label: 'Default' },
    { value: 'Dizzy', label: 'Dizzy' },
    { value: 'EyeRoll', label: 'Eye Roll' },
    { value: 'Happy', label: 'Happy' },
    { value: 'Hearts', label: 'Hearts' },
    { value: 'Side', label: 'Side' },
    { value: 'Squint', label: 'Squint' },
    { value: 'Surprised', label: 'Surprised' },
    { value: 'Wink', label: 'Wink' },
    { value: 'WinkWacky', label: 'Wacky Wink' },
  ],
  
  eyebrowType: [
    { value: 'Angry', label: 'Angry' },
    { value: 'AngryNatural', label: 'Angry Natural' },
    { value: 'Default', label: 'Default' },
    { value: 'DefaultNatural', label: 'Default Natural' },
    { value: 'FlatNatural', label: 'Flat Natural' },
    { value: 'RaisedExcited', label: 'Excited' },
    { value: 'RaisedExcitedNatural', label: 'Excited Natural' },
    { value: 'SadConcerned', label: 'Sad' },
    { value: 'SadConcernedNatural', label: 'Sad Natural' },
    { value: 'UnibrowNatural', label: 'Unibrow' },
    { value: 'UpDown', label: 'Up Down' },
    { value: 'UpDownNatural', label: 'Up Down Natural' },
  ],
  
  mouthType: [
    { value: 'Concerned', label: 'Concerned' },
    { value: 'Default', label: 'Default' },
    { value: 'Disbelief', label: 'Disbelief' },
    { value: 'Eating', label: 'Eating' },
    { value: 'Grimace', label: 'Grimace' },
    { value: 'Sad', label: 'Sad' },
    { value: 'ScreamOpen', label: 'Scream' },
    { value: 'Serious', label: 'Serious' },
    { value: 'Smile', label: 'Smile' },
    { value: 'Tongue', label: 'Tongue' },
    { value: 'Twinkle', label: 'Twinkle' },
    { value: 'Vomit', label: 'Vomit' },
  ],
  
  facialHairType: [
    { value: 'Blank', label: 'None' },
    { value: 'BeardMedium', label: 'Medium Beard' },
    { value: 'BeardLight', label: 'Light Beard' },
    { value: 'BeardMajestic', label: 'Majestic Beard' },
    { value: 'MoustacheFancy', label: 'Fancy Moustache' },
    { value: 'MoustacheMagnum', label: 'Magnum' },
  ],
  
  accessoriesType: [
    { value: 'Blank', label: 'None' },
    { value: 'Kurt', label: 'Kurt' },
    { value: 'Prescription01', label: 'Glasses 1' },
    { value: 'Prescription02', label: 'Glasses 2' },
    { value: 'Round', label: 'Round Glasses' },
    { value: 'Sunglasses', label: 'Sunglasses' },
    { value: 'Wayfarers', label: 'Wayfarers' },
  ],
  
  clotheType: [
    { value: 'BlazerShirt', label: 'Blazer' },
    { value: 'BlazerSweater', label: 'Blazer Sweater' },
    { value: 'CollarSweater', label: 'Collar Sweater' },
    { value: 'GraphicShirt', label: 'Graphic Shirt' },
    { value: 'Hoodie', label: 'Hoodie' },
    { value: 'Overall', label: 'Overall' },
    { value: 'ShirtCrewNeck', label: 'Crew Neck' },
    { value: 'ShirtScoopNeck', label: 'Scoop Neck' },
    { value: 'ShirtVNeck', label: 'V-Neck' },
  ],
  
  skinColor: [
    { value: 'Tanned', label: 'Tanned', color: '#FD9841' },
    { value: 'Yellow', label: 'Yellow', color: '#F8D25C' },
    { value: 'Pale', label: 'Pale', color: '#FFDBB4' },
    { value: 'Light', label: 'Light', color: '#EDB98A' },
    { value: 'Brown', label: 'Brown', color: '#D08B5B' },
    { value: 'DarkBrown', label: 'Dark Brown', color: '#AE5D29' },
    { value: 'Black', label: 'Black', color: '#614335' },
  ],
};

interface AvatarBuilderProps {
  initialConfig?: AvatarConfig;
  onChange?: (config: AvatarConfig) => void;
  onSave?: (config: AvatarConfig) => void;
  className?: string;
}

export function AvatarBuilder({
  initialConfig,
  onChange,
  onSave,
  className
}: AvatarBuilderProps) {
  
  // State for avatar configuration
  const [config, setConfig] = useState<AvatarConfig>(initialConfig || {
    hair: 'short07',
    hairColor: 'Brown',
    eyeType: 'Default',
    eyebrowType: 'Default',
    mouthType: 'Smile',
    facialHairType: 'Blank',
    accessoriesType: 'Blank',
    clotheType: 'ShirtCrewNeck',
    clotheColor: '#3B82F6',
    skinColor: 'Light',
    backgroundColor: ['#E0E0E0'],
  });
  
  // Undo/Redo history
  const [history, setHistory] = useState<AvatarConfig[]>([config]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Color picker state
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('appearance');
  
  // Update config and history
  const updateConfig = useCallback((updates: Partial<AvatarConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newConfig);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    // Notify parent
    onChange?.(newConfig);
  }, [config, history, historyIndex, onChange]);
  
  // Undo action
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setConfig(history[newIndex]);
      onChange?.(history[newIndex]);
    }
  }, [historyIndex, history, onChange]);
  
  // Redo action
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setConfig(history[newIndex]);
      onChange?.(history[newIndex]);
    }
  }, [historyIndex, history, onChange]);
  
  // Reset to defaults
  const handleReset = useCallback(() => {
    const defaultConfig: AvatarConfig = {
      hair: 'short07',
      hairColor: 'Brown',
      eyeType: 'Default',
      eyebrowType: 'Default',
      mouthType: 'Smile',
      facialHairType: 'Blank',
      accessoriesType: 'Blank',
      clotheType: 'ShirtCrewNeck',
      clotheColor: '#3B82F6',
      skinColor: 'Light',
      backgroundColor: ['#E0E0E0'],
    };
    updateConfig(defaultConfig);
  }, [updateConfig]);
  
  // Randomize avatar
  const handleRandomize = useCallback(() => {
    const randomConfig: AvatarConfig = {
      hair: AVATAR_OPTIONS.hair[Math.floor(Math.random() * AVATAR_OPTIONS.hair.length)].value,
      hairColor: AVATAR_OPTIONS.hairColor[Math.floor(Math.random() * AVATAR_OPTIONS.hairColor.length)].value,
      eyeType: AVATAR_OPTIONS.eyeType[Math.floor(Math.random() * AVATAR_OPTIONS.eyeType.length)].value,
      eyebrowType: AVATAR_OPTIONS.eyebrowType[Math.floor(Math.random() * AVATAR_OPTIONS.eyebrowType.length)].value,
      mouthType: AVATAR_OPTIONS.mouthType[Math.floor(Math.random() * AVATAR_OPTIONS.mouthType.length)].value,
      facialHairType: AVATAR_OPTIONS.facialHairType[Math.floor(Math.random() * AVATAR_OPTIONS.facialHairType.length)].value,
      accessoriesType: AVATAR_OPTIONS.accessoriesType[Math.floor(Math.random() * AVATAR_OPTIONS.accessoriesType.length)].value,
      clotheType: AVATAR_OPTIONS.clotheType[Math.floor(Math.random() * AVATAR_OPTIONS.clotheType.length)].value,
      clotheColor: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      skinColor: AVATAR_OPTIONS.skinColor[Math.floor(Math.random() * AVATAR_OPTIONS.skinColor.length)].value,
      backgroundColor: [`#${Math.floor(Math.random()*16777215).toString(16)}`],
    };
    updateConfig(randomConfig);
  }, [updateConfig]);
  
  // Convert config to DiceBear options
  const avatarOptions = useMemo(() => {
    const options = avatarConfigToDiceBearOptions(config);
    console.log('Avatar options:', options);
    console.log('Config being converted:', config);
    return options;
  }, [config]);
  
  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Avatar Preview - Always visible at the top */}
      <div className={cn(
        "rounded-lg p-4 text-center bg-gray-50 dark:bg-gray-800",
        theme.border.default,
        "border"
      )}>
        <div className="mx-auto mb-3" style={{ width: '120px', height: '120px' }}>
          <div 
            className="w-full h-full rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center"
            style={{ backgroundColor: config.backgroundColor?.[0] || '#f3f4f6' }}
            dangerouslySetInnerHTML={{ 
              __html: (() => {
                try {
                  const svg = Object.keys(avatarOptions).length > 0 
                    ? createAvatar(adventurer as any, { ...avatarOptions, size: 120, backgroundColor: [] }).toString()
                    : createAvatar(adventurer as any, { seed: 'default-avatar', size: 120, backgroundColor: [] }).toString();
                  console.log('Avatar SVG created, length:', svg?.length);
                  return svg;
                } catch (error) {
                  console.error('Error creating avatar:', error);
                  return '<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:#e5e7eb;">❌</div>';
                }
              })()
            }}
          />
        </div>
            
        {/* Action Buttons */}
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex === 0}
            className={cn(
              "p-2 rounded-lg transition-colors",
              historyIndex === 0
                ? cn(theme.text.muted, 'cursor-not-allowed')
                : cn(theme.text.primary, theme.surface.hover)
            )}
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex === history.length - 1}
            className={cn(
              "p-2 rounded-lg transition-colors",
              historyIndex === history.length - 1
                ? cn(theme.text.muted, 'cursor-not-allowed')
                : cn(theme.text.primary, theme.surface.hover)
            )}
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          
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
              "p-2 rounded-lg transition-colors",
              theme.text.primary,
              theme.surface.hover
            )}
            title="Randomize"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Customization Options */}
      <div className="space-y-4">
          {/* Appearance Section */}
          <div className={cn(
            "rounded-lg overflow-hidden",
            theme.surface.secondary,
            theme.border.default,
            "border"
          )}>
            <button
              type="button"
              onClick={() => toggleSection('appearance')}
              className={cn(
                "w-full px-4 py-3 flex items-center justify-between",
                theme.surface.hover,
                "hover:bg-opacity-50 transition-colors"
              )}
            >
              <span className={cn("font-medium", theme.text.primary)}>Appearance</span>
              <ChevronDown className={cn(
                "w-5 h-5 transition-transform",
                theme.text.muted,
                expandedSection === 'appearance' ? 'rotate-180' : ''
              )} />
            </button>
            
            {expandedSection === 'appearance' && (
              <div className="p-4 space-y-4">
                {/* Skin Color */}
                <div>
                  <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
                    Skin Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_OPTIONS.skinColor.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateConfig({ skinColor: option.value })}
                        className={cn(
                          "w-10 h-10 rounded-full border-2 transition-all",
                          config.skinColor === option.value
                            ? 'border-blue-500 scale-110'
                            : 'border-gray-300 hover:scale-105'
                        )}
                        style={{ backgroundColor: option.color }}
                        title={option.label}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Eyes */}
                <div>
                  <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
                    Eyes
                  </label>
                  <select
                    value={config.eyeType}
                    onChange={(e) => updateConfig({ eyeType: e.target.value })}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg",
                      theme.surface.primary,
                      theme.border.default,
                      theme.text.primary,
                      "border"
                    )}
                  >
                    {AVATAR_OPTIONS.eyeType.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Eyebrows */}
                <div>
                  <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
                    Eyebrows
                  </label>
                  <select
                    value={config.eyebrowType}
                    onChange={(e) => updateConfig({ eyebrowType: e.target.value })}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg",
                      theme.surface.primary,
                      theme.border.default,
                      theme.text.primary,
                      "border"
                    )}
                  >
                    {AVATAR_OPTIONS.eyebrowType.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Mouth */}
                <div>
                  <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
                    Mouth
                  </label>
                  <select
                    value={config.mouthType}
                    onChange={(e) => updateConfig({ mouthType: e.target.value })}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg",
                      theme.surface.primary,
                      theme.border.default,
                      theme.text.primary,
                      "border"
                    )}
                  >
                    {AVATAR_OPTIONS.mouthType.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
          
          {/* Hair Section */}
          <div className={cn(
            "rounded-lg overflow-hidden",
            theme.surface.secondary,
            theme.border.default,
            "border"
          )}>
            <button
              type="button"
              onClick={() => toggleSection('hair')}
              className={cn(
                "w-full px-4 py-3 flex items-center justify-between",
                theme.surface.hover,
                "hover:bg-opacity-50 transition-colors"
              )}
            >
              <span className={cn("font-medium", theme.text.primary)}>Hair & Facial Hair</span>
              <ChevronDown className={cn(
                "w-5 h-5 transition-transform",
                theme.text.muted,
                expandedSection === 'hair' ? 'rotate-180' : ''
              )} />
            </button>
            
            {expandedSection === 'hair' && (
              <div className="p-4 space-y-4">
                {/* Hair Style */}
                <div>
                  <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
                    Hair Style
                  </label>
                  <select
                    value={config.hair || ''}
                    onChange={(e) => updateConfig({ hair: e.target.value })}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg",
                      theme.surface.primary,
                      theme.border.default,
                      theme.text.primary,
                      "border"
                    )}
                  >
                    {AVATAR_OPTIONS.hair.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.emoji} {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Hair Color */}
                {config.hair && (
                  <div>
                    <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
                      Hair Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AVATAR_OPTIONS.hairColor.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateConfig({ hairColor: option.value })}
                          className={cn(
                            "w-10 h-10 rounded-full border-2 transition-all",
                            config.hairColor === option.value
                              ? 'border-blue-500 scale-110'
                              : 'border-gray-300 hover:scale-105'
                          )}
                          style={{ backgroundColor: option.color }}
                          title={option.label}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Facial Hair */}
                <div>
                  <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
                    Facial Hair
                  </label>
                  <select
                    value={config.facialHairType}
                    onChange={(e) => updateConfig({ facialHairType: e.target.value })}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg",
                      theme.surface.primary,
                      theme.border.default,
                      theme.text.primary,
                      "border"
                    )}
                  >
                    {AVATAR_OPTIONS.facialHairType.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Facial Hair Color */}
                {config.facialHairType && config.facialHairType !== 'Blank' && (
                  <div>
                    <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
                      Facial Hair Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AVATAR_OPTIONS.hairColor.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateConfig({ facialHairColor: option.value })}
                          className={cn(
                            "w-10 h-10 rounded-full border-2 transition-all",
                            config.facialHairColor === option.value
                              ? 'border-blue-500 scale-110'
                              : 'border-gray-300 hover:scale-105'
                          )}
                          style={{ backgroundColor: option.color }}
                          title={option.label}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Accessories & Clothing Section */}
          <div className={cn(
            "rounded-lg overflow-hidden",
            theme.surface.secondary,
            theme.border.default,
            "border"
          )}>
            <button
              type="button"
              onClick={() => toggleSection('accessories')}
              className={cn(
                "w-full px-4 py-3 flex items-center justify-between",
                theme.surface.hover,
                "hover:bg-opacity-50 transition-colors"
              )}
            >
              <span className={cn("font-medium", theme.text.primary)}>Accessories & Clothing</span>
              <ChevronDown className={cn(
                "w-5 h-5 transition-transform",
                theme.text.muted,
                expandedSection === 'accessories' ? 'rotate-180' : ''
              )} />
            </button>
            
            {expandedSection === 'accessories' && (
              <div className="p-4 space-y-4">
                {/* Accessories */}
                <div>
                  <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
                    Accessories
                  </label>
                  <select
                    value={config.accessoriesType}
                    onChange={(e) => updateConfig({ accessoriesType: e.target.value })}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg",
                      theme.surface.primary,
                      theme.border.default,
                      theme.text.primary,
                      "border"
                    )}
                  >
                    {AVATAR_OPTIONS.accessoriesType.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Clothing Style */}
                <div>
                  <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
                    Clothing Style
                  </label>
                  <select
                    value={config.clotheType}
                    onChange={(e) => updateConfig({ clotheType: e.target.value })}
                    className={cn(
                      "w-full px-3 py-2 rounded-lg",
                      theme.surface.primary,
                      theme.border.default,
                      theme.text.primary,
                      "border"
                    )}
                  >
                    {AVATAR_OPTIONS.clotheType.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Clothing Color */}
                <div>
                  <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
                    Clothing Color
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowColorPicker(showColorPicker === 'clothing' ? null : 'clothing')}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg flex items-center justify-between",
                        theme.surface.primary,
                        theme.border.default,
                        theme.text.primary,
                        "border"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: config.clotheColor || '#3B82F6' }}
                        />
                        {config.clotheColor || '#3B82F6'}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    {showColorPicker === 'clothing' && (
                      <div className="absolute z-10 mt-2">
                        <div
                          className="fixed inset-0"
                          onClick={() => setShowColorPicker(null)}
                        />
                        <SketchPicker
                          color={config.clotheColor || '#3B82F6'}
                          onChange={(color) => updateConfig({ clotheColor: color.hex })}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Background Color */}
                <div>
                  <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
                    Background Color
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowColorPicker(showColorPicker === 'background' ? null : 'background')}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg flex items-center justify-between",
                        theme.surface.primary,
                        theme.border.default,
                        theme.text.primary,
                        "border"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: config.backgroundColor?.[0] || '#E0E0E0' }}
                        />
                        {config.backgroundColor?.[0] || '#E0E0E0'}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    {showColorPicker === 'background' && (
                      <div className="absolute z-10 mt-2">
                        <div
                          className="fixed inset-0"
                          onClick={() => setShowColorPicker(null)}
                        />
                        <SketchPicker
                          color={config.backgroundColor?.[0] || '#E0E0E0'}
                          onChange={(color) => updateConfig({ backgroundColor: [color.hex] })}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Background Color */}
                <div>
                  <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
                    Background Color
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowColorPicker(showColorPicker === 'background' ? null : 'background')}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg flex items-center justify-between",
                        theme.surface.primary,
                        theme.border.default,
                        theme.text.primary,
                        "border"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: config.backgroundColor?.[0] || '#E0E0E0' }}
                        />
                        {config.backgroundColor?.[0] || '#E0E0E0'}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    {showColorPicker === 'background' && (
                      <div className="absolute z-10 mt-2">
                        <SketchPicker
                          color={config.backgroundColor?.[0] || '#E0E0E0'}
                          onChange={(color) => updateConfig({ backgroundColor: [color.hex] })}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
      </div>
      
      {/* Save Button */}
      {onSave && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onSave(config)}
            className={cn(
              "px-6 py-2 rounded-lg font-medium transition-colors",
              theme.components.button.primary,
              "text-white"
            )}
          >
            Save Avatar
          </button>
        </div>
      )}
    </div>
  );
}
