import { useState } from 'react';
import { EnhancementResponse, InsightResponse } from '@/types/claude';

export function useClaudeAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enhanceHabit = async (
    habitName: string,
    category?: string,
    existingHabits?: string[]
  ): Promise<EnhancementResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/claude/enhance-habit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          habitName: habitName.trim(),
          category,
          existingHabits,
        }),
      });

      if (!response.ok) {
        // Try to parse error response, but handle cases where it's not JSON
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use the status-based message
          if (response.status === 503) {
            errorMessage = 'AI features are currently unavailable. Please try again later.';
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enhance habit';
      setError(errorMessage);
      console.error('Error enhancing habit:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getQuickInsight = async (
    habitName: string,
    streak: number,
    completionRate: number
  ): Promise<InsightResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/claude/quick-insight', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          habitName: habitName.trim(),
          streak,
          completionRate,
        }),
      });

      if (!response.ok) {
        // Try to parse error response, but handle cases where it's not JSON
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use the status-based message
          if (response.status === 503) {
            errorMessage = 'AI features are currently unavailable. Please try again later.';
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get insight';
      setError(errorMessage);
      console.error('Error getting insight:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    loading,
    error,
    enhanceHabit,
    getQuickInsight,
    clearError,
  };
}