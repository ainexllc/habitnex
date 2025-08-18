'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CreateHabitForm } from '@/types';

const habitSchema = z.object({
  name: z.string().min(1, 'Habit name is required').max(50, 'Name too long'),
  description: z.string().max(200, 'Description too long').optional(),
  category: z.string().min(1, 'Category is required'),
  color: z.string().min(1, 'Please select a color'),
  frequency: z.enum(['daily', 'weekly']),
  targetDays: z.array(z.number()).min(1, 'Select at least one day'),
  goal: z.object({
    type: z.enum(['streak', 'completion']),
    target: z.number().min(1).max(365),
    period: z.enum(['weekly', 'monthly']),
  }).optional(),
});

const CATEGORIES = [
  'Health & Fitness',
  'Learning & Growth', 
  'Productivity',
  'Relationships',
  'Hobbies',
  'Mindfulness',
  'Other'
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

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateHabitForm>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      category: initialData?.category || '',
      color: initialData?.color || COLORS[0],
      frequency: initialData?.frequency || 'daily',
      targetDays: initialData?.targetDays || [0, 1, 2, 3, 4, 5, 6],
      goal: initialData?.goal || undefined,
    },
  });

  const watchFrequency = watch('frequency');
  const watchTargetDays = watch('targetDays');
  const watchColor = watch('color');

  const handleTargetDayToggle = (day: number) => {
    const currentDays = watchTargetDays || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort();
    setValue('targetDays', newDays);
  };

  const handleFormSubmit = (data: CreateHabitForm) => {
    // Clean up the data before submitting
    const cleanedData: CreateHabitForm = {
      ...data,
      goal: showGoal && data.goal ? data.goal : undefined,
    };
    
    // Remove undefined fields to prevent Firestore errors
    if (!cleanedData.goal) {
      delete cleanedData.goal;
    }
    if (!cleanedData.description) {
      delete cleanedData.description;
    }
    
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
            <Input
              label="Habit Name"
              placeholder="e.g., Morning meditation, Read 30 minutes"
              error={errors.name?.message}
              {...register('name')}
            />
            
            <div>
              <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                Description (optional)
              </label>
              <textarea
                className="input w-full min-h-[80px] resize-none"
                placeholder="Add more details about your habit..."
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-error-500 mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Category
            </label>
            <select
              className="input w-full"
              {...register('category')}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-sm text-error-500 mt-1">{errors.category.message}</p>
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
            <div className="flex space-x-4">
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
            </div>
          </div>

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

          <Button type="submit" className="w-full" loading={loading}>
            {submitText}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}