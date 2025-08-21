// Wave animation utilities for Momentum Wave View
import { Habit, HabitCompletion } from '@/types';

export interface WavePoint {
  x: number;
  y: number;
}

export interface WaveParameters {
  amplitude: number;      // Wave height (represents completion rate)
  frequency: number;      // Wave frequency (represents consistency)
  phase: number;         // Wave phase offset
  speed: number;         // Animation speed (represents recent activity)
  color: string;         // Wave color based on performance
  opacity: number;       // Wave transparency
  yOffset: number;       // Vertical position offset
}

export interface MomentumState {
  level: 'building' | 'stable' | 'declining' | 'stalled';
  intensity: number;     // 0-1 scale
  trend: 'up' | 'down' | 'stable';
  completionRate: number; // Recent completion rate
  streak: number;        // Current streak
}

export interface ParticleConfig {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

// Generate wave points using sine/cosine mathematics
export function generateWavePoints(
  width: number,
  parameters: WaveParameters,
  time: number,
  resolution: number = 2
): WavePoint[] {
  const points: WavePoint[] = [];
  const { amplitude, frequency, phase, speed, yOffset } = parameters;
  
  for (let x = 0; x <= width; x += resolution) {
    // Main wave calculation: y = amplitude * sin(frequency * x + phase + time * speed)
    const normalizedX = (x / width) * Math.PI * 2 * frequency;
    const y = amplitude * Math.sin(normalizedX + phase + time * speed) + yOffset;
    
    points.push({ x, y });
  }
  
  return points;
}

// Generate complex wave with multiple harmonics for more realistic motion
export function generateComplexWave(
  width: number,
  parameters: WaveParameters,
  time: number,
  resolution: number = 2
): WavePoint[] {
  const points: WavePoint[] = [];
  const { amplitude, frequency, phase, speed, yOffset } = parameters;
  
  for (let x = 0; x <= width; x += resolution) {
    const normalizedX = (x / width) * Math.PI * 2 * frequency;
    
    // Primary wave
    const wave1 = amplitude * Math.sin(normalizedX + phase + time * speed);
    
    // Secondary harmonic (adds complexity)
    const wave2 = (amplitude * 0.3) * Math.sin(
      normalizedX * 2.1 + phase * 0.7 + time * speed * 1.3
    );
    
    // Tertiary harmonic (subtle variation)
    const wave3 = (amplitude * 0.1) * Math.sin(
      normalizedX * 3.7 + phase * 1.3 + time * speed * 0.8
    );
    
    const y = wave1 + wave2 + wave3 + yOffset;
    points.push({ x, y });
  }
  
  return points;
}

// Calculate wave parameters from habit data
export function calculateWaveParameters(
  habit: Habit,
  completions: HabitCompletion[],
  momentum: MomentumState,
  baseY: number,
  maxAmplitude: number = 40
): WaveParameters {
  // Calculate completion rate for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentCompletions = completions.filter(c => 
    c.habitId === habit.id && 
    new Date(c.date) >= thirtyDaysAgo &&
    c.completed
  );
  
  const completionRate = recentCompletions.length / 30;
  
  // Amplitude based on completion rate (0-1 scale)
  const amplitude = Math.max(10, completionRate * maxAmplitude);
  
  // Frequency based on consistency (more consistent = smoother waves)
  const consistency = momentum.completionRate;
  const frequency = 0.5 + (consistency * 0.5); // 0.5 to 1.0
  
  // Speed based on recent activity level
  const recentActivity = recentCompletions.filter(c => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return new Date(c.date) >= sevenDaysAgo;
  }).length / 7;
  
  const speed = 0.002 + (recentActivity * 0.003); // 0.002 to 0.005
  
  // Phase offset for wave uniqueness
  const phase = (habit.id.charCodeAt(0) * habit.id.charCodeAt(1)) % (Math.PI * 2);
  
  // Color based on momentum level
  const color = getMomentumColor(momentum);
  
  // Opacity based on intensity
  const opacity = 0.6 + (momentum.intensity * 0.4); // 0.6 to 1.0
  
  return {
    amplitude,
    frequency,
    phase,
    speed,
    color,
    opacity,
    yOffset: baseY
  };
}

// Get color based on momentum state
export function getMomentumColor(momentum: MomentumState): string {
  const { level, completionRate } = momentum;
  
  if (completionRate >= 0.8) {
    // Strong momentum - green tones
    return level === 'building' ? '#22c55e' : '#16a34a';
  } else if (completionRate >= 0.5) {
    // Moderate momentum - blue/yellow tones  
    return level === 'building' ? '#3b82f6' : '#f59e0b';
  } else if (completionRate >= 0.25) {
    // Declining momentum - orange tones
    return level === 'declining' ? '#f97316' : '#ea580c';
  } else {
    // Poor momentum - red tones
    return level === 'stalled' ? '#dc2626' : '#ef4444';
  }
}

// Create SVG path string from wave points
export function createWavePath(points: WavePoint[], height: number): string {
  if (points.length === 0) return '';
  
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  
  // Start path at bottom left
  let path = `M 0 ${height}`;
  
  // Line to first wave point
  path += ` L ${firstPoint.x} ${firstPoint.y}`;
  
  // Create smooth curve through all points
  for (let i = 1; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    
    // Use quadratic curves for smooth interpolation
    const cpX = current.x;
    const cpY = current.y;
    
    path += ` Q ${cpX} ${cpY} ${(current.x + next.x) / 2} ${(current.y + next.y) / 2}`;
  }
  
  // Line to last point
  path += ` L ${lastPoint.x} ${lastPoint.y}`;
  
  // Close path at bottom right
  path += ` L ${lastPoint.x} ${height}`;
  path += ` Z`;
  
  return path;
}

// Create particle effects for celebrations
export function createParticleEffect(
  x: number, 
  y: number, 
  count: number = 12,
  color: string = '#3b82f6'
): ParticleConfig[] {
  const particles: ParticleConfig[] = [];
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = 2 + Math.random() * 3;
    
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2, // Slight upward bias
      life: 1,
      maxLife: 1,
      color,
      size: 2 + Math.random() * 3
    });
  }
  
  return particles;
}

// Update particle positions and life
export function updateParticles(particles: ParticleConfig[], deltaTime: number): ParticleConfig[] {
  return particles
    .map(particle => ({
      ...particle,
      x: particle.x + particle.vx * deltaTime,
      y: particle.y + particle.vy * deltaTime,
      vy: particle.vy + 0.1 * deltaTime, // Gravity effect
      life: particle.life - deltaTime * 0.016, // Fade over ~1 second
    }))
    .filter(particle => particle.life > 0);
}

// Smooth wave transitions between states
export function interpolateWaveParameters(
  from: WaveParameters,
  to: WaveParameters,
  t: number // 0 to 1
): WaveParameters {
  const easeInOut = (x: number) => x * x * (3 - 2 * x); // Smooth interpolation curve
  const easedT = easeInOut(t);
  
  return {
    amplitude: from.amplitude + (to.amplitude - from.amplitude) * easedT,
    frequency: from.frequency + (to.frequency - from.frequency) * easedT,
    phase: from.phase, // Keep phase constant to avoid visual jumps
    speed: from.speed + (to.speed - from.speed) * easedT,
    color: t > 0.5 ? to.color : from.color, // Switch color at halfway point
    opacity: from.opacity + (to.opacity - from.opacity) * easedT,
    yOffset: from.yOffset + (to.yOffset - from.yOffset) * easedT,
  };
}

// Check if user prefers reduced motion
export function respectsReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Get wave animation config based on user preferences
export function getAnimationConfig() {
  const reducedMotion = respectsReducedMotion();
  
  return {
    animationEnabled: !reducedMotion,
    frameRate: reducedMotion ? 12 : 60, // Reduce frame rate for reduced motion
    speedMultiplier: reducedMotion ? 0.3 : 1.0, // Slower animations
    particlesEnabled: !reducedMotion,
  };
}