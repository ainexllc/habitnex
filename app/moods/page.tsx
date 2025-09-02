'use client';

import { useState, useMemo } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/layout/Header';
import { MoodForm } from '@/components/moods/MoodForm';
import { MoodCard } from '@/components/moods/MoodCard';
import { MoodEditModal } from '@/components/moods/MoodEditModal';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useMoods } from '@/hooks/useMoods';
import { getTodayDateString } from '@/lib/utils';
import { theme } from '@/lib/theme';
import { MoodEntry } from '@/types';
import { 
  Heart, 
  Plus, 
  Calendar,
  TrendingUp,
  BarChart3,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Link from 'next/link';

export default function MoodsPage() {
  const { moods, addMood, editMood, removeMood, getTodayMood, loading: moodsLoading } = useMoods();
  
  // State management
  const [editingMood, setEditingMood] = useState<MoodEntry | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'mood' | 'energy'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Get today's mood
  const todayMood = getTodayMood();

  // Mood analytics
  const moodAnalytics = useMemo(() => {
    if (moods.length === 0) return null;

    const averages = {
      mood: moods.reduce((sum, m) => sum + m.mood, 0) / moods.length,
      energy: moods.reduce((sum, m) => sum + m.energy, 0) / moods.length,
      stress: moods.reduce((sum, m) => sum + m.stress, 0) / moods.length,
      sleep: moods.reduce((sum, m) => sum + m.sleep, 0) / moods.length,
    };

    // Chart data for the last 30 days
    const chartData = moods
      .slice(0, 30)
      .reverse()
      .map(mood => ({
        date: new Date(mood.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood: mood.mood,
        energy: mood.energy,
        stress: mood.stress,
        sleep: mood.sleep,
      }));

    return { averages, chartData };
  }, [moods]);

  // Sorted moods
  const sortedMoods = useMemo(() => {
    const sorted = [...moods].sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'date':
          aVal = new Date(a.date).getTime();
          bVal = new Date(b.date).getTime();
          break;
        case 'mood':
          aVal = a.mood;
          bVal = b.mood;
          break;
        case 'energy':
          aVal = a.energy;
          bVal = b.energy;
          break;
        default:
          aVal = new Date(a.date).getTime();
          bVal = new Date(b.date).getTime();
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return sorted;
  }, [moods, sortBy, sortOrder]);


  const handleMoodEdit = (mood: MoodEntry) => {
    setEditingMood(mood);
    setIsEditModalOpen(true);
  };

  const handleMoodEditSave = async (moodData: any) => {
    if (!editingMood) return;
    
    try {
      await editMood(editingMood.id, moodData);
    } catch (error) {
      throw error;
    }
  };

  const handleMoodDelete = async (moodId: string) => {
    try {
      await removeMood(moodId);
    } catch (error) {
      // Failed to delete mood - handle silently
    }
  };

  const toggleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  if (moodsLoading) {
    return (
      <ProtectedRoute>
        <div className={`min-h-screen ${theme.surface.base}`}>
          <Header />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className={`min-h-screen ${theme.surface.base}`}>
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className={`text-3xl font-bold ${theme.text.primary} flex items-center`}>
                <Heart className="w-8 h-8 mr-3 text-primary-600 dark:text-primary-400" />
                Mood Tracking
              </h1>
              <p className={`${theme.text.secondary} mt-1`}>
                Monitor your emotional well-being and identify patterns
              </p>
            </div>
            
            {todayMood ? (
              <Button disabled variant="secondary">
                <Heart className="w-4 h-4 mr-2" />
                Today's Mood Recorded
              </Button>
            ) : (
              <Link href="/moods/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Mood Entry
                </Button>
              </Link>
            )}
          </div>

          {/* Today's Mood Display */}
          {todayMood && (
            <div className="mb-8">
              <h2 className={`text-xl font-semibold ${theme.text.primary} mb-4`}>
                Today's Mood
              </h2>
              <MoodCard 
                mood={todayMood}
                onEdit={handleMoodEdit}
                onDelete={handleMoodDelete}
              />
            </div>
          )}

          {/* Analytics */}
          {moodAnalytics && (
            <div className="mb-8 space-y-6">
              <h2 className={`text-xl font-semibold ${theme.text.primary}`}>
                Mood Analytics
              </h2>
              
              {/* Average Scores */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {moodAnalytics.averages.mood.toFixed(1)}
                    </div>
                    <div className={`text-sm ${theme.text.secondary}`}>
                      Avg Mood
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-success-600 dark:text-success-400">
                      {moodAnalytics.averages.energy.toFixed(1)}
                    </div>
                    <div className={`text-sm ${theme.text.secondary}`}>
                      Avg Energy
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-warning-600 dark:text-warning-400">
                      {moodAnalytics.averages.stress.toFixed(1)}
                    </div>
                    <div className={`text-sm ${theme.text.secondary}`}>
                      Avg Stress
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-secondary-600 dark:text-secondary-400">
                      {moodAnalytics.averages.sleep.toFixed(1)}
                    </div>
                    <div className={`text-sm ${theme.text.secondary}`}>
                      Avg Sleep
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Mood Trends Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Mood Trends (Last 30 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={moodAnalytics.chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis domain={[1, 5]} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="mood" 
                          stroke="#3B82F6" 
                          strokeWidth={2}
                          name="Mood"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="energy" 
                          stroke="#10B981" 
                          strokeWidth={2}
                          name="Energy"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="stress" 
                          stroke="#F59E0B" 
                          strokeWidth={2}
                          name="Stress"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="sleep" 
                          stroke="#6B7280" 
                          strokeWidth={2}
                          name="Sleep"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Mood History */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className={`text-xl font-semibold ${theme.text.primary}`}>
                Mood History
              </h2>
              
              {/* Sort Controls */}
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${theme.text.secondary}`}>
                  Sort by:
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSort('date')}
                  className={sortBy === 'date' ? 'bg-primary-100 dark:bg-primary-900' : ''}
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Date
                  {sortBy === 'date' && (
                    <ArrowUpDown className={`w-3 h-3 ml-1 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSort('mood')}
                  className={sortBy === 'mood' ? 'bg-primary-100 dark:bg-primary-900' : ''}
                >
                  Mood
                  {sortBy === 'mood' && (
                    <ArrowUpDown className={`w-3 h-3 ml-1 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSort('energy')}
                  className={sortBy === 'energy' ? 'bg-primary-100 dark:bg-primary-900' : ''}
                >
                  Energy
                  {sortBy === 'energy' && (
                    <ArrowUpDown className={`w-3 h-3 ml-1 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </Button>
              </div>
            </div>

            {moods.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Heart className="w-16 h-16 text-primary-600 dark:text-primary-400 mx-auto mb-4 opacity-50" />
                  <h3 className={`text-lg font-medium ${theme.text.primary} mb-2`}>
                    No mood entries yet
                  </h3>
                  <p className={`${theme.text.secondary} mb-4`}>
                    Start tracking your mood to gain insights into your emotional well-being.
                  </p>
                  {todayMood ? (
                    <Button disabled variant="secondary">
                      <Heart className="w-4 h-4 mr-2" />
                      Today's Mood Recorded
                    </Button>
                  ) : (
                    <Link href="/moods/new">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Track Your First Mood
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedMoods.map((mood) => (
                  <MoodCard
                    key={mood.id}
                    mood={mood}
                    onEdit={handleMoodEdit}
                    onDelete={handleMoodDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Mood Edit Modal */}
        <MoodEditModal
          mood={editingMood}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingMood(null);
          }}
          onSave={handleMoodEditSave}
          loading={moodsLoading}
        />
      </div>
    </ProtectedRoute>
  );
}