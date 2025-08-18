'use client';

import { MoodEntry } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Smile, 
  Battery,
  Zap,
  Moon,
  Edit,
  Trash2,
  Tag,
  Heart
} from 'lucide-react';

interface MoodCardProps {
  mood: MoodEntry;
  onEdit?: (mood: MoodEntry) => void;
  onDelete?: (moodId: string) => void;
}

const MOOD_COLORS = {
  1: 'text-error-500',
  2: 'text-warning-500', 
  3: 'text-secondary-500',
  4: 'text-success-500',
  5: 'text-primary-500'
};

const MOOD_EMOJIS = {
  1: '😢',
  2: '😕',
  3: '😐', 
  4: '🙂',
  5: '😊'
};

export function MoodCard({ mood, onEdit, onDelete }: MoodCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (date.toDateString() === today) return 'Today';
    if (date.toDateString() === yesterday) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getMeterColor = (value: number, type: 'mood' | 'energy' | 'stress' | 'sleep') => {
    if (type === 'stress') {
      // For stress, lower is better (green), higher is worse (red)
      if (value <= 2) return 'bg-success-500';
      if (value <= 3) return 'bg-warning-500';
      return 'bg-error-500';
    } else {
      // For mood, energy, sleep - higher is better
      if (value >= 4) return 'bg-success-500';
      if (value >= 3) return 'bg-warning-500';
      return 'bg-error-500';
    }
  };

  const MoodMeter = ({ 
    label, 
    value, 
    icon: Icon, 
    type 
  }: { 
    label: string, 
    value: number, 
    icon: any, 
    type: 'mood' | 'energy' | 'stress' | 'sleep' 
  }) => (
    <div className="flex items-center space-x-3">
      <Icon className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
      <div className="flex-1">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-text-secondary-light dark:text-text-secondary-dark">{label}</span>
          <span className="font-medium">{value}/5</span>
        </div>
        <div className="w-full bg-secondary-200 dark:bg-secondary-800 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${getMeterColor(value, type)}`}
            style={{ width: `${(value / 5) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">
              {MOOD_EMOJIS[mood.mood as keyof typeof MOOD_EMOJIS]}
            </div>
            <div>
              <CardTitle className="text-lg flex items-center">
                <Heart className="w-4 h-4 mr-1 text-primary-600 dark:text-primary-400" />
                {formatDate(mood.date)}
              </CardTitle>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Overall mood: {mood.mood}/5
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(mood)}>
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={() => onDelete(mood.id)}>
                <Trash2 className="w-4 h-4 text-error-500" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mood Meters */}
        <div className="space-y-3">
          <MoodMeter label="Mood" value={mood.mood} icon={Smile} type="mood" />
          <MoodMeter label="Energy" value={mood.energy} icon={Battery} type="energy" />
          <MoodMeter label="Stress" value={mood.stress} icon={Zap} type="stress" />
          <MoodMeter label="Sleep" value={mood.sleep} icon={Moon} type="sleep" />
        </div>

        {/* Tags */}
        {mood.tags && mood.tags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-1">
              <Tag className="w-3 h-3 text-text-secondary-light dark:text-text-secondary-dark" />
              <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                Tags
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {mood.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs rounded-full"
                >
                  {tag.replace('-', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {mood.notes && (
          <div className="space-y-2">
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              Notes
            </p>
            <p className="text-sm text-text-primary-light dark:text-text-primary-dark bg-secondary-50 dark:bg-secondary-900 p-3 rounded-lg">
              {mood.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}