'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Habit, HabitCompletion } from '@/types';
import { useHabits } from '@/hooks/useHabits';
import { 
  calculateHabitMomentum,
  generateMomentumInsights,
  calculateOverallMomentum,
  HabitMomentumData,
  MomentumInsight
} from '@/lib/momentumAnalysis';
import { WaveCanvas } from './momentum/WaveCanvas';
import { WaveControls } from './momentum/WaveControls';
import { MomentumGrid, DetailedMomentumIndicator } from './momentum/MomentumIndicator';
import { ParticleEffect, Fireworks } from './momentum/ParticleEffect';
import { Button } from '@/components/ui/Button';
import { 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  Info,
  Filter,
  BarChart3,
  Zap,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';

interface MomentumWaveViewProps {
  habits: Habit[];
  completions: HabitCompletion[];
  onEdit?: (habit: Habit) => void;
  className?: string;
}

interface ViewSettings {
  showInsights: boolean;
  showGrid: boolean;
  showStats: boolean;
  filterLevel: 'all' | 'building' | 'stable' | 'declining' | 'stalled';
  sortBy: 'momentum' | 'streak' | 'completion' | 'name';
  isPlaying: boolean;
  speed: number;
  showParticles: boolean;
  isFullscreen: boolean;
}

export function MomentumWaveView({ 
  habits, 
  completions, 
  onEdit, 
  className = '' 
}: MomentumWaveViewProps) {
  const { toggleCompletion } = useHabits();
  const [viewSettings, setViewSettings] = useState<ViewSettings>({
    showInsights: true,
    showGrid: false,
    showStats: true,
    filterLevel: 'all',
    sortBy: 'momentum',
    isPlaying: true,
    speed: 1.0,
    showParticles: true,
    isFullscreen: false
  });
  
  const [celebrationTrigger, setCelebrationTrigger] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  // Calculate momentum data for all habits
  const momentumData = useMemo<HabitMomentumData[]>(() => {
    if (habits.length === 0) return [];
    
    try {
      const analysisDate = new Date();
      return habits.map(habit => 
        calculateHabitMomentum(habit, completions, analysisDate)
      );
    } catch (error) {
      console.error('Error calculating momentum data:', error);
      return [];
    }
  }, [habits, completions]);

  // Calculate overall momentum
  const overallMomentum = useMemo(() => 
    calculateOverallMomentum(momentumData), 
    [momentumData]
  );

  // Generate insights
  const insights = useMemo<MomentumInsight[]>(() => {
    if (momentumData.length === 0) return [];
    
    try {
      return generateMomentumInsights(habits, momentumData)
        .slice(0, 5); // Show top 5 insights
    } catch (error) {
      console.error('Error generating insights:', error);
      return [];
    }
  }, [habits, momentumData]);

  // Filter and sort habits
  const filteredHabits = useMemo(() => {
    let filtered = habits;

    // Filter by momentum level
    if (viewSettings.filterLevel !== 'all') {
      filtered = filtered.filter(habit => {
        const momentum = momentumData.find(m => m.habitId === habit.id);
        return momentum?.momentum.level === viewSettings.filterLevel;
      });
    }

    // Sort habits
    const sortedFiltered = [...filtered].sort((a, b) => {
      const aMomentum = momentumData.find(m => m.habitId === a.id);
      const bMomentum = momentumData.find(m => m.habitId === b.id);

      if (!aMomentum || !bMomentum) return 0;

      switch (viewSettings.sortBy) {
        case 'momentum':
          return bMomentum.momentum.intensity - aMomentum.momentum.intensity;
        case 'streak':
          return bMomentum.streakData.current - aMomentum.streakData.current;
        case 'completion':
          return bMomentum.completion.last30Days - aMomentum.completion.last30Days;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return sortedFiltered;
  }, [habits, momentumData, viewSettings.filterLevel, viewSettings.sortBy]);

  // Filter momentum data to match filtered habits
  const filteredMomentumData = useMemo(() => 
    momentumData.filter(data => 
      filteredHabits.some(habit => habit.id === data.habitId)
    ), 
    [momentumData, filteredHabits]
  );

  // Handle habit completion
  const handleHabitComplete = useCallback(async (habitId: string) => {
    try {
      await toggleCompletion(habitId, new Date().toISOString().split('T')[0], true);
      setCelebrationTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error completing habit:', error);
    }
  }, [toggleCompletion]);

  // Handle habit click
  const handleHabitClick = useCallback((habit: Habit) => {
    setSelectedHabit(habit);
    onEdit?.(habit);
  }, [onEdit]);

  // Update view settings
  const updateViewSettings = <K extends keyof ViewSettings>(
    key: K, 
    value: ViewSettings[K]
  ) => {
    setViewSettings(prev => ({ ...prev, [key]: value }));
  };

  // Initialize loading state
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && viewSettings.isFullscreen) {
      document.exitFullscreen();
    } else if (document.fullscreenElement && !viewSettings.isFullscreen) {
      // Already in fullscreen, just update state
    }
    updateViewSettings('isFullscreen', !viewSettings.isFullscreen);
  }, [viewSettings.isFullscreen]);

  // Reset waves
  const resetWaves = useCallback(() => {
    // This would reset wave animations - implementation depends on WaveCanvas
    setCelebrationTrigger(0);
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            Analyzing momentum patterns...
          </p>
        </div>
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className={`text-center py-16 ${className}`}>
        <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-6">
          <TrendingUp className="w-12 h-12 text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
          No Habits to Visualize
        </h3>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
          Create some habits to see their beautiful momentum waves in action!
        </p>
        <Button onClick={() => window.location.href = '/habits/new'}>
          Create Your First Habit
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Momentum Stats */}
      {viewSettings.showStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Overall Score */}
          <div className="bg-gradient-to-r from-primary-500 to-blue-600 text-white p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Overall Momentum</h3>
                <p className="text-2xl font-bold">
                  {Math.round(overallMomentum.score * 100)}%
                </p>
                <p className="text-sm opacity-90 capitalize">
                  {overallMomentum.level}
                </p>
              </div>
              <Award className="w-12 h-12 opacity-80" />
            </div>
          </div>

          {/* Active Habits */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-1">
                  Active Habits
                </h3>
                <p className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                  {habits.length}
                </p>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  {filteredHabits.length} visible
                </p>
              </div>
              <BarChart3 className="w-12 h-12 text-primary-500" />
            </div>
          </div>

          {/* Top Insights */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-1">
                  Insights
                </h3>
                <p className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                  {insights.length}
                </p>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  actionable items
                </p>
              </div>
              <Zap className="w-12 h-12 text-warning-500" />
            </div>
          </div>
        </div>
      )}

      {/* Controls and Filters */}
      <div className="flex flex-col sm:flex-row lg:flex-row gap-4">
        {/* Wave Controls */}
        <div className="flex-1">
          <WaveControls
            isPlaying={viewSettings.isPlaying}
            onPlayPause={() => updateViewSettings('isPlaying', !viewSettings.isPlaying)}
            speed={viewSettings.speed}
            onSpeedChange={(speed) => updateViewSettings('speed', speed)}
            showParticles={viewSettings.showParticles}
            onToggleParticles={() => updateViewSettings('showParticles', !viewSettings.showParticles)}
            isFullscreen={viewSettings.isFullscreen}
            onToggleFullscreen={toggleFullscreen}
            onReset={resetWaves}
          />
        </div>

        {/* View Options */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={viewSettings.filterLevel}
            onChange={(e) => updateViewSettings('filterLevel', e.target.value as any)}
            className="input text-sm"
          >
            <option value="all">All Levels</option>
            <option value="building">Building</option>
            <option value="stable">Stable</option>
            <option value="declining">Declining</option>
            <option value="stalled">Stalled</option>
          </select>

          <select
            value={viewSettings.sortBy}
            onChange={(e) => updateViewSettings('sortBy', e.target.value as any)}
            className="input text-sm"
          >
            <option value="momentum">Sort by Momentum</option>
            <option value="streak">Sort by Streak</option>
            <option value="completion">Sort by Completion</option>
            <option value="name">Sort by Name</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => updateViewSettings('showGrid', !viewSettings.showGrid)}
            className={viewSettings.showGrid ? 'bg-primary-50 border-primary-200' : ''}
          >
            {viewSettings.showGrid ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Main Wave Visualization */}
      <div className="relative">
        <WaveCanvas
          habits={filteredHabits}
          completions={completions}
          momentumData={filteredMomentumData}
          onHabitComplete={handleHabitComplete}
          onHabitClick={handleHabitClick}
          isPlaying={viewSettings.isPlaying}
          speedMultiplier={viewSettings.speed}
          className="min-h-[400px] lg:min-h-[500px]"
        />

        {/* Celebration Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <Fireworks
            isActive={celebrationTrigger > 0}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Momentum Grid (Optional) */}
      {viewSettings.showGrid && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
              Momentum Overview
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateViewSettings('showGrid', false)}
            >
              <EyeOff className="w-4 h-4 mr-2" />
              Hide Grid
            </Button>
          </div>
          <MomentumGrid
            momentumData={filteredMomentumData}
            onIndicatorClick={handleHabitClick ? (habitId) => {
              const habit = habits.find(h => h.id === habitId);
              if (habit) handleHabitClick(habit);
            } : undefined}
          />
        </div>
      )}

      {/* Insights Panel */}
      {viewSettings.showInsights && insights.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
              Momentum Insights
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateViewSettings('showInsights', false)}
            >
              <EyeOff className="w-4 h-4 mr-2" />
              Hide Insights
            </Button>
          </div>

          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'celebration'
                    ? 'bg-success-50 border-success-400 dark:bg-success-900'
                    : insight.type === 'warning'
                    ? 'bg-warning-50 border-warning-400 dark:bg-warning-900'
                    : insight.type === 'critical'
                    ? 'bg-error-50 border-error-400 dark:bg-error-900'
                    : 'bg-primary-50 border-primary-400 dark:bg-primary-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-1 rounded ${
                    insight.type === 'celebration'
                      ? 'bg-success-100 text-success-600'
                      : insight.type === 'warning'
                      ? 'bg-warning-100 text-warning-600'
                      : insight.type === 'critical'
                      ? 'bg-error-100 text-error-600'
                      : 'bg-primary-100 text-primary-600'
                  }`}>
                    {insight.type === 'celebration' && <Award className="w-4 h-4" />}
                    {insight.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
                    {insight.type === 'critical' && <AlertTriangle className="w-4 h-4" />}
                    {insight.type === 'positive' && <Info className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark">
                      {insight.title}
                    </h4>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                      {insight.message}
                    </p>
                    {insight.suggestion && (
                      <p className="text-sm text-text-muted-light dark:text-text-muted-dark mt-2 italic">
                        💡 {insight.suggestion}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Habit Details */}
      {selectedHabit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-text-primary-light dark:text-text-primary-dark">
              {selectedHabit.name}
            </h3>
            
            {(() => {
              const momentum = momentumData.find(m => m.habitId === selectedHabit.id);
              return momentum ? (
                <DetailedMomentumIndicator momentum={momentum.momentum} />
              ) : null;
            })()}

            <div className="flex gap-2 mt-4">
              <Button onClick={() => setSelectedHabit(null)}>
                Close
              </Button>
              {onEdit && (
                <Button variant="outline" onClick={() => onEdit(selectedHabit)}>
                  Edit Habit
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}