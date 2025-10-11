'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Habit, HabitCompletion } from '@/types';
import { 
  WaveParameters,
  MomentumState,
  generateComplexWave,
  createWavePath,
  calculateWaveParameters,
  interpolateWaveParameters,
  createParticleEffect,
  updateParticles,
  ParticleConfig,
  getAnimationConfig
} from '@/lib/waveAnimations';
import { HabitMomentumData } from '@/lib/momentumAnalysis';

interface HabitWaveProps {
  habit: Habit;
  completions: HabitCompletion[];
  momentum: HabitMomentumData;
  width: number;
  height: number;
  yOffset: number;
  isActive?: boolean;
  onComplete?: (habitId: string) => void;
  onClick?: (habit: Habit) => void;
  animationTime: number;
}

export function HabitWave({
  habit,
  completions,
  momentum,
  width,
  height,
  yOffset,
  isActive = true,
  onComplete,
  onClick,
  animationTime
}: HabitWaveProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [particles, setParticles] = useState<ParticleConfig[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [lastCompletionTrigger, setLastCompletionTrigger] = useState(0);
  const animationConfig = getAnimationConfig();

  // Calculate wave parameters
  const baseWaveParams = useMemo(() => 
    calculateWaveParameters(habit, completions, momentum.momentum, yOffset),
    [habit, completions, momentum, yOffset]
  );

  // Apply hover and active effects
  const currentWaveParams = useMemo(() => {
    const params = { ...baseWaveParams };
    
    if (isHovered) {
      params.amplitude *= 1.3;
      params.speed *= 1.5;
      params.opacity = Math.min(1, params.opacity + 0.2);
    }
    
    if (!isActive) {
      params.opacity *= 0.5;
      params.speed *= 0.5;
    }
    
    return params;
  }, [baseWaveParams, isHovered, isActive]);

  // Generate wave path
  const wavePath = useMemo(() => {
    if (!animationConfig.animationEnabled) {
      // Static wave for reduced motion
      const staticTime = 0;
      const points = generateComplexWave(width, currentWaveParams, staticTime);
      return createWavePath(points, height);
    }

    const points = generateComplexWave(width, currentWaveParams, animationTime);
    return createWavePath(points, height);
  }, [width, height, currentWaveParams, animationTime, animationConfig.animationEnabled]);

  // Create gradient for wave
  const gradientId = `wave-gradient-${habit.id}`;
  const maskId = `wave-mask-${habit.id}`;

  // Handle completion celebration
  const triggerCompletion = () => {
    if (onComplete && animationConfig.particlesEnabled) {
      // Create celebration particles at wave peak
      const peakX = width / 2;
      const peakY = yOffset - currentWaveParams.amplitude;
      const newParticles = createParticleEffect(
        peakX, 
        peakY, 
        16, 
        currentWaveParams.color
      );
      
      setParticles(prev => [...prev, ...newParticles]);
      setLastCompletionTrigger(Date.now());
      onComplete(habit.id);
    }
  };

  // Handle wave click
  const handleWaveClick = (event: React.MouseEvent) => {
    event.preventDefault();
    
    if (onClick) {
      onClick(habit);
    } else {
      triggerCompletion();
    }
  };

  // Update particles animation
  useEffect(() => {
    if (!animationConfig.particlesEnabled || particles.length === 0) return;

    const updateInterval = setInterval(() => {
      setParticles(prev => updateParticles(prev, 1));
    }, 1000 / 60); // 60 FPS for particles

    return () => clearInterval(updateInterval);
  }, [particles.length, animationConfig.particlesEnabled]);

  // Performance momentum indicator
  const getMomentumIndicatorProps = () => {
    const { level, intensity, completionRate } = momentum.momentum;
    
    const indicatorColor = currentWaveParams.color;
    let pulseSpeed = 2000;
    
    switch (level) {
      case 'building':
        pulseSpeed = 1000;
        break;
      case 'declining':
        pulseSpeed = 3000;
        break;
      case 'stalled':
        pulseSpeed = 0; // No pulse
        break;
    }
    
    return { indicatorColor, pulseSpeed, intensity: intensity * 100 };
  };

  const { indicatorColor, pulseSpeed, intensity } = getMomentumIndicatorProps();

  return (
    <div className="relative group">
      {/* Wave SVG */}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="cursor-pointer transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleWaveClick}
        style={{ filter: isHovered ? 'brightness(1.1)' : 'none' }}
      >
        {/* Gradient Definition */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop 
              offset="0%" 
              stopColor={currentWaveParams.color} 
              stopOpacity={currentWaveParams.opacity} 
            />
            <stop 
              offset="100%" 
              stopColor={currentWaveParams.color} 
              stopOpacity={currentWaveParams.opacity * 0.3} 
            />
          </linearGradient>
          
          {/* Wave mask for crisp edges */}
          <mask id={maskId}>
            <rect width={width} height={height} fill="white" />
          </mask>
        </defs>

        {/* Background wave (subtle) */}
        <path
          d={wavePath}
          fill={`url(#${gradientId})`}
          opacity={0.3}
          mask={`url(#${maskId})`}
        />

        {/* Main wave */}
        <path
          d={wavePath}
          fill="none"
          stroke={currentWaveParams.color}
          strokeWidth="2"
          opacity={currentWaveParams.opacity}
          mask={`url(#${maskId})`}
        />

        {/* Particles */}
        {animationConfig.particlesEnabled && particles.map((particle, index) => (
          <circle
            key={`${lastCompletionTrigger}-${index}`}
            cx={particle.x}
            cy={particle.y}
            r={particle.size}
            fill={particle.color}
            opacity={particle.life}
          />
        ))}

        {/* Wave Peak Interaction Area */}
        <circle
          cx={width / 2}
          cy={yOffset - currentWaveParams.amplitude}
          r="8"
          fill="transparent"
          className="cursor-pointer hover:fill-white hover:fill-opacity-20"
          onClick={handleWaveClick}
        />
      </svg>

      {/* Habit Info Overlay (appears on hover) */}
      <div className={`absolute left-0 right-0 bottom-0 bg-black bg-opacity-80 text-white p-2 rounded-b-lg 
        transform transition-all duration-300 ${
          isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-sm truncate">{habit.name}</h4>
            <div className="flex items-center gap-2 text-xs text-gray-300">
              <span>Streak: {momentum.streakData.current}</span>
              <span>•</span>
              <span>{Math.round(momentum.completion.last30Days * 100)}% rate</span>
            </div>
          </div>
          
          {/* Momentum Indicator */}
          <div className="flex items-center gap-1">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: indicatorColor }}
            >
              {pulseSpeed > 0 && (
                <div 
                  className="w-full h-full rounded-full animate-pulse"
                  style={{ 
                    backgroundColor: indicatorColor,
                    animationDuration: `${pulseSpeed}ms`
                  }}
                />
              )}
            </div>
            <span className="text-xs capitalize font-medium">
              {momentum.momentum.level}
            </span>
          </div>
        </div>
      </div>

      {/* Completion Rate Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-b-lg overflow-hidden">
        <div 
          className="h-full transition-all duration-300"
          style={{ 
            width: `${intensity}%`,
            backgroundColor: indicatorColor,
          }}
        />
      </div>
    </div>
  );
}

// Performance optimized memo wrapper
export const MemoizedHabitWave = React.memo(HabitWave, (prevProps, nextProps) => {
  // Only re-render if essential props change
  return (
    prevProps.habit.id === nextProps.habit.id &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height &&
    prevProps.yOffset === nextProps.yOffset &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.momentum.momentum.level === nextProps.momentum.momentum.level &&
    prevProps.momentum.momentum.intensity === nextProps.momentum.momentum.intensity &&
    Math.floor(prevProps.animationTime / 100) === Math.floor(nextProps.animationTime / 100) // Reduce animation updates
  );
});