/**
 * OpenMoji Utility Functions
 * Utility functions for loading, caching, and managing OpenMoji SVGs
 */

import { EmojiMapping, allEmojis, emojiByName, emojiByUnicode, emojiByFilename } from './emojiMap';

// SVG cache for performance
const svgCache = new Map<string, string>();
const loadingPromises = new Map<string, Promise<string>>();

/**
 * Load an OpenMoji SVG file
 * @param filename The SVG filename (e.g., '1F600.svg')
 * @returns Promise that resolves to the SVG content
 */
export async function loadOpenMojiSVG(filename: string): Promise<string> {
  // Check cache first
  if (svgCache.has(filename)) {
    return svgCache.get(filename)!;
  }

  // Check if already loading
  if (loadingPromises.has(filename)) {
    return loadingPromises.get(filename)!;
  }

  // Start loading
  const loadingPromise = fetch(`/openmoji/${filename}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load OpenMoji: ${filename}`);
      }
      return response.text();
    })
    .then(svgContent => {
      // Cache the result
      svgCache.set(filename, svgContent);
      loadingPromises.delete(filename);
      return svgContent;
    })
    .catch(error => {
      loadingPromises.delete(filename);
      throw error;
    });

  loadingPromises.set(filename, loadingPromise);
  return loadingPromise;
}

/**
 * Preload multiple OpenMoji SVGs
 * @param filenames Array of SVG filenames to preload
 */
export async function preloadOpenMojis(filenames: string[]): Promise<void> {
  const promises = filenames.map(filename => 
    loadOpenMojiSVG(filename).catch(error => {
      console.warn(`Failed to preload OpenMoji ${filename}:`, error);
      return '';
    })
  );
  
  await Promise.all(promises);
}

/**
 * Get OpenMoji SVG content synchronously from cache
 * @param filename The SVG filename
 * @returns SVG content if cached, null otherwise
 */
export function getCachedOpenMojiSVG(filename: string): string | null {
  return svgCache.get(filename) || null;
}

/**
 * Search emojis by keyword or name
 * @param query Search query
 * @param limit Maximum number of results
 * @returns Array of matching EmojiMapping objects
 */
export function searchEmojis(query: string, limit: number = 20): EmojiMapping[] {
  if (!query.trim()) {
    return allEmojis.slice(0, limit);
  }

  const searchTerm = query.toLowerCase().trim();
  const results: EmojiMapping[] = [];
  
  // First, search by exact name match
  const exactMatch = emojiByName.get(searchTerm);
  if (exactMatch) {
    results.push(exactMatch);
  }

  // Then search by name prefix
  allEmojis.forEach(emoji => {
    if (emoji.name.toLowerCase().startsWith(searchTerm) && !results.includes(emoji)) {
      results.push(emoji);
    }
  });

  // Then search by keywords
  allEmojis.forEach(emoji => {
    if (!results.includes(emoji)) {
      const hasKeywordMatch = emoji.keywords.some(keyword => 
        keyword.toLowerCase().includes(searchTerm)
      );
      if (hasKeywordMatch) {
        results.push(emoji);
      }
    }
  });

  // Finally, search by name containing the term
  allEmojis.forEach(emoji => {
    if (!results.includes(emoji) && emoji.name.toLowerCase().includes(searchTerm)) {
      results.push(emoji);
    }
  });

  return results.slice(0, limit);
}

/**
 * Get emoji by name
 * @param name Emoji name
 * @returns EmojiMapping object if found
 */
export function getEmojiByName(name: string): EmojiMapping | undefined {
  return emojiByName.get(name);
}

/**
 * Get emoji by Unicode character
 * @param unicode Unicode character (e.g., '😀')
 * @returns EmojiMapping object if found
 */
export function getEmojiByUnicode(unicode: string): EmojiMapping | undefined {
  return emojiByUnicode.get(unicode);
}

/**
 * Get emoji by filename
 * @param filename SVG filename (e.g., '1F600.svg')
 * @returns EmojiMapping object if found
 */
export function getEmojiByFilename(filename: string): EmojiMapping | undefined {
  return emojiByFilename.get(filename);
}

/**
 * Convert Unicode codepoint to filename
 * @param codepoint Unicode codepoint (e.g., 'U+1F600' or '1F600')
 * @returns SVG filename
 */
export function codepointToFilename(codepoint: string): string {
  // Remove U+ prefix if present
  const cleanCodepoint = codepoint.replace(/^U\+/, '').toUpperCase();
  return `${cleanCodepoint}.svg`;
}

/**
 * Convert Unicode character to filename
 * @param unicode Unicode character (e.g., '😀')
 * @returns SVG filename
 */
export function unicodeToFilename(unicode: string): string {
  // Convert Unicode character to codepoint
  const codepoint = unicode.codePointAt(0);
  if (!codepoint) {
    throw new Error(`Invalid Unicode character: ${unicode}`);
  }
  
  return `${codepoint.toString(16).toUpperCase()}.svg`;
}

/**
 * Get popular emojis for quick access
 * @returns Array of popular EmojiMapping objects
 */
export function getPopularEmojis(): EmojiMapping[] {
  const popularNames = [
    'grinning', 'heart_eyes', 'joy', 'thumbs_up', 'heart', 'fire',
    'star', 'checkmark', 'trophy', 'target', 'running', 'apple',
    'coffee', 'book', 'family', 'sun', 'clap', 'raised_hands'
  ];
  
  return popularNames
    .map(name => emojiByName.get(name))
    .filter((emoji): emoji is EmojiMapping => emoji !== undefined);
}

/**
 * Get recently used emojis from localStorage
 * @param maxCount Maximum number of recent emojis to return
 * @returns Array of recently used EmojiMapping objects
 */
export function getRecentEmojis(maxCount: number = 16): EmojiMapping[] {
  try {
    const recentData = localStorage.getItem('openmoji-recent');
    if (!recentData) return [];
    
    const recentNames: string[] = JSON.parse(recentData);
    return recentNames
      .slice(0, maxCount)
      .map(name => emojiByName.get(name))
      .filter((emoji): emoji is EmojiMapping => emoji !== undefined);
  } catch (error) {
    console.warn('Failed to load recent emojis:', error);
    return [];
  }
}

/**
 * Add an emoji to recent emojis in localStorage
 * @param emojiName The emoji name to add
 */
export function addToRecentEmojis(emojiName: string): void {
  try {
    const recentData = localStorage.getItem('openmoji-recent');
    const recentNames: string[] = recentData ? JSON.parse(recentData) : [];
    
    // Remove if already exists
    const filteredRecent = recentNames.filter(name => name !== emojiName);
    
    // Add to beginning
    filteredRecent.unshift(emojiName);
    
    // Limit to 32 items
    const limitedRecent = filteredRecent.slice(0, 32);
    
    localStorage.setItem('openmoji-recent', JSON.stringify(limitedRecent));
  } catch (error) {
    console.warn('Failed to save recent emoji:', error);
  }
}

/**
 * Clear recent emojis from localStorage
 */
export function clearRecentEmojis(): void {
  try {
    localStorage.removeItem('openmoji-recent');
  } catch (error) {
    console.warn('Failed to clear recent emojis:', error);
  }
}

/**
 * Validate if an emoji filename exists
 * @param filename SVG filename to validate
 * @returns True if the emoji exists in our mapping
 */
export function isValidEmojiFilename(filename: string): boolean {
  return emojiByFilename.has(filename);
}

/**
 * Get emoji categories with emoji counts
 * @returns Object with category names and their emoji counts
 */
export function getEmojiCategoryStats(): Record<string, number> {
  const stats: Record<string, number> = {};
  
  allEmojis.forEach(emoji => {
    stats[emoji.category] = (stats[emoji.category] || 0) + 1;
  });
  
  return stats;
}

/**
 * Filter emojis by category
 * @param category Category name
 * @returns Array of emojis in the specified category
 */
export function getEmojisByCategory(category: string): EmojiMapping[] {
  return allEmojis.filter(emoji => emoji.category === category);
}

/**
 * Get random emojis
 * @param count Number of random emojis to return
 * @returns Array of random EmojiMapping objects
 */
export function getRandomEmojis(count: number = 10): EmojiMapping[] {
  const shuffled = [...allEmojis].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get emoji data as JSON for debugging
 * @param emoji EmojiMapping object
 * @returns JSON string representation
 */
export function emojiToJSON(emoji: EmojiMapping): string {
  return JSON.stringify(emoji, null, 2);
}

/**
 * Batch preload popular and recent emojis
 */
export async function preloadCommonEmojis(): Promise<void> {
  const popular = getPopularEmojis();
  const recent = getRecentEmojis();
  
  const filenames = [
    ...popular.map(e => e.filename),
    ...recent.map(e => e.filename)
  ];
  
  // Remove duplicates
  const uniqueFilenames = Array.from(new Set(filenames));
  
  await preloadOpenMojis(uniqueFilenames);
}

/**
 * Get cache statistics for debugging
 * @returns Object with cache statistics
 */
export function getCacheStats(): {
  cachedCount: number;
  loadingCount: number;
  totalMapped: number;
  cacheHitRate: number;
} {
  return {
    cachedCount: svgCache.size,
    loadingCount: loadingPromises.size,
    totalMapped: allEmojis.length,
    cacheHitRate: svgCache.size / allEmojis.length
  };
}