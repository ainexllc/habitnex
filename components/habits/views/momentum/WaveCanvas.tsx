'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Habit, HabitCompletion } from '@/types';
import { HabitMomentumData } from '@/lib/momentumAnalysis';
import { MemoizedHabitWave } from './HabitWave';
import { getAnimationConfig } from '@/lib/waveAnimations';

interface WaveCanvasProps {
  habits: Habit[];
  completions: HabitCompletion[];
  momentumData: HabitMomentumData[];
  onHabitComplete?: (habitId: string) => void;
  onHabitClick?: (habit: Habit) => void;
  isPlaying?: boolean;
  speedMultiplier?: number;
  className?: string;
}

export function WaveCanvas({
  habits,
  completions,
  momentumData,
  onHabitComplete,
  onHabitClick,
  isPlaying = true,
  speedMultiplier = 1,
  className = ''
}: WaveCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [animationTime, setAnimationTime] = useState(0);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  const animationConfig = getAnimationConfig();

  // Calculate container dimensions
  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ 
        width: Math.max(300, width), 
        height: Math.max(200, Math.min(600, height))
      });
    }
  }, []);

  // Initialize dimensions
  useEffect(() => {
    updateDimensions();
    
    const handleResize = () => updateDimensions();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [updateDimensions]);

  // Animation loop
  useEffect(() => {
    if (!animationConfig.animationEnabled || !isPlaying) {
      return;
    }

    const animate = (currentTime: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }
      
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;
      
      setAnimationTime(prev => prev + (deltaTime * speedMultiplier * animationConfig.speedMultiplier));
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, speedMultiplier, animationConfig.animationEnabled, animationConfig.speedMultiplier]);

  // Calculate wave layout
  const calculateWaveLayout = () => {
    const { width, height } = dimensions;
    const habitCount = habits.length;
    
    if (habitCount === 0) return [];

    const waveHeight = Math.min(100, height / habitCount - 20);
    const spacing = Math.max(20, (height - habitCount * waveHeight) / (habitCount + 1));
    
    return habits.map((habit, index) => {
      const momentum = momentumData.find(m => m.habitId === habit.id);
      const yOffset = spacing + (index * (waveHeight + spacing)) + waveHeight / 2;
      
      return {
        habit,
        momentum,
        yOffset,
        height: waveHeight,
        width: width - 40, // Account for padding
      };
    });
  };

  const waveLayout = calculateWaveLayout();

  // Handle completion with feedback
  const handleHabitComplete = useCallback((habitId: string) => {
    onHabitComplete?.(habitId);
    
    // Visual feedback for completion
    const completedWave = waveLayout.find(w => w.habit.id === habitId);
    if (completedWave && containerRef.current) {
      // Add subtle screen shake effect
      containerRef.current.style.animation = 'shake 0.3s ease-in-out';
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.animation = '';
        }
      }, 300);
    }
  }, [onHabitComplete, waveLayout]);

  // Loading state
  if (habits.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
            No Waves to Show
          </h3>
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            Create some habits to see their momentum waves!
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (momentumData.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-warning-100 dark:bg-warning-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-warning-600 dark:text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
            Analyzing Momentum...
          </h3>
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            Calculating wave patterns from your habit data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-gradient-to-b from-primary-50 to-primary-100 
        dark:from-primary-950 dark:to-primary-900 rounded-xl p-5 ${className}`}
      style={{ minHeight: '400px' }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="wave-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" fill="currentColor" className="text-primary-400" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#wave-grid)" />
        </svg>
      </div>

      {/* Performance Warning for Many Habits */}
      {habits.length > 10 && (
        <div className="absolute top-2 right-2 bg-warning-100 dark:bg-warning-900 text-warning-700 dark:text-warning-300 px-2 py-1 rounded text-xs">
          {habits.length} waves - performance mode
        </div>
      )}

      {/* Wave Container */}
      <div className="relative z-10 h-full">
        {waveLayout.map(({ habit, momentum, yOffset, height, width }) => {
          if (!momentum) return null;
          
          return (
            <div
              key={habit.id}
              className="absolute"
              style={{
                top: yOffset - height / 2,
                left: 20,
                width: width,
                height: height,
              }}
            >
              <MemoizedHabitWave
                habit={habit}
                completions={completions.filter(c => c.habitId === habit.id)}
                momentum={momentum}
                width={width}
                height={height}
                yOffset={height / 2}
                animationTime={animationTime}
                onComplete={handleHabitComplete}
                onClick={onHabitClick}
              />
            </div>
          );
        })}
      </div>

      {/* Performance Overlay (if many habits) */}
      {habits.length > 15 && (
        <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-sm">
            <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Performance Mode
            </h4>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-3">
              Showing {habits.length} habits. Consider filtering for better performance.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700 transition-colors"
            >
              Refresh View
            </button>
          </div>
        </div>
      )}

      {/* Reduced Motion Notice */}
      {!animationConfig.animationEnabled && (
        <div className="absolute bottom-2 left-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded text-xs">
          Static view (reduced motion)
        </div>
      )}
    </div>
  );
}

// Add CSS for shake animation
const shakeKeyframes = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-2px); }
    75% { transform: translateX(2px); }
  }
`;

// Inject styles if not already present
if (typeof document !== 'undefined') {
  const styleId = 'wave-canvas-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = shakeKeyframes;
    document.head.appendChild(style);
  }
}