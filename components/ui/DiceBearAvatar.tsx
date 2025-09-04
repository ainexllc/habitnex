'use client';

import React, { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { funEmoji, avataaars, bottts, personas, adventurer } from '@dicebear/collection';
import { cn } from '@/lib/utils';

export type AvatarStyle = 'fun-emoji' | 'avataaars' | 'bottts' | 'personas' | 'adventurer';

interface DiceBearAvatarProps {
  seed: string;
  style?: AvatarStyle;
  size?: number;
  className?: string;
  backgroundColor?: string;
  fallbackEmoji?: string;
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
  fallbackEmoji = '👤'
}: DiceBearAvatarProps) {
  const avatarSvg = useMemo(() => {
    try {
      const collection = styleCollections[style];
      if (!collection) {
        console.warn(`Avatar style "${style}" not found, falling back to personas`);
        return createAvatar(personas as any, { seed }).toString();
      }

      // Special handling for adventurer style which needs a background
      const options: any = {
        seed,
        size,
      };
      
      // Add background for adventurer style to make it visible
      if (style === 'adventurer') {
        options.backgroundColor = backgroundColor ? [backgroundColor] : ['#f0f0f0', '#e0e0e0', '#d0d0d0'];
      } else if (backgroundColor) {
        options.backgroundColor = [backgroundColor];
      }
      
      return createAvatar(collection as any, options).toString();
    } catch (error) {
      console.error('Failed to generate DiceBear avatar:', error);
      return null;
    }
  }, [seed, style, size, backgroundColor]);

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