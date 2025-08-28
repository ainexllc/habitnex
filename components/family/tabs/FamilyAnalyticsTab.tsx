'use client';

import { useState } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useFamilyAnalytics } from '@/hooks/useFamilyAnalytics';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Target,
  Trophy,
  Star,
  Gift,
  Download,
  RefreshCw,
  Clock,
  Zap,
  Crown,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Period = 'week' | 'month' | 'year';

export function FamilyAnalyticsTab() {
  const { currentFamily, currentMember, isParent } = useFamily();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('week');
  const {
    analytics,
    memberAnalytics,
    habitAnalytics,
    timeAnalytics,
    loading,
    error,
    refreshAnalytics
  } = useFamilyAnalytics(selectedPeriod);

  if (!currentFamily || !currentMember) {
    return null;
  }

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable': return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 4) return 'text-green-600';
    if (mood >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMoodEmoji = (mood: number) => {
    if (mood >= 4.5) return '😊';
    if (mood >= 3.5) return '🙂';
    if (mood >= 2.5) return '😐';
    if (mood >= 1.5) return '😕';
    return '😢';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-600 dark:text-blue-400 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error Loading Analytics</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <Button onClick={refreshAnalytics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Tab Header with Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Family Analytics</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Track your family's progress and achievements</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex rounded-lg bg-white dark:bg-gray-700 p-1 shadow-sm border border-gray-200 dark:border-gray-600">
            {(['week', 'month', 'year'] as Period[]).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize",
                  selectedPeriod === period
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                )}
              >
                {period}
              </button>
            ))}
          </div>

          <Button onClick={refreshAnalytics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          {isParent && (
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Completions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics?.overall.totalCompletions || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(analytics?.overall.averageCompletionRate || 0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Points Earned</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics?.overall.totalPointsEarned || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Members</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics?.overall.activeMembers || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Progress Over Time */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900 dark:text-white">
              <Calendar className="w-5 h-5 mr-2" />
              Progress Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="period" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      if (selectedPeriod === 'week') return new Date(value).toLocaleDateString('en-US', { weekday: 'short' });
                      if (selectedPeriod === 'month') return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      return value;
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value, name) => [value, name === 'completions' ? 'Completions' : 'Points']}
                    labelFormatter={(value) => `Period: ${value}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="completions" 
                    stackId="1" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pointsEarned" 
                    stackId="2" 
                    stroke="#06B6D4" 
                    fill="#06B6D4" 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Member Performance */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900 dark:text-white">
              <Trophy className="w-5 h-5 mr-2" />
              Member Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={memberAnalytics} margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="memberName" 
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value}${name === 'completionRate' ? '%' : ''}`,
                      name === 'completions' ? 'Completions' : 
                      name === 'completionRate' ? 'Completion Rate' : 
                      name === 'pointsEarned' ? 'Points' : name
                    ]}
                  />
                  <Bar dataKey="completions" fill="#3b82f6" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Member Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {memberAnalytics.map((member, index) => (
          <Card key={member.memberId} className="overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3" style={{ backgroundColor: `${member.memberColor}15` }}>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: member.memberColor }}
                >
                  👤
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">{member.memberName}</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Level {Math.floor(member.pointsEarned / 100) + 1}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{Math.round(member.completionRate)}%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-500" />
                    Points
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">{member.pointsEarned}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <Zap className="w-4 h-4 mr-1 text-orange-500" />
                    Current Streak
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">{member.currentStreak} days</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <Crown className="w-4 h-4 mr-1 text-blue-500 dark:text-blue-400" />
                    Best Streak
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">{member.longestStreak} days</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <Heart className="w-4 h-4 mr-1 text-red-500" />
                    Avg Mood
                  </span>
                  <span className={cn("font-semibold flex items-center", getMoodColor(member.averageMood))}>
                    {member.averageMood.toFixed(1)} {getMoodEmoji(member.averageMood)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <Gift className="w-4 h-4 mr-1 text-pink-500" />
                    Rewards
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">{member.rewardsEarned}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Habit Performance */}
      <Card className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900 dark:text-white">
            <Target className="w-5 h-5 mr-2" />
            Habit Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-600">
                  <th className="text-left py-3 px-4 text-gray-900 dark:text-white">Habit</th>
                  <th className="text-left py-3 px-4 text-gray-900 dark:text-white">Completions</th>
                  <th className="text-left py-3 px-4 text-gray-900 dark:text-white">Success Rate</th>
                  <th className="text-left py-3 px-4 text-gray-900 dark:text-white">Avg Streak</th>
                  <th className="text-left py-3 px-4 text-gray-900 dark:text-white">Top Performer</th>
                  <th className="text-left py-3 px-4 text-gray-900 dark:text-white">Trend</th>
                </tr>
              </thead>
              <tbody>
                {habitAnalytics.map((habit, index) => (
                  <tr key={habit.habitId} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{habit.habitEmoji}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{habit.habitName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{habit.totalCompletions}</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{Math.round(habit.completionRate)}%</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{habit.averageStreak.toFixed(1)} days</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                        {habit.mostSuccessfulMember}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {getTrendIcon(habit.trendDirection)}
                        <span className="ml-1 text-sm capitalize text-gray-900 dark:text-white">{habit.trendDirection}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Rewards Activity */}
      {analytics?.rewardActivity && (
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900 dark:text-white">
              <Gift className="w-5 h-5 mr-2" />
              Reward Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {analytics.rewardActivity.totalRedemptions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Redemptions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {analytics.rewardActivity.totalPointsSpent}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Points Spent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {analytics.rewardActivity.mostPopularReward}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Most Popular</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {analytics.rewardActivity.pendingApprovals}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}