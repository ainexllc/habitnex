'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  ParticleConfig, 
  createParticleEffect, 
  updateParticles,
  getAnimationConfig 
} from '@/lib/waveAnimations';

interface ParticleEffectProps {
  isActive?: boolean;
  intensity?: number; // 0-1 scale
  color?: string;
  className?: string;
}

interface ParticleSystem {
  particles: ParticleConfig[];
  lastUpdate: number;
}

export function ParticleEffect({ 
  isActive = false, 
  intensity = 0.5,
  color = '#3b82f6',
  className = ''
}: ParticleEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particleSystem, setParticleSystem] = useState<ParticleSystem>({
    particles: [],
    lastUpdate: Date.now()
  });
  const animationFrameRef = useRef<number | undefined>(undefined);
  const animationConfig = getAnimationConfig();

  // Trigger particle burst
  const triggerBurst = useCallback((x?: number, y?: number) => {
    if (!animationConfig.particlesEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const centerX = x ?? rect.width / 2;
    const centerY = y ?? rect.height / 2;
    
    const particleCount = Math.floor(8 + (intensity * 16)); // 8-24 particles
    const newParticles = createParticleEffect(centerX, centerY, particleCount, color);
    
    setParticleSystem(prev => ({
      particles: [...prev.particles, ...newParticles],
      lastUpdate: Date.now()
    }));
  }, [intensity, color, animationConfig.particlesEnabled]);

  // Animation loop for particles
  useEffect(() => {
    if (!animationConfig.particlesEnabled || !isActive) {
      return;
    }

    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - particleSystem.lastUpdate) / 16.67; // Normalize to ~60fps
      
      setParticleSystem(prev => ({
        particles: updateParticles(prev.particles, deltaTime),
        lastUpdate: now
      }));
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (particleSystem.particles.length > 0) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, particleSystem.particles.length, particleSystem.lastUpdate, animationConfig.particlesEnabled]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !animationConfig.particlesEnabled) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render particles
    particleSystem.particles.forEach(particle => {
      ctx.save();
      
      // Set particle properties
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = particle.color;
      
      // Draw particle with glow effect
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 2
      );
      gradient.addColorStop(0, particle.color);
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw solid center
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    });
  }, [particleSystem.particles, animationConfig.particlesEnabled]);

  // Handle canvas click for manual triggers
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isActive) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    triggerBurst(x, y);
  };

  // Auto-trigger particles based on intensity when active
  useEffect(() => {
    if (!isActive || !animationConfig.particlesEnabled || intensity <= 0) return;

    // Higher intensity = more frequent bursts
    const interval = Math.max(500, 2000 - (intensity * 1500));
    
    const timer = setInterval(() => {
      if (Math.random() < intensity) {
        triggerBurst();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isActive, intensity, triggerBurst, animationConfig.particlesEnabled]);

  // Resize canvas to match container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;

      const { width, height } = container.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  if (!animationConfig.particlesEnabled) {
    // Show static celebratory element for reduced motion
    return (
      <div className={`flex items-center justify-center ${className}`}>
        {isActive && (
          <div 
            className="w-4 h-4 rounded-full animate-pulse"
            style={{ backgroundColor: color }}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-auto cursor-pointer"
        onClick={handleCanvasClick}
        style={{ zIndex: 10 }}
      />
      
      {/* Particle trigger area overlay */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full bg-transparent" />
        </div>
      )}
    </div>
  );
}

// Specialized celebration burst component
interface CelebrationBurstProps {
  trigger: number; // Change this to trigger a new burst
  x?: number;
  y?: number;
  color?: string;
  intensity?: number;
  duration?: number;
}

export function CelebrationBurst({
  trigger,
  x = 50,
  y = 50,
  color = '#22c55e',
  intensity = 1,
  duration = 2000
}: CelebrationBurstProps) {
  const [isActive, setIsActive] = useState(false);
  const animationConfig = getAnimationConfig();

  useEffect(() => {
    if (trigger === 0 || !animationConfig.particlesEnabled) return;

    setIsActive(true);
    
    const timer = setTimeout(() => {
      setIsActive(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [trigger, duration, animationConfig.particlesEnabled]);

  useEffect(() => {
    if (!isActive) return;

    // Create multiple bursts for celebration
    const burstCount = Math.floor(2 + intensity * 3);
    const interval = duration / burstCount;

    const timers: NodeJS.Timeout[] = [];

    for (let i = 0; i < burstCount; i++) {
      const timer = setTimeout(() => {
        // Random position variation for multiple bursts
        const offsetX = x + (Math.random() - 0.5) * 20;
        const offsetY = y + (Math.random() - 0.5) * 20;
        
        // This would trigger the actual burst
        // (Implementation depends on how you want to integrate with ParticleEffect)
      }, i * interval);
      
      timers.push(timer);
    }

    return () => timers.forEach(clearTimeout);
  }, [isActive, x, y, intensity, duration]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <ParticleEffect
        isActive={isActive}
        intensity={intensity}
        color={color}
        className="w-full h-full"
      />
    </div>
  );
}

// Fireworks effect for major celebrations
interface FireworksProps {
  isActive: boolean;
  colors?: string[];
  className?: string;
}

export function Fireworks({ 
  isActive, 
  colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444'],
  className = ''
}: FireworksProps) {
  const [burstPositions, setBurstPositions] = useState<Array<{x: number, y: number, color: string}>>([]);
  const animationConfig = getAnimationConfig();

  useEffect(() => {
    if (!isActive || !animationConfig.particlesEnabled) {
      setBurstPositions([]);
      return;
    }

    // Create random burst positions
    const positions = Array.from({ length: 5 }, () => ({
      x: 20 + Math.random() * 60, // 20% to 80% of width
      y: 20 + Math.random() * 40, // 20% to 60% of height
      color: colors[Math.floor(Math.random() * colors.length)]
    }));

    setBurstPositions(positions);

    // Clear after animation
    const timer = setTimeout(() => {
      setBurstPositions([]);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isActive, colors, animationConfig.particlesEnabled]);

  if (!animationConfig.particlesEnabled) {
    // Simple celebration for reduced motion
    return isActive ? (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="flex gap-1">
          {colors.slice(0, 3).map((color, index) => (
            <div
              key={index}
              className="w-3 h-3 rounded-full animate-bounce"
              style={{ 
                backgroundColor: color,
                animationDelay: `${index * 0.1}s`
              }}
            />
          ))}
        </div>
      </div>
    ) : null;
  }

  return (
    <div className={`relative ${className}`}>
      {burstPositions.map((position, index) => (
        <div
          key={index}
          className="absolute"
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <ParticleEffect
            isActive={true}
            intensity={0.8}
            color={position.color}
            className="w-20 h-20"
          />
        </div>
      ))}
    </div>
  );
}