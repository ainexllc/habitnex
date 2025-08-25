'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CelebrationEvent {
  id: string;
  type: 'habit_complete' | 'streak_milestone' | 'reward_earned' | 'challenge_complete' | 'level_up';
  memberName: string;
  memberAvatar: string;
  memberColor: string;
  title: string;
  description: string;
  emoji: string;
  points?: number;
  streak?: number;
  level?: number;
  duration?: number; // Animation duration in ms
}

interface CelebrationContextType {
  celebrations: CelebrationEvent[];
  addCelebration: (event: Omit<CelebrationEvent, 'id' | 'duration'>) => void;
  removeCelebration: (id: string) => void;
  clearCelebrations: () => void;
}

const CelebrationContext = createContext<CelebrationContextType | undefined>(undefined);

export function CelebrationProvider({ children }: { children: ReactNode }) {
  const [celebrations, setCelebrations] = useState<CelebrationEvent[]>([]);

  const addCelebration = (event: Omit<CelebrationEvent, 'id' | 'duration'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const duration = getDurationByType(event.type);
    
    const celebration: CelebrationEvent = {
      ...event,
      id,
      duration
    };

    setCelebrations(prev => [...prev, celebration]);

    // Auto-remove celebration after duration
    setTimeout(() => {
      setCelebrations(prev => prev.filter(c => c.id !== id));
    }, duration);
  };

  const removeCelebration = (id: string) => {
    setCelebrations(prev => prev.filter(c => c.id !== id));
  };

  const clearCelebrations = () => {
    setCelebrations([]);
  };

  return (
    <CelebrationContext.Provider value={{
      celebrations,
      addCelebration,
      removeCelebration,
      clearCelebrations
    }}>
      {children}
    </CelebrationContext.Provider>
  );
}

export function useCelebration() {
  const context = useContext(CelebrationContext);
  if (context === undefined) {
    throw new Error('useCelebration must be used within a CelebrationProvider');
  }
  return context;
}

// Helper function to determine animation duration based on celebration type
function getDurationByType(type: CelebrationEvent['type']): number {
  switch (type) {
    case 'habit_complete':
      return 3000; // 3 seconds
    case 'streak_milestone':
      return 4000; // 4 seconds
    case 'reward_earned':
      return 5000; // 5 seconds
    case 'challenge_complete':
      return 6000; // 6 seconds
    case 'level_up':
      return 7000; // 7 seconds
    default:
      return 4000;
  }
}