'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { theme } from '@/lib/theme';
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
        return `border ${theme.status.error.border} ${theme.status.error.bg}`;
      case 'medium':
        return `border ${theme.status.warning.border} ${theme.status.warning.bg}`;
      case 'low':
        return `border ${theme.status.success.border} ${theme.status.success.bg}`;
    }
  };

  return (
    <Card className={`border-l-4 border-l-purple-500 ${getPriorityColor()} transition-all duration-200`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getMoodIcon()}
            <div>
              <CardTitle className={`text-lg ${theme.text.primary}`}>
                {strategy.title}
              </CardTitle>
              <p className={`text-sm ${theme.text.muted} mt-1`}>
                When experiencing: {getTriggerDescription()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              strategy.priority === 'high' 
                ? `${theme.status.error.bg} ${theme.status.error.text}`
                : strategy.priority === 'medium'
                ? `${theme.status.warning.bg} ${theme.status.warning.text}`
                : `${theme.status.success.bg} ${theme.status.success.text}`
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
          <p className={`${theme.text.secondary} leading-relaxed`}>
            {strategy.message}
          </p>
        </div>

        {/* Strategy name */}
        <div className={`mb-4 p-3 ${theme.surface.primary} rounded-lg border ${theme.border.default}`}>
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
            <h4 className={`font-medium ${theme.text.primary} mb-3 flex items-center gap-2`}>
              <CheckCircle className="w-4 h-4 text-green-500" />
              Implementation Steps:
            </h4>
            <div className="space-y-2">
              {strategy.implementation.map((step, index) => (
                <div key={index} className={`flex items-start gap-3 p-2 ${theme.surface.hover} rounded`}>
                  <span className={`flex-shrink-0 w-5 h-5 ${theme.status.info.bg} ${theme.status.info.text} rounded-full flex items-center justify-center text-xs font-medium`}>
                    {index + 1}
                  </span>
                  <p className={`text-sm ${theme.text.secondary} flex-1`}>
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mood trigger ranges */}
        {expanded && (
          <div className={`mb-4 p-3 ${theme.surface.secondary} rounded-lg`}>
            <h4 className={`font-medium ${theme.text.primary} mb-2 text-sm`}>
              Trigger Conditions:
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {Object.entries(strategy.moodTrigger).map(([key, range]) => (
                range && (
                  <div key={key} className="flex items-center justify-between">
                    <span className={`capitalize ${theme.text.muted}`}>{key}:</span>
                    <span className={`${theme.text.primary} font-medium`}>
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
            <span className={`${theme.text.muted}`}>Confidence:</span>
            <div className="flex items-center gap-2">
              <div className={`w-20 h-2 ${theme.surface.tertiary} rounded-full overflow-hidden`}>
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${strategy.confidence * 100}%` }}
                />
              </div>
              <span className={`${theme.text.primary} font-medium`}>
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
            className={`text-xs ${theme.text.muted} hover:${theme.text.secondary}`}
          >
            Not Helpful
          </Button>
        </div>

        {/* Usage tip */}
        {expanded && (
          <div className={`mt-4 p-3 ${theme.status.info.bg} border ${theme.status.info.border} rounded-lg`}>
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className={`font-medium ${theme.status.info.text} mb-1`}>
                  Usage Tip
                </p>
                <p className={`${theme.status.info.text}`}>
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