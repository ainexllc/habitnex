'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  createWorkspaceChallenge,
  getWorkspaceChallenges,
  startChallenge,
  completeChallenge,
  joinChallenge,
  getChallengeProgress,
  getChallengeDailyProgress
} from '@/lib/workspaceDb';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import type { WorkspaceChallenge } from '@/types/workspace';
import { useToast } from '@/hooks/useToast';

interface ChallengeProgress {
  [memberId: string]: number;
}

export function useWorkspaceChallenges() {
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  
  const [challenges, setChallenges] = useState<WorkspaceChallenge[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<WorkspaceChallenge[]>([]);
  const [upcomingChallenges, setUpcomingChallenges] = useState<WorkspaceChallenge[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<WorkspaceChallenge[]>([]);
  const [challengeProgress, setChallengeProgress] = useState<Record<string, ChallengeProgress>>({});
  const [dailyProgress, setDailyProgress] = useState<Record<string, Record<string, { date: string; count: number }[]>>>({});
  const [loading, setLoading] = useState(false);

  const loadChallenges = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    
    try {
      setLoading(true);
      
      // Load all challenges
      const allChallenges = await getWorkspaceChallenges(currentWorkspace.id);
      setChallenges(allChallenges);
      
      // Separate by status
      setActiveChallenges(allChallenges.filter(c => c.status === 'active'));
      setUpcomingChallenges(allChallenges.filter(c => c.status === 'upcoming'));
      setCompletedChallenges(allChallenges.filter(c => c.status === 'completed'));
      
      // Load progress for active challenges
      const progressMap: Record<string, ChallengeProgress> = {};
      const dailyMap: Record<string, Record<string, { date: string; count: number }[]>> = {};
      for (const challenge of allChallenges.filter(c => c.status === 'active')) {
        const progress = await getChallengeProgress(currentWorkspace.id, challenge.id);
        progressMap[challenge.id] = progress;
        try {
          const daily = await getChallengeDailyProgress(currentWorkspace.id, challenge.id);
          dailyMap[challenge.id] = daily;
        } catch (e) {
          // ignore breakdown errors; keep main UI functioning
        }
      }
      setChallengeProgress(progressMap);
      setDailyProgress(dailyMap);
      
    } catch (error) {
      console.error('Failed to load challenges:', error);
      toast({
        title: 'Error',
        description: 'Failed to load family challenges',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id, toast]);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  const createChallenge = useCallback(async (challengeData: Omit<WorkspaceChallenge, 'id' | 'workspaceId' | 'createdAt' | 'status'>) => {
    if (!currentWorkspace?.id) return null;
    
    try {
      setLoading(true);
      const challengeId = await createWorkspaceChallenge(currentWorkspace.id, challengeData);
      
      toast({
        title: 'Challenge Created!',
        description: `${challengeData.name} has been created successfully.`,
      });
      
      await loadChallenges(); // Refresh challenges
      return challengeId;
    } catch (error) {
      console.error('Failed to create challenge:', error);
      toast({
        title: 'Error',
        description: 'Failed to create challenge',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id, toast, loadChallenges]);

  const startChallengeById = useCallback(async (challengeId: string) => {
    if (!currentWorkspace?.id) return;
    
    try {
      setLoading(true);
      await startChallenge(currentWorkspace.id, challengeId);
      
      toast({
        title: 'Challenge Started!',
        description: 'The challenge is now active. Good luck everyone!',
      });
      
      await loadChallenges(); // Refresh challenges
    } catch (error) {
      console.error('Failed to start challenge:', error);
      toast({
        title: 'Error',
        description: 'Failed to start challenge',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id, toast, loadChallenges]);

  const completeChallengeById = useCallback(async (challengeId: string, winnerId?: string) => {
    if (!currentWorkspace?.id) return;
    
    try {
      setLoading(true);
      await completeChallenge(currentWorkspace.id, challengeId, winnerId);
      
      const challenge = challenges.find(c => c.id === challengeId);
      const winnerName = winnerId ? currentWorkspace.members.find(m => m.id === winnerId)?.displayName : 'Everyone';
      
      toast({
        title: 'Challenge Complete!',
        description: `${challenge?.name} is complete! Winner: ${winnerName}`,
      });
      
      await loadChallenges(); // Refresh challenges
    } catch (error) {
      console.error('Failed to complete challenge:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete challenge',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id, currentWorkspace?.members, challenges, toast, loadChallenges]);

  const joinChallengeById = useCallback(async (challengeId: string, memberId: string) => {
    if (!currentWorkspace?.id) return;
    
    try {
      setLoading(true);
      await joinChallenge(currentWorkspace.id, challengeId, memberId);
      
      const challenge = challenges.find(c => c.id === challengeId);
      const memberName = currentWorkspace.members.find(m => m.id === memberId)?.displayName;
      
      toast({
        title: 'Joined Challenge!',
        description: `${memberName} has joined ${challenge?.name}`,
      });
      
      await loadChallenges(); // Refresh challenges
    } catch (error) {
      console.error('Failed to join challenge:', error);
      toast({
        title: 'Error',
        description: 'Failed to join challenge',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id, currentWorkspace?.members, challenges, toast, loadChallenges]);

  const refreshProgress = useCallback(async (challengeId: string) => {
    if (!currentWorkspace?.id) return;
    
    try {
      const progress = await getChallengeProgress(currentWorkspace.id, challengeId);
      setChallengeProgress(prev => ({
        ...prev,
        [challengeId]: progress
      }));
      try {
        const daily = await getChallengeDailyProgress(currentWorkspace.id, challengeId);
        setDailyProgress(prev => ({
          ...prev,
          [challengeId]: daily
        }));
      } catch (e) {}
    } catch (error) {
      console.error('Failed to refresh challenge progress:', error);
    }
  }, [currentWorkspace?.id]);

  // Duplicate challenge with new dates and status reset
  const duplicateChallenge = useCallback(async (source: WorkspaceChallenge, overrides?: Partial<WorkspaceChallenge>) => {
    if (!currentWorkspace?.id) return null;
    const todayStr = new Date().toISOString().split('T')[0];
    const duration = overrides?.duration ?? source.duration;
    const endStr = new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const payload = {
      name: overrides?.name ?? `${source.name} (Copy)` ,
      description: overrides?.description ?? source.description,
      emoji: overrides?.emoji ?? source.emoji,
      type: overrides?.type ?? source.type,
      habitIds: overrides?.habitIds ?? source.habitIds,
      participantIds: overrides?.participantIds ?? source.participantIds,
      target: overrides?.target ?? source.target,
      duration,
      bonusPoints: overrides?.bonusPoints ?? source.bonusPoints,
      startDate: todayStr,
      endDate: endStr,
      winnerReward: overrides?.winnerReward ?? source.winnerReward,
      participationReward: overrides?.participationReward ?? source.participationReward,
      createdBy: source.createdBy
    } as Omit<WorkspaceChallenge, 'id' | 'workspaceId' | 'createdAt' | 'status'>;
    try {
      setLoading(true);
      const id = await createWorkspaceChallenge(currentWorkspace.id, payload);
      await loadChallenges();
      toast({ title: 'Challenge Duplicated', description: `${payload.name} created.` });
      return id;
    } catch (e) {
      console.error('Duplicate challenge failed', e);
      toast({ title: 'Error', description: 'Failed to duplicate challenge', variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id, loadChallenges, toast]);

  // Restart completed challenge (duplicate with same name + reset progress)
  const restartChallenge = useCallback(async (challenge: WorkspaceChallenge) => {
    return duplicateChallenge(challenge, { name: `${challenge.name} (Restart)` });
  }, [duplicateChallenge]);

  // Helper functions
  const getChallengeById = useCallback((challengeId: string) => {
    return challenges.find(c => c.id === challengeId);
  }, [challenges]);

  const getChallengesByType = useCallback((type: 'streak' | 'total' | 'race' | 'collaboration') => {
    return challenges.filter(c => c.type === type);
  }, [challenges]);

  const getMemberChallenges = useCallback((memberId: string) => {
    return challenges.filter(c => c.participantIds.includes(memberId));
  }, [challenges]);

  const getChallengeLeader = useCallback((challengeId: string) => {
    const progress = challengeProgress[challengeId];
    if (!progress || Object.keys(progress).length === 0) return null;
    
    const sortedParticipants = Object.entries(progress)
      .sort(([, a], [, b]) => b - a);
    
    return sortedParticipants[0]?.[0] || null;
  }, [challengeProgress]);

  const isChallengeExpiring = useCallback((challenge: WorkspaceChallenge) => {
    if (challenge.status !== 'active') return false;
    
    const endDate = new Date(challenge.endDate);
    const now = new Date();
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysLeft <= 2; // Expiring within 2 days
  }, []);

  const getChallengeCompletionRate = useCallback((challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    const progress = challengeProgress[challengeId];
    
    if (!challenge || !progress) return 0;
    
    const totalParticipants = challenge.participantIds.length;
    const completedParticipants = Object.values(progress).filter(p => p >= challenge.target).length;
    
    return totalParticipants > 0 ? (completedParticipants / totalParticipants) * 100 : 0;
  }, [challenges, challengeProgress]);

  return {
    // Data
    challenges,
    activeChallenges,
    upcomingChallenges,
    completedChallenges,
    challengeProgress,
    
    // State
    loading,
    
    // Actions
    createChallenge,
    startChallenge: startChallengeById,
    completeChallenge: completeChallengeById,
    joinChallenge: joinChallengeById,
    refreshProgress,
    
    // Helper functions
    getChallengeById,
    getChallengesByType,
    getMemberChallenges,
    getChallengeLeader,
    isChallengeExpiring,
    getChallengeCompletionRate,
    dailyProgress,
    duplicateChallenge,
    restartChallenge,
    
    // Refresh
    loadChallenges
  };
}
// Backward compatibility exports
/** @deprecated Use useWorkspaceChallenges instead */
export const useFamilyChallenges = useWorkspaceChallenges;
