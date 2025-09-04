'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { unicodeToFilename, filenameToUnicode } from '@/lib/openmoji/emojiMap';
import { cn } from '@/lib/utils';

export interface OpenMojiProps {
  /** Emoji name, Unicode character, or direct filename */
  emoji: string;
  /** Size in pixels */
  size?: 16 | 20 | 24 | 32 | 48 | 64;
  /** Additional CSS classes */
  className?: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Show fallback Unicode emoji when OpenMoji fails to load */
  showFallback?: boolean;
}

export function OpenMoji({ 
  emoji, 
  size = 24, 
  className, 
  alt,
  showFallback = true 
}: OpenMojiProps) {
  const [imageError, setImageError] = useState(false);

  // Determine the filename to use
  const getFilename = (emoji: string): string | null => {
    // If it's already a filename (ends with .svg)
    if (emoji.endsWith('.svg')) {
      return emoji;
    }
    
    // Try to convert Unicode to filename
    const filename = unicodeToFilename(emoji);
    if (filename) {
      return filename;
    }
    
    // If it doesn't match our mapping, return null
    return null;
  };

  const filename = getFilename(emoji);
  
  // Get fallback Unicode for display when image fails
  const fallbackUnicode = filename ? filenameToUnicode(filename) : emoji;
  
  // If no filename found and showFallback is true, show Unicode emoji
  if (!filename && showFallback) {
    return (
      <span 
        className={cn("inline-block select-none", className)}
        style={{ 
          fontSize: `${size}px`,
          lineHeight: 1,
          fontFamily: '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif'
        }}
        role="img"
        aria-label={alt || `Emoji: ${emoji}`}
      >
        {emoji}
      </span>
    );
  }
  
  // If no filename found and showFallback is false, return null
  if (!filename) {
    return null;
  }
  
  // Show fallback Unicode emoji if image failed to load
  if (imageError && showFallback && fallbackUnicode) {
    return (
      <span 
        className={cn("inline-block select-none", className)}
        style={{ 
          fontSize: `${size}px`,
          lineHeight: 1,
          fontFamily: '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif'
        }}
        role="img"
        aria-label={alt || `Emoji: ${fallbackUnicode}`}
      >
        {fallbackUnicode}
      </span>
    );
  }
  
  return (
    <Image
      src={`/openmoji/${filename}`}
      alt={alt || `OpenMoji: ${emoji}`}
      width={size}
      height={size}
      className={cn("inline-block select-none", className)}
      onError={() => setImageError(true)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain'
      }}
      unoptimized // OpenMoji SVGs don't need Next.js optimization
    />
  );
}

// Preset size components for convenience
export function OpenMojiSmall(props: Omit<OpenMojiProps, 'size'>) {
  return <OpenMoji {...props} size={16} />;
}

export function OpenMojiMedium(props: Omit<OpenMojiProps, 'size'>) {
  return <OpenMoji {...props} size={24} />;
}

export function OpenMojiLarge(props: Omit<OpenMojiProps, 'size'>) {
  return <OpenMoji {...props} size={32} />;
}

export function OpenMojiXL(props: Omit<OpenMojiProps, 'size'>) {
  return <OpenMoji {...props} size={48} />;
}

export function OpenMojiXXL(props: Omit<OpenMojiProps, 'size'>) {
  return <OpenMoji {...props} size={64} />;
}