'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  loadOpenMojiSVG, 
  getCachedOpenMojiSVG, 
  getEmojiByName, 
  getEmojiByUnicode, 
  getEmojiByFilename,
  searchEmojis,
  getRecentEmojis,
  addToRecentEmojis,
  clearRecentEmojis,
  getPopularEmojis,
  preloadCommonEmojis
} from '@/lib/openmoji/utils';
import type { EmojiMapping } from '@/lib/openmoji/emojiMap';

/**
 * Hook for loading and managing a single OpenMoji
 */
export function useOpenMoji(emoji: string) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emojiMapping, setEmojiMapping] = useState<EmojiMapping | null>(null);

  const resolveEmojiMapping = useCallback((identifier: string): { filename: string; mapping?: EmojiMapping } => {
    // If it's a filename (ends with .svg)
    if (identifier.endsWith('.svg')) {
      const mapping = getEmojiByFilename(identifier);
      return { filename: identifier, mapping };
    }
    
    // If it's a Unicode character
    if (identifier.length <= 2) {
      const mapping = getEmojiByUnicode(identifier);
      return mapping ? { filename: mapping.filename, mapping } : { filename: `${identifier}.svg` };
    }
    
    // If it's an emoji name
    const mapping = getEmojiByName(identifier);
    if (mapping) {
      return { filename: mapping.filename, mapping };
    }
    
    // Fallback: treat as filename if it doesn't end with .svg
    const filename = identifier.includes('.') ? identifier : `${identifier}.svg`;
    return { filename };
  }, []);

  const loadEmoji = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { filename, mapping } = resolveEmojiMapping(emoji);
      setEmojiMapping(mapping || null);

      // Check cache first
      const cached = getCachedOpenMojiSVG(filename);
      if (cached) {
        setSvgContent(cached);
        setLoading(false);
        return;
      }

      // Load from server
      const content = await loadOpenMojiSVG(filename);
      setSvgContent(content);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load emoji';
      setError(errorMessage);
      setLoading(false);
    }
  }, [emoji, resolveEmojiMapping]);

  const retry = useCallback(() => {
    loadEmoji();
  }, [loadEmoji]);

  useEffect(() => {
    loadEmoji();
  }, [loadEmoji]);

  return {
    svgContent,
    loading,
    error,
    emoji: emojiMapping,
    retry,
  };
}

/**
 * Hook for searching emojis with debouncing
 */
export function useEmojiSearch(initialQuery = '', debounceMs = 300) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [results, setResults] = useState<EmojiMapping[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      setLoading(true);
      const searchResults = searchEmojis(debouncedQuery, 50);
      setResults(searchResults);
      setLoading(false);
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [debouncedQuery]);

  const search = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setLoading(true);
  }, []);

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []);

  return {
    query,
    results,
    loading,
    search,
    clear,
  };
}

/**
 * Hook for managing recent emojis
 */
export function useRecentEmojis() {
  const [recent, setRecent] = useState<EmojiMapping[]>([]);

  // Load recent emojis on mount
  useEffect(() => {
    const recentEmojis = getRecentEmojis(16);
    setRecent(recentEmojis);
  }, []);

  const addRecent = useCallback((emoji: EmojiMapping) => {
    addToRecentEmojis(emoji.name);
    const updated = getRecentEmojis(16);
    setRecent(updated);
  }, []);

  const clearRecent = useCallback(() => {
    clearRecentEmojis();
    setRecent([]);
  }, []);

  return {
    recent,
    addRecent,
    clearRecent,
  };
}

/**
 * Hook for getting popular emojis
 */
export function usePopularEmojis() {
  const popularEmojis = useMemo(() => getPopularEmojis(), []);
  return popularEmojis;
}

/**
 * Hook for managing emoji picker state
 */
export function useEmojiPicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<EmojiMapping | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const openPicker = useCallback(() => setIsOpen(true), []);
  const closePicker = useCallback(() => setIsOpen(false), []);
  const togglePicker = useCallback(() => setIsOpen(prev => !prev), []);

  const selectEmoji = useCallback((emoji: EmojiMapping) => {
    setSelectedEmoji(emoji);
    addToRecentEmojis(emoji.name);
    setIsOpen(false);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedEmoji(null);
  }, []);

  const resetPicker = useCallback(() => {
    setSearchQuery('');
    setActiveCategory('all');
  }, []);

  return {
    isOpen,
    selectedEmoji,
    searchQuery,
    activeCategory,
    openPicker,
    closePicker,
    togglePicker,
    selectEmoji,
    clearSelection,
    setSearchQuery,
    setActiveCategory,
    resetPicker,
  };
}

/**
 * Hook for preloading emojis
 */
export function useEmojiPreloader(emojiList: string[] = []) {
  const [preloaded, setPreloaded] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);

  useEffect(() => {
    const preloadEmojis = async () => {
      try {
        setPreloaded(false);
        setPreloadProgress(0);

        // Preload common emojis first
        await preloadCommonEmojis();
        setPreloadProgress(0.5);

        // Preload custom emoji list if provided
        if (emojiList.length > 0) {
          const promises = emojiList.map(async (emoji, index) => {
            try {
              const mapping = getEmojiByName(emoji) || getEmojiByUnicode(emoji);
              if (mapping) {
                await loadOpenMojiSVG(mapping.filename);
              }
            } catch (error) {
              console.warn(`Failed to preload emoji: ${emoji}`, error);
            }
            setPreloadProgress(0.5 + (0.5 * (index + 1)) / emojiList.length);
          });

          await Promise.allSettled(promises);
        }

        setPreloaded(true);
        setPreloadProgress(1);
      } catch (error) {
        console.error('Failed to preload emojis:', error);
        setPreloaded(false);
      }
    };

    preloadEmojis();
  }, [emojiList]);

  return {
    preloaded,
    preloadProgress,
  };
}

/**
 * Hook for emoji analytics and usage tracking
 */
export function useEmojiAnalytics() {
  const [analytics, setAnalytics] = useState({
    mostUsed: [] as Array<{ emoji: EmojiMapping; count: number }>,
    recentActivity: [] as Array<{ emoji: EmojiMapping; timestamp: number }>,
    categoryStats: {} as Record<string, number>,
  });

  const trackEmojiUsage = useCallback((emoji: EmojiMapping) => {
    // Track usage in localStorage
    try {
      const analyticsData = localStorage.getItem('openmoji-analytics');
      const data = analyticsData ? JSON.parse(analyticsData) : { usage: {}, activity: [] };
      
      // Update usage count
      data.usage[emoji.name] = (data.usage[emoji.name] || 0) + 1;
      
      // Add to activity log
      data.activity.unshift({
        emoji: emoji.name,
        timestamp: Date.now(),
      });
      
      // Keep only last 100 activities
      data.activity = data.activity.slice(0, 100);
      
      localStorage.setItem('openmoji-analytics', JSON.stringify(data));
      
      // Update state
      loadAnalytics();
    } catch (error) {
      console.warn('Failed to track emoji usage:', error);
    }
  }, []);

  const loadAnalytics = useCallback(() => {
    try {
      const analyticsData = localStorage.getItem('openmoji-analytics');
      if (analyticsData) {
        const data = JSON.parse(analyticsData);
        
        // Convert usage data to most used array
        const mostUsed = Object.entries(data.usage || {})
          .map(([name, count]) => ({
            emoji: getEmojiByName(name),
            count: count as number,
          }))
          .filter(item => item.emoji)
          .sort((a, b) => b.count - a.count)
          .slice(0, 20) as Array<{ emoji: EmojiMapping; count: number }>;

        // Convert activity data
        const recentActivity = (data.activity || [])
          .map((item: any) => ({
            emoji: getEmojiByName(item.emoji),
            timestamp: item.timestamp,
          }))
          .filter((item: any) => item.emoji)
          .slice(0, 50) as Array<{ emoji: EmojiMapping; timestamp: number }>;

        // Calculate category stats
        const categoryStats: Record<string, number> = {};
        mostUsed.forEach(({ emoji, count }) => {
          categoryStats[emoji.category] = (categoryStats[emoji.category] || 0) + count;
        });

        setAnalytics({
          mostUsed,
          recentActivity,
          categoryStats,
        });
      }
    } catch (error) {
      console.warn('Failed to load emoji analytics:', error);
    }
  }, []);

  const clearAnalytics = useCallback(() => {
    try {
      localStorage.removeItem('openmoji-analytics');
      setAnalytics({
        mostUsed: [],
        recentActivity: [],
        categoryStats: {},
      });
    } catch (error) {
      console.warn('Failed to clear emoji analytics:', error);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    analytics,
    trackEmojiUsage,
    clearAnalytics,
    refreshAnalytics: loadAnalytics,
  };
}

/**
 * Hook for managing emoji favorites
 */
export function useEmojiFavorites() {
  const [favorites, setFavorites] = useState<EmojiMapping[]>([]);

  // Load favorites on mount
  useEffect(() => {
    try {
      const favoritesData = localStorage.getItem('openmoji-favorites');
      if (favoritesData) {
        const favoriteNames: string[] = JSON.parse(favoritesData);
        const favoriteEmojis = favoriteNames
          .map(name => getEmojiByName(name))
          .filter((emoji): emoji is EmojiMapping => emoji !== undefined);
        setFavorites(favoriteEmojis);
      }
    } catch (error) {
      console.warn('Failed to load emoji favorites:', error);
    }
  }, []);

  const addFavorite = useCallback((emoji: EmojiMapping) => {
    try {
      const updated = [emoji, ...favorites.filter(fav => fav.name !== emoji.name)];
      setFavorites(updated);
      
      const favoriteNames = updated.map(e => e.name);
      localStorage.setItem('openmoji-favorites', JSON.stringify(favoriteNames));
    } catch (error) {
      console.warn('Failed to add emoji favorite:', error);
    }
  }, [favorites]);

  const removeFavorite = useCallback((emoji: EmojiMapping) => {
    try {
      const updated = favorites.filter(fav => fav.name !== emoji.name);
      setFavorites(updated);
      
      const favoriteNames = updated.map(e => e.name);
      localStorage.setItem('openmoji-favorites', JSON.stringify(favoriteNames));
    } catch (error) {
      console.warn('Failed to remove emoji favorite:', error);
    }
  }, [favorites]);

  const isFavorite = useCallback((emoji: EmojiMapping) => {
    return favorites.some(fav => fav.name === emoji.name);
  }, [favorites]);

  const toggleFavorite = useCallback((emoji: EmojiMapping) => {
    if (isFavorite(emoji)) {
      removeFavorite(emoji);
    } else {
      addFavorite(emoji);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  };
}