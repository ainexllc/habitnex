/**
 * Centralized Theme System for HabitNex
 * 
 * This file contains all theme-related classes and utilities to ensure
 * consistent light/dark mode styling across the entire application.
 * 
 * Usage:
 * import { theme } from '@/lib/theme';
 * className={theme.surface.primary}
 */

export const theme = {
  // Background colors for different surface levels
  surface: {
    // Main app background
    base: 'bg-white dark:bg-gray-900',
    // Cards, modals, elevated surfaces
    primary: 'bg-white dark:bg-gray-800',
    // Secondary elevated surfaces
    secondary: 'bg-gray-50 dark:bg-gray-800',
    // Tertiary surfaces (nested cards, etc)
    tertiary: 'bg-gray-100 dark:bg-gray-700',
    // Interactive hover states
    hover: 'hover:bg-gray-50 dark:hover:bg-gray-700',
    // Selected/active states
    active: 'bg-gray-100 dark:bg-gray-700',
  },

  // Text colors with proper contrast
  text: {
    // Primary text (headings, important text)
    primary: 'text-gray-900 dark:text-white',
    // Secondary text (body text)
    secondary: 'text-gray-700 dark:text-gray-200',
    // Muted text (hints, placeholders)
    muted: 'text-gray-600 dark:text-gray-400',
    // Disabled text
    disabled: 'text-gray-400 dark:text-gray-500',
    // Link text
    link: 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300',
  },

  // Border colors
  border: {
    // Default borders
    default: 'border-gray-200 dark:border-gray-700',
    // Light borders (dividers)
    light: 'border-gray-100 dark:border-gray-800',
    // Strong borders (focus, selected)
    strong: 'border-gray-300 dark:border-gray-600',
    // Interactive borders
    interactive: 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
  },

  // Status colors (keeping light/dark consistency)
  status: {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-300',
      icon: 'text-green-600 dark:text-green-400',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-300',
      icon: 'text-red-600 dark:text-red-400',
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-700 dark:text-yellow-300',
      icon: 'text-yellow-600 dark:text-yellow-400',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      icon: 'text-blue-600 dark:text-blue-400',
    },
  },

  // Component-specific styles
  components: {
    // Cards and containers
    card: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm',
    cardHover: 'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all',
    
    // Modals
    modal: {
      backdrop: 'bg-black/50 dark:bg-black/70',
      content: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
      header: 'border-b border-gray-200 dark:border-gray-700',
    },
    
    // Forms
    input: {
      base: 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500',
      focus: 'focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20',
      error: 'border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400',
      disabled: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed',
    },
    
    // Buttons
    button: {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200',
      outline: 'border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200',
      ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
    },
    
    // Badges and chips
    badge: {
      default: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
      primary: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    },
    
    // Navigation
    nav: {
      link: 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800',
      linkActive: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    },
    
    // Tooltips
    tooltip: 'bg-gray-900 dark:bg-gray-700 text-white text-sm',
    
    // Dropdowns
    dropdown: {
      menu: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg',
      item: 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700',
      itemActive: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    },
  },

  // Gradient backgrounds
  gradients: {
    // Primary gradients
    primary: 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
    primaryStrong: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    
    // Success gradients
    success: 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
    successStrong: 'bg-gradient-to-r from-green-600 to-emerald-600',
    
    // Multi-color gradients
    rainbow: 'bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-green-900/20',
    
    // Background gradients for pages
    pageBackground: 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800',
  },

  // Icon containers (colored backgrounds for icons)
  iconContainer: {
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    green: 'bg-green-100 dark:bg-green-900/30',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/30',
    red: 'bg-red-100 dark:bg-red-900/30',
    gray: 'bg-gray-100 dark:bg-gray-800',
  },

  // Shadows (adjusted for dark mode)
  shadow: {
    sm: 'shadow-sm dark:shadow-gray-900/50',
    md: 'shadow-md dark:shadow-gray-900/50',
    lg: 'shadow-lg dark:shadow-gray-900/50',
    xl: 'shadow-xl dark:shadow-gray-900/50',
  },

  // Animation classes
  animation: {
    transition: 'transition-all duration-200 ease-in-out',
    transitionSlow: 'transition-all duration-300 ease-in-out',
    transitionFast: 'transition-all duration-150 ease-in-out',
  },
};

// Helper function to combine theme classes
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Type for theme keys for TypeScript support
export type ThemeKey = keyof typeof theme;
export type SurfaceKey = keyof typeof theme.surface;
export type TextKey = keyof typeof theme.text;
export type BorderKey = keyof typeof theme.border;
export type StatusKey = keyof typeof theme.status;
export type ComponentKey = keyof typeof theme.components;

// Export individual sections for easier imports
export const surfaces = theme.surface;
export const text = theme.text;
export const borders = theme.border;
export const status = theme.status;
export const components = theme.components;
export const gradients = theme.gradients;
export const shadows = theme.shadow;