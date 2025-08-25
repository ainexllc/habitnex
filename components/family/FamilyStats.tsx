'use client';

import { FamilyMember } from '@/types/family';
import { Card, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Trophy, Target, Star, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FamilyStatsProps {
  members: FamilyMember[];
  getMemberStats: (memberId: string) => {
    completed: number;
    total: number;
    completionRate: number;
    totalPoints: number;
    pending: number;
  };
  touchMode?: boolean;
  className?: string;
}

export function FamilyStats({
  members,
  getMemberStats,
  touchMode = false,
  className
}: FamilyStatsProps) {
  // Calculate family-wide stats
  const familyStats = members.reduce((acc, member) => {
    const stats = getMemberStats(member.id);
    acc.totalCompleted += stats.completed;
    acc.totalHabits += stats.total;
    acc.totalPoints += stats.totalPoints;
    acc.totalPending += stats.pending;
    return acc;
  }, {
    totalCompleted: 0,
    totalHabits: 0,
    totalPoints: 0,
    totalPending: 0
  });
  
  const familyCompletionRate = familyStats.totalHabits > 0 
    ? (familyStats.totalCompleted / familyStats.totalHabits) * 100 
    : 0;
  
  // Find top performer
  const topPerformer = members.reduce((top, member) => {
    const stats = getMemberStats(member.id);
    const topStats = getMemberStats(top.id);
    return stats.completionRate > topStats.completionRate ? member : top;
  }, members[0]);
  
  // Calculate team streaks
  const teamStreak = Math.min(...members.map(m => m.stats.currentStreak));
  const longestTeamStreak = Math.max(...members.map(m => m.stats.longestStreak));
  
  return (
    <Card className={cn(
      "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg",
      className
    )}>
      <CardContent className={cn(
        touchMode ? "p-6" : "p-4"
      )}>
        {/* Overall Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className={cn(
              "font-bold text-gray-900 flex items-center",
              touchMode ? "text-2xl" : "text-lg"
            )}>
              <Trophy className={cn(
                "mr-2 text-yellow-600",
                touchMode ? "w-7 h-7" : "w-5 h-5"
              )} />
              Family Progress Today
            </h3>
            <div className={cn(
              "text-right",
              touchMode ? "text-xl" : "text-lg"
            )}>
              <span className="font-bold text-blue-600">
                {familyStats.totalCompleted}
              </span>
              <span className="text-gray-500 mx-1">/</span>
              <span className="font-bold text-gray-900">
                {familyStats.totalHabits}
              </span>
            </div>
          </div>
          
          <Progress 
            value={familyCompletionRate} 
            className={cn(
              "w-full bg-white",
              touchMode ? "h-4" : "h-3"
            )}
          />
          
          <div className="flex justify-between mt-2">
            <span className={cn(
              "text-gray-600",
              touchMode ? "text-base" : "text-sm"
            )}>
              {Math.round(familyCompletionRate)}% Complete
            </span>
            <span className={cn(
              "text-gray-600",
              touchMode ? "text-base" : "text-sm"
            )}>
              {familyStats.totalPending} remaining
            </span>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className={cn(
          "grid gap-4",
          touchMode ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-4"
        )}>
          {/* Total Points */}
          <div className="text-center">
            <div className={cn(
              "font-bold text-purple-600",
              touchMode ? "text-3xl" : "text-2xl"
            )}>
              {familyStats.totalPoints}
            </div>
            <div className={cn(
              "text-gray-600 flex items-center justify-center",
              touchMode ? "text-base" : "text-sm"
            )}>
              <Star className="w-4 h-4 mr-1 text-purple-500" />
              Total Points
            </div>
          </div>
          
          {/* Team Streak */}
          <div className="text-center">
            <div className={cn(
              "font-bold text-green-600",
              touchMode ? "text-3xl" : "text-2xl"
            )}>
              {teamStreak}
            </div>
            <div className={cn(
              "text-gray-600 flex items-center justify-center",
              touchMode ? "text-base" : "text-sm"
            )}>
              <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
              Team Streak
            </div>
          </div>
          
          {/* Active Members */}
          <div className="text-center">
            <div className={cn(
              "font-bold text-blue-600",
              touchMode ? "text-3xl" : "text-2xl"
            )}>
              {members.length}
            </div>
            <div className={cn(
              "text-gray-600 flex items-center justify-center",
              touchMode ? "text-base" : "text-sm"
            )}>
              <Target className="w-4 h-4 mr-1 text-blue-500" />
              Members
            </div>
          </div>
          
          {/* Completion Rate */}
          <div className="text-center">
            <div className={cn(
              "font-bold",
              familyCompletionRate >= 80 ? "text-green-600" : 
              familyCompletionRate >= 60 ? "text-yellow-600" : "text-red-600",
              touchMode ? "text-3xl" : "text-2xl"
            )}>
              {Math.round(familyCompletionRate)}%
            </div>
            <div className={cn(
              "text-gray-600",
              touchMode ? "text-base" : "text-sm"
            )}>
              Success Rate
            </div>
          </div>
        </div>
        
        {/* Top Performer */}
        {topPerformer && getMemberStats(topPerformer.id).completionRate > 0 && (
          <div className={cn(
            "mt-4 pt-4 border-t border-blue-200",
            touchMode && "mt-6 pt-6"
          )}>
            <div className="flex items-center justify-center space-x-2">
              <div className="text-center">
                <div className={cn(
                  "text-yellow-600 font-bold mb-1",
                  touchMode ? "text-lg" : "text-sm"
                )}>
                  🏆 Today's Champion
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div 
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm",
                      touchMode && "w-10 h-10 text-base"
                    )}
                    style={{ backgroundColor: topPerformer.color }}
                  >
                    {topPerformer.avatar}
                  </div>
                  <span className={cn(
                    "font-medium text-gray-900",
                    touchMode ? "text-lg" : "text-base"
                  )}>
                    {topPerformer.displayName}
                  </span>
                  <span className={cn(
                    "text-gray-500",
                    touchMode ? "text-base" : "text-sm"
                  )}>
                    {Math.round(getMemberStats(topPerformer.id).completionRate)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Motivational Messages */}
        {familyCompletionRate === 100 && (
          <div className={cn(
            "mt-4 p-3 bg-green-100 border border-green-200 rounded-lg text-center",
            touchMode && "mt-6 p-4"
          )}>
            <div className={cn(
              "text-green-800 font-bold",
              touchMode ? "text-xl" : "text-lg"
            )}>
              🎉 Perfect Day! Everyone completed their habits! 🎉
            </div>
          </div>
        )}
        
        {familyCompletionRate >= 80 && familyCompletionRate < 100 && (
          <div className={cn(
            "mt-4 p-3 bg-blue-100 border border-blue-200 rounded-lg text-center",
            touchMode && "mt-6 p-4"
          )}>
            <div className={cn(
              "text-blue-800 font-medium",
              touchMode ? "text-lg" : "text-base"
            )}>
              ⭐ Amazing work! You're almost there! ⭐
            </div>
          </div>
        )}
        
        {familyCompletionRate < 50 && familyStats.totalHabits > 0 && (
          <div className={cn(
            "mt-4 p-3 bg-yellow-100 border border-yellow-200 rounded-lg text-center",
            touchMode && "mt-6 p-4"
          )}>
            <div className={cn(
              "text-yellow-800 font-medium",
              touchMode ? "text-lg" : "text-base"
            )}>
              💪 Keep going! Every habit completed is a victory! 💪
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}