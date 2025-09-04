'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { OpenMoji } from '@/components/ui/OpenMoji';
import { CreateMoodForm } from '@/types';
import { 
  Sparkles,
  MessageSquare,
  TrendingUp,
  Calendar,
  X,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

const moodSchema = z.object({
  mood: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  energy: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  stress: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  sleep: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  notes: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
});

// Mood faces with OpenMoji
const MOOD_FACES = [
  { value: 1, emoji: '😢', label: 'Very Bad', color: 'from-red-500 to-rose-500' },
  { value: 2, emoji: '😟', label: 'Bad', color: 'from-orange-500 to-amber-500' },
  { value: 3, emoji: '😐', label: 'Okay', color: 'from-yellow-500 to-lime-500' },
  { value: 4, emoji: '🙂', label: 'Good', color: 'from-green-500 to-emerald-500' },
  { value: 5, emoji: '😄', label: 'Excellent', color: 'from-blue-500 to-indigo-500' }
];

// Dimension configurations
const DIMENSIONS = {
  energy: {
    label: 'Energy Level',
    icon: '⚡',
    lowLabel: 'Exhausted',
    highLabel: 'Energized',
    gradient: 'from-gray-400 to-yellow-400',
    activeGradient: 'from-amber-400 to-yellow-500'
  },
  stress: {
    label: 'Stress Level',
    icon: '🌊',
    lowLabel: 'Calm',
    highLabel: 'Stressed',
    gradient: 'from-green-400 to-red-400',
    activeGradient: 'from-emerald-400 to-rose-500'
  },
  sleep: {
    label: 'Sleep Quality',
    icon: '🌙',
    lowLabel: 'Poor',
    highLabel: 'Excellent',
    gradient: 'from-purple-400 to-indigo-400',
    activeGradient: 'from-violet-400 to-indigo-500'
  }
};

// Popular mood tags
const MOOD_TAGS = [
  { id: 'productive', emoji: '🚀', label: 'Productive' },
  { id: 'creative', emoji: '🎨', label: 'Creative' },
  { id: 'social', emoji: '👥', label: 'Social' },
  { id: 'exercise', emoji: '💪', label: 'Exercise' },
  { id: 'family-time', emoji: '👨‍👩‍👧‍👦', label: 'Family Time' },
  { id: 'work', emoji: '💼', label: 'Work' },
  { id: 'relaxed', emoji: '🧘', label: 'Relaxed' },
  { id: 'anxious', emoji: '😰', label: 'Anxious' },
  { id: 'grateful', emoji: '🙏', label: 'Grateful' },
  { id: 'tired', emoji: '😴', label: 'Tired' },
  { id: 'motivated', emoji: '💫', label: 'Motivated' },
  { id: 'overwhelmed', emoji: '🤯', label: 'Overwhelmed' },
  { id: 'happy', emoji: '😊', label: 'Happy' },
  { id: 'focused', emoji: '🎯', label: 'Focused' },
  { id: 'sick', emoji: '🤧', label: 'Sick' },
];

interface ModernMoodFormProps {
  onSubmit: (data: CreateMoodForm) => Promise<void>;
  onClose?: () => void;
  loading?: boolean;
  initialData?: Partial<CreateMoodForm>;
  date?: string;
  mode?: 'create' | 'edit';
}

export function ModernMoodForm({ 
  onSubmit, 
  onClose,
  loading = false, 
  initialData, 
  date,
  mode = 'create'
}: ModernMoodFormProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
  const [showAllTags, setShowAllTags] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateMoodForm>({
    resolver: zodResolver(moodSchema),
    defaultValues: {
      mood: initialData?.mood || 3,
      energy: initialData?.energy || 3,
      stress: initialData?.stress || 3,
      sleep: initialData?.sleep || 3,
      notes: initialData?.notes || '',
      tags: initialData?.tags || [],
    },
  });

  const watchMood = watch('mood');
  const watchEnergy = watch('energy');
  const watchStress = watch('stress');
  const watchSleep = watch('sleep');

  const handleTagToggle = (tagId: string) => {
    const newTags = selectedTags.includes(tagId)
      ? selectedTags.filter(t => t !== tagId)
      : [...selectedTags, tagId];
    
    setSelectedTags(newTags);
    setValue('tags', newTags);
  };

  const handleFormSubmit = (data: CreateMoodForm) => {
    const cleanedData = { ...data };
    
    if (selectedTags.length > 0) {
      cleanedData.tags = selectedTags;
    } else {
      delete cleanedData.tags;
    }
    
    if (!cleanedData.notes || cleanedData.notes.trim() === '') {
      delete cleanedData.notes;
    }
    
    onSubmit(cleanedData);
  };

  const selectedMoodFace = MOOD_FACES.find(m => m.value === watchMood) || MOOD_FACES[2];
  const displayTags = showAllTags ? MOOD_TAGS : MOOD_TAGS.slice(0, 8);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="relative mb-6">
        <div className={cn(
          "absolute inset-0 rounded-3xl bg-gradient-to-br opacity-20 blur-xl",
          selectedMoodFace.color
        )} />
        <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                {mode === 'create' ? 'Track Your Mood' : 'Edit Mood Entry'}
              </h2>
              {date && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              )}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Primary Mood Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              How are you feeling?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select the emoji that best represents your overall mood
            </p>
          </div>

          <div className="flex justify-center items-center gap-2 sm:gap-4">
            {MOOD_FACES.map((mood) => (
              <button
                key={mood.value}
                type="button"
                onClick={() => setValue('mood', mood.value as any)}
                className={cn(
                  "group relative flex flex-col items-center p-3 sm:p-4 rounded-2xl transition-all duration-300",
                  watchMood === mood.value
                    ? "scale-110 bg-gradient-to-br shadow-xl transform -translate-y-1"
                    : "hover:scale-105 hover:bg-gray-50 dark:hover:bg-gray-700/50",
                  watchMood === mood.value && mood.color
                )}
              >
                <div className={cn(
                  "text-3xl sm:text-4xl mb-2 transition-all duration-300",
                  watchMood === mood.value ? "animate-bounce" : "group-hover:scale-110"
                )}>
                  <OpenMoji emoji={mood.emoji} size={48} alt={mood.label} />
                </div>
                <span className={cn(
                  "text-xs font-medium transition-colors",
                  watchMood === mood.value 
                    ? "text-white" 
                    : "text-gray-600 dark:text-gray-400"
                )}>
                  {mood.label}
                </span>
                {watchMood === mood.value && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-ping" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Dimensions */}
        <div className="space-y-4">
          {Object.entries(DIMENSIONS).map(([key, config]) => {
            const value = watch(key as keyof CreateMoodForm);
            return (
              <div
                key={key}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      <OpenMoji emoji={config.icon} size={24} alt={config.label} />
                    </span>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {config.label}
                    </h4>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium",
                    "bg-gradient-to-r text-white",
                    value >= 4 ? config.activeGradient : config.gradient
                  )}>
                    {value}/5
                  </div>
                </div>

                <div className="relative">
                  {/* Slider Track */}
                  <div className="relative h-12 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
                    <div 
                      className={cn(
                        "absolute inset-y-0 left-0 bg-gradient-to-r rounded-xl transition-all duration-500",
                        config.activeGradient
                      )}
                      style={{ width: `${(value / 5) * 100}%` }}
                    />
                    
                    {/* Slider Buttons */}
                    <div className="relative flex h-full">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          className={cn(
                            "flex-1 flex items-center justify-center transition-all duration-200",
                            "hover:bg-white/20 relative group"
                          )}
                          onClick={() => setValue(key as keyof CreateMoodForm, rating as any)}
                        >
                          <span className={cn(
                            "font-semibold transition-all duration-200",
                            value >= rating ? "text-white scale-110" : "text-gray-600 dark:text-gray-400",
                            "group-hover:scale-125"
                          )}>
                            {rating}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Labels */}
                  <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{config.lowLabel}</span>
                    <span>{config.highLabel}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tags Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            What influenced your mood? <span className="text-sm font-normal text-gray-500">(optional)</span>
          </h4>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {displayTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagToggle(tag.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
                  selectedTags.includes(tag.id)
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg scale-105"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                )}
              >
                <OpenMoji emoji={tag.emoji} size={16} alt={tag.label} />
                {tag.label}
              </button>
            ))}
          </div>
          
          {!showAllTags && MOOD_TAGS.length > 8 && (
            <button
              type="button"
              onClick={() => setShowAllTags(true)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Show more tags
            </button>
          )}
        </div>

        {/* Notes Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-500" />
            Additional thoughts <span className="text-sm font-normal text-gray-500">(optional)</span>
          </h4>
          
          <textarea
            {...register('notes')}
            placeholder="What's on your mind? Any specific events or feelings you'd like to note?"
            className={cn(
              "w-full px-4 py-3 rounded-xl",
              "bg-gray-50 dark:bg-gray-900",
              "border border-gray-200 dark:border-gray-700",
              "text-gray-900 dark:text-white",
              "placeholder-gray-400 dark:placeholder-gray-500",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "resize-none transition-all duration-200",
              "min-h-[100px]"
            )}
          />
          
          {errors.notes && (
            <p className="mt-2 text-sm text-red-500">{errors.notes.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          {onClose && (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            loading={loading}
            className={cn(
              "flex-1 bg-gradient-to-r shadow-lg",
              selectedMoodFace.color,
              "hover:shadow-xl hover:scale-105 transition-all duration-300"
            )}
          >
            {mode === 'create' ? 'Save Mood Entry' : 'Update Mood Entry'}
          </Button>
        </div>
      </form>
    </div>
  );
}