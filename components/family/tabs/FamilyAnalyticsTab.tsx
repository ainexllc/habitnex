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
  const periodOptions: { id: Period; label: string }[] = [
    { id: 'week', label: 'This week' },
    { id: 'month', label: 'This month' },
    { id: 'year', label: 'This year' },
  ];
  const totalCompletions = analytics?.overall.totalCompletions || 0;
  const successRate = Math.round(analytics?.overall.averageCompletionRate || 0);
  const totalPointsEarned = analytics?.overall.totalPointsEarned || 0;
  const activeMembers = currentFamily.members.filter((member) => member.isActive).length;

  if (!currentFamily || !currentMember) {
    return null;
  }

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-[#ff7a9e]" />;
      case 'stable': return <Minus className="w-4 h-4 text-white/60" />;
    }
  };

  const getMoodColor = (mood: number) => {
    if (mood >= 4) return 'text-[#7fe8c1]';
    if (mood >= 3) return 'text-[#ffb876]';
    return 'text-[#ff7a9e]';
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
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.04] px-10 py-16 text-center text-white shadow-[0_35px_120px_rgba(0,0,0,0.45)]">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-2 border-white/30 border-t-transparent" />
        <p className="text-sm text-white/70">Loading analytics…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center rounded-[28px] border border-red-500/40 bg-red-500/10 px-10 py-16 text-center text-white shadow-[0_35px_120px_rgba(0,0,0,0.45)]">
        <h2 className="text-2xl font-semibold text-white">Error loading analytics</h2>
        <p className="mt-2 text-sm text-white/80">{error}</p>
        <Button
          onClick={refreshAnalytics}
          variant="ghost"
          className="mt-6 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 text-white">
      <section className="rounded-[32px] border border-white/5 bg-[radial-gradient(circle_at_top,_rgba(73,197,255,0.16),transparent_60%),_rgba(12,13,22,0.9)] px-6 py-6 shadow-[0_35px_120px_rgba(0,0,0,0.45)] sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.48em] text-[#49c5ff]">Insight pulse</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-[36px]">Team analytics</h2>
            <p className="mt-3 max-w-xl text-sm text-white/70">
              {totalCompletions} completions · {successRate}% success rate · {totalPointsEarned} points earned
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-xs">
              {periodOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedPeriod(option.id)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold uppercase tracking-[0.18em]',
                    selectedPeriod === option.id
                      ? 'bg-[#49c5ff] text-[#041726] shadow-[0_12px_30px_rgba(73,197,255,0.4)]'
                      : 'text-white/70 hover:text-white'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <Button
              onClick={refreshAnalytics}
              variant="ghost"
              className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/15"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            {isParent && (
              <Button
                variant="ghost"
                className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/15"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-inner shadow-black/20">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">Total completions</p>
            <p className="mt-2 text-2xl font-semibold text-white">{totalCompletions}</p>
            <p className="text-sm text-white/60">Habits completed across the crew</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-inner shadow-black/20">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">Success rate</p>
            <p className="mt-2 text-2xl font-semibold text-[#7fe8c1]">{successRate}%</p>
            <p className="text-sm text-white/60">Consistency for the selected period</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-inner shadow-black/20">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">Active members</p>
            <p className="mt-2 text-2xl font-semibold text-white">{activeMembers}</p>
            <p className="text-sm text-white/60">Contributing to the momentum</p>
          </div>
        </div>
      </section>

      {/* Overview Stats */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="!border-white/10 !bg-white/[0.05] !shadow-[0_30px_90px_rgba(0,0,0,0.4)]">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-xl border border-white/10 bg-white/10">
                <Target className="w-6 h-6 text-[#49c5ff]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">Total Completions</p>
                <p className="text-2xl font-bold text-white">
                  {analytics?.overall.totalCompletions || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="!border-white/10 !bg-white/[0.05] !shadow-[0_30px_90px_rgba(0,0,0,0.4)]">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-xl border border-white/10 bg-white/10">
                <TrendingUp className="w-6 h-6 text-[#7fe8c1]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">Completion Rate</p>
                <p className="text-2xl font-bold text-white">
                  {Math.round(analytics?.overall.averageCompletionRate || 0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="!border-white/10 !bg-white/[0.05] !shadow-[0_30px_90px_rgba(0,0,0,0.4)]">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-xl border border-white/10 bg-white/10">
                <Star className="w-6 h-6 text-[#ffb876]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">Points Earned</p>
                <p className="text-2xl font-bold text-white">
                  {analytics?.overall.totalPointsEarned || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="!border-white/10 !bg-white/[0.05] !shadow-[0_30px_90px_rgba(0,0,0,0.4)]">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-xl border border-white/10 bg-white/10">
                <Users className="w-6 h-6 text-[#49c5ff]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white/70">Active Members</p>
                <p className="text-2xl font-bold text-white">
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
        <Card className="!border-white/10 !bg-white/[0.05] !shadow-[0_30px_90px_rgba(0,0,0,0.4)]">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
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
        <Card className="!border-white/10 !bg-white/[0.05] !shadow-[0_30px_90px_rgba(0,0,0,0.4)]">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
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
          <Card key={member.memberId} className="overflow-hidden !border-white/10 !bg-white/[0.05] !shadow-[0_30px_90px_rgba(0,0,0,0.4)]">
            <CardHeader className="pb-3" style={{ backgroundColor: `${member.memberColor}15` }}>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: member.memberColor }}
                >
                  👤
                </div>
                <div>
                  <CardTitle className="text-lg text-white">{member.memberName}</CardTitle>
                  <p className="text-sm text-white/70">Level {Math.floor(member.pointsEarned / 100) + 1}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/70">Completion Rate</span>
                  <span className="font-semibold text-white">{Math.round(member.completionRate)}%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/70 flex items-center">
                    <Star className="w-4 h-4 mr-1 text-[#ffb876]" />
                    Points
                  </span>
                  <span className="font-semibold text-white">{member.pointsEarned}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/70 flex items-center">
                    <Zap className="w-4 h-4 mr-1 text-[#ff7a1c]" />
                    Current Streak
                  </span>
                  <span className="font-semibold text-white">{member.currentStreak} days</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/70 flex items-center">
                    <Crown className="w-4 h-4 mr-1 text-[#49c5ff]" />
                    Best Streak
                  </span>
                  <span className="font-semibold text-white">{member.longestStreak} days</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/70 flex items-center">
                    <Heart className="w-4 h-4 mr-1 text-[#ff7a9e]" />
                    Avg Mood
                  </span>
                  <span className={cn("font-semibold flex items-center", getMoodColor(member.averageMood))}>
                    {member.averageMood.toFixed(1)} {getMoodEmoji(member.averageMood)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/70 flex items-center">
                    <Gift className="w-4 h-4 mr-1 text-[#ff7a9e]" />
                    Rewards
                  </span>
                  <span className="font-semibold text-white">{member.rewardsEarned}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Habit Performance */}
      <Card className="mb-8 !border-white/10 !bg-white/[0.05] !shadow-[0_30px_90px_rgba(0,0,0,0.4)]">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Target className="w-5 h-5 mr-2" />
            Habit Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-white">Habit</th>
                  <th className="text-left py-3 px-4 text-white">Completions</th>
                  <th className="text-left py-3 px-4 text-white">Success Rate</th>
                  <th className="text-left py-3 px-4 text-white">Avg Streak</th>
                  <th className="text-left py-3 px-4 text-white">Top Performer</th>
                  <th className="text-left py-3 px-4 text-white">Trend</th>
                </tr>
              </thead>
              <tbody>
                {habitAnalytics.map((habit, index) => (
                  <tr key={habit.habitId} className="border-b border-white/10">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{habit.habitEmoji}</span>
                        <span className="font-medium text-white">{habit.habitName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-white">{habit.totalCompletions}</td>
                    <td className="py-3 px-4 text-white">{Math.round(habit.completionRate)}%</td>
                    <td className="py-3 px-4 text-white">{habit.averageStreak.toFixed(1)} days</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full border border-[#49c5ff]/40 bg-[#49c5ff]/10 text-[#bce9ff] text-xs">
                        {habit.mostSuccessfulMember}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {getTrendIcon(habit.trendDirection)}
                        <span className="ml-1 text-sm capitalize text-white">{habit.trendDirection}</span>
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
        <Card className="!border-white/10 !bg-white/[0.05] !shadow-[0_30px_90px_rgba(0,0,0,0.4)]">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Gift className="w-5 h-5 mr-2" />
              Reward Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#49c5ff]">
                  {analytics.rewardActivity.totalRedemptions}
                </div>
                <div className="text-sm text-white/70">Total Redemptions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#49c5ff]">
                  {analytics.rewardActivity.totalPointsSpent}
                </div>
                <div className="text-sm text-white/70">Points Spent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#7fe8c1]">
                  {analytics.rewardActivity.mostPopularReward}
                </div>
                <div className="text-sm text-white/70">Most Popular</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#ff7a1c]">
                  {analytics.rewardActivity.pendingApprovals}
                </div>
                <div className="text-sm text-white/70">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
