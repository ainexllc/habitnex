'use client';

import React, { useState, useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useFamilyChallenges } from '@/hooks/useFamilyChallenges';
import { useFamilyHabits } from '@/hooks/useFamilyHabits';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent } from '@/components/ui/Card';
import { DiceBearAvatar } from '@/components/ui/DiceBearAvatar';
import {
  Trophy,
  Target,
  Users,
  Zap,
  Flag,
  Clock,
  CalendarDays,
  Gift,
  Plus,
  X,
  CheckCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChallengeType, FamilyHabit } from '@/types/family';

interface ChallengeFormData {
  name: string;
  description: string;
  emoji: string;
  type: ChallengeType;
  habitIds: string[];
  participantIds: string[];
  target: number;
  duration: number;
  bonusPoints: number;
  startDate: string;
  endDate: string;
  winnerReward?: string;
  participationReward?: string;
}

interface CreateWorkspaceChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const challengeTemplates = [
  {
    id: 'week-streak',
    name: '7-Day Streak Challenge',
    description: 'Build consistency with a week-long habit streak',
    emoji: '🔥',
    type: 'streak' as ChallengeType,
    target: 7,
    duration: 7,
    bonusPoints: 50
  },
  {
    id: 'family-race',
    name: 'Family Habit Race',
    description: 'See who can complete their habits the most times',
    emoji: '🏃',
    type: 'race' as ChallengeType,
    target: 10,
    duration: 14,
    bonusPoints: 30
  },
  {
    id: 'team-total',
    name: 'Team 100 Challenge',
    description: 'Work together to reach 100 total completions',
    emoji: '💯',
    type: 'collaboration' as ChallengeType,
    target: 100,
    duration: 21,
    bonusPoints: 75
  },
  {
    id: 'habit-master',
    name: 'Habit Master Challenge',
    description: 'Complete habits 30 times in a month',
    emoji: '👑',
    type: 'total' as ChallengeType,
    target: 30,
    duration: 30,
    bonusPoints: 100
  }
];

const challengeEmojis = ['🏆', '🎯', '🔥', '⭐', '🚀', '💪', '🎪', '🌟', '⚡', '🎊', '🎉', '👑', '🏃', '💯', '🎮', '🎲'];

export function CreateWorkspaceChallengeModal({ isOpen, onClose }: CreateWorkspaceChallengeModalProps) {
  const { currentFamily, isParent } = useFamily();
  const { createChallenge } = useFamilyChallenges();
  const { habits } = useFamilyHabits();

  const [formData, setFormData] = useState<ChallengeFormData>({
    name: '',
    description: '',
    emoji: '🏆',
    type: 'total',
    habitIds: [],
    participantIds: [],
    target: 10,
    duration: 7,
    bonusPoints: 25,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    winnerReward: '',
    participationReward: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        emoji: '🏆',
        type: 'total',
        habitIds: [],
        participantIds: [],
        target: 10,
        duration: 7,
        bonusPoints: 25,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        winnerReward: '',
        participationReward: ''
      });
      setCurrentStep(1);
    }
  }, [isOpen]);

  const challengeTypeInfo = {
    streak: {
      icon: <Zap className="w-5 h-5" />,
      title: 'Streak Challenge',
      description: 'Build consistency by maintaining daily habit streaks',
      targetLabel: 'Streak length (days)',
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    },
    total: {
      icon: <Target className="w-5 h-5" />,
      title: 'Total Challenge',
      description: 'Complete habits a certain number of times',
      targetLabel: 'Total completions',
      color: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    race: {
      icon: <Flag className="w-5 h-5" />,
      title: 'Race Challenge',
      description: 'Compete to see who completes habits the most',
      targetLabel: 'Completions to win',
      color: 'bg-red-100 text-red-700 border-red-200'
    },
    collaboration: {
      icon: <Users className="w-5 h-5" />,
      title: 'Team Challenge',
      description: 'Work together to reach a collective goal',
      targetLabel: 'Team target',
      color: 'bg-green-100 text-green-700 border-green-200'
    }
  };

  const handleTemplateSelect = (template: typeof challengeTemplates[0]) => {
    setFormData(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      emoji: template.emoji,
      type: template.type,
      target: template.target,
      duration: template.duration,
      bonusPoints: template.bonusPoints,
      endDate: new Date(Date.now() + template.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));
    setCurrentStep(2);
  };

  const handleInputChange = (field: keyof ChallengeFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-calculate end date when duration changes
    if (field === 'duration' || field === 'startDate') {
      const startDate = field === 'startDate' ? value : formData.startDate;
      const duration = field === 'duration' ? value : formData.duration;
      const endDate = new Date(new Date(startDate).getTime() + (duration * 24 * 60 * 60 * 1000));
      setFormData(prev => ({
        ...prev,
        endDate: endDate.toISOString().split('T')[0]
      }));
    }
  };

  const toggleHabit = (habitId: string) => {
    setFormData(prev => ({
      ...prev,
      habitIds: prev.habitIds.includes(habitId)
        ? prev.habitIds.filter(id => id !== habitId)
        : [...prev.habitIds, habitId]
    }));
  };

  const toggleParticipant = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      participantIds: prev.participantIds.includes(memberId)
        ? prev.participantIds.filter(id => id !== memberId)
        : [...prev.participantIds, memberId]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || formData.habitIds.length === 0 || formData.participantIds.length === 0) {
      return;
    }

    try {
      setLoading(true);
      // Build challenge data without undefined values
      const challengeData: any = {
        name: formData.name,
        description: formData.description,
        emoji: formData.emoji,
        type: formData.type,
        habitIds: formData.habitIds,
        participantIds: formData.participantIds,
        target: formData.target,
        duration: formData.duration,
        bonusPoints: formData.bonusPoints,
        startDate: formData.startDate,
        endDate: formData.endDate,
        createdBy: currentFamily.members.find(m => m.userId === currentFamily.createdBy)?.id || ''
      };
      
      // Only add optional fields if they have values
      if (formData.winnerReward && formData.winnerReward.trim()) {
        challengeData.winnerReward = formData.winnerReward;
      }
      if (formData.participationReward && formData.participationReward.trim()) {
        challengeData.participationReward = formData.participationReward;
      }
      
      const challengeId = await createChallenge(challengeData);

      if (challengeId) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to create challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = (step: number) => {
    switch (step) {
      case 1:
        return true; // Can always start
      case 2:
        return formData.name.trim().length > 0 && formData.description.trim().length > 0;
      case 3:
        return formData.habitIds.length > 0;
      case 4:
        return formData.participantIds.length > 0;
      default:
        return true;
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    onClose();
  };

  if (!currentFamily || !isParent) {
    return null;
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <div className="text-center mb-6">
              <Trophy className="w-12 h-12 mx-auto text-purple-600 dark:text-purple-400 mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Family Challenge</h3>
              <p className="text-gray-600 dark:text-gray-400">Set up a fun challenge to motivate your family!</p>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Choose a Challenge Template</h2>
                <p className="text-gray-600 dark:text-gray-400">Select a pre-made template or create a custom challenge</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {challengeTemplates.map(template => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-600"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="text-2xl">{template.emoji}</div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                          <div className={cn(
                            "px-2 py-1 rounded text-xs font-medium inline-flex items-center space-x-1 mt-1",
                            challengeTypeInfo[template.type].color
                          )}>
                            {challengeTypeInfo[template.type].icon}
                            <span>{challengeTypeInfo[template.type].title}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{template.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{template.duration} days</span>
                        <span>Target: {template.target}</span>
                        <span>+{template.bonusPoints} bonus points</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center pt-4">
                <Button
                  onClick={() => setCurrentStep(2)}
                  variant="outline"
                >
                  Create Custom Challenge
                </Button>
              </div>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <div className="text-center mb-6">
              <Target className="w-12 h-12 mx-auto text-purple-600 dark:text-purple-400 mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Challenge Details</h3>
              <p className="text-gray-600 dark:text-gray-400">Customize your challenge name, type, and goals</p>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Challenge Name
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter challenge name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the challenge goals and rules"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Emoji
                    </label>
                    <div className="grid grid-cols-8 gap-2">
                      {challengeEmojis.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleInputChange('emoji', emoji)}
                          className={cn(
                            "p-2 rounded-lg text-xl hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors",
                            formData.emoji === emoji ? "bg-purple-200 dark:bg-purple-900/40" : "bg-gray-100 dark:bg-gray-800"
                          )}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Challenge Type
                    </label>
                    <div className="space-y-2">
                      {Object.entries(challengeTypeInfo).map(([type, info]) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleInputChange('type', type)}
                          className={cn(
                            "w-full p-3 rounded-lg border text-left transition-all",
                            formData.type === type
                              ? "border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                          )}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            {info.icon}
                            <span className="font-medium text-gray-900 dark:text-white">{info.title}</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{info.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {challengeTypeInfo[formData.type].targetLabel}
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.target}
                        onChange={(e) => handleInputChange('target', parseInt(e.target.value))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Duration (days)
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="365"
                        value={formData.duration}
                        onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bonus Points
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.bonusPoints}
                      onChange={(e) => handleInputChange('bonusPoints', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="flex-1"
                  disabled={!canProceed(2)}
                >
                  Next: Select Habits
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </>
        );

      case 3:
        return (
          <>
            <div className="text-center mb-6">
              <Target className="w-12 h-12 mx-auto text-purple-600 dark:text-purple-400 mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Challenge Habits</h3>
              <p className="text-gray-600 dark:text-gray-400">Choose which habits will be part of this challenge</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                {habits.filter(h => h.isActive).map(habit => {
                  const isSelected = formData.habitIds.includes(habit.id);
                  return (
                    <label key={habit.id} className="cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleHabit(habit.id)}
                        className="sr-only"
                      />
                      <div className={cn(
                        "p-4 border-2 rounded-lg flex items-center space-x-4",
                        isSelected
                          ? 'border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      )}>
                        <div
                          className="text-2xl"
                          style={{
                            fontFamily: '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif',
                            fontSize: '24px',
                            fontWeight: '400'
                          }}
                        >
                          {habit.emoji}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">{habit.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {habit.frequency === 'daily' ? 'Daily' :
                             habit.frequency === 'weekly' ? 'Weekly' :
                             `Every ${habit.intervalDays} days`}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {habit.basePoints} pts
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="flex-1"
                  disabled={!canProceed(3)}
                >
                  Next: Choose Participants
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </>
        );

      case 4:
        return (
          <>
            <div className="text-center mb-6">
              <Users className="w-12 h-12 mx-auto text-purple-600 dark:text-purple-400 mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Choose Participants</h3>
              <p className="text-gray-600 dark:text-gray-400">Select family members to participate in this challenge</p>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-3">
                {currentFamily.members.filter(m => m.isActive).map((member) => (
                  <label key={member.id} className="cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.participantIds.includes(member.id)}
                      onChange={() => toggleParticipant(member.id)}
                      className="sr-only"
                    />
                    <div className={cn(
                      "p-4 border-2 rounded-lg flex items-center space-x-3",
                      formData.participantIds.includes(member.id)
                        ? 'border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    )}>
                      {member.avatarStyle && member.avatarSeed ? (
                        <DiceBearAvatar
                          seed={member.avatarSeed}
                          style={member.avatarStyle}
                          size={48}
                          className="border-2 border-white shadow-sm"
                          backgroundColor={member.color}
                          fallbackEmoji={member.avatar}
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: member.color }}
                        >
                          {member.avatar}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{member.displayName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{member.role}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(3)}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="flex-1"
                  disabled={!canProceed(4)}
                >
                  Review & Create
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </>
        );

      case 5:
        return (
          <>
            <div className="text-center mb-6">
              <CheckCircle className="w-12 h-12 mx-auto text-green-600 dark:text-green-400 mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Review Your Challenge</h3>
              <p className="text-gray-600 dark:text-gray-400">Make sure everything looks good before creating</p>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="text-4xl">{formData.emoji}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{formData.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{formData.description}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Type:</span>
                      <span className="ml-2 font-medium">{challengeTypeInfo[formData.type].title}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Target:</span>
                      <span className="ml-2 font-medium">{formData.target} {challengeTypeInfo[formData.type].targetLabel.split('(')[0].trim().toLowerCase()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                      <span className="ml-2 font-medium">{formData.duration} days</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Bonus Points:</span>
                      <span className="ml-2 font-medium">{formData.bonusPoints}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Challenge Habits:</div>
                    <div className="flex flex-wrap gap-2">
                      {formData.habitIds.map((habitId) => {
                        const habit = habits.find(h => h.id === habitId);
                        return habit ? (
                          <div
                            key={habit.id}
                            className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900/20"
                          >
                            <span
                              style={{
                                fontFamily: '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif',
                                fontSize: '16px',
                                fontWeight: '400'
                              }}
                            >
                              {habit.emoji}
                            </span>
                            <span className="text-purple-700 dark:text-purple-300">{habit.name}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Participants:</div>
                    <div className="flex flex-wrap gap-2">
                      {formData.participantIds.map((memberId) => {
                        const member = currentFamily.members.find(m => m.id === memberId);
                        return member ? (
                          <div
                            key={member.id}
                            className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm"
                            style={{ backgroundColor: `${member.color}20`, color: member.color }}
                          >
                            <span>{member.avatar}</span>
                            <span>{member.displayName}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(4)}
                  className="flex-1"
                  disabled={loading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  disabled={loading || formData.habitIds.length === 0 || formData.participantIds.length === 0}
                >
                  {loading ? 'Creating...' : 'Create Challenge'}
                  <Plus className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Family Challenge"
      size="xl"
    >
      {/* Progress Steps */}
      <div className="flex items-center space-x-4 mb-8">
        {[
          { step: 1, title: 'Choose Type' },
          { step: 2, title: 'Challenge Details' },
          { step: 3, title: 'Select Habits' },
          { step: 4, title: 'Choose Participants' },
          { step: 5, title: 'Review & Create' }
        ].map(({ step, title }) => (
          <div key={step} className="flex items-center">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
              currentStep >= step ? "bg-purple-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            )}>
              {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
            </div>
            <span className={cn(
              "ml-2 text-sm font-medium",
              currentStep >= step ? "text-purple-600 dark:text-purple-400" : "text-gray-600 dark:text-gray-400"
            )}>
              {title}
            </span>
            {step < 5 && <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600 ml-4" />}
          </div>
        ))}
      </div>

      {renderStepContent()}
    </Modal>
  );
}
