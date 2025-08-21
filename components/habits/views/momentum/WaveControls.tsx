'use client';

import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Volume2, 
  VolumeX, 
  Zap,
  Eye,
  EyeOff,
  Maximize,
  Minimize,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getAnimationConfig } from '@/lib/waveAnimations';

interface WaveControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  showParticles: boolean;
  onToggleParticles: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onReset?: () => void;
  className?: string;
  disabled?: boolean;
}

interface ControlsState {
  showAdvanced: boolean;
  volume: number;
  autoMode: boolean;
  quality: 'low' | 'medium' | 'high';
}

export function WaveControls({
  isPlaying,
  onPlayPause,
  speed,
  onSpeedChange,
  showParticles,
  onToggleParticles,
  isFullscreen = false,
  onToggleFullscreen,
  onReset,
  className = '',
  disabled = false
}: WaveControlsProps) {
  const [controls, setControls] = useState<ControlsState>({
    showAdvanced: false,
    volume: 50,
    autoMode: false,
    quality: 'medium'
  });

  const animationConfig = getAnimationConfig();
  const reducedMotion = !animationConfig.animationEnabled;

  // Speed presets
  const speedPresets = [
    { label: 'Slow', value: 0.5, icon: '🐌' },
    { label: 'Normal', value: 1.0, icon: '🚶' },
    { label: 'Fast', value: 2.0, icon: '🏃' },
    { label: 'Turbo', value: 4.0, icon: '⚡' }
  ];

  const currentSpeedPreset = speedPresets.find(p => Math.abs(p.value - speed) < 0.1);

  const toggleAdvanced = () => {
    setControls(prev => ({ ...prev, showAdvanced: !prev.showAdvanced }));
  };

  const toggleAutoMode = () => {
    setControls(prev => ({ ...prev, autoMode: !prev.autoMode }));
  };

  const toggleVolume = () => {
    setControls(prev => ({ 
      ...prev, 
      volume: prev.volume > 0 ? 0 : 50 
    }));
  };

  const setQuality = (quality: ControlsState['quality']) => {
    setControls(prev => ({ ...prev, quality }));
  };

  // Reduced motion warning
  if (reducedMotion) {
    return (
      <div className={`flex items-center justify-center p-4 bg-warning-50 dark:bg-warning-900 
        rounded-lg border border-warning-200 dark:border-warning-700 ${className}`}>
        <Info className="w-5 h-5 text-warning-600 dark:text-warning-400 mr-2 flex-shrink-0" />
        <div className="text-sm text-warning-700 dark:text-warning-300">
          <strong>Reduced Motion Mode:</strong> Wave animations are disabled based on your system preferences. 
          Static momentum indicators are shown instead.
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 
      shadow-sm ${className}`}>
      
      {/* Main Controls */}
      <div className="flex items-center justify-between p-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPlayPause}
            disabled={disabled}
            className="w-10 h-10 p-0"
            title={isPlaying ? 'Pause animations' : 'Play animations'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>

          {onReset && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              disabled={disabled}
              className="w-10 h-10 p-0"
              title="Reset waves"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Speed Control */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Speed:
          </span>
          <div className="flex items-center gap-1">
            {speedPresets.map(preset => (
              <button
                key={preset.value}
                onClick={() => onSpeedChange(preset.value)}
                disabled={disabled}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  currentSpeedPreset?.value === preset.value
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-text-secondary-light dark:text-text-secondary-dark'
                }`}
                title={`${preset.label} (${preset.value}x)`}
              >
                {preset.icon}
              </button>
            ))}
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleParticles}
            disabled={disabled}
            className={`w-10 h-10 p-0 ${showParticles ? 'bg-primary-50 border-primary-200 dark:bg-primary-900' : ''}`}
            title={showParticles ? 'Hide particles' : 'Show particles'}
          >
            <Zap className={`w-4 h-4 ${showParticles ? 'text-primary-600' : ''}`} />
          </Button>

          {onToggleFullscreen && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFullscreen}
              disabled={disabled}
              className="w-10 h-10 p-0"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={toggleAdvanced}
            className={`w-10 h-10 p-0 ${controls.showAdvanced ? 'bg-secondary-50 border-secondary-200 dark:bg-secondary-900' : ''}`}
            title="Advanced controls"
          >
            <Settings className={`w-4 h-4 ${controls.showAdvanced ? 'text-secondary-600' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Advanced Controls */}
      {controls.showAdvanced && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
          
          {/* Custom Speed Slider */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
              Custom Speed: {speed.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.1"
              value={speed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              disabled={disabled}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-600"
            />
          </div>

          {/* Quality Settings */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
              Animation Quality
            </label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map(quality => (
                <button
                  key={quality}
                  onClick={() => setQuality(quality)}
                  disabled={disabled}
                  className={`px-3 py-1 text-xs rounded transition-colors capitalize ${
                    controls.quality === quality
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {quality}
                </button>
              ))}
            </div>
            <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
              Higher quality uses more system resources
            </p>
          </div>

          {/* Auto Mode */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                Auto Mode
              </label>
              <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
                Automatically adjust speed based on momentum
              </p>
            </div>
            <button
              onClick={toggleAutoMode}
              disabled={disabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                controls.autoMode
                  ? 'bg-primary-600'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  controls.autoMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Volume Control (Future: for sound effects) */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleVolume}
              disabled={disabled}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title={controls.volume > 0 ? 'Mute' : 'Unmute'}
            >
              {controls.volume > 0 ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={controls.volume}
              onChange={(e) => setControls(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
              disabled={disabled || controls.volume === 0}
              className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-600"
            />
            <span className="text-xs text-text-muted-light dark:text-text-muted-dark w-8">
              {controls.volume}%
            </span>
          </div>

          {/* Performance Info */}
          <div className="text-xs text-text-muted-light dark:text-text-muted-dark bg-gray-50 dark:bg-gray-900 p-2 rounded">
            <strong>Performance:</strong> {controls.quality} quality, {animationConfig.frameRate}fps target
          </div>
        </div>
      )}
    </div>
  );
}

// Minimal controls for mobile/compact views
export function CompactWaveControls({
  isPlaying,
  onPlayPause,
  speed,
  onSpeedChange,
  className = '',
  disabled = false
}: Pick<WaveControlsProps, 'isPlaying' | 'onPlayPause' | 'speed' | 'onSpeedChange' | 'className' | 'disabled'>) {
  const animationConfig = getAnimationConfig();
  
  if (!animationConfig.animationEnabled) {
    return (
      <div className={`flex items-center gap-2 text-xs text-warning-600 dark:text-warning-400 ${className}`}>
        <EyeOff className="w-4 h-4" />
        <span>Motion reduced</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={onPlayPause}
        disabled={disabled}
        className="w-8 h-8 p-0"
      >
        {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
      </Button>
      
      <select
        value={speed}
        onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="text-xs border rounded px-2 py-1 bg-white dark:bg-gray-800"
      >
        <option value={0.5}>0.5x</option>
        <option value={1.0}>1x</option>
        <option value={2.0}>2x</option>
        <option value={4.0}>4x</option>
      </select>
    </div>
  );
}