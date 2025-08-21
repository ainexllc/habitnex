'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { MoodBasedStrategy } from '@/lib/aiCoach';
import { 
  Heart,
  Zap,
  Shield,
  Moon,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Lightbulb,
  Target
} from 'lucide-react';

interface MoodStrategyCardProps {
  strategy: MoodBasedStrategy;
  onSaveStrategy?: (strategyId: string) => void;
  onApplyStrategy?: (strategyId: string) => void;
  compact?: boolean;
}

export function MoodStrategyCard({ 
  strategy, 
  onSaveStrategy,
  onApplyStrategy,
  compact = false
}: MoodStrategyCardProps) {
  const [expanded, setExpanded] = useState(!compact);

  const getMoodIcon = () => {
    // Determine the primary mood trigger
    const triggers = strategy.moodTrigger;
    
    if (triggers.mood && triggers.mood[1] <= 2) {
      return <Heart className="w-5 h-5 text-red-500" />;
    }
    if (triggers.energy && triggers.energy[1] <= 2) {
      return <Zap className="w-5 h-5 text-orange-500" />;
    }
    if (triggers.stress && triggers.stress[0] >= 4) {
      return <Shield className="w-5 h-5 text-purple-500" />;
    }
    if (triggers.sleep && triggers.sleep[1] <= 2) {
      return <Moon className="w-5 h-5 text-blue-500" />;
    }
    
    return <Lightbulb className="w-5 h-5 text-green-500" />;
  };

  const getTriggerDescription = () => {
    const triggers = strategy.moodTrigger;
    const descriptions: string[] = [];
    
    if (triggers.mood) {
      if (triggers.mood[1] <= 2) descriptions.push('Low mood');
      else if (triggers.mood[0] >= 4) descriptions.push('High mood');
    }
    
    if (triggers.energy) {
      if (triggers.energy[1] <= 2) descriptions.push('Low energy');
      else if (triggers.energy[0] >= 4) descriptions.push('High energy');
    }
    
    if (triggers.stress) {
      if (triggers.stress[0] >= 4) descriptions.push('High stress');
      else if (triggers.stress[1] <= 2) descriptions.push('Low stress');
    }
    
    if (triggers.sleep) {
      if (triggers.sleep[1] <= 2) descriptions.push('Poor sleep');
      else if (triggers.sleep[0] >= 4) descriptions.push('Great sleep');
    }
    
    return descriptions.length > 0 ? descriptions.join(' + ') : 'General strategy';
  };

  const getPriorityColor = () => {
    switch (strategy.priority) {
      case 'high':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20';
      case 'low':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20';
    }
  };

  return (
    <Card className={`border-l-4 border-l-purple-500 ${getPriorityColor()} transition-all duration-200`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getMoodIcon()}
            <div>
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                {strategy.title}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                When experiencing: {getTriggerDescription()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              strategy.priority === 'high' 
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : strategy.priority === 'medium'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            }`}>
              {strategy.priority}
            </span>
            
            {compact && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="p-1"
              >
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Strategy overview */}
        <div className="mb-4">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {strategy.message}
          </p>
        </div>

        {/* Strategy name */}
        <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-600" />
            <span className="font-medium text-purple-800 dark:text-purple-200">
              Strategy: {strategy.strategy}
            </span>
          </div>
        </div>

        {/* Implementation steps */}
        {expanded && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Implementation Steps:
            </h4>
            <div className="space-y-2">
              {strategy.implementation.map((step, index) => (
                <div key={index} className="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                  <span className="flex-shrink-0 w-5 h-5 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mood trigger ranges */}
        {expanded && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 text-sm">
              Trigger Conditions:
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {Object.entries(strategy.moodTrigger).map(([key, range]) => (
                range && (
                  <div key={key} className="flex items-center justify-between">
                    <span className="capitalize text-gray-600 dark:text-gray-400">{key}:</span>
                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                      {range[0]}-{range[1]}
                    </span>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Confidence indicator */}
        {expanded && (
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${strategy.confidence * 100}%` }}
                />
              </div>
              <span className="text-gray-800 dark:text-gray-200 font-medium">
                {Math.round(strategy.confidence * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {onApplyStrategy && (
            <Button
              size="sm"
              onClick={() => onApplyStrategy(strategy.id)}
              className="text-xs"
            >
              Apply Strategy
            </Button>
          )}
          
          {onSaveStrategy && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSaveStrategy(strategy.id)}
              className="text-xs"
            >
              Save for Later
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Not Helpful
          </Button>
        </div>

        {/* Usage tip */}
        {expanded && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Usage Tip
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  This strategy works best when applied consistently during the specified mood conditions. 
                  Start with step 1 and gradually incorporate other steps as they become natural.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}