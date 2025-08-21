'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { HabitCard } from './HabitCard';
import { BenefitsHabitCard } from './BenefitsHabitCard';
import { Habit } from '@/types';
import { LayoutGrid, List } from 'lucide-react';

interface HabitCardShowcaseProps {
  habits: Habit[];
  onEdit?: (habit: Habit) => void;
}

type CardType = 'original' | 'benefits';

export function HabitCardShowcase({ habits, onEdit }: HabitCardShowcaseProps) {
  const [cardType, setCardType] = useState<CardType>('benefits');

  return (
    <div className="space-y-6">
      {/* Card Type Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Habit Cards
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Choose your preferred card style
          </p>
        </div>
        
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <Button
            variant={cardType === 'original' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setCardType('original')}
            className="px-3"
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Compact
          </Button>
          <Button
            variant={cardType === 'benefits' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setCardType('benefits')}
            className="px-3"
          >
            <List className="w-4 h-4 mr-2" />
            Benefits
          </Button>
        </div>
      </div>

      {/* Card Grid */}
      <div className={`grid gap-6 ${
        cardType === 'benefits' 
          ? 'grid-cols-1 lg:grid-cols-2' 
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {habits.map((habit) => (
          cardType === 'benefits' ? (
            <BenefitsHabitCard
              key={habit.id}
              habit={habit}
              onEdit={onEdit}
            />
          ) : (
            <HabitCard
              key={habit.id}
              habit={habit}
              onEdit={onEdit}
            />
          )
        ))}
      </div>

      {/* Feature Comparison */}
      {habits.length > 0 && (
        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Card Features Comparison
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Compact Cards
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Minimal space usage</li>
                <li>• Quick completion actions</li>
                <li>• Basic streak & stats</li>
                <li>• Ideal for overview</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Benefits-Focused Cards
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Rich benefits information</li>
                <li>• Health & mental impact</li>
                <li>• Success tips & guidance</li>
                <li>• Motivation through why</li>
                <li>• Detailed progress metrics</li>
                <li>• Expandable content</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}