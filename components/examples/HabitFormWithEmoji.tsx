'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { OpenMoji } from '@/components/ui/OpenMoji';
import { OpenMojiPickerPopover, OpenMojiPickerCompact } from '@/components/ui/OpenMojiPicker';
import type { EmojiMapping } from '@/lib/openmoji/emojiMap';
import { Sparkles } from 'lucide-react';

const habitWithEmojiSchema = z.object({
  name: z.string().min(1, 'Habit name is required').max(50, 'Name too long'),
  description: z.string().max(200, 'Description too long').optional(),
  emoji: z.string().optional(),
  color: z.string().min(1, 'Please select a color'),
  frequency: z.enum(['daily', 'weekly', 'interval']),
  targetDays: z.array(z.number()),
});

type HabitWithEmojiForm = z.infer<typeof habitWithEmojiSchema>;

interface HabitFormWithEmojiProps {
  onSubmit: (data: HabitWithEmojiForm & { emojiData?: EmojiMapping }) => void;
  initialData?: Partial<HabitWithEmojiForm>;
  isLoading?: boolean;
}

const colorOptions = [
  { value: '#ef4444', label: 'Red', color: 'bg-red-500' },
  { value: '#f97316', label: 'Orange', color: 'bg-orange-500' },
  { value: '#eab308', label: 'Yellow', color: 'bg-yellow-500' },
  { value: '#22c55e', label: 'Green', color: 'bg-green-500' },
  { value: '#3b82f6', label: 'Blue', color: 'bg-blue-500' },
  { value: '#8b5cf6', label: 'Purple', color: 'bg-purple-500' },
  { value: '#ec4899', label: 'Pink', color: 'bg-pink-500' },
  { value: '#6b7280', label: 'Gray', color: 'bg-gray-500' },
];

export const HabitFormWithEmoji: React.FC<HabitFormWithEmojiProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [selectedEmoji, setSelectedEmoji] = useState<EmojiMapping | null>(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HabitWithEmojiForm>({
    resolver: zodResolver(habitWithEmojiSchema),
    defaultValues: {
      frequency: 'daily',
      targetDays: [0, 1, 2, 3, 4, 5, 6], // All days by default
      color: '#3b82f6',
      ...initialData,
    },
  });

  const habitName = watch('name');
  const selectedColor = watch('color');

  const handleEmojiSelect = (emoji: EmojiMapping) => {
    setSelectedEmoji(emoji);
    setValue('emoji', emoji.name);
    setEmojiPickerOpen(false);
  };

  const handleFormSubmit = (data: HabitWithEmojiForm) => {
    onSubmit({
      ...data,
      emojiData: selectedEmoji || undefined,
    });
  };

  const removeEmoji = () => {
    setSelectedEmoji(null);
    setValue('emoji', '');
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Create New Habit</span>
          <Sparkles className="w-5 h-5 text-primary-500" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Habit Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Habit Name *
            </label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., Morning meditation"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Emoji Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Choose an Emoji
            </label>
            
            <div className="flex items-center space-x-4">
              {/* Current Selection Display */}
              <div className="flex items-center space-x-2">
                {selectedEmoji ? (
                  <div className="flex items-center space-x-2 p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                    <OpenMoji emoji={selectedEmoji.name} size={32} />
                    <div className="text-sm">
                      <p className="font-medium">{selectedEmoji.name}</p>
                      <p className="text-gray-500">{selectedEmoji.unicode}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeEmoji}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-12 h-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md">
                    <span className="text-gray-400 text-sm">🎯</span>
                  </div>
                )}
              </div>

              {/* Picker Trigger */}
              <OpenMojiPickerPopover
                trigger={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <span>Choose Emoji</span>
                  </Button>
                }
                open={emojiPickerOpen}
                onOpenChange={setEmojiPickerOpen}
                onEmojiSelect={handleEmojiSelect}
                habitContext={habitName}
                showSearch={true}
                showCategories={true}
                showRecent={true}
                showPopular={true}
              />
            </div>

            {/* Quick Suggestions */}
            {habitName && habitName.length > 2 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Quick suggestions for "{habitName}":</p>
                <OpenMojiPickerCompact
                  habitContext={habitName}
                  onEmojiSelect={handleEmojiSelect}
                  maxEmojis={12}
                  columns={6}
                  className="border border-gray-200 dark:border-gray-700"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <Input
              id="description"
              {...register('description')}
              placeholder="Brief description of this habit"
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Color *
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setValue('color', option.value)}
                  className={`w-8 h-8 rounded-full ${option.color} transition-transform hover:scale-110 ${
                    selectedColor === option.value 
                      ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-gray-100' 
                      : ''
                  }`}
                  title={option.label}
                />
              ))}
            </div>
            {errors.color && (
              <p className="text-sm text-red-600">{errors.color.message}</p>
            )}
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Frequency *
            </label>
            <select
              {...register('frequency')}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="interval">Custom Interval</option>
            </select>
          </div>

          {/* Preview Card */}
          {habitName && (
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800">
              <h3 className="text-sm font-medium mb-2">Preview:</h3>
              <div 
                className="flex items-center space-x-3 p-3 rounded-md text-white"
                style={{ backgroundColor: selectedColor }}
              >
                {selectedEmoji ? (
                  <OpenMoji emoji={selectedEmoji.name} size={24} />
                ) : (
                  <span className="text-lg">🎯</span>
                )}
                <div>
                  <p className="font-medium">{habitName}</p>
                  {watch('description') && (
                    <p className="text-sm opacity-90">{watch('description')}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              {isLoading && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
              <span>{isLoading ? 'Creating...' : 'Create Habit'}</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};