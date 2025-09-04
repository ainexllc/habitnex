'use client';

import React, { useState, useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useAllFamilyHabits } from '@/hooks/useFamilyHabits';
import { useClaudeAI } from '@/hooks/useClaudeAI';
import { HabitEnhancementCard } from '@/components/ai/HabitEnhancementCard';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TagInput } from '@/components/ui/TagInput';
import { DiceBearAvatar } from '@/components/ui/DiceBearAvatar';
import { OpenMojiTrigger } from '@/components/ui/OpenMojiPicker';
import { OpenMoji } from '@/components/ui/OpenMoji';
import { EMOJI_MAP } from '@/lib/openmoji/emojiMap';
import { CreateFamilyHabitRequest } from '@/types/family';
import { HabitEnhancement, FamilyHabit } from '@/types/claude';
import {
  Target,
  Clock,
  Users,
  Sparkles,
  Plus,
  ArrowLeft,
  ArrowRight,
  Edit3,
  CheckCircle,
  Calendar,
  Settings,
  Award,
  Trophy,
  Star,
  Zap,
  Heart,
  Gift
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FamilyHabitFormProps {
  mode: 'create' | 'edit';
  isOpen: boolean;
  onClose: () => void;
  habit?: FamilyHabit | null;
}

type WizardStep = 'basic' | 'schedule' | 'assignment' | 'gamification' | 'review';

interface StepConfig {
  id: WizardStep;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
}

const difficultyOptions = [
  { 
    value: 'easy', 
    label: 'Easy', 
    points: 1, 
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-700',
    gradient: 'from-green-400 to-emerald-500',
    description: 'Simple daily actions that are easy to maintain'
  },
  { 
    value: 'medium', 
    label: 'Medium', 
    points: 3, 
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-700',
    gradient: 'from-amber-400 to-orange-500',
    description: 'Moderate effort required but manageable with consistency'
  },
  { 
    value: 'hard', 
    label: 'Hard', 
    points: 5, 
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-700',
    gradient: 'from-red-400 to-pink-500',
    description: 'Challenging habits that require dedication and commitment'
  }
] as const;

const stepConfigs: StepConfig[] = [
  {
    id: 'basic',
    title: 'Basic Info',
    subtitle: 'Name, description, and emoji',
    icon: <Edit3 className="w-5 h-5" />,
    color: 'text-blue-600 dark:text-blue-400',
    bgGradient: 'from-blue-500 to-indigo-500'
  },
  {
    id: 'schedule',
    title: 'Schedule',
    subtitle: 'Frequency and timing',
    icon: <Calendar className="w-5 h-5" />,
    color: 'text-purple-600 dark:text-purple-400',
    bgGradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'assignment',
    title: 'Assignment',
    subtitle: 'Select family members',
    icon: <Users className="w-5 h-5" />,
    color: 'text-green-600 dark:text-green-400',
    bgGradient: 'from-green-500 to-teal-500'
  },
  {
    id: 'gamification',
    title: 'Gamification',
    subtitle: 'Points, rewards, and goals',
    icon: <Trophy className="w-5 h-5" />,
    color: 'text-amber-600 dark:text-amber-400',
    bgGradient: 'from-amber-500 to-orange-500'
  },
  {
    id: 'review',
    title: 'Review & Create',
    subtitle: 'Final review',
    icon: <CheckCircle className="w-5 h-5" />,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgGradient: 'from-emerald-500 to-green-500'
  }
];


export function FamilyHabitForm({ mode, isOpen, onClose, habit }: FamilyHabitFormProps) {
  const { currentFamily, currentMember } = useFamily();
  const { createHabit, updateHabit, loading } = useAllFamilyHabits();
  const { enhanceHabit, loading: aiLoading, clearError: clearAiError } = useClaudeAI();

  // Function to suggest appropriate emoji based on habit content using OpenMoji mappings
  const suggestEmojiForHabit = (title: string, description: string): string | null => {
    const content = `${title} ${description}`.toLowerCase();

    // Health & Fitness keywords
    if (content.match(/\b(exercise|workout|gym|fitness|run|running|jog|jogging|walk|walking|hike|hiking|bike|biking|swim|swimming|yoga|meditation|stretch|stretching|cardio|strength|muscle|weight|lift|lifting|sport|sports|athletic|active|activity|physical|body|health)\b/)) {
      // Prioritize specific activities
      if (content.match(/\b(run|running|jog|jogging)\b/)) return EMOJI_MAP.runner.unicode;
      if (content.match(/\b(swim|swimming)\b/)) return EMOJI_MAP.swimmer.unicode;
      if (content.match(/\b(bike|biking|cycling)\b/)) return EMOJI_MAP.cyclist.unicode;
      if (content.match(/\b(weight|lift|lifting|gym)\b/)) return EMOJI_MAP.weight_lifter.unicode;
      if (content.match(/\b(yoga|meditation|mindful)\b/)) return EMOJI_MAP.person_in_lotus_position.unicode;
      return EMOJI_MAP.muscle.unicode; // Default fitness emoji
    }

    // Learning & Knowledge keywords
    if (content.match(/\b(read|reading|book|books|study|studying|learn|learning|education|school|class|course|lesson|teach|teaching|research|write|writing|practice|practicing|skill|skills|knowledge|brain|mind|think|thinking|intelligent|smart|wise)\b/)) {
      return EMOJI_MAP.book.unicode;
    }

    // Mindfulness & Wellness keywords
    if (content.match(/\b(meditate|meditation|mindful|mindfulness|relax|relaxation|calm|peace|peaceful|serene|breath|breathing|breathe|zen|spiritual|spirituality)\b/)) {
      return EMOJI_MAP.person_in_lotus_position.unicode;
    }

    // Nutrition & Hydration keywords
    if (content.match(/\b(water|drink|drinking|hydrate|hydration)\b/)) {
      return EMOJI_MAP.droplet.unicode;
    }
    if (content.match(/\b(eat|eating|food|meal|meals|diet|nutrition|healthy|fruit|fruits|vegetable|vegetables|salad|smoothie|juice|coffee|tea|breakfast|lunch|dinner|snack|cook|cooking)\b/)) {
      return EMOJI_MAP.green_salad.unicode;
    }

    // Nature & Outdoors keywords
    if (content.match(/\b(nature|outdoor|outdoors|park|forest|mountain|mountains|lake|river|ocean|sea|beach|hike|hiking|climb|climbing)\b/)) {
      return EMOJI_MAP.mountain.unicode;
    }
    if (content.match(/\b(plant|plants|garden|gardening|grow|growing|seed|seeds)\b/)) {
      return EMOJI_MAP.seedling.unicode;
    }
    if (content.match(/\b(flower|flowers|bloom|blooming|beauty|beautiful)\b/)) {
      return EMOJI_MAP.hibiscus.unicode;
    }

    // Emotions & Motivation keywords
    if (content.match(/\b(happy|happiness|joy|joyful|smile|smiling|laugh|laughing|positive|optimistic|motivated|motivation|inspire|inspiring|encourage|encouraging|grateful|gratitude|thankful|appreciate|appreciation)\b/)) {
      return EMOJI_MAP.smiling_face_with_smiling_eyes.unicode;
    }
    if (content.match(/\b(love|care|caring|heart|family|relationship|bond|bonding)\b/)) {
      return EMOJI_MAP.red_heart.unicode;
    }
    if (content.match(/\b(good|great|awesome|excellent|success|successful|approve|approval|like|thumbs)\b/)) {
      return EMOJI_MAP.thumbs_up.unicode;
    }

    // Goals & Achievement keywords
    if (content.match(/\b(goal|goals|achieve|achievement|accomplish|accomplishment|success|successful|succeed|succeeding|win|winning|victory|triumph|celebrate|celebration|reward|rewards|prize|prizes|milestone|milestones|star|excellence|excellent)\b/)) {
      return EMOJI_MAP.star.unicode;
    }

    // Time & Schedule keywords
    if (content.match(/\b(morning|dawn|early|sunrise|wake|waking)\b/)) {
      return EMOJI_MAP.sunrise.unicode;
    }
    if (content.match(/\b(evening|sunset|dusk|twilight|night)\b/)) {
      return EMOJI_MAP.cityscape_at_dusk.unicode;
    }

    // Activities keywords
    if (content.match(/\b(boat|boating|water|recreation|fun|activity)\b/)) {
      return EMOJI_MAP.speedboat.unicode;
    }

    // Default fallback
    return EMOJI_MAP.target.unicode;
  };

  const [formData, setFormData] = useState(() => {
    if (mode === 'edit' && habit) {
      return {
        name: habit.name || '',
        description: habit.description || '',
        emoji: habit.emoji || '🎯',
        difficulty: habit.difficulty || 'medium',
        frequency: habit.frequency || 'daily',
        targetDays: habit.targetDays || [1, 2, 3, 4, 5, 6, 0],
        intervalDays: habit.intervalDays || 1,
        isShared: habit.isShared || false,
        basePoints: habit.basePoints || 3,
        assignedMembers: habit.assignedMembers || [],
        tags: habit.tags || []
      };
    }
    return {
      name: '',
      description: '',
      emoji: '🎯',
      difficulty: 'medium' as 'easy' | 'medium' | 'hard',
      frequency: 'daily' as 'daily' | 'weekly' | 'interval',
      targetDays: [1, 2, 3, 4, 5, 6, 0], // All days for daily
      intervalDays: 1,
      assignedMembers: [] as string[],
      isShared: false,
      tags: [] as string[]
    };
  });

  const [aiEnhancement, setAiEnhancement] = useState<HabitEnhancement | null>(null);
  const [currentStep, setCurrentStep] = useState<WizardStep>('basic');
  const [error, setError] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<WizardStep>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Additional form data for gamification step
  const [rewardText, setRewardText] = useState('');
  const [milestoneTarget, setMilestoneTarget] = useState(7);

  // Clear error when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setCurrentStep('basic');
    }
  }, [isOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && habit) {
        setFormData({
          name: habit.name || '',
          description: habit.description || '',
          emoji: habit.emoji || '🎯',
          difficulty: habit.difficulty || 'medium',
          frequency: habit.frequency || 'daily',
          targetDays: habit.targetDays || [1, 2, 3, 4, 5, 6, 0],
          intervalDays: habit.intervalDays || 1,
          isShared: habit.isShared || false,
          basePoints: habit.basePoints || 3,
          assignedMembers: habit.assignedMembers || [],
          tags: habit.tags || []
        });
      } else {
        setFormData({
          name: '',
          description: '',
          emoji: '🎯',
          difficulty: 'medium',
          frequency: 'daily',
          targetDays: [1, 2, 3, 4, 5, 6, 0],
          intervalDays: 1,
          assignedMembers: [],
          isShared: false,
          tags: []
        });
      }
      setAiEnhancement(null);
      setCurrentStep('basic');
      setError(null);
      setCompletedSteps(new Set());
      setRewardText('');
      setMilestoneTarget(7);
    }
  }, [isOpen, mode, habit]);

  const handleAiEnhance = async () => {
    if (!formData.name.trim()) {
      setError('Please enter a habit name first');
      return;
    }

    try {
      clearAiError();
      setError(null);

      const response = await enhanceHabit(formData.name, formData.description);

      if (response?.success && response.data) {
        setAiEnhancement(response.data);

        // Auto-populate enhanced fields
        if (response.data?.title && response.data.title !== formData.name) {
          setFormData(prev => ({ ...prev, name: response.data.title }));
        }
        if (response.data?.enhancedDescription) {
          setFormData(prev => ({ ...prev, description: response.data.enhancedDescription }));
        }

        // Auto-select appropriate emoji based on habit content
        const suggestedEmoji = suggestEmojiForHabit(response.data?.title || formData.name, response.data?.enhancedDescription || formData.description);
        if (suggestedEmoji && suggestedEmoji !== formData.emoji) {
          setFormData(prev => ({ ...prev, emoji: suggestedEmoji }));
        }
      } else {
        // Handle specific AI unavailable error
        if (response?.error?.includes('AI features are not available')) {
          setError('AI enhancement is currently unavailable. You can still create your habit manually.');
        } else {
          setError(response?.error || 'Failed to enhance habit with AI');
        }
      }

    } catch (err) {
      // Handle network errors or other issues
      if (err instanceof Error && err.message.includes('fetch')) {
        setError('AI enhancement is currently unavailable. You can still create your habit manually.');
      } else {
        setError('Failed to enhance habit with AI. Please try again.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentFamily || !currentMember) {
      setError(`Must be in a family to ${mode} habits`);
      return;
    }

    if (!formData.name.trim()) {
      setError('Habit name is required');
      return;
    }

    // Debug log to see what's in assignedMembers
    console.log('Assigned members on submit:', formData.assignedMembers);
    console.log('Is shared habit:', formData.isShared);
    
    if (mode === 'create' && formData.assignedMembers.length === 0) {
      setError('Please assign this habit to at least one family member');
      return;
    }

    try {
      setError(null);

      if (mode === 'create') {
        const habitData: Omit<CreateFamilyHabitRequest['habit'], 'familyId'> = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          emoji: formData.emoji,
          color: difficultyOptions.find(d => d.value === formData.difficulty)?.color.split(' ')[0].replace('bg-', '') || 'blue',
          tags: formData.tags,
          assignedMembers: formData.assignedMembers,
          isShared: formData.isShared,
          createdBy: currentMember.id,
          frequency: formData.frequency,
          targetDays: formData.frequency === 'interval' ? [] : formData.targetDays,
          ...(formData.frequency === 'interval' && { intervalDays: formData.intervalDays }),
          difficulty: formData.difficulty,
          basePoints: difficultyOptions.find(d => d.value === formData.difficulty)?.points || 3,
          linkedRewards: [],
          milestoneRewards: [
            { 
              streak: milestoneTarget, 
              points: 5, 
              description: rewardText || `${milestoneTarget} day streak bonus!` 
            },
            { streak: 30, points: 20, description: '1 month streak bonus!' },
            { streak: 90, points: 50, description: '3 month streak bonus!' }
          ],
          // AI Enhancement fields
          aiEnhanced: !!aiEnhancement,
          ...(aiEnhancement?.tip && { tip: aiEnhancement.tip }),
          ...(aiEnhancement?.healthBenefits && { healthBenefits: aiEnhancement.healthBenefits }),
          ...(aiEnhancement?.mentalBenefits && { mentalBenefits: aiEnhancement.mentalBenefits }),
          ...(aiEnhancement?.longTermBenefits && { longTermBenefits: aiEnhancement.longTermBenefits }),
          ...(aiEnhancement?.complementary && { complementary: aiEnhancement.complementary })
        };

        await createHabit(habitData);
      } else if (mode === 'edit' && habit) {
        // Handle edit mode
        const updateData = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          emoji: formData.emoji,
          tags: formData.tags,
          assignedMembers: formData.assignedMembers,
          basePoints: formData.basePoints,
          aiEnhanced: !!aiEnhancement,
          ...(aiEnhancement?.tip && { tip: aiEnhancement.tip }),
          ...(aiEnhancement?.healthBenefits && { healthBenefits: aiEnhancement.healthBenefits }),
          ...(aiEnhancement?.mentalBenefits && { mentalBenefits: aiEnhancement.mentalBenefits }),
          ...(aiEnhancement?.longTermBenefits && { longTermBenefits: aiEnhancement.longTermBenefits })
        };

        await updateHabit(habit.id, updateData);
      }

      onClose();

    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${mode} habit`);
    }
  };

  const handleClose = () => {
    setError(null);
    setAiEnhancement(null);
    setCurrentStep('basic');
    setCompletedSteps(new Set());
    setIsAnimating(false);
    onClose();
  };

  const nextStep = () => {
    const currentIndex = stepConfigs.findIndex(s => s.id === currentStep);
    if (currentIndex < stepConfigs.length - 1) {
      setError(null); // Clear any errors when moving forward
      setIsAnimating(true);
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setTimeout(() => {
        setCurrentStep(stepConfigs[currentIndex + 1].id);
        setIsAnimating(false);
      }, 150);
    }
  };

  const prevStep = () => {
    const currentIndex = stepConfigs.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      setError(null); // Clear any errors when moving backward
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(stepConfigs[currentIndex - 1].id);
        setIsAnimating(false);
      }, 150);
    }
  };

  const goToStep = (stepId: WizardStep) => {
    setError(null); // Clear any errors when jumping to a step
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(stepId);
      setIsAnimating(false);
    }, 150);
  };

  const isStepValid = (stepId: WizardStep): boolean => {
    switch (stepId) {
      case 'basic':
        return formData.name.trim().length > 0;
      case 'schedule':
        return formData.frequency === 'interval' || formData.targetDays.length > 0;
      case 'assignment':
        return formData.assignedMembers.length > 0;
      case 'gamification':
        return true; // Optional step, always valid
      case 'review':
        return isStepValid('basic') && isStepValid('schedule') && isStepValid('assignment');
      default:
        return false;
    }
  };

  const getCurrentStepConfig = () => {
    return stepConfigs.find(s => s.id === currentStep) || stepConfigs[0];
  };

  if (!currentFamily || !currentMember) {
    return null;
  }

  const renderStepContent = () => {
    const stepConfig = getCurrentStepConfig();
    
    switch (currentStep) {
      case 'basic':
        return (
          <div className={cn("transition-all duration-300", isAnimating && "opacity-50 scale-95")}>
            {/* Step Header with Gradient */}
            <div className="relative mb-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 right-8 w-20 h-20 bg-white rounded-full blur-2xl" />
                <div className="absolute bottom-4 left-8 w-24 h-24 bg-yellow-300 rounded-full blur-2xl" />
              </div>
              
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Edit3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {mode === 'create' ? 'Basic Information' : 'Edit Habit Details'}
                </h3>
                <p className="text-blue-100">
                  {mode === 'create' ? 'Let\'s start with the fundamentals of your family habit' : 'Update the basic details of this habit'}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Habit Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Habit Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Drink 8 glasses of water"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="text-lg"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAiEnhance}
                    disabled={aiLoading || !formData.name.trim()}
                    className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-900/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    {aiLoading ? 'AI Enhancing...' : 'AI Enhance'}
                  </Button>
                </div>
                <textarea
                  placeholder="Brief description of the habit..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 resize-none"
                  rows={3}
                />

                {/* AI Enhancement Display */}
                {aiEnhancement && (
                  <div className="mt-4">
                    <HabitEnhancementCard
                      enhancement={aiEnhancement}
                      onApply={() => {
                        if (aiEnhancement.title) {
                          setFormData(prev => ({ ...prev, name: aiEnhancement.title }));
                        }
                        if (aiEnhancement.enhancedDescription) {
                          setFormData(prev => ({ ...prev, description: aiEnhancement.enhancedDescription }));
                        }
                      }}
                      onClose={() => setAiEnhancement(null)}
                    />
                  </div>
                )}

                {/* AI Enhancement Info */}
                {!aiEnhancement && formData.name.trim() && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                          Try AI Enhancement
                        </p>
                        <p className="text-blue-700 dark:text-blue-300">
                          Click the "AI Enhance" button to get personalized suggestions for improving your habit description, benefits, and success tips.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Emoji Selection - Enhanced */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Choose Your Habit Emoji
                </label>
                
                {/* Enhanced Emoji Display */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border-2 border-blue-100 dark:border-blue-800/30">
                    <div className="text-center space-y-4">
                      {/* Large Emoji Display */}
                      <div className="bg-white dark:bg-gray-800 rounded-full w-20 h-20 mx-auto flex items-center justify-center shadow-lg ring-4 ring-white dark:ring-gray-700">
                        <OpenMoji 
                          emoji={formData.emoji} 
                          size={64}
                          alt="Selected habit emoji"
                        />
                      </div>
                      
                      {/* Emoji Trigger Button */}
                      <div>
                        <OpenMojiTrigger
                          value={formData.emoji}
                          onSelect={(emoji) => setFormData(prev => ({ ...prev, emoji }))}
                          placeholder="🎯"
                          size={32}
                          className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 rounded-xl px-6 py-3 transition-all duration-200 shadow-sm hover:shadow-md"
                        />
                      </div>
                      
                      {/* Help Text */}
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          🎨 Choose the perfect emoji to represent your habit
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Browse from 4,294+ beautiful OpenMoji icons with search & categories
                        </p>
                      </div>
                      
                      {/* Quick Suggestions */}
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                          🔥 Popular for habits:
                        </p>
                        <div className="flex justify-center space-x-2">
                          {['💪', '🏃‍♀️', '📚', '🥗', '💧', '🧘‍♀️', '🚫', '⏰'].map((suggestedEmoji, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, emoji: suggestedEmoji }))}
                              className="bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 rounded-lg p-2 transition-all duration-200 hover:scale-110"
                              title={`Use ${suggestedEmoji}`}
                            >
                              <OpenMoji emoji={suggestedEmoji} size={20} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (Optional)
                </label>
                <TagInput
                  tags={formData.tags}
                  onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
                  placeholder="Add tags like 'health', 'morning', etc."
                />
              </div>

              <div className="flex justify-end pt-6">
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid('basic')}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg px-8 py-3"
                  size="lg"
                >
                  Next: Schedule
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className={cn("transition-all duration-300", isAnimating && "opacity-50 scale-95")}>
            {/* Step Header with Gradient */}
            <div className="relative mb-8 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 rounded-2xl p-8 text-white shadow-xl overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 right-8 w-20 h-20 bg-white rounded-full blur-2xl" />
                <div className="absolute bottom-4 left-8 w-24 h-24 bg-yellow-300 rounded-full blur-2xl" />
              </div>
              
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Schedule & Timing</h3>
                <p className="text-pink-100">
                  When and how often should this habit be practiced?
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Frequency
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'daily', label: 'Daily', description: 'Every day' },
                    { value: 'weekly', label: 'Weekly', description: 'Specific days of the week' },
                    { value: 'interval', label: 'Every X Days', description: 'Custom interval' }
                  ].map((option) => (
                    <label key={option.value} className="cursor-pointer">
                      <input
                        type="radio"
                        name="frequency"
                        value={option.value}
                        checked={formData.frequency === option.value}
                        onChange={(e) => {
                          const newFreq = e.target.value as any;
                          setFormData(prev => ({
                            ...prev,
                            frequency: newFreq,
                            targetDays: newFreq === 'daily' ? [1, 2, 3, 4, 5, 6, 0] :
                                      newFreq === 'weekly' ? [] : prev.targetDays
                          }));
                        }}
                        className="sr-only"
                      />
                      <div className={cn(
                        "p-4 border-2 rounded-lg",
                        formData.frequency === option.value
                          ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      )}>
                        <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Weekly Days Selection */}
              {formData.frequency === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Which days of the week?
                  </label>
                  <div className="flex space-x-2">
                    {[
                      { value: 0, label: 'Sun' },
                      { value: 1, label: 'Mon' },
                      { value: 2, label: 'Tue' },
                      { value: 3, label: 'Wed' },
                      { value: 4, label: 'Thu' },
                      { value: 5, label: 'Fri' },
                      { value: 6, label: 'Sat' }
                    ].map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        className={cn(
                          "px-3 py-2 rounded-lg border text-sm font-medium",
                          formData.targetDays.includes(day.value)
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                        )}
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            targetDays: prev.targetDays.includes(day.value)
                              ? prev.targetDays.filter(d => d !== day.value)
                              : [...prev.targetDays, day.value]
                          }));
                        }}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Interval Days */}
              {formData.frequency === 'interval' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Every how many days?
                  </label>
                  <select
                    value={formData.intervalDays}
                    onChange={(e) => setFormData(prev => ({ ...prev, intervalDays: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {Array.from({ length: 14 }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>
                        Every {num} day{num > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-4 pt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1 border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                  size="lg"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                  disabled={!isStepValid('schedule')}
                  size="lg"
                >
                  Next: Assignment
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        );

      case 'assignment':
        return (
          <div className={cn("transition-all duration-300", isAnimating && "opacity-50 scale-95")}>
            {/* Step Header with Gradient */}
            <div className="relative mb-8 bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 rounded-2xl p-8 text-white shadow-xl overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 right-8 w-20 h-20 bg-white rounded-full blur-2xl" />
                <div className="absolute bottom-4 left-8 w-24 h-24 bg-yellow-300 rounded-full blur-2xl" />
              </div>
              
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Family Assignment</h3>
                <p className="text-green-100">
                  Choose which family members will participate in this habit
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="flex items-center space-x-3 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    checked={formData.isShared}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setFormData(prev => ({
                        ...prev,
                        isShared: isChecked,
                        // When shared is checked, automatically select all active members
                        assignedMembers: isChecked 
                          ? currentFamily.members.filter(m => m.isActive).map(m => m.id)
                          : prev.assignedMembers
                      }));
                    }}
                    className="w-5 h-5 text-blue-600 dark:text-blue-400 rounded"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Shared Family Habit</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Everyone must complete this together (like family dinner)
                    </div>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Assign to Members *
                  {formData.isShared && (
                    <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                      (All members selected for shared habit)
                    </span>
                  )}
                </label>
                <div className="grid md:grid-cols-2 gap-3">
                  {currentFamily.members.filter(m => m.isActive).map((member) => (
                    <label key={member.id} className={cn(
                      "cursor-pointer",
                      formData.isShared && "cursor-not-allowed opacity-75"
                    )}>
                      <input
                        type="checkbox"
                        checked={formData.assignedMembers.includes(member.id)}
                        onChange={(e) => {
                          // Don't allow changes if it's a shared habit
                          if (formData.isShared) return;
                          
                          setFormData(prev => ({
                            ...prev,
                            assignedMembers: e.target.checked
                              ? [...prev.assignedMembers, member.id]
                              : prev.assignedMembers.filter(id => id !== member.id)
                          }));
                        }}
                        disabled={formData.isShared}
                        className="sr-only"
                      />
                      <div className={cn(
                        "p-4 border-2 rounded-lg flex items-center space-x-3 transition-all",
                        formData.assignedMembers.includes(member.id)
                          ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700',
                        !formData.isShared && !formData.assignedMembers.includes(member.id) && 
                          'hover:border-gray-300 dark:hover:border-gray-600'
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
              </div>

              <div className="flex gap-4 pt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1 border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                  size="lg"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-lg"
                  disabled={!isStepValid('assignment')}
                  size="lg"
                >
                  Next: Gamification
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        );

      case 'gamification':
        return (
          <div className={cn("transition-all duration-300", isAnimating && "opacity-50 scale-95")}>
            {/* Step Header with Gradient */}
            <div className="relative mb-8 bg-gradient-to-r from-amber-600 via-orange-600 to-red-500 rounded-2xl p-8 text-white shadow-xl overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 right-8 w-20 h-20 bg-white rounded-full blur-2xl" />
                <div className="absolute bottom-4 left-8 w-24 h-24 bg-yellow-300 rounded-full blur-2xl" />
              </div>
              
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Gamification & Rewards</h3>
                <p className="text-amber-100">
                  Make it fun with points, rewards, and achievements
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Difficulty & Points */}
              <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Difficulty Level</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Choose the challenge level and base points</p>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  {difficultyOptions.map((option) => (
                    <label key={option.value} className="cursor-pointer group">
                      <input
                        type="radio"
                        name="difficulty"
                        value={option.value}
                        checked={formData.difficulty === option.value}
                        onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                        className="sr-only"
                      />
                      <div className={cn(
                        "p-5 border-2 rounded-xl transition-all duration-200 group-hover:shadow-md",
                        formData.difficulty === option.value
                          ? `${option.borderColor} ${option.bgColor} shadow-lg`
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      )}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r text-white font-bold text-lg shadow-md",
                              option.gradient
                            )}>
                              {option.points}
                            </div>
                            <div>
                              <div className={cn("font-semibold text-lg", option.color)}>
                                {option.label}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {option.description}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={cn("text-sm font-medium", option.color)}>
                              {option.points} point{option.points !== 1 ? 's' : ''}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">per completion</div>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Milestone Rewards */}
              <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Milestone Rewards</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Set goals and rewards for streak achievements</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Milestone Target (days)
                    </label>
                    <select
                      value={milestoneTarget}
                      onChange={(e) => setMilestoneTarget(parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value={3}>3 days</option>
                      <option value={7}>1 week (7 days)</option>
                      <option value={14}>2 weeks (14 days)</option>
                      <option value={21}>3 weeks (21 days)</option>
                      <option value={30}>1 month (30 days)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reward Description (Optional)
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Choose family movie night, Extra 30 minutes screen time"
                      value={rewardText}
                      onChange={(e) => setRewardText(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Preview of default milestones */}
                  <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-3">
                      <Gift className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm font-medium text-amber-900 dark:text-amber-100">Default Milestone Rewards</span>
                    </div>
                    <div className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
                      <div className="flex justify-between">
                        <span>• {milestoneTarget} days:</span>
                        <span className="font-medium">{rewardText || 'Great start bonus!'} (+5 pts)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• 30 days:</span>
                        <span className="font-medium">1 month streak bonus! (+20 pts)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>• 90 days:</span>
                        <span className="font-medium">3 month champion! (+50 pts)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1 border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                  size="lg"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
                  size="lg"
                >
                  Review & Create
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className={cn("transition-all duration-300", isAnimating && "opacity-50 scale-95")}>
            {/* Step Header with Gradient */}
            <div className="relative mb-8 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-2xl p-8 text-white shadow-xl overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 right-8 w-20 h-20 bg-white rounded-full blur-2xl" />
                <div className="absolute bottom-4 left-8 w-24 h-24 bg-yellow-300 rounded-full blur-2xl" />
              </div>
              
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {mode === 'create' ? 'Review & Create' : 'Review Changes'}
                </h3>
                <p className="text-emerald-100">
                  {mode === 'create' ? 'Everything looks good? Let\'s create this family habit!' : 'Review your changes before saving'}
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Main Habit Preview Card */}
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-lg">
                <div className="flex items-center space-x-6 mb-6">
                  <div className="relative">
                    <div className="transform transition-transform duration-300 hover:scale-110">
                      <OpenMoji 
                        emoji={formData.emoji} 
                        size={64} 
                        alt={formData.name}
                        className="transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{formData.name}</h3>
                    {formData.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">{formData.description}</p>
                    )}
                    
                    {/* Tags */}
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {formData.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Points Badge */}
                  <div className={cn(
                    "flex flex-col items-center justify-center rounded-2xl px-6 py-4 text-white shadow-lg flex-shrink-0 bg-gradient-to-r",
                    difficultyOptions.find(d => d.value === formData.difficulty)?.gradient || 'from-blue-400 to-blue-600'
                  )}>
                    <Award className="w-8 h-8 mb-2" />
                    <span className="text-2xl font-bold">
                      {difficultyOptions.find(d => d.value === formData.difficulty)?.points}
                    </span>
                    <span className="text-sm opacity-90">points</span>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid md:grid-cols-4 gap-6 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Difficulty</div>
                    <div className="font-semibold text-gray-900 dark:text-white capitalize">
                      {formData.difficulty}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {difficultyOptions.find(d => d.value === formData.difficulty)?.points} pts/completion
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Frequency</div>
                    <div className="font-semibold text-gray-900 dark:text-white capitalize">
                      {formData.frequency}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formData.frequency === 'daily' && 'Every day'}
                      {formData.frequency === 'weekly' && `${formData.targetDays.length} day${formData.targetDays.length !== 1 ? 's' : ''}/week`}
                      {formData.frequency === 'interval' && `Every ${formData.intervalDays} day${formData.intervalDays > 1 ? 's' : ''}`}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-green-400 to-teal-500 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Members</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {formData.assignedMembers.length}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formData.isShared ? 'Shared habit' : 'Individual'}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">First Milestone</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {milestoneTarget} days
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +5 bonus points
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Assigned Members Summary - Compact Display */}
              <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-teal-500 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Assigned To</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formData.assignedMembers.length} member{formData.assignedMembers.length !== 1 ? 's' : ''} • 
                        {formData.isShared ? ' Shared habit' : ' Individual tracking'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Compact member list with avatars only */}
                <div className="flex flex-wrap gap-3">
                  {formData.assignedMembers.map((memberId) => {
                    const member = currentFamily.members.find(m => m.id === memberId);
                    return member ? (
                      <div
                        key={member.id}
                        className="group relative"
                      >
                        {/* Avatar with tooltip */}
                        <div className="relative">
                          {member.avatarStyle && member.avatarSeed ? (
                            <DiceBearAvatar
                              seed={member.avatarSeed}
                              style={member.avatarStyle}
                              size={48}
                              className="border-3 border-white dark:border-gray-700 shadow-md rounded-full"
                              backgroundColor={member.color}
                              fallbackEmoji={member.avatar}
                            />
                          ) : (
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm border-3 border-white dark:border-gray-700 shadow-md"
                              style={{ backgroundColor: member.color }}
                            >
                              {member.avatar}
                            </div>
                          )}
                          {/* Checkmark indicator */}
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        
                        {/* Tooltip with member name */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                          {member.displayName}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
              
              {/* Schedule & Rewards Details */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Schedule Details */}
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">When this habit will be practiced</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 px-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Frequency</span>
                      <span className="text-sm font-bold text-purple-900 dark:text-purple-100 capitalize">
                        {formData.frequency}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between py-2 px-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Schedule</span>
                      <span className="text-sm font-bold text-purple-900 dark:text-purple-100">
                        {formData.frequency === 'daily' && 'Every day'}
                        {formData.frequency === 'weekly' && (
                          formData.targetDays.length === 7 ? 'Every day' :
                          formData.targetDays.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')
                        )}
                        {formData.frequency === 'interval' && `Every ${formData.intervalDays} day${formData.intervalDays > 1 ? 's' : ''}`}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Rewards & Points */}
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Rewards</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Points and milestone bonuses</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 px-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Base Points</span>
                      <span className="text-sm font-bold text-amber-900 dark:text-amber-100">
                        {difficultyOptions.find(d => d.value === formData.difficulty)?.points}/completion
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between py-2 px-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <span className="text-sm font-medium text-amber-700 dark:text-amber-300">First Milestone</span>
                      <span className="text-sm font-bold text-amber-900 dark:text-amber-100">
                        {milestoneTarget} days (+5 pts)
                      </span>
                    </div>
                    
                    {rewardText && (
                      <div className="py-2 px-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Custom Reward:</span>
                        <div className="text-sm text-amber-900 dark:text-amber-100 mt-1">
                          {rewardText}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1 border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                  disabled={loading}
                  size="lg"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {mode === 'create' ? (
                        <Plus className="w-5 h-5 mr-2" />
                      ) : (
                        <CheckCircle className="w-5 h-5 mr-2" />
                      )}
                      {mode === 'create' ? 'Create' : 'Update'} Family Habit
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`${mode === 'create' ? 'Create' : 'Edit'} Family Habit`}
      size="xl"
    >
      <form onSubmit={handleSubmit}>
        {/* Progress Steps - Modern Wizard Style */}
        <div className="mb-10">
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${(stepConfigs.findIndex(s => s.id === currentStep) / (stepConfigs.length - 1)) * 100}%` 
                }}
              />
            </div>
            
            {/* Step Indicators */}
            <div className="relative flex justify-between">
              {stepConfigs.map((stepConfig, index) => {
                const isActive = currentStep === stepConfig.id;
                const isCompleted = completedSteps.has(stepConfig.id);
                const isPast = stepConfigs.findIndex(s => s.id === currentStep) > index;
                const isClickable = mode === 'create' && (isCompleted || isPast || isActive);
                
                return (
                  <button
                    key={stepConfig.id}
                    onClick={() => isClickable && goToStep(stepConfig.id)}
                    disabled={!isClickable}
                    className={cn(
                      "group relative flex flex-col items-center transition-all duration-300",
                      isClickable && "cursor-pointer hover:scale-105"
                    )}
                  >
                    {/* Step Circle */}
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 shadow-lg border-4",
                      isActive && `bg-gradient-to-r ${stepConfig.bgGradient} text-white border-white shadow-xl`,
                      isCompleted && !isActive && "bg-green-500 text-white border-green-200",
                      !isActive && !isCompleted && "bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-300 dark:border-gray-600"
                    )}>
                      {isCompleted && !isActive ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        stepConfig.icon
                      )}
                    </div>
                    
                    {/* Step Info */}
                    <div className="mt-3 text-center max-w-24">
                      <div className={cn(
                        "text-xs font-semibold transition-colors duration-200",
                        isActive && stepConfig.color,
                        isCompleted && !isActive && "text-green-600 dark:text-green-400",
                        !isActive && !isCompleted && "text-gray-500 dark:text-gray-400"
                      )}>
                        {stepConfig.title}
                      </div>
                      <div className={cn(
                        "text-xs mt-1 transition-colors duration-200",
                        isActive && "text-gray-700 dark:text-gray-300",
                        !isActive && "text-gray-400 dark:text-gray-500"
                      )}>
                        {stepConfig.subtitle}
                      </div>
                    </div>
                    
                    {/* Active Step Indicator */}
                    {isActive && (
                      <div className="absolute -top-2 -left-2 w-16 h-16 rounded-full border-2 border-blue-300 dark:border-blue-600 animate-pulse opacity-60" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {renderStepContent()}
      </form>
    </Modal>
  );
}