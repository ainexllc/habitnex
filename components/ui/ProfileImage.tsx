'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ProfileImageProps {
  name: string;
  profileImageUrl?: string;
  color: string;
  size?: number;
  className?: string;
  showBorder?: boolean;
  borderColor?: string;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

/**
 * ProfileImage component displays either:
 * 1. A custom uploaded photo (if profileImageUrl is provided)
 * 2. Two-letter initials on a colored background (default)
 * 
 * The initials are generated from the first letter of the first word
 * and the first letter of the last word of the name.
 */
export function ProfileImage({
  name,
  profileImageUrl,
  color,
  size = 64,
  className,
  showBorder = false,
  borderColor = 'rgba(255,255,255,0.2)',
  fontWeight = 'semibold'
}: ProfileImageProps) {
  // State to handle image loading errors
  const [imageError, setImageError] = useState(false);
  
  // Check if we have a valid image URL
  const hasValidImageUrl = profileImageUrl && profileImageUrl.trim().length > 0;
  
  // Debug logging  
  if (profileImageUrl) {
    console.log('🖼️ ProfileImage with URL:', { 
      name, 
      profileImageUrl, 
      urlLength: profileImageUrl.length,
      hasValidUrl: hasValidImageUrl,
      isFirebaseUrl: profileImageUrl.includes('firebasestorage'),
      imageError,
      willShowImage: hasValidImageUrl && !imageError
    });
  } else {
    console.log('📝 ProfileImage fallback to initials:', { name, color, reason: 'No profileImageUrl provided' });
  }
  
  // Reset error state when profileImageUrl changes
  useEffect(() => {
    setImageError(false);
  }, [profileImageUrl]);
  
  // Generate initials from name
  const generateInitials = (fullName: string): string => {
    const words = fullName.trim().split(/\s+/).filter(word => word.length > 0);
    
    if (words.length === 0) return '??';
    if (words.length === 1) {
      // Single word: use first and last character if long enough, otherwise repeat first
      const word = words[0];
      return word.length >= 2 ? `${word[0]}${word[word.length - 1]}` : `${word[0]}${word[0]}`;
    }
    
    // Multiple words: use first letter of first and last word
    return `${words[0][0]}${words[words.length - 1][0]}`;
  };

  const initials = generateInitials(name).toUpperCase();

  // Determine if color is light or dark for text contrast
  const isLightColor = (hexColor: string): boolean => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };

  const isLight = isLightColor(color);
  const textColor = isLight ? '#1f2937' : '#ffffff'; // gray-800 or white
  const fontSize = Math.round(size * 0.4); // 40% of container size

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    backgroundColor: hasValidImageUrl ? 'transparent' : color,
    border: showBorder ? `2px solid ${borderColor}` : 'none',
    fontSize: `${fontSize}px`,
    color: textColor,
  };

  // Show image if valid URL exists and no error occurred
  if (hasValidImageUrl && !imageError) {
    return (
      <div
        className={cn(
          "rounded-full overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-700",
          className
        )}
        style={containerStyle}
      >
        <img
          src={profileImageUrl}
          alt={`${name}'s profile`}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.log('Image failed to load:', profileImageUrl);
            setImageError(true);
          }}
          onLoad={() => {
            console.log('Image loaded successfully:', profileImageUrl);
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center select-none",
        `font-${fontWeight}`,
        className
      )}
      style={containerStyle}
      title={`${name} (${initials})`}
    >
      {initials}
    </div>
  );
}