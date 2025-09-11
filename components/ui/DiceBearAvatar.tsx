'use client';

import React, { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { funEmoji, bottts, personas, adventurer } from '@dicebear/collection';
import { cn } from '@/lib/utils';
import type { AvatarConfig } from '@/types/family';

export type AvatarStyle = 'fun-emoji' | 'bottts' | 'personas' | 'adventurer';

interface DiceBearAvatarProps {
  seed?: string;
  style?: AvatarStyle;
  size?: number;
  className?: string;
  backgroundColor?: string;
  fallbackEmoji?: string;
  options?: Record<string, any>; // Custom avatar options for deterministic rendering
}

// Style collections mapping
const styleCollections = {
  'fun-emoji': funEmoji,
  'bottts': bottts,
  'personas': personas,
  'adventurer': adventurer,
};


// Default style based on role (will be used externally)
export const getDefaultAvatarStyle = (role: string): AvatarStyle => {
  switch (role) {
    case 'child':
      return 'bottts'; // Fun robots for kids
    case 'teen':
      return 'adventurer'; // Popular illustrated style
    case 'adult':
    case 'parent':
      return 'personas'; // Professional style
    default:
      return 'personas';
  }
};

export function DiceBearAvatar({
  seed,
  style = 'personas',
  size = 64,
  className,
  backgroundColor,
  fallbackEmoji = '👤',
  options
}: DiceBearAvatarProps) {
  const avatarSvg = useMemo(() => {
    try {
      const collection = styleCollections[style];
      if (!collection) {
        return createAvatar(personas as any, { seed: seed || 'default' }).toString();
      }

      // If custom options are provided, use them directly (for custom avatars)
      if (options && Object.keys(options).length > 0) {
        // Filter out avatarUrl as it's not a DiceBear option
        const { avatarUrl, ...filteredOptions } = options;

        const customOptions: any = {
          seed: seed || 'default', // Always include seed for deterministic generation
          ...filteredOptions,
          size,
        };
        
        // Ensure adventurer style uses proper options format
        if (style === 'adventurer') {

          // Ensure skinColor and mouth are properly formatted as arrays
          if (customOptions.skinColor && !Array.isArray(customOptions.skinColor)) {
            customOptions.skinColor = [customOptions.skinColor];
          }
          if (customOptions.mouth && !Array.isArray(customOptions.mouth)) {
            customOptions.mouth = [customOptions.mouth];
          }
          if (customOptions.hairColor && !Array.isArray(customOptions.hairColor)) {
            customOptions.hairColor = [customOptions.hairColor];
          }

          // For adventurer style, keep hex with #. Map named colors to hex.
          const normalizeColor = (c: string) => {
            const map: Record<string, string> = {
              Auburn: '#A55728',
              Black: '#2C1B18',
              Blonde: '#B58143',
              BlondeGolden: '#D6B370',
              Brown: '#724133',
              BrownDark: '#4A312C',
              PastelPink: '#F59797',
              Blue: '#000FFF',
              Platinum: '#ECDCBF',
              Red: '#C93305',
              SilverGray: '#E8E1E1',
              Tanned: '#FD9841',
              Yellow: '#F8D25C',
              Pale: '#FFDBB4',
              Light: '#EDB98A',
              DarkBrown: '#AE5D29'
            };
            return map[c] || c;
          };
          if (customOptions.skinColor && Array.isArray(customOptions.skinColor)) {
            customOptions.skinColor = customOptions.skinColor.map((c: string) => normalizeColor(c));
          }
          if (customOptions.hairColor && Array.isArray(customOptions.hairColor)) {
            customOptions.hairColor = customOptions.hairColor.map((c: string) => normalizeColor(c));
          }

          // Always ensure backgroundColor is set for adventurer style
          if (!customOptions.backgroundColor) {
            customOptions.backgroundColor = backgroundColor ? [backgroundColor] : ['#ffffff'];
          }

          // Keep # for backgroundColor as well
          if (customOptions.backgroundColor && Array.isArray(customOptions.backgroundColor)) {
            customOptions.backgroundColor = customOptions.backgroundColor.map((c: string) => normalizeColor(c));
          }


        }

        // Ensure backgroundColor is included for non-adventurer styles if provided
        if (backgroundColor && style !== 'adventurer') {
          customOptions.backgroundColor = Array.isArray(backgroundColor) ? backgroundColor : [backgroundColor];
        }

        const result = createAvatar(collection as any, customOptions).toString();
        return result;
      }
      
      // Original seed-based generation
      const seedOptions: any = {
        seed: seed || 'default',
        size,
      };
      
      // Add background for styles that need it
      if (style === 'adventurer') {
        seedOptions.backgroundColor = backgroundColor ? [backgroundColor] : ['#f0f0f0', '#e0e0e0', '#d0d0d0'];
      } else if (backgroundColor) {
        // Other styles that support backgroundColor
        seedOptions.backgroundColor = [backgroundColor];
      }
      
      return createAvatar(collection as any, seedOptions).toString();
    } catch (error) {
      return null;
    }
  }, [seed, style, size, backgroundColor, options]);

  // Fallback to emoji if avatar generation fails
  if (!avatarSvg) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center text-white font-bold rounded-full",
          className
        )}
        style={{ 
          width: size, 
          height: size,
          backgroundColor: backgroundColor || '#6B7280',
          fontSize: size * 0.4
        }}
      >
        {fallbackEmoji}
      </div>
    );
  }

  return (
    <div
      className={cn("flex items-center justify-center rounded-full overflow-hidden relative", className)}
      style={{ width: size, height: size, isolation: 'isolate' }}
      dangerouslySetInnerHTML={{ __html: avatarSvg }}
    />
  );
}

// Helper function to convert AvatarConfig to DiceBear options
export function avatarConfigToDiceBearOptions(config: AvatarConfig): Record<string, any> {
  if (!config) return {};
  
  const options: Record<string, any> = {};
  
  // Helper to convert PascalCase to camelCase
  const toCamelCase = (str: string): string => {
    return str.charAt(0).toLowerCase() + str.slice(1);
  };
  
  // Map AvatarConfig fields to DiceBear options
  // Note: DiceBear expects arrays for most options and camelCase values
  
  // Skin color - convert to proper format
  if (config.skinColor) {
    // Map our skin color names to hex values that adventurer expects
    const skinColorMap: Record<string, string> = {
      'Tanned': '#FD9841',
      'Yellow': '#F8D25C',
      'Pale': '#FFDBB4',
      'Light': '#EDB98A',
      'Brown': '#D08B5B',
      'DarkBrown': '#AE5D29',
      'Black': '#614335'
    };
    const skinHex = skinColorMap[config.skinColor] || config.skinColor;
    options.skinColor = [skinHex];
  }
  
  // Eyes - adventurer uses numeric variants: variant01..variantXX
  if (config.eyeType) {
    options.eyes = [config.eyeType];
  } else {
    options.eyes = ['variant01'];
  }
  
  // Eyebrows - adventurer uses variantXX
  if (config.eyebrowType) {
    options.eyebrows = [config.eyebrowType];
  } else {
    options.eyebrows = ['variant01'];
  }
  
  // Mouth - adventurer uses variantXX
  if (config.mouthType) {
    options.mouth = [config.mouthType];
  } else {
    options.mouth = ['variant01'];
  }
  
  // Hair for adventurer style
  if (config.hair) {
    options.hair = [config.hair];
  }
  
  // Top/Hair for avataaars style (legacy) - Don't set for adventurer
  // The adventurer style doesn't recognize topType, only hair
  if (config.topType && config.topType !== 'NoHair' && !config.hair) {
    // Only set topType if we're not using adventurer style (no hair property)
    options.topType = [config.topType];
  }
  
  // Hair color - convert to hex values
  if (config.hairColor) {
    const hairColorMap: Record<string, string> = {
      'Auburn': '#A55728',
      'Black': '#2C1B18',
      'Blonde': '#B58143',
      'BlondeGolden': '#D6B370',
      'Brown': '#724133',
      'BrownDark': '#4A312C',
      'PastelPink': '#F59797',
      'Blue': '#000FFF',
      'Platinum': '#ECDCBF',
      'Red': '#C93305',
      'SilverGray': '#E8E1E1'
    };
    const hairHex = hairColorMap[config.hairColor] || config.hairColor;
    options.hairColor = [hairHex];
  }
  
  // Facial hair removed from builder; ignore any stray values safely
  
  // Accessories removed from builder; ignore
  
  // Clothing removed from builder; ignore
  
  if (config.graphicType) {
    options.clothingGraphic = [toCamelCase(config.graphicType)];
  }
  
  if (config.backgroundColor) {
    options.backgroundColor = config.backgroundColor;
  }
  
  // Remove any 'top' property that might have been accidentally added
  // The adventurer style doesn't recognize 'top', only 'hair'
  if ('top' in options) {
    delete options.top;
  }
  
  return options;
}

// Hook for generating avatar previews during selection
export function useAvatarPreview(baseSeed: string, style: AvatarStyle) {
  return useMemo(() => {
    const variants = [];
    for (let i = 0; i < 12; i++) {
      try {
        // Add randomness to seed generation for more variety
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const seed = `${baseSeed}-${i}-${randomSuffix}`;
        
        const collection = styleCollections[style];
        if (!collection) {
          continue;
        }
        
        // Add background for adventurer style
        const options: any = { seed, size: 64 };
        if (style === 'adventurer') {
          options.backgroundColor = ['#f0f0f0', '#e0e0e0', '#d0d0d0'];
        }
        
        const svg = createAvatar(collection as any, options).toString();
        
        
        variants.push({
          id: i,
          seed,
          svg
        });
      } catch (error) {
        // Silent error handling
      }
    }
    return variants;
  }, [baseSeed, style]);
}