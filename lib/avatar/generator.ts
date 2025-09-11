// Avatar generation utilities and configuration management

import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
import type { AvatarConfig } from '@/types/family';
import { SKIN_COLORS, HAIR_COLORS, BACKGROUND_COLORS, findColorByValue, colorValueToHex } from './colors';
import { HAIR_STYLES, EYE_TYPES, EYEBROW_TYPES, MOUTH_TYPES, getDefaultFeaturesForRole, type ProbabilityConfig } from './features';

export interface AvatarGenerationOptions {
  seed?: string;
  style?: 'adventurer';
  size?: number;
  backgroundColor?: string;
  config?: AvatarConfig;
}

export interface GeneratedAvatar {
  id: string;
  seed: string;
  svg: string;
  config: AvatarConfig;
  url?: string;
}

// Generate a single avatar with the given options
export function generateAvatar(options: AvatarGenerationOptions = {}): GeneratedAvatar {
  const {
    seed = generateSeed(),
    style = 'adventurer',
    size = 120,
    backgroundColor = 'transparent',
    config
  } = options;

  try {
    const diceBearOptions = config 
      ? avatarConfigToDiceBearOptions(config, seed, size) 
      : getDefaultDiceBearOptions(seed, size, backgroundColor);
    
    const svg = createAvatar(adventurer, diceBearOptions).toString();
    
    return {
      id: generateId(),
      seed,
      svg,
      config: config || getDefaultAvatarConfig(seed),
      url: generateAvatarUrl(config || getDefaultAvatarConfig(seed), seed)
    };
  } catch (error) {
    console.error('Avatar generation failed:', error);
    throw new Error('Failed to generate avatar');
  }
}

// Generate multiple random avatars for selection
export function generateAvatarGallery(count: number = 12, role?: 'parent' | 'child' | 'teen' | 'adult'): GeneratedAvatar[] {
  const avatars: GeneratedAvatar[] = [];
  
  for (let i = 0; i < count; i++) {
    try {
      const seed = generateSeed();
      const config = generateRandomAvatarConfig(role);
      const avatar = generateAvatar({ seed, config });
      avatars.push(avatar);
    } catch (error) {
      console.error(`Failed to generate avatar ${i}:`, error);
      // Continue generating others even if one fails
    }
  }
  
  return avatars;
}

// Generate a random avatar configuration
export function generateRandomAvatarConfig(role?: 'parent' | 'child' | 'teen' | 'adult'): AvatarConfig {
  const baseDefaults = role ? getDefaultFeaturesForRole(role) : getDefaultFeaturesForRole('child');
  
  return {
    skinColor: getRandomOption(SKIN_COLORS).value,
    hairColor: getRandomOption(HAIR_COLORS).value,
    hair: getRandomOption(HAIR_STYLES.filter(h => h.value !== '')).value, // Exclude 'no hair'
    eyeType: getRandomOption(EYE_TYPES).value,
    eyebrowType: getRandomOption(EYEBROW_TYPES).value,
    mouthType: getRandomOption(MOUTH_TYPES).value,
    backgroundColor: [getRandomOption(BACKGROUND_COLORS.filter(bg => bg.value !== 'transparent')).value],
    hairProbability: baseDefaults.probabilities.hairProbability,
    glassesProbability: Math.floor(Math.random() * 100),
    featuresProbability: Math.floor(Math.random() * 50),
    earringsProbability: Math.floor(Math.random() * 80),
  };
}

// Generate default avatar config for a role
export function getDefaultAvatarConfig(seed: string, role?: 'parent' | 'child' | 'teen' | 'adult'): AvatarConfig {
  const defaults = role ? getDefaultFeaturesForRole(role) : getDefaultFeaturesForRole('child');
  
  return {
    skinColor: 'Light',
    hairColor: 'Brown',
    hair: defaults.hair,
    eyeType: defaults.eyeType,
    eyebrowType: defaults.eyebrowType,
    mouthType: defaults.mouthType,
    backgroundColor: ['transparent'],
    ...defaults.probabilities
  };
}

// Convert AvatarConfig to DiceBear options
export function avatarConfigToDiceBearOptions(config: AvatarConfig, seed: string = 'default', size: number = 120): Record<string, any> {
  const options: Record<string, any> = {
    seed,
    size,
  };

  // Debug logging
  console.log('Converting config to DiceBear options:', config);

  // Skin color - ensure we use DiceBear-compatible values
  if (config.skinColor) {
    const skinColor = findColorByValue(SKIN_COLORS, config.skinColor);
    if (skinColor) {
      options.skinColor = [skinColor.hex];
    } else {
      // Fallback to a default if not found
      options.skinColor = ['#EDB98A']; // Light skin as default
    }
  } else {
    // Always provide a default skin color
    options.skinColor = ['#EDB98A'];
  }

  // Hair - always provide a default
  options.hair = config.hair ? [config.hair] : ['short07']; // Default to short modern style

  // Hair color - ensure we use DiceBear-compatible values
  if (config.hairColor) {
    const hairColor = findColorByValue(HAIR_COLORS, config.hairColor);
    if (hairColor) {
      options.hairColor = [hairColor.hex];
    } else {
      // Fallback to a default if not found
      options.hairColor = ['#724133']; // Brown as default
    }
  } else {
    // Always provide a default hair color
    options.hairColor = ['#724133'];
  }

  // Facial features - always provide defaults
  options.eyes = config.eyeType ? [config.eyeType] : ['variant01'];
  options.eyebrows = config.eyebrowType ? [config.eyebrowType] : ['variant01'];
  options.mouth = config.mouthType ? [config.mouthType] : ['variant01'];

  // Background
  if (config.backgroundColor && config.backgroundColor.length > 0) {
    const bgValue = config.backgroundColor[0];
    if (bgValue !== 'transparent') {
      options.backgroundColor = [colorValueToHex(bgValue)];
    }
  }

  // Probabilities
  if (config.hairProbability !== undefined) {
    options.hairProbability = config.hairProbability;
  }
  if (config.glassesProbability !== undefined) {
    options.glassesProbability = config.glassesProbability;
  }
  if (config.featuresProbability !== undefined) {
    options.featuresProbability = config.featuresProbability;
  }
  if (config.earringsProbability !== undefined) {
    options.earringsProbability = config.earringsProbability;
  }

  // Debug logging
  console.log('Final DiceBear options:', options);

  return options;
}

// Get default DiceBear options for seed-based generation
function getDefaultDiceBearOptions(seed: string, size: number, backgroundColor: string): Record<string, any> {
  const options: Record<string, any> = {
    seed,
    size,
  };

  if (backgroundColor && backgroundColor !== 'transparent') {
    options.backgroundColor = [backgroundColor];
  }

  return options;
}

// Generate avatar URL for DiceBear API
export function generateAvatarUrl(config: AvatarConfig, seed: string = 'default'): string {
  const params = new URLSearchParams();
  params.set('seed', seed);
  
  if (config.skinColor) {
    const skinColor = findColorByValue(SKIN_COLORS, config.skinColor);
    if (skinColor) params.set('skinColor', skinColor.hex.replace('#', ''));
  }
  
  if (config.hairColor) {
    const hairColor = findColorByValue(HAIR_COLORS, config.hairColor);
    if (hairColor) params.set('hairColor', hairColor.hex.replace('#', ''));
  }
  
  if (config.hair) {
    params.set('hair', config.hair);
  }
  
  if (config.eyeType) {
    params.set('eyes', config.eyeType);
  }
  
  if (config.eyebrowType) {
    params.set('eyebrows', config.eyebrowType);
  }
  
  if (config.mouthType) {
    params.set('mouth', config.mouthType);
  }
  
  if (config.backgroundColor && config.backgroundColor[0] !== 'transparent') {
    params.set('backgroundColor', config.backgroundColor[0].replace('#', ''));
  }
  
  // Add probabilities if they differ from defaults
  if (config.hairProbability !== undefined && config.hairProbability !== 100) {
    params.set('hairProbability', String(config.hairProbability));
  }
  if (config.glassesProbability !== undefined && config.glassesProbability !== 50) {
    params.set('glassesProbability', String(config.glassesProbability));
  }
  if (config.featuresProbability !== undefined && config.featuresProbability !== 10) {
    params.set('featuresProbability', String(config.featuresProbability));
  }
  if (config.earringsProbability !== undefined && config.earringsProbability !== 30) {
    params.set('earringsProbability', String(config.earringsProbability));
  }
  
  return `https://api.dicebear.com/9.x/adventurer/svg?${params.toString()}`;
}

// Utility functions
function generateSeed(): string {
  return `avatar-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function getRandomOption<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Validate avatar configuration
export function validateAvatarConfig(config: AvatarConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if skin color is valid
  if (config.skinColor && !findColorByValue(SKIN_COLORS, config.skinColor)) {
    errors.push(`Invalid skin color: ${config.skinColor}`);
  }

  // Check if hair color is valid
  if (config.hairColor && !findColorByValue(HAIR_COLORS, config.hairColor)) {
    errors.push(`Invalid hair color: ${config.hairColor}`);
  }

  // Check if hair style is valid
  if (config.hair && !HAIR_STYLES.find(h => h.value === config.hair)) {
    errors.push(`Invalid hair style: ${config.hair}`);
  }

  // Check probabilities are in valid range
  const probabilities = [
    { key: 'hairProbability', value: config.hairProbability },
    { key: 'glassesProbability', value: config.glassesProbability },
    { key: 'featuresProbability', value: config.featuresProbability },
    { key: 'earringsProbability', value: config.earringsProbability },
  ];

  for (const prob of probabilities) {
    if (prob.value !== undefined && (prob.value < 0 || prob.value > 100)) {
      errors.push(`${prob.key} must be between 0 and 100`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}