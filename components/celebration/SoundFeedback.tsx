'use client';

import { useEffect, useRef } from 'react';
import { useCelebration } from '@/contexts/CelebrationContext';

// Sound effect mappings
const SOUND_EFFECTS = {
  habit_complete: '/sounds/success-bell.mp3',
  streak_milestone: '/sounds/achievement-fanfare.mp3', 
  reward_earned: '/sounds/coin-collect.mp3',
  challenge_complete: '/sounds/victory-trumpet.mp3',
  level_up: '/sounds/level-up-chime.mp3'
};

export function SoundFeedback() {
  const { celebrations } = useCelebration();
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundBuffersRef = useRef<Record<string, AudioBuffer>>({});

  // Initialize Web Audio API and preload sounds
  useEffect(() => {
    // Only initialize if we're in the browser
    if (typeof window === 'undefined') return;

    try {
      // Create audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Preload sound effects
      preloadSounds();
    } catch (error) {
      console.warn('Audio not supported or failed to initialize:', error);
    }

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Play sound when new celebration is added
  useEffect(() => {
    if (celebrations.length > 0) {
      const latestCelebration = celebrations[celebrations.length - 1];
      playSound(latestCelebration.type);
      
      // Trigger haptic feedback if available
      triggerHapticFeedback(latestCelebration.type);
    }
  }, [celebrations.length]);

  const preloadSounds = async () => {
    if (!audioContextRef.current) return;

    try {
      for (const [type, soundPath] of Object.entries(SOUND_EFFECTS)) {
        try {
          // For now, we'll create synthetic sounds instead of loading files
          // This avoids needing actual audio files in the repo
          const buffer = createSyntheticSound(type as keyof typeof SOUND_EFFECTS);
          soundBuffersRef.current[type] = buffer;
        } catch (error) {
          console.warn(`Failed to load sound for ${type}:`, error);
        }
      }
    } catch (error) {
      console.warn('Failed to preload sounds:', error);
    }
  };

  const createSyntheticSound = (type: keyof typeof SOUND_EFFECTS): AudioBuffer => {
    if (!audioContextRef.current) throw new Error('Audio context not available');

    const ctx = audioContextRef.current;
    const sampleRate = ctx.sampleRate;
    let buffer: AudioBuffer;

    switch (type) {
      case 'habit_complete':
        // Pleasant success chime
        buffer = createToneSequence(ctx, [523.25, 659.25, 783.99], 0.2, 0.3);
        break;
      case 'streak_milestone':
        // Ascending fanfare
        buffer = createToneSequence(ctx, [261.63, 329.63, 392.00, 523.25, 659.25], 0.15, 0.4);
        break;
      case 'reward_earned':
        // Coin collection sound
        buffer = createToneSequence(ctx, [659.25, 830.61], 0.1, 0.5);
        break;
      case 'challenge_complete':
        // Victory trumpet
        buffer = createToneSequence(ctx, [392.00, 523.25, 659.25, 783.99, 880.00], 0.2, 0.6);
        break;
      case 'level_up':
        // Level up chime
        buffer = createToneSequence(ctx, [523.25, 659.25, 783.99, 1046.50], 0.25, 0.7);
        break;
      default:
        buffer = createToneSequence(ctx, [523.25], 0.3, 0.3);
    }

    return buffer;
  };

  const createToneSequence = (
    ctx: AudioContext, 
    frequencies: number[], 
    noteDuration: number, 
    totalDuration: number
  ): AudioBuffer => {
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * totalDuration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const channelData = buffer.getChannelData(0);

    let offset = 0;
    const noteLength = Math.floor(sampleRate * noteDuration);

    frequencies.forEach((freq, index) => {
      for (let i = 0; i < noteLength && offset + i < length; i++) {
        const t = i / sampleRate;
        const decay = Math.exp(-t * 3); // Exponential decay
        const envelope = Math.sin((t / noteDuration) * Math.PI); // Bell envelope
        
        channelData[offset + i] = 
          Math.sin(2 * Math.PI * freq * t) * 0.1 * decay * envelope;
      }
      offset += noteLength;
    });

    return buffer;
  };

  const playSound = (type: string) => {
    if (!audioContextRef.current || !soundBuffersRef.current[type]) return;

    try {
      const ctx = audioContextRef.current;
      
      // Resume context if suspended (required for some browsers)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();
      
      source.buffer = soundBuffersRef.current[type];
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Set volume based on celebration type
      const volume = getVolumeForType(type);
      gainNode.gain.value = volume;
      
      source.start(0);
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  };

  const getVolumeForType = (type: string): number => {
    switch (type) {
      case 'habit_complete': return 0.3;
      case 'streak_milestone': return 0.4;
      case 'reward_earned': return 0.5;
      case 'challenge_complete': return 0.6;
      case 'level_up': return 0.7;
      default: return 0.3;
    }
  };

  const triggerHapticFeedback = (type: string) => {
    if (!navigator.vibrate) return;

    try {
      switch (type) {
        case 'habit_complete':
          navigator.vibrate([50, 50, 50]); // Short triple tap
          break;
        case 'streak_milestone':
          navigator.vibrate([100, 50, 100, 50, 200]); // Ascending pattern
          break;
        case 'reward_earned':
          navigator.vibrate([200]); // Single strong vibration
          break;
        case 'challenge_complete':
          navigator.vibrate([100, 50, 100, 50, 100, 50, 300]); // Victory pattern
          break;
        case 'level_up':
          navigator.vibrate([50, 50, 50, 50, 50, 100, 400]); // Build-up pattern
          break;
        default:
          navigator.vibrate([100]);
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  };

  // This component doesn't render anything, it just handles sound effects
  return null;
}