import { HabitEnhancement } from '@/types/claude';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Sparkles, 
  Target, 
  Lightbulb, 
  CheckCircle,
  ArrowRight,
  X
} from 'lucide-react';

interface HabitEnhancementCardProps {
  enhancement: HabitEnhancement;
  onApply: (enhancement: HabitEnhancement) => void;
  onClose: () => void;
  cached?: boolean;
  cost?: number;
}

export function HabitEnhancementCard({ 
  enhancement, 
  onApply, 
  onClose, 
  cached = false, 
  cost = 0 
}: HabitEnhancementCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'hard': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
    }
  };

  return (
    <Card className="border-2 border-primary-200 dark:border-primary-800 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-950 dark:to-blue-950">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary-500" />
            AI Enhancement
            {cached && (
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full dark:bg-green-900 dark:text-green-300">
                Cached
              </span>
            )}
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
        {!cached && cost > 0 && (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            AI Cost: ${cost.toFixed(4)}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {enhancement.description}
          </p>
        </div>

        {/* Detailed Benefits */}
        <div className="space-y-3">
          {/* Health Benefits */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              💪 Health Benefits
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {enhancement.healthBenefits}
            </p>
          </div>

          {/* Mental Benefits */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-500" />
              🧠 Mental Benefits
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {enhancement.mentalBenefits}
            </p>
          </div>

          {/* Long-term Benefits */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-500" />
              🎯 Long-term Benefits
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
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
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h5 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
                💡 Success Tips & Strategies
              </h5>
              <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                {enhancement.tip}
              </p>
              <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                💪 These strategies are designed to maximize your success rate
              </div>
            </div>
          </div>
        </div>

        {/* Complementary Habits */}
        {enhancement.complementary.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              Works Great With
            </h5>
            <div className="flex flex-wrap gap-2">
              {enhancement.complementary.map((habit, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md dark:bg-blue-900 dark:text-blue-300"
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