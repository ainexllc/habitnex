'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFamily } from '@/contexts/FamilyContext';
import { useFamilyChallenges } from '@/hooks/useFamilyChallenges';
import { useFamilyHabits } from '@/hooks/useFamilyHabits';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DiceBearAvatar } from '@/components/ui/DiceBearAvatar';
import { CreateFamilyHabitModal } from '@/components/family/CreateFamilyHabitModal';
import {
  ArrowLeft,
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
  CheckCircle
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

export default function CreateChallengePage() {
  const router = useRouter();
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
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showCreateHabitModal, setShowCreateHabitModal] = useState(false);

  if (!currentFamily || !isParent) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-bold mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-4">Only parents can create family challenges.</p>
              <Link href="/family/challenges">
                <Button>Back to Challenges</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

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
      const challengeId = await createChallenge({
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
        winnerReward: formData.winnerReward || undefined,
        participationReward: formData.participationReward || undefined,
        createdBy: currentFamily.members.find(m => m.userId === currentFamily.createdBy)?.id || ''
      });

      if (challengeId) {
        router.push('/family/challenges');
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

  // Build adventurer avatar options from stored avatarConfig so challenges page matches other displays
  const getAvatarOptions = (member: any) => {
    const cfg = member.avatarConfig || {};
    const addHash = (c?: string) => (c ? (c.startsWith('#') ? c : `#${c}`) : c);
    const opts: any = {};

    // Only add options if they have values
    if (cfg.skinColor || member.avatarSkinColor) {
      opts.skinColor = [addHash(cfg.skinColor || member.avatarSkinColor)];
    }
    if (cfg.mouthType || member.avatarMouth) {
      opts.mouth = [cfg.mouthType || member.avatarMouth];
    }
    if (cfg.hairColor || member.avatarHairColor) {
      opts.hairColor = [addHash(cfg.hairColor || member.avatarHairColor)];
    }

    // Get hair probability - use new format or fallback to old
    const hairProb = member.hairProbability ?? cfg.hairProbability ?? 100;
    if (hairProb >= 50) {
      opts.hair = ['short01', 'short02', 'short03', 'short04', 'short05', 'long01', 'long02', 'long03'];
    }

    // Get glasses probability and set options
    const glassesProb = member.glassesProbability ?? cfg.glassesProbability ?? 50;
    if (glassesProb >= 50) {
      opts.accessories = ['prescription01', 'prescription02', 'round', 'sunglasses'];
    }

    // Get earrings probability and set options
    const earringsProb = member.earringsProbability ?? cfg.earringsProbability ?? 30;
    if (earringsProb >= 50) {
      opts.earrings = ['variant01', 'variant02', 'variant03'];
    }

    // Get features probability and set options
    const featuresProb = member.featuresProbability ?? cfg.featuresProbability ?? 10;
    if (featuresProb >= 50) {
      opts.facialHair = ['variant01', 'variant02', 'variant03', 'variant04'];
    }

    // Set transparent background for the avatar
    opts.backgroundColor = ['transparent'];

    return opts;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/family/challenges">
                <Button variant="ghost" className="flex items-center mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Challenges
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Create Family Challenge</h1>
              <p className="text-gray-600">Set up a fun challenge to motivate your family!</p>
            </div>
          </div>

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
                  currentStep >= step ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-600"
                )}>
                  {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
                </div>
                <span className={cn(
                  "ml-2 text-sm font-medium",
                  currentStep >= step ? "text-purple-600" : "text-gray-600"
                )}>
                  {title}
                </span>
                {step < 5 && <div className="w-8 h-0.5 bg-gray-300 ml-4" />}
              </div>
            ))}
          </div>

          <Card>
            <CardContent className="p-8">
              {/* Step 1: Choose Template/Type */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-2">Choose a Challenge Template</h2>
                    <p className="text-gray-600">Select a pre-made template or create a custom challenge</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {challengeTemplates.map(template => (
                      <Card 
                        key={template.id}
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-purple-300"
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="text-2xl">{template.emoji}</div>
                            <div>
                              <h3 className="font-semibold">{template.name}</h3>
                              <div className={cn(
                                "px-2 py-1 rounded text-xs font-medium inline-flex items-center space-x-1 mt-1",
                                challengeTypeInfo[template.type].color
                              )}>
                                {challengeTypeInfo[template.type].icon}
                                <span>{challengeTypeInfo[template.type].title}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
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
              )}

              {/* Step 2: Challenge Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-2">Challenge Details</h2>
                    <p className="text-gray-600">Customize your challenge name, type, and goals</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Challenge Name
                        </label>
                        <Input
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter challenge name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Emoji
                        </label>
                        <div className="grid grid-cols-8 gap-2">
                          {challengeEmojis.map(emoji => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleInputChange('emoji', emoji)}
                              className={cn(
                                "p-2 rounded-lg text-xl hover:bg-purple-100 transition-colors",
                                formData.emoji === emoji ? "bg-purple-200" : "bg-gray-100"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                  ? "border-purple-300 bg-purple-50"
                                  : "border-gray-200 hover:border-gray-300"
                              )}
                            >
                              <div className="flex items-center space-x-2 mb-1">
                                {info.icon}
                                <span className="font-medium">{info.title}</span>
                              </div>
                              <p className="text-sm text-gray-600">{info.description}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                </div>
              )}

              {/* Step 3: Select Habits */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-2">Select Challenge Habits</h2>
                    <p className="text-gray-600">Choose which habits will be part of this challenge</p>
                  </div>

                  <div className="space-y-2">
                    {habits.filter(h => h.isActive).map(habit => {
                      const isSelected = formData.habitIds.includes(habit.id);
                      return (
                        <div
                          key={habit.id}
                          onClick={() => toggleHabit(habit.id)}
                          className={cn(
                            "p-4 rounded-lg border cursor-pointer transition-all",
                            isSelected
                              ? "border-purple-300 bg-purple-50"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="text-xl">{habit.emoji}</div>
                              <div>
                                <div className="font-medium">{habit.name}</div>
                                {habit.description && (
                                  <div className="text-sm text-gray-600">{habit.description}</div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">{habit.basePoints} points</span>
                              {isSelected && <CheckCircle className="w-5 h-5 text-purple-600" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {habits.filter(h => h.isActive).length === 0 && (
                    <div className="text-center py-8">
                      <Target className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No active habits found. Create some habits first!</p>
                      <Button 
                        className="mt-4"
                        onClick={() => setShowCreateHabitModal(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Habit
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Choose Participants */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-2">Choose Participants</h2>
                    <p className="text-gray-600">Select which family members can participate in this challenge</p>
                  </div>

                  <div className="space-y-2">
                    {currentFamily.members.map(member => {
                      const isSelected = formData.participantIds.includes(member.id);
                      return (
                        <div
                          key={member.id}
                          onClick={() => toggleParticipant(member.id)}
                          className={cn(
                            "p-4 rounded-lg border cursor-pointer transition-all",
                            isSelected
                              ? "border-purple-300 bg-purple-50"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {member.avatarStyle && member.avatarSeed ? (
                                <DiceBearAvatar
                                  seed={member.avatarSeed}
                                  style={member.avatarStyle}
                                  size={40}
                                  className="border-2 border-white shadow-sm"
                                  backgroundColor="transparent"
                                  fallbackEmoji={member.avatar}
                                  options={getAvatarOptions(member)}
                                />
                              ) : (
                                <div 
                                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                  style={{ backgroundColor: member.color }}
                                >
                                  {member.avatar}
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{member.displayName}</div>
                                <div className="text-sm text-gray-600 capitalize">{member.role}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">Level {member.stats.level}</span>
                              {isSelected && <CheckCircle className="w-5 h-5 text-purple-600" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 5: Review & Create */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold mb-2">Review Challenge</h2>
                    <p className="text-gray-600">Review all details before creating the challenge</p>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{formData.emoji}</div>
                      <div>
                        <h3 className="text-xl font-bold">{formData.name}</h3>
                        <p className="text-gray-600">{formData.description}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Challenge Type: </span>
                          <span className="capitalize">{formData.type}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Target: </span>
                          <span>{formData.target} {
                            formData.type === 'streak' ? 'day streak' :
                            formData.type === 'total' ? 'completions' :
                            formData.type === 'race' ? 'completions' :
                            'team completions'
                          }</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Duration: </span>
                          <span>{formData.duration} days</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Bonus Points: </span>
                          <span>{formData.bonusPoints} points</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Challenge Habits:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {formData.habitIds.map(habitId => {
                              const habit = habits.find(h => h.id === habitId);
                              return (
                                <span key={habitId} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                                  {habit?.emoji} {habit?.name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Participants:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {formData.participantIds.map(memberId => {
                              const member = currentFamily.members.find(m => m.id === memberId);
                              return (
                                <div key={memberId} className="flex items-center space-x-1">
                                  <div 
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                    style={{ backgroundColor: member?.color }}
                                  >
                                    {member?.avatar}
                                  </div>
                                  <span className="text-sm">{member?.displayName}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  variant="outline"
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>

                <div className="flex items-center space-x-2">
                  {currentStep < 5 ? (
                    <Button
                      onClick={() => setCurrentStep(currentStep + 1)}
                      disabled={!canProceed(currentStep)}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={loading || formData.habitIds.length === 0 || formData.participantIds.length === 0}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {loading ? 'Creating...' : 'Create Challenge'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Habit Modal */}
      <CreateFamilyHabitModal
        isOpen={showCreateHabitModal}
        onClose={() => setShowCreateHabitModal(false)}
      />
    </ProtectedRoute>
  );
}