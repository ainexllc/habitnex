'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TagInput } from '@/components/ui/TagInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { HabitEnhancementCard } from '@/components/ai/HabitEnhancementCard';
import { useClaudeAI } from '@/hooks/useClaudeAI';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { CreateHabitForm } from '@/types';
import { HabitEnhancement } from '@/types/claude';
import { getTimeFormatOptions, getTimePlaceholder } from '@/lib/timeUtils';
import { Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const habitSchema = z.object({
  name: z.string().min(1, 'Habit name is required').max(50, 'Name too long'),
  description: z.string().max(200, 'Description too long').optional(),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional(),
  color: z.string().min(1, 'Please select a color'),
  frequency: z.enum(['daily', 'weekly', 'interval']),
  targetDays: z.array(z.number()),
  intervalDays: z.number().min(1).max(365).optional(),
  startDate: z.string().optional(),
  reminderTime: z.string().optional(),
  reminderType: z.enum(['specific', 'general']).optional(),
  goal: z.object({
    type: z.enum(['streak', 'completion']),
    target: z.number().min(1).max(365),
    period: z.enum(['weekly', 'monthly']),
  }).optional(),
  // AI Enhancement fields
  aiEnhanced: z.boolean().optional(),
  tip: z.string().max(2000, 'Tip too long').optional(),
  healthBenefits: z.string().max(1000, 'Health benefits too long').optional(),
  mentalBenefits: z.string().max(1000, 'Mental benefits too long').optional(),
  longTermBenefits: z.string().max(1000, 'Long-term benefits too long').optional(),
  complementary: z.array(z.string()).optional(),
}).refine((data) => {
  if (data.frequency === 'interval') {
    return data.intervalDays && data.intervalDays > 0;
  }
  return true;
}, {
  message: "Interval days is required for interval frequency",
  path: ["intervalDays"],
}).refine((data) => {
  if (data.frequency === 'weekly') {
    return data.targetDays && data.targetDays.length > 0;
  }
  return true;
}, {
  message: "Select at least one day",
  path: ["targetDays"],
});

// Popular tag suggestions to help users get started
const SUGGESTED_TAGS = [
  'morning', 'evening', 'health', 'fitness', 'mindfulness', 'productivity',
  'learning', 'creativity', 'social', 'routine', 'self-care', 'quick',
  '5-min', '15-min', 'daily', 'weekly', 'habit-stack', 'goal', 'challenge'
];

const COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
];

const WEEKDAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

interface HabitFormProps {
  onSubmit: (data: CreateHabitForm) => Promise<void>;
  loading?: boolean;
  initialData?: Partial<CreateHabitForm>;
  submitText?: string;
}

export function HabitForm({ 
  onSubmit, 
  loading = false, 
  initialData,
  submitText = 'Create Habit' 
}: HabitFormProps) {
  const [showGoal, setShowGoal] = useState(!!initialData?.goal);
  const [aiEnhancement, setAiEnhancement] = useState<HabitEnhancement | null>(null);
  const { enhanceHabit, loading: aiLoading, error: aiError, clearError } = useClaudeAI();
  const { timeFormatPreferences } = useUserPreferences();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateHabitForm>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      tags: initialData?.tags || [],
      color: initialData?.color || '#3b82f6', // Default to blue
      frequency: initialData?.frequency || 'daily',
      targetDays: initialData?.targetDays || [0, 1, 2, 3, 4, 5, 6],
      intervalDays: initialData?.intervalDays || 2,
      startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
      reminderTime: initialData?.reminderTime || '',
      reminderType: initialData?.reminderType || 'general',
      goal: initialData?.goal || undefined,
      // AI Enhancement fields
      aiEnhanced: initialData?.aiEnhanced || false,
      tip: initialData?.tip || undefined,
      healthBenefits: initialData?.healthBenefits || undefined,
      mentalBenefits: initialData?.mentalBenefits || undefined,
      longTermBenefits: initialData?.longTermBenefits || undefined,
      complementary: initialData?.complementary || [],
    },
  });

  const watchFrequency = watch('frequency');
  const watchTargetDays = watch('targetDays');
  const watchColor = watch('color');
  const watchName = watch('name');
  const watchTags = watch('tags');
  const watchTip = watch('tip');
  const watchReminderType = watch('reminderType');
  const watchHealthBenefits = watch('healthBenefits');
  const watchMentalBenefits = watch('mentalBenefits');
  const watchLongTermBenefits = watch('longTermBenefits');
  const watchComplementary = watch('complementary');

  const handleTargetDayToggle = (day: number) => {
    const currentDays = watchTargetDays || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort();
    setValue('targetDays', newDays);
  };

  const handleAIEnhance = async () => {
    if (!watchName?.trim()) {
      return;
    }

    clearError();
    
    try {
      const response = await enhanceHabit(
        watchName.trim(),
        watchTags?.join(', ') || undefined,
        [] // Could pass existing user habits here
      );

      if (response?.success && response.data) {
        setAiEnhancement(response.data);
        
        // Auto-populate form fields with AI-generated content
        if (response.data.title) {
          setValue('name', response.data.title);
        }
        if (response.data.description) {
          setValue('description', response.data.description);
        }
      }
    } catch (error) {
      console.error('Failed to enhance habit:', error);
    }
  };

  const applyAIEnhancement = (enhancement: HabitEnhancement) => {
    // Mark as AI enhanced
    setValue('aiEnhanced', true);
    
    // Apply AI suggestions to form
    if (!watch('description') && enhancement.description) {
      setValue('description', enhancement.description);
    }
    
    // Set detailed benefits
    if (enhancement.healthBenefits) {
      setValue('healthBenefits', enhancement.healthBenefits);
    }
    
    if (enhancement.mentalBenefits) {
      setValue('mentalBenefits', enhancement.mentalBenefits);
    }
    
    if (enhancement.longTermBenefits) {
      setValue('longTermBenefits', enhancement.longTermBenefits);
    }
    
    if (enhancement.tip) {
      setValue('tip', enhancement.tip);
    }
    
    if (enhancement.complementary && enhancement.complementary.length > 0) {
      setValue('complementary', enhancement.complementary);
    }

    // Close the enhancement card
    setAiEnhancement(null);
  };

  const handleFormSubmit = (data: CreateHabitForm) => {
    console.log('Form data before cleaning:', data);
    
    // Clean up the data before submitting
    const cleanedData: any = {
      ...data,
      goal: showGoal && data.goal ? data.goal : undefined,
    };
    
    // Remove undefined/empty fields to prevent Firestore errors
    if (!cleanedData.goal) {
      delete cleanedData.goal;
    }
    if (!cleanedData.description || cleanedData.description.trim() === '') {
      delete cleanedData.description;
    }
    if (!cleanedData.tip || cleanedData.tip.trim() === '') {
      delete cleanedData.tip;
    }
    if (!cleanedData.healthBenefits || cleanedData.healthBenefits.trim() === '') {
      delete cleanedData.healthBenefits;
    }
    if (!cleanedData.mentalBenefits || cleanedData.mentalBenefits.trim() === '') {
      delete cleanedData.mentalBenefits;
    }
    if (!cleanedData.longTermBenefits || cleanedData.longTermBenefits.trim() === '') {
      delete cleanedData.longTermBenefits;
    }
    if (!cleanedData.complementary || cleanedData.complementary.length === 0) {
      delete cleanedData.complementary;
    }
    if (!cleanedData.tags || cleanedData.tags.length === 0) {
      delete cleanedData.tags;
    }
    if (!cleanedData.aiEnhanced) {
      delete cleanedData.aiEnhanced;
    }
    
    // Remove interval fields if not interval frequency
    if (cleanedData.frequency !== 'interval') {
      delete cleanedData.intervalDays;
      delete cleanedData.startDate;
      delete cleanedData.reminderTime;
      delete cleanedData.reminderType;
    } else {
      // For interval habits, clean up reminder fields if not set
      if (!cleanedData.reminderTime || cleanedData.reminderTime.trim() === '') {
        delete cleanedData.reminderTime;
        delete cleanedData.reminderType;
      }
    }
    
    // For daily habits, set all days as target
    if (cleanedData.frequency === 'daily') {
      cleanedData.targetDays = [0, 1, 2, 3, 4, 5, 6];
    }
    
    // For interval habits, clear targetDays
    if (cleanedData.frequency === 'interval') {
      cleanedData.targetDays = [];
    }
    
    console.log('Cleaned data being submitted:', cleanedData);
    onSubmit(cleanedData);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {submitText === 'Create Habit' ? 'Create New Habit' : 'Edit Habit'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Input
                label="Habit Name"
                placeholder="e.g., Morning meditation, Read 30 minutes"
                error={errors.name?.message}
                {...register('name')}
              />
              {/* AI Enhancement Button */}
              {watchName?.trim() && (
                <div className="mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAIEnhance}
                    loading={aiLoading}
                    className="text-primary-600 border-primary-200 hover:bg-primary-50 dark:text-primary-400 dark:border-primary-800 dark:hover:bg-primary-950"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    ✨ AI Enhance
                  </Button>
                  {aiError && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md dark:bg-red-950 dark:border-red-800">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-700 dark:text-red-300">
                          {aiError}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                Description (optional)
              </label>
              <div className="relative">
                <textarea
                  className={cn(
                    "input w-full min-h-[80px] resize-none",
                    errors.description && 'border-error-500 focus:ring-error-500/30 focus:border-error-500 focus:bg-error-50/30 dark:focus:bg-error-950/30'
                  )}
                  placeholder="Add more details about your habit..."
                  {...register('description')}
                />
              </div>
              {errors.description && (
                <p className="text-sm text-error-500 mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* AI Enhancement Card */}
          {aiEnhancement && (
            <HabitEnhancementCard
              enhancement={aiEnhancement}
              onApply={applyAIEnhancement}
              onClose={() => setAiEnhancement(null)}
            />
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Tags <span className="text-text-muted-light dark:text-text-muted-dark text-xs">(optional)</span>
            </label>
            <TagInput
              tags={watchTags || []}
              onChange={(newTags) => setValue('tags', newTags)}
              placeholder="Add tags to organize your habit (optional)..."
              suggestions={SUGGESTED_TAGS}
              maxTags={10}
            />
            {errors.tags && (
              <p className="text-sm text-error-500 mt-1">{errors.tags.message}</p>
            )}
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Color
            </label>
            <div className="flex space-x-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    watchColor === color 
                      ? 'border-primary-500 scale-110' 
                      : 'border-border-light dark:border-border-dark hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setValue('color', color)}
                />
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Frequency
            </label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="daily"
                  className="mr-2"
                  {...register('frequency')}
                />
                Daily
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="weekly"
                  className="mr-2"
                  {...register('frequency')}
                />
                Specific Days
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="interval"
                  className="mr-2"
                  {...register('frequency')}
                />
                Every X Days
              </label>
            </div>
          </div>

          {/* Interval Configuration */}
          {watchFrequency === 'interval' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                    Every X Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    className="input w-full"
                    placeholder="e.g., 2 for every 2 days"
                    {...register('intervalDays', { valueAsNumber: true })}
                  />
                  {errors.intervalDays && (
                    <p className="text-sm text-error-500 mt-1">{errors.intervalDays.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="input w-full"
                    {...register('startDate')}
                  />
                </div>
              </div>
              
              {/* Time Configuration */}
              <div>
                <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-3">
                  Preferred Time (Optional)
                </label>
                <div className="space-y-3">
                  {/* Time Type Selection */}
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="general"
                        className="mr-2"
                        {...register('reminderType')}
                      />
                      General Time
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="specific"
                        className="mr-2"
                        {...register('reminderType')}
                      />
                      Specific Time
                    </label>
                  </div>
                  
                  {/* Time Input based on selection */}
                  {watchReminderType === 'general' && (
                    <select
                      className="input w-full"
                      {...register('reminderTime')}
                    >
                      <option value="">No preference</option>
                      {getTimeFormatOptions(timeFormatPreferences).map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                  
                  {watchReminderType === 'specific' && (
                    <input
                      type="time"
                      className="input w-full"
                      placeholder={getTimePlaceholder(timeFormatPreferences)}
                      {...register('reminderTime')}
                    />
                  )}
                </div>
                <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1">
                  Set when you prefer to do this habit to make it more actionable
                </p>
              </div>
              
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                This habit will be due every {watch('intervalDays') || 2} days starting from the selected date{watch('reminderTime') && watchReminderType === 'general' ? ` in the ${watch('reminderTime')}` : watch('reminderTime') && watchReminderType === 'specific' ? ` at ${watch('reminderTime')}` : ''}.
              </p>
            </div>
          )}

          {/* Target Days */}
          {watchFrequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                Select Days
              </label>
              <div className="grid grid-cols-7 gap-2">
                {WEEKDAYS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      watchTargetDays?.includes(value)
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'border-border-light dark:border-border-dark hover:bg-secondary-50 dark:hover:bg-secondary-900'
                    }`}
                    onClick={() => handleTargetDayToggle(value)}
                  >
                    {label.slice(0, 3)}
                  </button>
                ))}
              </div>
              {errors.targetDays && (
                <p className="text-sm text-error-500 mt-1">{errors.targetDays.message}</p>
              )}
            </div>
          )}

          {/* Goal Setting */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                Set Goal (optional)
              </label>
              <button
                type="button"
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                onClick={() => setShowGoal(!showGoal)}
              >
                {showGoal ? 'Remove Goal' : 'Add Goal'}
              </button>
            </div>
            
            {showGoal && (
              <div className="space-y-3 p-4 bg-secondary-50 dark:bg-secondary-900 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Goal Type</label>
                    <select className="input w-full" {...register('goal.type')}>
                      <option value="streak">Streak</option>
                      <option value="completion">Completion Rate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Target</label>
                    <input
                      type="number"
                      className="input w-full"
                      min="1"
                      max="365"
                      {...register('goal.target', { valueAsNumber: true })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Period</label>
                  <select className="input w-full" {...register('goal.period')}>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* AI Enhancement Fields */}
          {(watch('aiEnhanced') || watchTip || watchHealthBenefits || watchMentalBenefits || watchLongTermBenefits) && (
            <div className="bg-primary-50 dark:bg-primary-950 p-4 rounded-lg border border-primary-200 dark:border-primary-800">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary-500" />
                <h3 className="font-medium text-primary-800 dark:text-primary-200">
                  AI Enhancement Details
                </h3>
                {watch('aiEnhanced') && (
                  <span className="text-xs px-2 py-1 bg-primary-200 text-primary-800 rounded-full dark:bg-primary-800 dark:text-primary-200">
                    Enhanced
                  </span>
                )}
              </div>
              
              {/* Benefits Title */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-primary-800 dark:text-primary-200">
                  Motivation & Benefits
                </h4>
                <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                  Detailed benefits help maintain motivation and remind you why this habit matters
                </p>
              </div>

              {/* Detailed Benefits */}
              <div className="space-y-4">
                {/* Health Benefits */}
                {(watchHealthBenefits || watch('aiEnhanced')) && (
                  <div>
                    <label className="block text-sm font-medium text-primary-800 dark:text-primary-200 mb-2">
                      💪 Health Benefits
                    </label>
                    <textarea
                      className="input w-full min-h-[80px] resize-none"
                      placeholder="Physical health improvements and benefits..."
                      {...register('healthBenefits')}
                    />
                    {errors.healthBenefits && (
                      <p className="text-sm text-error-500 mt-1">{errors.healthBenefits.message}</p>
                    )}
                  </div>
                )}

                {/* Mental Benefits */}
                {(watchMentalBenefits || watch('aiEnhanced')) && (
                  <div>
                    <label className="block text-sm font-medium text-primary-800 dark:text-primary-200 mb-2">
                      🧠 Mental & Emotional Benefits
                    </label>
                    <textarea
                      className="input w-full min-h-[80px] resize-none"
                      placeholder="Mental, emotional, and cognitive benefits..."
                      {...register('mentalBenefits')}
                    />
                    {errors.mentalBenefits && (
                      <p className="text-sm text-error-500 mt-1">{errors.mentalBenefits.message}</p>
                    )}
                  </div>
                )}

                {/* Long-term Benefits */}
                {(watchLongTermBenefits || watch('aiEnhanced')) && (
                  <div>
                    <label className="block text-sm font-medium text-primary-800 dark:text-primary-200 mb-2">
                      🎯 Long-term Benefits
                    </label>
                    <textarea
                      className="input w-full min-h-[80px] resize-none"
                      placeholder="Long-term life improvements and outcomes..."
                      {...register('longTermBenefits')}
                    />
                    {errors.longTermBenefits && (
                      <p className="text-sm text-error-500 mt-1">{errors.longTermBenefits.message}</p>
                    )}
                  </div>
                )}

                {/* Success Tips & Strategies - Elaborated section */}
                {(watchTip || watch('aiEnhanced')) && (
                  <div>
                    <label className="block text-sm font-medium text-primary-800 dark:text-primary-200 mb-2">
                      💡 Success Tips & Strategies
                    </label>
                    <div className="mb-2">
                      <p className="text-xs text-primary-600 dark:text-primary-400">
                        Share actionable strategies, timing advice, environmental setup, potential obstacles and how to overcome them, habit stacking opportunities, and motivation techniques.
                      </p>
                    </div>
                    <textarea
                      className="input w-full min-h-[120px] resize-y"
                      placeholder="Example: Start with just 5 minutes daily and gradually increase. Set up your environment the night before - lay out workout clothes, prepare healthy snacks, or place your book on your pillow. Link this habit to an existing routine like 'after my morning coffee' or 'before checking emails'. Common obstacles include lack of time (solution: start smaller) or forgetting (solution: set phone reminders). Track your progress visually and celebrate small wins to maintain motivation..."
                      {...register('tip')}
                    />
                    {errors.tip && (
                      <p className="text-sm text-error-500 mt-1">{errors.tip.message}</p>
                    )}
                    <div className="mt-2">
                      <p className="text-xs text-primary-600 dark:text-primary-400">
                        💪 Pro tip: The more specific and actionable your strategies, the more likely you are to succeed!
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Complementary Habits */}
              {watchComplementary && watchComplementary.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-primary-800 dark:text-primary-200 mb-2">
                    Complementary Habits
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {watchComplementary.map((habit, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-primary-200 text-primary-800 text-sm rounded-full dark:bg-primary-800 dark:text-primary-200"
                      >
                        {habit}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                    These habits work well together with your main habit
                  </p>
                </div>
              )}
            </div>
          )}

          <Button type="submit" className="w-full" loading={loading}>
            {submitText}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}