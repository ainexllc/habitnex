'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { FamilyHabit } from '@/types/family';
import { 
  Heart, 
  Brain, 
  TrendingUp, 
  Lightbulb,
  Target,
  Star,
  Award,
  Sparkles
} from 'lucide-react';

interface HabitBenefitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: FamilyHabit | null;
}

export function HabitBenefitsModal({ isOpen, onClose, habit }: HabitBenefitsModalProps) {
  if (!habit) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <span className="text-3xl">{habit.emoji}</span>
          <span>{habit.name}</span>
        </div>
      }
      size="lg"
    >
      <div className="space-y-6">
        {/* Description */}
        {habit.description && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {habit.description}
            </p>
          </div>
        )}

        {/* Health Benefits */}
        {habit.healthBenefits && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-400 to-pink-500 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span>Health Benefits</span>
            </div>
            <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-5 border border-red-100 dark:border-red-900/30">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {habit.healthBenefits}
              </p>
            </div>
          </div>
        )}

        {/* Mental Benefits */}
        {habit.mentalBenefits && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span>Mental Benefits</span>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-5 border border-purple-100 dark:border-purple-900/30">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {habit.mentalBenefits}
              </p>
            </div>
          </div>
        )}

        {/* Long-term Benefits */}
        {habit.longTermBenefits && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span>Long-term Benefits</span>
            </div>
            <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-5 border border-green-100 dark:border-green-900/30">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {habit.longTermBenefits}
              </p>
            </div>
          </div>
        )}

        {/* Success Tips */}
        {habit.successTips && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <span>Tips for Success</span>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-5 border border-amber-100 dark:border-amber-900/30">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {habit.successTips}
              </p>
            </div>
          </div>
        )}

        {/* Habit Details */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Difficulty</p>
              <p className="font-medium text-gray-900 dark:text-white capitalize">
                {habit.difficulty || 'Medium'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Points</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {habit.points || 10} pts
              </p>
            </div>
          </div>
        </div>

        {/* Tags */}
        {habit.tags && habit.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            {habit.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Motivational Footer */}
        <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl p-4 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">
            Every day you complete this habit brings you closer to your goals!
          </p>
        </div>
      </div>
    </Modal>
  );
}