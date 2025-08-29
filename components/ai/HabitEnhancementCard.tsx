import { HabitEnhancement } from '@/types/claude';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { UsageBadge, UsageTooltip } from '@/components/ui/UsageIndicator';
import { theme } from '@/lib/theme';
import { 
  Sparkles, 
  Target, 
  Lightbulb, 
  CheckCircle,
  ArrowRight,
  X,
  Zap
} from 'lucide-react';

interface HabitEnhancementCardProps {
  enhancement: HabitEnhancement;
  onApply: (enhancement: HabitEnhancement) => void;
  onClose: () => void;
  cached?: boolean;
  cost?: number;
  remainingRequests?: number;
  responseTime?: number;
}

export function HabitEnhancementCard({ 
  enhancement, 
  onApply, 
  onClose, 
  cached = false, 
  cost = 0,
  remainingRequests,
  responseTime
}: HabitEnhancementCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return `${theme.status.success.text} ${theme.status.success.bg}`;
      case 'medium': return `${theme.status.warning.text} ${theme.status.warning.bg}`;
      case 'hard': return `${theme.status.error.text} ${theme.status.error.bg}`;
      default: return `${theme.text.muted} ${theme.surface.tertiary}`;
    }
  };

  return (
    <Card className={`border-2 ${theme.border.interactive} ${theme.gradients.primary}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-blue-500" />
            AI Enhancement
            {cached && (
              <span className={`text-xs px-2 py-1 rounded-full ${theme.status.success.bg} ${theme.status.success.text}`}>
                Cached
              </span>
            )}
            <UsageTooltip>
              <UsageBadge className="ml-2" />
            </UsageTooltip>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Usage and Cost Information */}
        <div className={`flex items-center gap-4 text-xs ${theme.text.muted}`}>
          {!cached && cost > 0 && (
            <div className="flex items-center gap-1">
              <span>💰</span>
              <span>Cost: ${cost.toFixed(4)}</span>
            </div>
          )}
          {responseTime && (
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>{responseTime}ms</span>
            </div>
          )}
          {remainingRequests !== undefined && (
            <div className="flex items-center gap-1">
              <span>⚡</span>
              <span>{remainingRequests} requests left today</span>
            </div>
          )}
          {cached && (
            <div className={`flex items-center gap-1 ${theme.status.success.text}`}>
              <span>🎯</span>
              <span>Free (from cache)</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <div>
          <p className={`${theme.text.secondary} leading-relaxed`}>
            {enhancement.enhancedDescription || enhancement.description}
          </p>
        </div>

        {/* Detailed Benefits */}
        <div className="space-y-3">
          {/* Health Benefits */}
          <div>
            <h4 className={`font-medium ${theme.text.primary} mb-2 flex items-center gap-2`}>
              <CheckCircle className="w-4 h-4 text-green-500" />
              💪 Health Benefits
            </h4>
            <p className={`text-sm ${theme.text.muted} leading-relaxed`}>
              {enhancement.healthBenefits}
            </p>
          </div>

          {/* Mental Benefits */}
          <div>
            <h4 className={`font-medium ${theme.text.primary} mb-2 flex items-center gap-2`}>
              <CheckCircle className="w-4 h-4 text-blue-500" />
              🧠 Mental Benefits
            </h4>
            <p className={`text-sm ${theme.text.muted} leading-relaxed`}>
              {enhancement.mentalBenefits}
            </p>
          </div>

          {/* Long-term Benefits */}
          <div>
            <h4 className={`font-medium ${theme.text.primary} mb-2 flex items-center gap-2`}>
              <CheckCircle className="w-4 h-4 text-purple-500" />
              🎯 Long-term Benefits
            </h4>
            <p className={`text-sm ${theme.text.muted} leading-relaxed`}>
              {enhancement.longTermBenefits}
            </p>
          </div>
        </div>

        {/* Difficulty */}
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(enhancement.difficulty)}`}>
            {enhancement.difficulty.toUpperCase()} DIFFICULTY
          </span>
        </div>

        {/* Success Tips & Strategies - Enhanced */}
        <div className={`${theme.status.warning.bg} p-4 rounded-lg border ${theme.status.warning.border}`}>
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h5 className={`text-sm font-semibold ${theme.status.warning.text} mb-2`}>
                💡 Success Tips & Strategies
              </h5>
              <p className={`text-sm ${theme.status.warning.text} leading-relaxed`}>
                {enhancement.tip}
              </p>
              <div className={`mt-2 text-xs ${theme.status.warning.icon}`}>
                💪 These strategies are designed to maximize your success rate
              </div>
            </div>
          </div>
        </div>

        {/* Complementary Habits */}
        {enhancement.complementary.length > 0 && (
          <div>
            <h5 className={`text-sm font-medium ${theme.text.primary} mb-2 flex items-center gap-2`}>
              <Target className="w-4 h-4 text-blue-500" />
              Works Great With
            </h5>
            <div className="flex flex-wrap gap-2">
              {enhancement.complementary.map((habit, index) => (
                <span 
                  key={index}
                  className={`px-2 py-1 text-xs rounded-md ${theme.components.badge.primary}`}
                >
                  {habit}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Apply Button */}
        <Button
          onClick={() => onApply(enhancement)}
          className="w-full"
          size="sm"
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          Apply AI Suggestions to Form
        </Button>
      </CardContent>
    </Card>
  );
}