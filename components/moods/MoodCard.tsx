'use client';

import { MoodEntry } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { theme } from '@/lib/theme';
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
    // Parse YYYY-MM-DD format in local timezone
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Compare dates in local timezone
    const isToday = date.getFullYear() === today.getFullYear() && 
                   date.getMonth() === today.getMonth() && 
                   date.getDate() === today.getDate();
                   
    const isYesterday = date.getFullYear() === yesterday.getFullYear() && 
                       date.getMonth() === yesterday.getMonth() && 
                       date.getDate() === yesterday.getDate();
    
    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    
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
      <Icon className={`w-4 h-4 ${theme.text.muted}`} />
      <div className="flex-1">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className={theme.text.muted}>{label}</span>
          <span className="font-medium">{value}/5</span>
        </div>
        <div className={`w-full ${theme.surface.tertiary} rounded-full h-2`}>
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
              <p className={`text-sm ${theme.text.secondary}`}>
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
              <Tag className={`w-3 h-3 ${theme.text.muted}`} />
              <span className={`text-xs ${theme.text.muted}`}>
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
            <p className={`text-xs ${theme.text.muted}`}>
              Notes
            </p>
            <p className={`text-sm ${theme.text.primary} ${theme.surface.secondary} p-3 rounded-lg`}>
              {mood.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}