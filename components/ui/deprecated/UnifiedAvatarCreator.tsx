'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Shuffle, Palette, ArrowLeft, ArrowRight, Check, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { theme } from '@/lib/theme';
import { DiceBearAvatar } from './DiceBearAvatar';
import { generateAvatarGallery, generateAvatar, generateRandomAvatarConfig, type GeneratedAvatar } from '@/lib/avatar/generator';
import { SKIN_COLORS, HAIR_COLORS, BACKGROUND_COLORS, type ColorOption } from '@/lib/avatar/colors';
import { HAIR_STYLES, EYE_TYPES, EYEBROW_TYPES, MOUTH_TYPES, FEATURE_PROBABILITIES, getHairStylesByCategory, type FeatureOption, type ProbabilityConfig } from '@/lib/avatar/features';
import type { AvatarConfig } from '@/types/family';

interface UnifiedAvatarCreatorProps {
  initialConfig?: AvatarConfig;
  role?: 'parent' | 'child' | 'teen' | 'adult';
  onChange?: (config: AvatarConfig) => void;
  className?: string;
}

type FlowStep = 'choice' | 'gallery' | 'customize';

export function UnifiedAvatarCreator({
  initialConfig,
  role = 'child',
  onChange,
  className
}: UnifiedAvatarCreatorProps) {
  const [step, setStep] = useState<FlowStep>('choice');
  const [selectedAvatar, setSelectedAvatar] = useState<GeneratedAvatar | null>(null);
  const [avatarGallery, setAvatarGallery] = useState<GeneratedAvatar[]>([]);
  const [customConfig, setCustomConfig] = useState<AvatarConfig>(
    initialConfig || generateRandomAvatarConfig(role)
  );
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize with existing config if provided
  useEffect(() => {
    if (initialConfig) {
      setCustomConfig(initialConfig);
      setStep('customize');
    }
  }, [initialConfig]);

  // Notify parent of changes
  useEffect(() => {
    if (selectedAvatar) {
      onChange?.(selectedAvatar.config);
    } else if (step === 'customize') {
      onChange?.(customConfig);
    }
  }, [selectedAvatar, customConfig, step, onChange]);

  // Generate gallery when moving to gallery step
  const handleGenerateGallery = async () => {
    setIsGenerating(true);
    try {
      const gallery = generateAvatarGallery(12, role);
      setAvatarGallery(gallery);
      setStep('gallery');
    } catch (error) {
      console.error('Failed to generate avatar gallery:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Regenerate a specific avatar in the gallery
  const regenerateAvatarAt = (index: number) => {
    try {
      const newAvatar = generateAvatar({ config: generateRandomAvatarConfig(role) });
      const newGallery = [...avatarGallery];
      newGallery[index] = newAvatar;
      setAvatarGallery(newGallery);
    } catch (error) {
      console.error('Failed to regenerate avatar:', error);
    }
  };

  // Update custom configuration
  const updateCustomConfig = (updates: Partial<AvatarConfig>) => {
    const newConfig = { ...customConfig, ...updates };
    setCustomConfig(newConfig);
  };

  const currentPreview = useMemo(() => {
    if (selectedAvatar) {
      return selectedAvatar;
    }
    
    if (step === 'customize') {
      try {
        return generateAvatar({ config: customConfig });
      } catch (error) {
        console.error('Failed to generate preview:', error);
        return null;
      }
    }
    
    return null;
  }, [selectedAvatar, customConfig, step]);

  if (step === 'choice') {
    return (
      <div className={cn("space-y-6 text-center", className)}>
        <div>
          <h3 className={cn("text-lg font-semibold mb-2", theme.text.primary)}>
            How would you like to create your avatar?
          </h3>
          <p className={cn("text-sm", theme.text.secondary)}>
            Choose a quick random avatar or customize every detail
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Generate Path */}
          <button
            onClick={handleGenerateGallery}
            disabled={isGenerating}
            className={cn(
              "p-6 rounded-lg border-2 transition-all hover:scale-105",
              "border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            )}
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <Shuffle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-700 dark:text-blue-300">
                  {isGenerating ? 'Generating...' : 'Generate Avatar'}
                </h4>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  Quick selection from 12 random options
                </p>
              </div>
            </div>
          </button>

          {/* Customize Path */}
          <button
            onClick={() => setStep('customize')}
            className={cn(
              "p-6 rounded-lg border-2 transition-all hover:scale-105",
              "border-purple-300 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-600"
            )}
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-purple-700 dark:text-purple-300">
                  Customize Avatar
                </h4>
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                  Choose every detail yourself
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (step === 'gallery') {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep('choice')}
            className={cn(
              "flex items-center gap-2 text-sm",
              theme.text.secondary,
              "hover:text-blue-600 transition-colors"
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to options
          </button>
          
          <button
            onClick={handleGenerateGallery}
            className={cn(
              "flex items-center gap-2 text-sm px-3 py-1 rounded-lg",
              theme.surface.secondary,
              theme.border.default,
              "border hover:bg-opacity-80 transition-colors"
            )}
          >
            <Shuffle className="w-4 h-4" />
            New Gallery
          </button>
        </div>

        <div>
          <h3 className={cn("text-lg font-semibold mb-2", theme.text.primary)}>
            Choose Your Avatar
          </h3>
          <p className={cn("text-sm", theme.text.secondary)}>
            Click an avatar to select it, or click the shuffle icon to regenerate a specific one
          </p>
        </div>

        {/* Avatar Gallery */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {avatarGallery.map((avatar, index) => (
            <div key={avatar.id} className="relative group">
              <button
                onClick={() => setSelectedAvatar(avatar)}
                className={cn(
                  "w-full aspect-square rounded-lg border-2 transition-all p-2",
                  selectedAvatar?.id === avatar.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 hover:scale-105"
                )}
              >
                <div 
                  className="w-full h-full rounded-lg overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: avatar.svg }}
                />
                {selectedAvatar?.id === avatar.id && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
              
              <button
                onClick={() => regenerateAvatarAt(index)}
                className={cn(
                  "absolute bottom-1 right-1 w-6 h-6 bg-gray-800 bg-opacity-75 rounded-full",
                  "flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                )}
              >
                <Shuffle className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        {selectedAvatar && (
          <div className="text-center pt-4">
            <button
              onClick={() => {/* Avatar is already selected, parent will receive onChange */}}
              className={cn(
                "px-6 py-2 rounded-lg font-medium transition-colors",
                theme.components.button.primary,
                "text-white"
              )}
            >
              Use This Avatar
            </button>
          </div>
        )}
      </div>
    );
  }

  // Customize step
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep('choice')}
          className={cn(
            "flex items-center gap-2 text-sm",
            theme.text.secondary,
            "hover:text-blue-600 transition-colors"
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to options
        </button>
        
        <button
          onClick={() => updateCustomConfig(generateRandomAvatarConfig(role))}
          className={cn(
            "flex items-center gap-2 text-sm px-3 py-1 rounded-lg",
            theme.surface.secondary,
            theme.border.default,
            "border hover:bg-opacity-80 transition-colors"
          )}
        >
          <RotateCcw className="w-4 h-4" />
          Randomize
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview */}
        <div className="lg:col-span-1">
          <div className={cn(
            "rounded-lg p-4 text-center",
            theme.surface.secondary,
            theme.border.default,
            "border"
          )}>
            <h4 className={cn("font-semibold mb-3", theme.text.primary)}>Preview</h4>
            <div className="mx-auto mb-3" style={{ width: '120px', height: '120px' }}>
              {currentPreview && (
                <div 
                  className="w-full h-full rounded-lg border-2 border-gray-300 dark:border-gray-600"
                  dangerouslySetInnerHTML={{ __html: currentPreview.svg }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Customization Controls */}
        <div className="lg:col-span-2 space-y-4">
          {/* Face Section */}
          <FeatureSection
            title="Face"
            icon="👤"
            config={customConfig}
            onUpdate={updateCustomConfig}
          />

          {/* Hair Section */}
          <HairSection
            config={customConfig}
            onUpdate={updateCustomConfig}
          />

          {/* Colors Section */}
          <ColorSection
            config={customConfig}
            onUpdate={updateCustomConfig}
          />

          {/* Features Section */}
          <ProbabilitySection
            config={customConfig}
            onUpdate={updateCustomConfig}
          />
        </div>
      </div>
    </div>
  );
}

// Feature Section Component
function FeatureSection({ 
  title, 
  icon, 
  config, 
  onUpdate 
}: { 
  title: string; 
  icon: string; 
  config: AvatarConfig; 
  onUpdate: (updates: Partial<AvatarConfig>) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={cn("rounded-lg border", theme.border.default)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full px-4 py-3 flex items-center justify-between",
          theme.surface.secondary,
          "hover:bg-opacity-80 transition-colors"
        )}
      >
        <span className="font-medium">{icon} {title}</span>
        <ArrowRight className={cn(
          "w-4 h-4 transition-transform",
          isExpanded ? "rotate-90" : ""
        )} />
      </button>
      
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Eyes */}
          <FeatureSelector
            label="Eyes"
            options={EYE_TYPES}
            value={config.eyeType || 'variant01'}
            onChange={(value) => onUpdate({ eyeType: value })}
          />
          
          {/* Eyebrows */}
          <FeatureSelector
            label="Eyebrows"
            options={EYEBROW_TYPES}
            value={config.eyebrowType || 'variant01'}
            onChange={(value) => onUpdate({ eyebrowType: value })}
          />
          
          {/* Mouth */}
          <FeatureSelector
            label="Expression"
            options={MOUTH_TYPES}
            value={config.mouthType || 'variant01'}
            onChange={(value) => onUpdate({ mouthType: value })}
          />
        </div>
      )}
    </div>
  );
}

// Hair Section Component
function HairSection({ 
  config, 
  onUpdate 
}: { 
  config: AvatarConfig; 
  onUpdate: (updates: Partial<AvatarConfig>) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [hairCategory, setHairCategory] = useState<'short' | 'long' | 'none'>('short');

  const hairStyles = useMemo(() => {
    return getHairStylesByCategory(hairCategory);
  }, [hairCategory]);

  return (
    <div className={cn("rounded-lg border", theme.border.default)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full px-4 py-3 flex items-center justify-between",
          theme.surface.secondary,
          "hover:bg-opacity-80 transition-colors"
        )}
      >
        <span className="font-medium">💇 Hair</span>
        <ArrowRight className={cn(
          "w-4 h-4 transition-transform",
          isExpanded ? "rotate-90" : ""
        )} />
      </button>
      
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Hair Category */}
          <div>
            <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
              Hair Length
            </label>
            <div className="flex gap-2">
              {['none', 'short', 'long'].map((category) => (
                <button
                  key={category}
                  onClick={() => setHairCategory(category as any)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-sm transition-colors",
                    hairCategory === category
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      : theme.surface.secondary
                  )}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Hair Style Grid */}
          {hairCategory !== 'none' && (
            <FeatureGrid
              label="Hair Style"
              options={hairStyles}
              value={config.hair || ''}
              onChange={(value) => onUpdate({ hair: value })}
            />
          )}
        </div>
      )}
    </div>
  );
}

// Color Section Component
function ColorSection({ 
  config, 
  onUpdate 
}: { 
  config: AvatarConfig; 
  onUpdate: (updates: Partial<AvatarConfig>) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={cn("rounded-lg border", theme.border.default)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full px-4 py-3 flex items-center justify-between",
          theme.surface.secondary,
          "hover:bg-opacity-80 transition-colors"
        )}
      >
        <span className="font-medium">🎨 Colors</span>
        <ArrowRight className={cn(
          "w-4 h-4 transition-transform",
          isExpanded ? "rotate-90" : ""
        )} />
      </button>
      
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Skin Color */}
          <ColorPicker
            label="Skin Color"
            colors={SKIN_COLORS}
            value={config.skinColor || 'Light'}
            onChange={(value) => onUpdate({ skinColor: value })}
          />
          
          {/* Hair Color */}
          {config.hair && (
            <ColorPicker
              label="Hair Color"
              colors={HAIR_COLORS}
              value={config.hairColor || 'Brown'}
              onChange={(value) => onUpdate({ hairColor: value })}
            />
          )}
          
          {/* Background Color */}
          <ColorPicker
            label="Background"
            colors={BACKGROUND_COLORS}
            value={config.backgroundColor?.[0] || 'transparent'}
            onChange={(value) => onUpdate({ backgroundColor: [value] })}
          />
        </div>
      )}
    </div>
  );
}

// Probability Section Component
function ProbabilitySection({ 
  config, 
  onUpdate 
}: { 
  config: AvatarConfig; 
  onUpdate: (updates: Partial<AvatarConfig>) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn("rounded-lg border", theme.border.default)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full px-4 py-3 flex items-center justify-between",
          theme.surface.secondary,
          "hover:bg-opacity-80 transition-colors"
        )}
      >
        <span className="font-medium">✨ Features</span>
        <ArrowRight className={cn(
          "w-4 h-4 transition-transform",
          isExpanded ? "rotate-90" : ""
        )} />
      </button>
      
      {isExpanded && (
        <div className="p-4 space-y-4">
          {FEATURE_PROBABILITIES.map((feature) => (
            <div key={feature.key}>
              <div className="flex items-center justify-between mb-2">
                <span className={cn("text-sm font-medium", theme.text.primary)}>
                  {feature.emoji} {feature.label}
                </span>
                <span className={cn("text-sm", theme.text.muted)}>
                  {config[feature.key] ?? feature.defaultValue}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={config[feature.key] ?? feature.defaultValue}
                onChange={(e) => onUpdate({ [feature.key]: Number(e.target.value) })}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Utility Components
function FeatureSelector({ 
  label, 
  options, 
  value, 
  onChange 
}: { 
  label: string; 
  options: FeatureOption[]; 
  value: string; 
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full px-3 py-2 rounded-lg border",
          theme.surface.primary,
          theme.border.default,
          theme.text.primary
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.emoji ? `${option.emoji} ` : ''}{option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FeatureGrid({ 
  label, 
  options, 
  value, 
  onChange 
}: { 
  label: string; 
  options: FeatureOption[]; 
  value: string; 
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
        {label}
      </label>
      <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "p-2 rounded-lg border text-xs transition-all",
              value === option.value
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
            )}
          >
            <div className="truncate">
              {option.emoji && <span className="mr-1">{option.emoji}</span>}
              {option.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ColorPicker({ 
  label, 
  colors, 
  value, 
  onChange 
}: { 
  label: string; 
  colors: ColorOption[]; 
  value: string; 
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color.value}
            onClick={() => onChange(color.value)}
            className={cn(
              "w-8 h-8 rounded-full border-2 transition-all",
              value === color.value
                ? "border-blue-500 scale-110 ring-2 ring-blue-300"
                : "border-gray-300 hover:scale-105"
            )}
            style={{ 
              backgroundColor: color.hex === 'transparent' ? '#ffffff' : color.hex,
              backgroundImage: color.hex === 'transparent' 
                ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%)'
                : undefined
            }}
            title={color.label}
          >
            {color.emoji && (
              <span className="text-xs">{color.emoji}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}