'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { SketchPicker } from 'react-color';
import { ChevronDown, RotateCcw, Shuffle, Sparkles } from 'lucide-react';
import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
import { cn } from '@/lib/utils';
import { theme } from '@/lib/theme';

interface AdventurerConfig {
  seed: string;
  backgroundColor?: string[];
  flip?: boolean;
  rotate?: number;
  scale?: number;
}

interface AdventurerAvatarBuilderProps {
  initialSeed?: string;
  onChange?: (seed: string, backgroundColor?: string[]) => void;
  className?: string;
}

// Pre-defined background colors that work well with adventurer avatars
const backgroundColors = [
  { label: 'None', value: 'transparent' },
  { label: 'Light Blue', value: '#E0F2FE' },
  { label: 'Light Green', value: '#DCFCE7' },
  { label: 'Light Yellow', value: '#FEF3C7' },
  { label: 'Light Pink', value: '#FCE7F3' },
  { label: 'Light Purple', value: '#EDE9FE' },
  { label: 'Light Gray', value: '#F3F4F6' },
  { label: 'Mint', value: '#D1FAE5' },
  { label: 'Peach', value: '#FED7AA' },
  { label: 'Lavender', value: '#DDD6FE' },
  { label: 'Sky', value: '#BAE6FD' },
];

export function AdventurerAvatarBuilder({
  initialSeed = 'default',
  onChange,
  className
}: AdventurerAvatarBuilderProps) {
  const [seed, setSeed] = useState(initialSeed);
  const [backgroundColor, setBackgroundColor] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState('#E0F2FE');
  const [flip, setFlip] = useState(false);
  const [rotate, setRotate] = useState(0);
  const [scale, setScale] = useState(100);

  // Generate random seed
  const handleRandomize = useCallback(() => {
    const randomSeed = Math.random().toString(36).substring(2, 15);
    setSeed(randomSeed);
    onChange?.(randomSeed, backgroundColor);
  }, [backgroundColor, onChange]);

  // Reset to defaults
  const handleReset = useCallback(() => {
    setSeed(initialSeed);
    setBackgroundColor([]);
    setFlip(false);
    setRotate(0);
    setScale(100);
    onChange?.(initialSeed, []);
  }, [initialSeed, onChange]);

  // Update seed
  const handleSeedChange = useCallback((newSeed: string) => {
    setSeed(newSeed);
    onChange?.(newSeed, backgroundColor);
  }, [backgroundColor, onChange]);

  // Update background color
  const handleBackgroundChange = useCallback((color: string) => {
    const newBg = color === 'transparent' ? [] : [color];
    setBackgroundColor(newBg);
    onChange?.(seed, newBg);
  }, [seed, onChange]);

  // Generate avatar SVG
  const avatarSvg = useMemo(() => {
    try {
      const options: any = {
        seed,
        size: 120,
        flip,
        rotate,
        scale,
      };
      
      // Only add backgroundColor if it's not empty
      if (backgroundColor.length > 0) {
        options.backgroundColor = backgroundColor;
      }
      
      const svg = createAvatar(adventurer as any, options).toString();
      return svg;
    } catch (error) {
      console.error('Failed to generate adventurer avatar:', error);
      return null;
    }
  }, [seed, backgroundColor, flip, rotate, scale]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Avatar Preview */}
      <div className={cn(
        "rounded-lg p-6 text-center",
        theme.surface.secondary,
        theme.border.default,
        "border"
      )}>
        <div className="mx-auto mb-4" style={{ width: '120px', height: '120px' }}>
          <div 
            className="w-full h-full rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center"
            style={{ 
              backgroundColor: backgroundColor[0] || 'transparent',
            }}
          >
            {avatarSvg && (
              <div dangerouslySetInnerHTML={{ __html: avatarSvg }} />
            )}
          </div>
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
            Generate New Avatar
          </button>
        </div>
      </div>
      
      {/* Customization Options */}
      <div className="space-y-4">
        {/* Seed Input */}
        <div>
          <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
            Avatar Seed
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={seed}
              onChange={(e) => handleSeedChange(e.target.value)}
              className={cn(
                "flex-1 px-3 py-2 rounded-lg",
                theme.surface.primary,
                theme.border.default,
                theme.text.primary,
                "border"
              )}
              placeholder="Enter a seed or use random"
            />
            <button
              type="button"
              onClick={handleRandomize}
              className={cn(
                "px-3 py-2 rounded-lg transition-colors",
                theme.surface.secondary,
                theme.text.primary,
                theme.surface.hover
              )}
              title="Generate Random"
            >
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
          <p className={cn("text-xs mt-1", theme.text.muted)}>
            The seed determines your unique avatar appearance
          </p>
        </div>
        
        {/* Background Color */}
        <div>
          <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
            Background Color
          </label>
          <div className="grid grid-cols-5 gap-2 mb-2">
            {backgroundColors.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => handleBackgroundChange(color.value)}
                className={cn(
                  "p-2 rounded-lg border-2 transition-all text-xs",
                  backgroundColor[0] === color.value || (backgroundColor.length === 0 && color.value === 'transparent')
                    ? 'border-blue-500 scale-105'
                    : 'border-gray-300 hover:scale-105'
                )}
                style={{ 
                  backgroundColor: color.value === 'transparent' ? 'white' : color.value,
                  backgroundImage: color.value === 'transparent' 
                    ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                    : undefined,
                  backgroundSize: color.value === 'transparent' ? '10px 10px' : undefined,
                  backgroundPosition: color.value === 'transparent' ? '0 0, 0 5px, 5px -5px, -5px 0px' : undefined,
                }}
                title={color.label}
              />
            ))}
          </div>
          
          {/* Custom Color Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
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
                  style={{ backgroundColor: customColor }}
                />
                Custom Color
              </span>
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                showColorPicker ? 'rotate-180' : ''
              )} />
            </button>
            
            {showColorPicker && (
              <div className="absolute z-10 mt-2">
                <SketchPicker
                  color={customColor}
                  onChange={(color) => {
                    setCustomColor(color.hex);
                    handleBackgroundChange(color.hex);
                  }}
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Advanced Options */}
        <div className="space-y-3">
          <label className={cn("block text-sm font-medium", theme.text.primary)}>
            Advanced Options
          </label>
          
          {/* Flip */}
          <div className="flex items-center justify-between">
            <span className={cn("text-sm", theme.text.secondary)}>Flip Horizontally</span>
            <button
              type="button"
              onClick={() => setFlip(!flip)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                flip ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  flip ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>
          
          {/* Rotation */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className={cn("text-sm", theme.text.secondary)}>Rotation</span>
              <span className={cn("text-sm", theme.text.muted)}>{rotate}°</span>
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
            <div className="flex items-center justify-between mb-1">
              <span className={cn("text-sm", theme.text.secondary)}>Scale</span>
              <span className={cn("text-sm", theme.text.muted)}>{scale}%</span>
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
      </div>
    </div>
  );
}
