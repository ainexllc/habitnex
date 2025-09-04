/**
 * TypeScript type definitions for OpenMoji integration
 */

// Re-export main types from emoji map
export type { EmojiMapping, EmojiCategory } from '@/lib/openmoji/emojiMap';

// Component prop types
export interface OpenMojiSize {
  size: 16 | 20 | 24 | 32 | 48 | 64;
}

export interface OpenMojiBaseProps {
  /** Emoji identifier (name, unicode, or filename) */
  emoji: string;
  /** CSS class name */
  className?: string;
  /** Alt text for accessibility */
  alt?: string;
}

export interface OpenMojiLoadingProps {
  /** Whether to show loading state */
  showLoading?: boolean;
  /** Custom loading component */
  loadingComponent?: React.ReactNode;
  /** Custom error component */
  errorComponent?: React.ReactNode;
}

export interface OpenMojiCallbackProps {
  /** Callback when emoji loads */
  onLoad?: (emoji: import('@/lib/openmoji/emojiMap').EmojiMapping) => void;
  /** Callback when emoji fails to load */
  onError?: (error: Error) => void;
}

export interface OpenMojiInteractionProps {
  /** Click handler */
  onClick?: () => void;
  /** Hover handler with emoji data */
  onHover?: (emoji: import('@/lib/openmoji/emojiMap').EmojiMapping | null) => void;
  /** Whether to scale on hover */
  hoverScale?: boolean;
  /** Whether the emoji is disabled */
  disabled?: boolean;
}

export interface OpenMojiPickerConfig {
  /** Whether to show search functionality */
  showSearch?: boolean;
  /** Whether to show category tabs */
  showCategories?: boolean;
  /** Whether to show recent emojis */
  showRecent?: boolean;
  /** Whether to show popular emojis */
  showPopular?: boolean;
  /** Maximum emojis per category */
  maxPerCategory?: number;
  /** Emoji size in picker */
  emojiSize?: 16 | 20 | 24 | 32 | 48 | 64;
  /** Habit context for suggestions */
  habitContext?: string;
}

export interface OpenMojiGridConfig {
  /** Array of emoji identifiers */
  emojis: string[];
  /** Gap between emojis */
  gap?: 'sm' | 'md' | 'lg';
  /** CSS class for grid items */
  itemClassName?: string;
  /** Maximum items to display */
  maxItems?: number;
  /** Click handler for grid items */
  onEmojiClick?: (emoji: string, mapping: import('@/lib/openmoji/emojiMap').EmojiMapping | null) => void;
}

// Utility function return types
export interface EmojiSearchResult {
  emojis: import('@/lib/openmoji/emojiMap').EmojiMapping[];
  total: number;
  hasMore: boolean;
}

export interface EmojiCacheStats {
  cachedCount: number;
  loadingCount: number;
  totalMapped: number;
  cacheHitRate: number;
}

// Context types for habit emoji suggestions
export type HabitContextType = 
  | 'exercise' | 'fitness' | 'health' | 'diet' | 'food' | 'water' | 'hydration'
  | 'meditation' | 'mindfulness' | 'sleep' | 'rest' | 'reading' | 'study' | 'learning'
  | 'work' | 'productivity' | 'social' | 'family' | 'creativity' | 'music' | 'cooking'
  | 'cleaning' | 'finance' | 'money' | 'savings' | 'gratitude' | 'thankfulness'
  | 'journal' | 'writing' | 'nature' | 'outdoor' | 'travel' | 'hobby' | 'goal'
  | 'achievement';

// Event types
export interface OpenMojiSelectEvent {
  emoji: import('@/lib/openmoji/emojiMap').EmojiMapping;
  timestamp: number;
  context?: string;
}

export interface OpenMojiLoadEvent {
  filename: string;
  success: boolean;
  loadTime?: number;
  fromCache: boolean;
}

// Error types
export class OpenMojiError extends Error {
  constructor(
    message: string,
    public readonly filename?: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'OpenMojiError';
  }
}

export class OpenMojiLoadError extends OpenMojiError {
  constructor(filename: string, cause?: Error) {
    super(`Failed to load OpenMoji: ${filename}`, filename, 'LOAD_ERROR');
    this.cause = cause;
  }
}

export class OpenMojiNotFoundError extends OpenMojiError {
  constructor(identifier: string) {
    super(`OpenMoji not found: ${identifier}`, undefined, 'NOT_FOUND');
  }
}

// Configuration types
export interface OpenMojiConfig {
  /** Base URL for OpenMoji files */
  baseUrl: string;
  /** Default emoji size */
  defaultSize: 16 | 20 | 24 | 32 | 48 | 64;
  /** Enable caching */
  enableCache: boolean;
  /** Cache expiry time in milliseconds */
  cacheExpiry: number;
  /** Preload popular emojis */
  preloadPopular: boolean;
  /** Maximum recent emojis to store */
  maxRecentEmojis: number;
}

// Hook return types
export interface UseOpenMojiResult {
  /** SVG content */
  svgContent: string | null;
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Emoji mapping data */
  emoji: import('@/lib/openmoji/emojiMap').EmojiMapping | null;
  /** Retry loading function */
  retry: () => void;
}

export interface UseEmojiSearchResult {
  /** Search results */
  results: import('@/lib/openmoji/emojiMap').EmojiMapping[];
  /** Loading state */
  loading: boolean;
  /** Search function */
  search: (query: string) => void;
  /** Clear results */
  clear: () => void;
}

export interface UseRecentEmojisResult {
  /** Recent emojis */
  recent: import('@/lib/openmoji/emojiMap').EmojiMapping[];
  /** Add emoji to recent */
  addRecent: (emoji: import('@/lib/openmoji/emojiMap').EmojiMapping) => void;
  /** Clear recent emojis */
  clearRecent: () => void;
}

// Component ref types
export interface OpenMojiRef {
  /** Retry loading the emoji */
  retry: () => void;
  /** Get current emoji data */
  getEmoji: () => import('@/lib/openmoji/emojiMap').EmojiMapping | null;
  /** Get SVG element */
  getSVGElement: () => HTMLDivElement | null;
}

export interface OpenMojiPickerRef {
  /** Focus the search input */
  focus: () => void;
  /** Clear current search */
  clearSearch: () => void;
  /** Set active category */
  setCategory: (category: string) => void;
  /** Get current selection */
  getSelection: () => import('@/lib/openmoji/emojiMap').EmojiMapping | null;
}

// Analytics types
export interface OpenMojiAnalytics {
  /** Most used emojis */
  topEmojis: Array<{ emoji: import('@/lib/openmoji/emojiMap').EmojiMapping; count: number }>;
  /** Usage by category */
  categoryUsage: Record<string, number>;
  /** Search patterns */
  searchPatterns: Array<{ query: string; count: number }>;
  /** Performance metrics */
  performance: {
    averageLoadTime: number;
    cacheHitRate: number;
    errorRate: number;
  };
}