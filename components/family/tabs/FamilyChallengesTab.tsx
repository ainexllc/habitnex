'use client';

import { useState } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useFamilyChallenges } from '@/hooks/useFamilyChallenges';
import { useFamilyHabits } from '@/hooks/useFamilyHabits';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { 
  Trophy, 
  Plus, 
  Target, 
  Users, 
  Calendar,
  Play,
  CheckCircle,
  Clock,
  Zap,
  Flag,
  Crown,
  Timer,
  UserCheck,
  Award,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Star,
  Flame,
  Medal,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FamilyChallenge, ChallengeType } from '@/types/family';

interface FamilyChallengesTabProps {
  onCreateChallenge?: () => void;
}

export function FamilyChallengesTab({ onCreateChallenge }: FamilyChallengesTabProps = {}) {
  const { currentFamily, currentMember, isParent } = useFamily();
  const { 
    activeChallenges, 
    upcomingChallenges, 
    completedChallenges, 
    challengeProgress,
    startChallenge,
    completeChallenge,
    joinChallenge,
    getChallengeLeader,
    isChallengeExpiring,
    getChallengeCompletionRate,
    loading 
  } = useFamilyChallenges();
  const { habits } = useFamilyHabits();
  
  const [selectedTab, setSelectedTab] = useState<'active' | 'upcoming' | 'completed'>('active');

  if (!currentFamily || !currentMember) {
    return null;
  }

  const challengeTypeData: Record<ChallengeType, { icon: React.ReactNode; color: string; bgGradient: string; label: string }> = {
    streak: {
      icon: <Flame className="w-5 h-5" />,
      color: 'text-orange-600 dark:text-orange-400',
      bgGradient: 'from-orange-500 to-red-500',
      label: 'Streak'
    },
    total: {
      icon: <Target className="w-5 h-5" />,
      color: 'text-blue-600 dark:text-blue-400',
      bgGradient: 'from-blue-500 to-indigo-500',
      label: 'Total'
    },
    race: {
      icon: <Flag className="w-5 h-5" />,
      color: 'text-purple-600 dark:text-purple-400',
      bgGradient: 'from-purple-500 to-pink-500',
      label: 'Race'
    },
    collaboration: {
      icon: <Users className="w-5 h-5" />,
      color: 'text-green-600 dark:text-green-400',
      bgGradient: 'from-green-500 to-teal-500',
      label: 'Team'
    }
  };

  const getChallengeList = () => {
    switch (selectedTab) {
      case 'active':
        return activeChallenges;
      case 'upcoming':
        return upcomingChallenges;
      case 'completed':
        return completedChallenges;
      default:
        return [];
    }
  };

  const renderChallengeCard = (challenge: FamilyChallenge) => {
    const progress = challengeProgress[challenge.id] || {};
    const leaderId = getChallengeLeader(challenge.id);
    const leader = currentFamily.members.find(m => m.id === leaderId);
    const isExpiring = isChallengeExpiring(challenge);
    const completionRate = getChallengeCompletionRate(challenge.id);
    const isParticipating = challenge.participantIds.includes(currentMember.id);
    const memberProgress = progress[currentMember.id] || 0;
    
    const challengeHabits = habits.filter(h => challenge.habitIds.includes(h.id));
    const daysLeft = Math.ceil((new Date(challenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const totalProgress = Object.values(progress).reduce((sum, val) => sum + (val as number), 0);
    const progressPercentage = Math.min((totalProgress / challenge.target) * 100, 100);

    return (
      <Card 
        key={challenge.id} 
        className={cn(
          "group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border-0 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]",
          isExpiring && challenge.status === 'active' && "ring-2 ring-orange-400 ring-offset-2 dark:ring-orange-500"
        )}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, ${challengeTypeData[challenge.type].color} 0%, transparent 50%)`,
          }} />
        </div>

        {/* Status Ribbon */}
        {challenge.status === 'active' && (
          <div className="absolute top-4 -right-12 transform rotate-45 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold py-1 px-12 shadow-md">
            ACTIVE
          </div>
        )}

        <CardHeader className="p-6 pb-4 relative">
          <div className="flex items-start justify-between">
            {/* Challenge Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                {/* Emoji with animation */}
                <div className="relative">
                  <div className="text-5xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                    {challenge.emoji}
                  </div>
                  {challenge.status === 'active' && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
                
                {/* Title and Type */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-relaxed">
                    {challenge.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r text-white",
                      challengeTypeData[challenge.type].bgGradient
                    )}>
                      {challengeTypeData[challenge.type].icon}
                      {challengeTypeData[challenge.type].label}
                    </span>
                    {isExpiring && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white animate-pulse">
                        <Timer className="w-3 h-3" />
                        {daysLeft}d left
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 text-sm leading-loose mt-3">
                {challenge.description}
              </p>
            </div>

            {/* Points Badge */}
            {challenge.bonusPoints > 0 && (
              <div className="flex flex-col items-center justify-center bg-gradient-to-br from-yellow-400 to-amber-500 text-white rounded-xl px-4 py-3 ml-4 shadow-lg flex-shrink-0">
                <Award className="w-6 h-6 mb-2" />
                <span className="text-sm font-bold">+{challenge.bonusPoints}</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-2 space-y-5">
          {/* Progress Section */}
          {challenge.status === 'active' && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Progress
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {totalProgress}/{challenge.target}
                </span>
              </div>
              
              <Progress 
                value={progressPercentage} 
                className="h-3 bg-gray-200 dark:bg-gray-700"
                style={{
                  background: `linear-gradient(to right, ${progressPercentage > 75 ? '#10b981' : progressPercentage > 50 ? '#3b82f6' : progressPercentage > 25 ? '#f59e0b' : '#ef4444'} ${progressPercentage}%, transparent ${progressPercentage}%)`
                }}
              />

              {/* Leader Board Mini */}
              {leader && (
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Leader:</span>
                    <span className="text-xs font-semibold" style={{ color: leader.color }}>
                      {leader.displayName}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {progress[leader.id] || 0} points
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Participants */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex -space-x-1">
              {challenge.participantIds.slice(0, 5).map((participantId, index) => {
                const participant = currentFamily.members.find(m => m.id === participantId);
                if (!participant) return null;
                return (
                  <div
                    key={participantId}
                    className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-bold text-white shadow-sm"
                    style={{ 
                      backgroundColor: participant.color,
                      zIndex: 5 - index
                    }}
                    title={participant.displayName}
                  >
                    {participant.displayName[0]}
                  </div>
                );
              })}
              {challenge.participantIds.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-200">
                  +{challenge.participantIds.length - 5}
                </div>
              )}
            </div>

            {/* Challenge Info */}
            <div className="flex items-center gap-5 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{challenge.duration} days</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                <span>{challenge.target} goal</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {/* Parent Controls */}
            {isParent && challenge.status === 'upcoming' && (
              <Button
                onClick={() => startChallenge(challenge.id)}
                disabled={loading}
                size="sm"
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Play className="w-4 h-4 mr-1" />
                Start Challenge
              </Button>
            )}
            
            {isParent && challenge.status === 'active' && completionRate >= 100 && (
              <Button
                onClick={() => completeChallenge(challenge.id, leaderId || undefined)}
                disabled={loading}
                size="sm"
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Complete Challenge
              </Button>
            )}

            {/* Member Controls */}
            {!isParent && challenge.status === 'upcoming' && !isParticipating && (
              <Button
                onClick={() => joinChallenge(challenge.id, currentMember.id)}
                disabled={loading}
                size="sm"
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <UserCheck className="w-4 h-4 mr-1" />
                Join Challenge
              </Button>
            )}

            {/* View Details (for all) */}
            {challenge.status === 'active' && (
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                View Details
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="px-6 pb-8">
      {/* Tab Header - Enhanced */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3" style={{
            fontFamily: '"Henny Penny", cursive',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Family Challenges
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
            🏆 Compete, collaborate, and celebrate your achievements together
          </p>
          <div className="flex items-center gap-4">
            <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
              {activeChallenges.length} Active Challenges
            </span>
            <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
              {completedChallenges.length} Completed
            </span>
          </div>
        </div>
        
        {isParent && (
          <Button 
            onClick={onCreateChallenge}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Challenge
          </Button>
        )}
      </div>

      {/* Modern Tab Selector */}
      <div className="flex p-2 mb-10 bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-inner">
        {[
          { key: 'active', label: 'Active', icon: <Zap className="w-4 h-4" />, count: activeChallenges.length, color: 'from-green-500 to-emerald-500' },
          { key: 'upcoming', label: 'Upcoming', icon: <Clock className="w-4 h-4" />, count: upcomingChallenges.length, color: 'from-blue-500 to-indigo-500' },
          { key: 'completed', label: 'Completed', icon: <Trophy className="w-4 h-4" />, count: completedChallenges.length, color: 'from-yellow-500 to-orange-500' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key as any)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all duration-300",
              selectedTab === tab.key
                ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-[1.02]`
                : "text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            <span className={cn(
              "px-2.5 py-1 rounded-full text-xs",
              selectedTab === tab.key 
                ? "bg-white/20 text-white"
                : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Challenges Grid */}
      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        {getChallengeList().length === 0 ? (
          <div className="col-span-full text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full mb-6">
              <Trophy className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {selectedTab === 'active' ? 'No Active Challenges' :
               selectedTab === 'upcoming' ? 'No Upcoming Challenges' :
               'No Completed Challenges Yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              {selectedTab === 'active' ? 'Start a challenge to bring excitement and motivation to your family\'s habits!' :
               selectedTab === 'upcoming' ? 'Create new challenges to keep the momentum going!' :
               'Complete your first challenge to see it celebrated here!'}
            </p>
            {isParent && selectedTab !== 'completed' && (
              <Button 
                onClick={onCreateChallenge}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Create Your First Challenge
              </Button>
            )}
          </div>
        ) : (
          getChallengeList().map(renderChallengeCard)
        )}
      </div>
    </div>
  );
}