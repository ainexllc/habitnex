'use client';

import { FamilyMember } from '@/types/family';
import { Card, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Trophy, Target, Star, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { familyText, familyIcons, familyProgress, familyAlerts, familyAnimations } from '@/lib/familyThemes';

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
      "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800 shadow-lg dark:shadow-blue-900/10",
      familyAnimations.fade,
      className
    )}>
      <CardContent className={cn(
        touchMode ? "p-6" : "p-4"
      )}>
        {/* Overall Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className={cn(
              familyText.primary,
              "font-bold flex items-center",
              touchMode ? "text-2xl" : "text-lg"
            )}>
              <Trophy className={cn(
                "mr-2 text-yellow-600 dark:text-yellow-500",
                touchMode ? "w-7 h-7" : "w-5 h-5"
              )} />
              Family Progress Today
            </h3>
            <div className={cn(
              "text-right",
              touchMode ? "text-xl" : "text-lg"
            )}>
              <span className={cn("font-bold", familyProgress.text.primary)}>
                {familyStats.totalCompleted}
              </span>
              <span className={cn("mx-1", familyText.muted)}>/</span>
              <span className={cn("font-bold", familyText.primary)}>
                {familyStats.totalHabits}
              </span>
            </div>
          </div>
          
          <Progress 
            value={familyCompletionRate} 
            className={cn(
              "w-full bg-white dark:bg-gray-700",
              touchMode ? "h-4" : "h-3"
            )}
          />
          
          <div className="flex justify-between mt-2">
            <span className={cn(
              familyText.secondary,
              touchMode ? "text-base" : "text-sm"
            )}>
              {Math.round(familyCompletionRate)}% Complete
            </span>
            <span className={cn(
              familyText.secondary,
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
              "font-bold text-purple-600 dark:text-purple-400",
              touchMode ? "text-3xl" : "text-2xl"
            )}>
              {familyStats.totalPoints}
            </div>
            <div className={cn(
              familyText.secondary,
              "flex items-center justify-center",
              touchMode ? "text-base" : "text-sm"
            )}>
              <Star className="w-4 h-4 mr-1 text-purple-500 dark:text-purple-400" />
              Total Points
            </div>
          </div>
          
          {/* Team Streak */}
          <div className="text-center">
            <div className={cn(
              "font-bold text-green-600 dark:text-green-400",
              touchMode ? "text-3xl" : "text-2xl"
            )}>
              {teamStreak}
            </div>
            <div className={cn(
              familyText.secondary,
              "flex items-center justify-center",
              touchMode ? "text-base" : "text-sm"
            )}>
              <TrendingUp className="w-4 h-4 mr-1 text-green-500 dark:text-green-400" />
              Team Streak
            </div>
          </div>
          
          {/* Active Members */}
          <div className="text-center">
            <div className={cn(
              "font-bold text-blue-600 dark:text-blue-400",
              touchMode ? "text-3xl" : "text-2xl"
            )}>
              {members.length}
            </div>
            <div className={cn(
              familyText.secondary,
              "flex items-center justify-center",
              touchMode ? "text-base" : "text-sm"
            )}>
              <Target className="w-4 h-4 mr-1 text-blue-500 dark:text-blue-400" />
              Members
            </div>
          </div>
          
          {/* Completion Rate */}
          <div className="text-center">
            <div className={cn(
              "font-bold",
              familyCompletionRate >= 80 ? "text-green-600 dark:text-green-400" : 
              familyCompletionRate >= 60 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400",
              touchMode ? "text-3xl" : "text-2xl"
            )}>
              {Math.round(familyCompletionRate)}%
            </div>
            <div className={cn(
              familyText.secondary,
              touchMode ? "text-base" : "text-sm"
            )}>
              Success Rate
            </div>
          </div>
        </div>
        
        {/* Top Performer */}
        {topPerformer && getMemberStats(topPerformer.id).completionRate > 0 && (
          <div className={cn(
            "mt-4 pt-4 border-t border-blue-200 dark:border-blue-800",
            touchMode && "mt-6 pt-6"
          )}>
            <div className="flex items-center justify-center space-x-2">
              <div className="text-center">
                <div className={cn(
                  "text-yellow-600 dark:text-yellow-500 font-bold mb-1",
                  touchMode ? "text-lg" : "text-sm"
                )}>
                  🏆 Today's Champion
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div 
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg",
                      familyAnimations.hover,
                      touchMode && "w-10 h-10 text-base"
                    )}
                    style={{ backgroundColor: topPerformer.color }}
                  >
                    {topPerformer.avatar}
                  </div>
                  <span className={cn(
                    familyText.primary,
                    "font-medium",
                    touchMode ? "text-lg" : "text-base"
                  )}>
                    {topPerformer.displayName}
                  </span>
                  <span className={cn(
                    familyText.muted,
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
            familyAlerts.success,
            "mt-4 p-3 rounded-lg text-center",
            familyAnimations.bounce,
            touchMode && "mt-6 p-4"
          )}>
            <div className={cn(
              "font-bold",
              touchMode ? "text-xl" : "text-lg"
            )}>
              🎉 Perfect Day! Everyone completed their habits! 🎉
            </div>
          </div>
        )}
        
        {familyCompletionRate >= 80 && familyCompletionRate < 100 && (
          <div className={cn(
            familyAlerts.info,
            "mt-4 p-3 rounded-lg text-center",
            familyAnimations.pulse,
            touchMode && "mt-6 p-4"
          )}>
            <div className={cn(
              "font-medium",
              touchMode ? "text-lg" : "text-base"
            )}>
              ⭐ Amazing work! You're almost there! ⭐
            </div>
          </div>
        )}
        
        {familyCompletionRate < 50 && familyStats.totalHabits > 0 && (
          <div className={cn(
            familyAlerts.warning,
            "mt-4 p-3 rounded-lg text-center",
            familyAnimations.hover,
            touchMode && "mt-6 p-4"
          )}>
            <div className={cn(
              "font-medium",
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