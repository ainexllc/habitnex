'use client';

import { useState } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useFamilyChallenges } from '@/hooks/useFamilyChallenges';
import { useFamilyHabits } from '@/hooks/useFamilyHabits';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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
  Award
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { FamilyChallenge, ChallengeType } from '@/types/family';

export function FamilyChallengesTab() {
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

  const challengeTypeIcons: Record<ChallengeType, React.ReactNode> = {
    streak: <Zap className="w-5 h-5" />,
    total: <Target className="w-5 h-5" />,
    race: <Flag className="w-5 h-5" />,
    collaboration: <Users className="w-5 h-5" />
  };

  const challengeTypeColors: Record<ChallengeType, string> = {
    streak: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
    total: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    race: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
    collaboration: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
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
    
    const challengeHabits = habits.filter(h => challenge.habitIds.includes(h.id));
    const daysLeft = Math.ceil((new Date(challenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return (
      <Card 
        key={challenge.id} 
        className={cn(
          "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-lg",
          isExpiring && challenge.status === 'active' ? "border-2 border-orange-300 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/20" : ""
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">{challenge.emoji}</div>
              <div className="flex-1">
                <CardTitle className="text-lg leading-tight text-gray-900 dark:text-white">{challenge.name}</CardTitle>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{challenge.description}</p>
                
                <div className="flex items-center space-x-2 mt-2">
                  <div className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1",
                    challengeTypeColors[challenge.type]
                  )}>
                    {challengeTypeIcons[challenge.type]}
                    <span className="capitalize">{challenge.type}</span>
                  </div>
                  
                  {isExpiring && (
                    <div className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium border border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800">
                      ⚠️ Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              challenge.status === 'active' ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300" :
              challenge.status === 'upcoming' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" :
              "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            )}>
              {challenge.status === 'active' ? 'Active' :
               challenge.status === 'upcoming' ? 'Upcoming' : 'Completed'}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Challenge Details */}
          <div className="space-y-3">
            {/* Target & Duration */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">Target: <strong>{challenge.target}</strong> {
                  challenge.type === 'streak' ? 'day streak' :
                  challenge.type === 'total' ? 'completions' :
                  challenge.type === 'race' ? 'completions' :
                  'team completions'
                }</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300">{challenge.duration} days</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 pt-2">
              {/* Parent Controls */}
              {isParent && (
                <>
                  {challenge.status === 'upcoming' && (
                    <Button
                      onClick={() => startChallenge(challenge.id)}
                      disabled={loading}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Start Challenge
                    </Button>
                  )}
                  
                  {challenge.status === 'active' && completionRate >= 100 && (
                    <Button
                      onClick={() => completeChallenge(challenge.id, leaderId || undefined)}
                      disabled={loading}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Complete Challenge
                    </Button>
                  )}
                </>
              )}

              {/* Member Controls */}
              {!isParent && challenge.status === 'upcoming' && !isParticipating && (
                <Button
                  onClick={() => joinChallenge(challenge.id, currentMember.id)}
                  disabled={loading}
                  size="sm"
                  variant="outline"
                >
                  <UserCheck className="w-4 h-4 mr-1" />
                  Join Challenge
                </Button>
              )}

              {/* Info for all */}
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 ml-auto">
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>{challenge.participantIds.length}</span>
                </div>
                {challenge.bonusPoints > 0 && (
                  <div className="flex items-center space-x-1">
                    <Award className="w-3 h-3" />
                    <span>+{challenge.bonusPoints}pts</span>
                  </div>
                )}
                {challenge.status === 'active' && (
                  <div className="flex items-center space-x-1">
                    <Timer className="w-3 h-3" />
                    <span>{daysLeft} days left</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      {/* Tab Header with Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Family Challenges</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Compete, collaborate, and celebrate together!</p>
        </div>
        
        {isParent && (
          <Link href="/family/challenges/create">
            <Button>
              <Plus className="w-5 h-5 mr-2" />
              Create Challenge
            </Button>
          </Link>
        )}
      </div>
      
      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{activeChallenges.length}</div>
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm">Active Challenges</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{upcomingChallenges.length}</div>
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm">Upcoming Challenges</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{completedChallenges.length}</div>
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-sm">Completed Challenges</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {[
          { key: 'active', label: 'Active', count: activeChallenges.length },
          { key: 'upcoming', label: 'Upcoming', count: upcomingChallenges.length },
          { key: 'completed', label: 'Completed', count: completedChallenges.length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key as any)}
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors",
              selectedTab === tab.key
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            )}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Challenges List */}
      <div className="space-y-4">
        {getChallengeList().length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {selectedTab === 'active' ? 'No Active Challenges' :
               selectedTab === 'upcoming' ? 'No Upcoming Challenges' :
               'No Completed Challenges'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {selectedTab === 'active' ? 'Start a challenge to get the family motivated!' :
               selectedTab === 'upcoming' ? 'Create some challenges to get started!' :
               'Complete some challenges to see them here!'}
            </p>
            {isParent && selectedTab !== 'completed' && (
              <Link href="/family/challenges/create">
                <Button>
                  <Plus className="w-5 h-5 mr-2" />
                  Create First Challenge
                </Button>
              </Link>
            )}
          </div>
        ) : (
          getChallengeList().map(renderChallengeCard)
        )}
      </div>
    </div>
  );
}