'use client';

import { useState } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useFamilyAnalytics } from '@/hooks/useFamilyAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
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
  ArrowLeft,
  Download,
  RefreshCw,
  Clock,
  Zap,
  Crown,
  Heart
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Period = 'week' | 'month' | 'year';

export default function FamilyAnalyticsPage() {
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
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-bold mb-2">No Family Found</h2>
              <p className="text-gray-600 mb-4">You need to be in a family to view analytics.</p>
              <Link href="/family/onboarding">
                <Button>Join or Create Family</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
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

  const chartColors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-purple-600 font-medium">Loading analytics...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-bold mb-2 text-red-600">Error Loading Analytics</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={refreshAnalytics} className="mr-2">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Link href="/dashboard/family">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/dashboard/family">
                <Button variant="ghost" className="flex items-center mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Family Dashboard
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Family Analytics</h1>
              <p className="text-gray-600">Track your family's progress and achievements</p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex rounded-lg bg-white p-1 shadow-sm">
                {(['week', 'month', 'year'] as Period[]).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize",
                      selectedPeriod === period
                        ? "bg-purple-600 text-white"
                        : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
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
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Completions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics?.overall.totalCompletions || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(analytics?.overall.averageCompletionRate || 0)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Points Earned</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics?.overall.totalPointsEarned || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Members</p>
                    <p className="text-2xl font-bold text-gray-900">
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
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
                        stroke="#8B5CF6" 
                        fill="#8B5CF6" 
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
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
                      <Bar dataKey="completions" fill="#8B5CF6" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Member Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {memberAnalytics.map((member, index) => (
              <Card key={member.memberId} className="overflow-hidden">
                <CardHeader className="pb-3" style={{ backgroundColor: `${member.memberColor}15` }}>
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: member.memberColor }}
                    >
                      👤
                    </div>
                    <div>
                      <CardTitle className="text-lg">{member.memberName}</CardTitle>
                      <p className="text-sm text-gray-600">Level {Math.floor(member.pointsEarned / 100) + 1}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Completion Rate</span>
                      <span className="font-semibold">{Math.round(member.completionRate)}%</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-500" />
                        Points
                      </span>
                      <span className="font-semibold">{member.pointsEarned}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 flex items-center">
                        <Zap className="w-4 h-4 mr-1 text-orange-500" />
                        Current Streak
                      </span>
                      <span className="font-semibold">{member.currentStreak} days</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 flex items-center">
                        <Crown className="w-4 h-4 mr-1 text-purple-500" />
                        Best Streak
                      </span>
                      <span className="font-semibold">{member.longestStreak} days</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 flex items-center">
                        <Heart className="w-4 h-4 mr-1 text-red-500" />
                        Avg Mood
                      </span>
                      <span className={cn("font-semibold flex items-center", getMoodColor(member.averageMood))}>
                        {member.averageMood.toFixed(1)} {getMoodEmoji(member.averageMood)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 flex items-center">
                        <Gift className="w-4 h-4 mr-1 text-pink-500" />
                        Rewards
                      </span>
                      <span className="font-semibold">{member.rewardsEarned}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Habit Performance */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Habit Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Habit</th>
                      <th className="text-left py-3 px-4">Completions</th>
                      <th className="text-left py-3 px-4">Success Rate</th>
                      <th className="text-left py-3 px-4">Avg Streak</th>
                      <th className="text-left py-3 px-4">Top Performer</th>
                      <th className="text-left py-3 px-4">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {habitAnalytics.map((habit, index) => (
                      <tr key={habit.habitId} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl">{habit.habitEmoji}</span>
                            <span className="font-medium">{habit.habitName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{habit.totalCompletions}</td>
                        <td className="py-3 px-4">{Math.round(habit.completionRate)}%</td>
                        <td className="py-3 px-4">{habit.averageStreak.toFixed(1)} days</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                            {habit.mostSuccessfulMember}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {getTrendIcon(habit.trendDirection)}
                            <span className="ml-1 text-sm capitalize">{habit.trendDirection}</span>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="w-5 h-5 mr-2" />
                  Reward Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {analytics.rewardActivity.totalRedemptions}
                    </div>
                    <div className="text-sm text-gray-600">Total Redemptions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {analytics.rewardActivity.totalPointsSpent}
                    </div>
                    <div className="text-sm text-gray-600">Points Spent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {analytics.rewardActivity.mostPopularReward}
                    </div>
                    <div className="text-sm text-gray-600">Most Popular</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {analytics.rewardActivity.pendingApprovals}
                    </div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}