import { cn } from '@/lib/utils';

/**
 * Family-specific theme utilities for consistent light/dark mode integration
 * Provides touch-friendly, accessibility-compliant theming for family features
 */

// Family background patterns
export const familyBackgrounds = {
  // Main page backgrounds with gradients
  page: {
    normal: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800",
    touch: "min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-purple-900",
    analytics: "min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-gray-900 dark:to-blue-900",
    celebration: "min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-green-900"
  },
  
  // Card and surface backgrounds
  surface: {
    primary: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
    secondary: "bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600",
    elevated: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-gray-900/20",
    glass: "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50",
    modal: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl"
  },
  
  // Header and navigation backgrounds
  header: {
    normal: "bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700",
    transparent: "bg-transparent",
    solid: "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
  }
};

// Family text color schemes
export const familyText = {
  // Primary text hierarchy
  primary: "text-gray-900 dark:text-white",
  secondary: "text-gray-600 dark:text-gray-300", 
  muted: "text-gray-500 dark:text-gray-400",
  placeholder: "text-gray-400 dark:text-gray-500",
  
  // Branded text colors
  brand: "text-blue-600 dark:text-blue-400",
  accent: "text-indigo-600 dark:text-indigo-400",
  
  // Status colors
  success: "text-green-600 dark:text-green-400",
  warning: "text-amber-600 dark:text-amber-400", 
  error: "text-red-600 dark:text-red-400",
  
  // Interactive states
  link: "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300",
  linkMuted: "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
};

// Family button variants with touch support
export const familyButtons = {
  // Primary actions
  primary: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white border-transparent",
  primaryTouch: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 dark:active:bg-blue-800 text-white border-transparent min-h-[48px] text-lg",
  
  // Secondary actions
  secondary: "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600",
  secondaryTouch: "bg-gray-100 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:active:bg-gray-500 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 min-h-[48px] text-lg",
  
  // Outline variants
  outline: "bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600",
  outlineTouch: "bg-transparent hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-gray-800 dark:active:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 min-h-[48px] text-lg",
  
  // Danger actions
  danger: "bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white border-transparent",
  dangerOutline: "bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border-red-300 dark:border-red-600",
  
  // Success actions
  success: "bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white border-transparent",
  successOutline: "bg-transparent hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 border-green-300 dark:border-green-600"
};

// Family input field styling
export const familyInputs = {
  base: "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400",
  baseTouch: "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 min-h-[48px] text-lg",
  error: "bg-white dark:bg-gray-800 border-red-300 dark:border-red-600 text-gray-900 dark:text-white focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400",
  success: "bg-white dark:bg-gray-800 border-green-300 dark:border-green-600 text-gray-900 dark:text-white focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500 dark:focus:border-green-400"
};

// Family-specific icon colors and states
export const familyIcons = {
  primary: "text-gray-600 dark:text-gray-400",
  secondary: "text-gray-500 dark:text-gray-500", 
  brand: "text-blue-600 dark:text-blue-400",
  success: "text-green-600 dark:text-green-400",
  warning: "text-amber-600 dark:text-amber-400",
  error: "text-red-600 dark:text-red-400",
  muted: "text-gray-400 dark:text-gray-600",
  interactive: "text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200"
};

// Family progress and status indicators
export const familyProgress = {
  background: "bg-gray-200 dark:bg-gray-700",
  fill: {
    primary: "bg-blue-600 dark:bg-blue-500",
    success: "bg-green-600 dark:bg-green-500", 
    warning: "bg-amber-600 dark:bg-amber-500",
    error: "bg-red-600 dark:bg-red-500"
  },
  text: {
    primary: "text-blue-600 dark:text-blue-400",
    success: "text-green-600 dark:text-green-400",
    warning: "text-amber-600 dark:text-amber-400", 
    error: "text-red-600 dark:text-red-400"
  }
};

// Family member avatar and color coordination
export const familyAvatars = {
  container: "ring-2 ring-white dark:ring-gray-800 shadow-lg",
  online: "ring-green-500 dark:ring-green-400",
  away: "ring-amber-500 dark:ring-amber-400",
  offline: "ring-gray-300 dark:ring-gray-600"
};

// Family notification and alert styling
export const familyAlerts = {
  success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
  warning: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200",
  error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
  info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
};

/**
 * Utility functions for family theme management
 */

// Get theme-appropriate background based on context
export function getFamilyBackground(
  type: keyof typeof familyBackgrounds.page | 'surface' | 'header' = 'normal',
  variant: string = 'normal',
  touchMode: boolean = false
): string {
  if (type === 'surface') {
    return familyBackgrounds.surface[variant as keyof typeof familyBackgrounds.surface] || familyBackgrounds.surface.primary;
  }
  
  if (type === 'header') {
    return familyBackgrounds.header[variant as keyof typeof familyBackgrounds.header] || familyBackgrounds.header.normal;
  }
  
  // For page backgrounds, consider touch mode
  if (touchMode && type === 'normal') {
    return familyBackgrounds.page.touch;
  }
  
  return familyBackgrounds.page[type] || familyBackgrounds.page.normal;
}

// Get button classes based on variant and touch mode
export function getFamilyButton(variant: keyof typeof familyButtons, touchMode: boolean = false): string {
  const baseVariant = variant.replace('Touch', '') as keyof typeof familyButtons;
  const touchVariant = `${baseVariant}Touch` as keyof typeof familyButtons;
  
  return touchMode && familyButtons[touchVariant] 
    ? familyButtons[touchVariant]
    : familyButtons[variant];
}

// Get input classes based on state and touch mode
export function getFamilyInput(state: 'base' | 'error' | 'success' = 'base', touchMode: boolean = false): string {
  const baseState = state;
  const touchState = `${state}Touch` as keyof typeof familyInputs;
  
  return touchMode && familyInputs[touchState]
    ? familyInputs[touchState] 
    : familyInputs[baseState];
}

// Combine theme classes with custom classes
export function getFamilyTheme(
  baseClasses: string,
  themeType: 'background' | 'text' | 'button' | 'input' | 'surface' = 'background',
  variant: string = 'primary'
): string {
  let themeClasses = '';
  
  switch (themeType) {
    case 'text':
      themeClasses = familyText[variant as keyof typeof familyText] || familyText.primary;
      break;
    case 'surface':
      themeClasses = familyBackgrounds.surface[variant as keyof typeof familyBackgrounds.surface] || familyBackgrounds.surface.primary;
      break;
    case 'button':
      themeClasses = familyButtons[variant as keyof typeof familyButtons] || familyButtons.primary;
      break;
    case 'input':
      themeClasses = familyInputs[variant as keyof typeof familyInputs] || familyInputs.base;
      break;
    default:
      themeClasses = familyBackgrounds.page[variant as keyof typeof familyBackgrounds.page] || familyBackgrounds.page.normal;
      break;
  }
  
  return cn(baseClasses, themeClasses);
}

// Touch-optimized spacing and sizing
export const familySpacing = {
  touch: {
    padding: "p-6 md:p-8",
    margin: "m-4 md:m-6",
    gap: "gap-4 md:gap-6",
    buttonHeight: "min-h-[48px] md:min-h-[52px]",
    iconSize: "w-6 h-6 md:w-8 md:h-8"
  },
  normal: {
    padding: "p-4 md:p-6", 
    margin: "m-2 md:m-4",
    gap: "gap-2 md:gap-4",
    buttonHeight: "min-h-[40px]",
    iconSize: "w-4 h-4 md:w-5 md:h-5"
  }
};

// Animation and transition classes optimized for family features
export const familyAnimations = {
  hover: "transition-all duration-200 ease-in-out hover:scale-105",
  press: "transition-all duration-100 ease-in-out active:scale-95",
  fade: "transition-opacity duration-300 ease-in-out",
  slide: "transition-transform duration-300 ease-in-out",
  bounce: "animate-bounce",
  pulse: "animate-pulse",
  celebration: "animate-momentum-pulse"
};