import { COMMON_HABITS, type CommonHabit } from './prompts';
import { HabitEnhancement } from '@/types/claude';

// In-memory cache for development (in production, use Redis or similar)
const cache = new Map<string, { data: any; timestamp: number; cost: number }>();

const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface CacheStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  totalCostSaved: number;
  hitRate: number;
}

// Cache statistics
let stats = {
  totalRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  totalCostSaved: 0,
};

export function getCacheStats(): CacheStats {
  return {
    ...stats,
    hitRate: stats.totalRequests > 0 ? (stats.cacheHits / stats.totalRequests) * 100 : 0,
  };
}

export function getHabitEnhancement(habitName: string): HabitEnhancement | null {
  stats.totalRequests++;
  
  // Check if it's a common habit first (highest priority)
  const commonHabitKey = habitName.toLowerCase().trim() as CommonHabit;
  if (COMMON_HABITS[commonHabitKey]) {
    stats.cacheHits++;
    stats.totalCostSaved += 0.0015; // Estimated cost saved per request
    
    console.log(`[AI Cache] Hit for common habit: ${habitName}`);
    // Convert readonly arrays to mutable arrays to match HabitEnhancement type
    const template = COMMON_HABITS[commonHabitKey];
    return {
      ...template,
      complementary: [...template.complementary]
    };
  }
  
  // Check custom cache
  const cacheKey = `habit_${habitName.toLowerCase().trim()}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    stats.cacheHits++;
    stats.totalCostSaved += cached.cost;
    
    console.log(`[AI Cache] Hit for cached habit: ${habitName}`);
    return cached.data;
  }
  
  stats.cacheMisses++;
  console.log(`[AI Cache] Miss for habit: ${habitName}`);
  return null;
}

export function setHabitEnhancement(habitName: string, data: HabitEnhancement, cost: number): void {
  const cacheKey = `habit_${habitName.toLowerCase().trim()}`;
  
  cache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    cost,
  });
  
  console.log(`[AI Cache] Stored enhancement for: ${habitName} (cost: $${cost.toFixed(4)})`);
}

export function getCachedInsight(habitName: string, streak: number, completionRate: number): string | null {
  stats.totalRequests++;
  
  const cacheKey = `insight_${habitName}_${streak}_${Math.floor(completionRate / 10) * 10}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    stats.cacheHits++;
    stats.totalCostSaved += cached.cost;
    
    console.log(`[AI Cache] Hit for insight: ${habitName}`);
    return cached.data;
  }
  
  stats.cacheMisses++;
  return null;
}

export function setCachedInsight(
  habitName: string, 
  streak: number, 
  completionRate: number, 
  insight: string, 
  cost: number
): void {
  const cacheKey = `insight_${habitName}_${streak}_${Math.floor(completionRate / 10) * 10}`;
  
  cache.set(cacheKey, {
    data: insight,
    timestamp: Date.now(),
    cost,
  });
  
  console.log(`[AI Cache] Stored insight for: ${habitName} (cost: $${cost.toFixed(4)})`);
}

// Clear expired cache entries
export function cleanupCache(): number {
  let cleaned = 0;
  const now = Date.now();
  
  for (const [key, value] of Array.from(cache.entries())) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`[AI Cache] Cleaned up ${cleaned} expired entries`);
  }
  
  return cleaned;
}

// Get cache size
export function getCacheSize(): number {
  return cache.size;
}

// Clear entire cache (for testing)
export function clearCache(): void {
  cache.clear();
  console.log('[AI Cache] Cache cleared');
}