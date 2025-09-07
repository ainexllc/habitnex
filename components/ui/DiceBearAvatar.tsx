'use client';

import React, { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { funEmoji, avataaars, bottts, personas, adventurer } from '@dicebear/collection';
import { cn } from '@/lib/utils';
import type { AvatarConfig } from '@/types/family';

export type AvatarStyle = 'fun-emoji' | 'avataaars' | 'bottts' | 'personas' | 'adventurer';

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
  'avataaars': avataaars,
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
      return 'avataaars'; // Popular illustrated style
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
        console.warn(`Avatar style "${style}" not found, falling back to personas`);
        return createAvatar(personas as any, { seed: seed || 'default' }).toString();
      }

      // If custom options are provided, use them directly (for custom avatars)
      if (options && Object.keys(options).length > 0) {
        const customOptions: any = {
          ...options,
          size,
        };
        
        // Ensure backgroundColor is included if provided
        if (backgroundColor) {
          customOptions.backgroundColor = Array.isArray(backgroundColor) ? backgroundColor : [backgroundColor];
        } else if (style === 'adventurer' && !customOptions.backgroundColor) {
          customOptions.backgroundColor = ['#f0f0f0', '#e0e0e0', '#d0d0d0'];
        }
        
        console.log('Creating avatar with custom options:', { style, customOptions });
        const result = createAvatar(collection as any, customOptions).toString();
        console.log('Avatar SVG length:', result?.length);
        return result;
      }
      
      // Original seed-based generation
      const seedOptions: any = {
        seed: seed || 'default',
        size,
      };
      
      // Add background for adventurer style to make it visible
      if (style === 'adventurer') {
        seedOptions.backgroundColor = backgroundColor ? [backgroundColor] : ['#f0f0f0', '#e0e0e0', '#d0d0d0'];
      } else if (backgroundColor) {
        seedOptions.backgroundColor = [backgroundColor];
      }
      
      return createAvatar(collection as any, seedOptions).toString();
    } catch (error) {
      console.error('Failed to generate DiceBear avatar:', error);
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
  
  // Map AvatarConfig fields to DiceBear avataaars options
  // Note: DiceBear expects arrays for most options and camelCase values
  
  // Skin color needs lowercase
  if (config.skinColor) {
    options.skinColor = [config.skinColor.toLowerCase()];
  }
  
  // Eyes - convert to camelCase
  if (config.eyeType) {
    const eyeValue = config.eyeType === 'EyeRoll' ? 'eyeRoll' : 
                     config.eyeType === 'WinkWacky' ? 'winkWacky' :
                     toCamelCase(config.eyeType);
    options.eyes = [eyeValue];
  }
  
  // Eyebrows - convert to camelCase
  if (config.eyebrowType) {
    const eyebrowValue = toCamelCase(config.eyebrowType);
    options.eyebrows = [eyebrowValue];
  }
  
  // Mouth - convert to camelCase
  if (config.mouthType) {
    const mouthValue = config.mouthType === 'ScreamOpen' ? 'screamOpen' :
                       toCamelCase(config.mouthType);
    options.mouth = [mouthValue];
  }
  
  // Top/Hair - needs special conversion
  if (config.topType) {
    // Convert values like ShortHairShortFlat to shortFlat
    let topValue = config.topType;
    if (topValue.startsWith('ShortHair')) {
      topValue = toCamelCase(topValue.replace('ShortHair', ''));
    } else if (topValue.startsWith('LongHair')) {
      topValue = toCamelCase(topValue.replace('LongHair', ''));
    } else if (topValue === 'NoHair') {
      // NoHair is not a valid option, skip it
      topValue = null;
    } else if (topValue === 'Hat') {
      topValue = 'hat';
    } else if (topValue === 'Hijab') {
      topValue = 'hijab';
    } else if (topValue === 'Turban') {
      topValue = 'turban';
    } else if (topValue.startsWith('WinterHat')) {
      topValue = toCamelCase(topValue);
    }
    
    if (topValue) {
      options.top = [topValue];
    }
  }
  
  // Hair color - keep as is, it accepts color names
  if (config.hairColor) {
    options.hairColor = [config.hairColor.toLowerCase()];
  }
  
  // Facial hair - convert and filter out 'Blank'
  if (config.facialHairType && config.facialHairType !== 'Blank') {
    const facialHairValue = toCamelCase(config.facialHairType);
    options.facialHair = [facialHairValue];
  }
  
  if (config.facialHairColor) {
    options.facialHairColor = [config.facialHairColor];
  }
  
  // Accessories - convert and filter out 'Blank'
  if (config.accessoriesType && config.accessoriesType !== 'Blank') {
    const accessoriesValue = config.accessoriesType === 'Prescription01' ? 'prescription01' :
                             config.accessoriesType === 'Prescription02' ? 'prescription02' :
                             config.accessoriesType === 'Kurt' ? 'kurt' :
                             config.accessoriesType === 'Round' ? 'round' :
                             config.accessoriesType === 'Sunglasses' ? 'sunglasses' :
                             config.accessoriesType === 'Wayfarers' ? 'wayfarers' :
                             toCamelCase(config.accessoriesType);
    options.accessories = [accessoriesValue];
  }
  
  // Clothing - convert to camelCase
  if (config.clotheType) {
    const clothingValue = config.clotheType === 'BlazerShirt' ? 'blazerAndShirt' :
                         config.clotheType === 'BlazerSweater' ? 'blazerAndSweater' :
                         config.clotheType === 'CollarSweater' ? 'collarAndSweater' :
                         config.clotheType === 'GraphicShirt' ? 'graphicShirt' :
                         config.clotheType === 'Hoodie' ? 'hoodie' :
                         config.clotheType === 'Overall' ? 'overall' :
                         config.clotheType === 'ShirtCrewNeck' ? 'shirtCrewNeck' :
                         config.clotheType === 'ShirtScoopNeck' ? 'shirtScoopNeck' :
                         config.clotheType === 'ShirtVNeck' ? 'shirtVNeck' :
                         toCamelCase(config.clotheType);
    options.clothing = [clothingValue];
  }
  
  // Clothing color - should be hex colors in an array
  if (config.clotheColor) {
    options.clothesColor = [config.clotheColor];
  }
  
  if (config.graphicType) {
    options.clothingGraphic = [toCamelCase(config.graphicType)];
  }
  
  if (config.backgroundColor) {
    options.backgroundColor = config.backgroundColor;
  }
  
  console.log('Converting config to options:', { config, options });
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
          console.error(`Style "${style}" not found in styleCollections`);
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
        console.error(`Failed to generate avatar for style "${style}":`, error);
      }
    }
    return variants;
  }, [baseSeed, style]);
}