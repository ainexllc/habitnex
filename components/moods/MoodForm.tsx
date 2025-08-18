'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CreateMoodForm } from '@/types';
import { 
  Smile, 
  Frown, 
  Meh, 
  Heart,
  Battery,
  Zap,
  Shield,
  Moon,
  Tag
} from 'lucide-react';

const moodSchema = z.object({
  mood: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  energy: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  stress: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  sleep: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  notes: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
});

const MOOD_LABELS = {
  1: 'Very Bad',
  2: 'Bad', 
  3: 'Okay',
  4: 'Good',
  5: 'Excellent'
};

const ENERGY_LABELS = {
  1: 'Very Low',
  2: 'Low',
  3: 'Moderate', 
  4: 'High',
  5: 'Very High'
};

const STRESS_LABELS = {
  1: 'Very Low',
  2: 'Low',
  3: 'Moderate',
  4: 'High', 
  5: 'Very High'
};

const SLEEP_LABELS = {
  1: 'Very Poor',
  2: 'Poor',
  3: 'Okay',
  4: 'Good',
  5: 'Excellent'
};

const COMMON_TAGS = [
  'work-stress', 'family-time', 'exercise', 'social', 'travel',
  'sick', 'tired', 'excited', 'anxious', 'productive',
  'lazy-day', 'celebration', 'deadline', 'weekend',
  'grateful', 'overwhelmed', 'focused', 'creative', 'peaceful',
  'frustrated', 'motivated', 'lonely', 'content', 'restless',
  'confident', 'sad', 'energetic', 'calm', 'stressed',
  'happy', 'angry', 'hopeful', 'worried', 'relaxed', 'relieved'
];

interface MoodFormProps {
  onSubmit: (data: CreateMoodForm) => Promise<void>;
  loading?: boolean;
  initialData?: Partial<CreateMoodForm>;
  date?: string;
}

export function MoodForm({ onSubmit, loading = false, initialData, date }: MoodFormProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);

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

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    setValue('tags', newTags);
  };

  const handleFormSubmit = (data: CreateMoodForm) => {
    const cleanedData = {
      ...data,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    };
    
    if (!cleanedData.notes || cleanedData.notes.trim() === '') {
      delete cleanedData.notes;
    }
    
    onSubmit(cleanedData);
  };

  const RatingScale = ({ 
    name, 
    value, 
    icon: Icon, 
    labels, 
    color 
  }: { 
    name: keyof CreateMoodForm, 
    value: number, 
    icon: any, 
    labels: Record<number, string>,
    color: string 
  }) => (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Icon className={`w-5 h-5 ${color}`} />
        <span className="text-sm font-medium capitalize">{name}</span>
        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          {labels[value as keyof typeof labels]}
        </span>
      </div>
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            className={`w-10 h-10 rounded-full border-2 text-sm font-medium transition-all ${
              value === rating
                ? `${color.replace('text-', 'border-')} ${color.replace('text-', 'bg-')} text-white`
                : 'border-border-light dark:border-border-dark hover:border-primary-300'
            }`}
            onClick={() => setValue(name, rating as any)}
          >
            {rating}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Heart className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
          Track Your Mood
          {date && (
            <span className="ml-2 text-sm font-normal text-text-secondary-light dark:text-text-secondary-dark">
              {new Date(date).toLocaleDateString()}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
          {/* Mood Rating */}
          <RatingScale
            name="mood"
            value={watchMood}
            icon={Smile}
            labels={MOOD_LABELS}
            color="text-primary-600 dark:text-primary-400"
          />

          {/* Energy Rating */}
          <RatingScale
            name="energy"
            value={watchEnergy}
            icon={Battery}
            labels={ENERGY_LABELS}
            color="text-success-600 dark:text-success-400"
          />

          {/* Stress Rating */}
          <RatingScale
            name="stress"
            value={watchStress}
            icon={Zap}
            labels={STRESS_LABELS}
            color="text-warning-600 dark:text-warning-400"
          />

          {/* Sleep Rating */}
          <RatingScale
            name="sleep"
            value={watchSleep}
            icon={Moon}
            labels={SLEEP_LABELS}
            color="text-secondary-600 dark:text-secondary-400"
          />

          {/* Tags */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Tag className="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark" />
              <span className="text-sm font-medium">Tags (optional)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {COMMON_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-primary-500 text-white'
                      : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-700'
                  }`}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
              Notes (optional)
            </label>
            <textarea
              className="input w-full min-h-[100px] resize-none"
              placeholder="How are you feeling today? What's on your mind?"
              {...register('notes')}
            />
            {errors.notes && (
              <p className="text-sm text-error-500">{errors.notes.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" loading={loading}>
            Save Mood Entry
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}