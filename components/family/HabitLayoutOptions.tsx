'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface HabitLayoutProps {
  habit: {
    emoji: string;
    name: string;
    basePoints: number;
    frequency?: string;
    completed: boolean;
  };
  touchMode?: boolean;
  onToggle?: () => void;
}

// Current 2-Row Layout (cleaner badges)
export function Layout1_CleanBadges({ habit, touchMode = false, onToggle }: HabitLayoutProps) {
  return (
    <div className={cn(
      "relative flex items-center justify-between rounded-lg transition-all duration-200",
      touchMode ? "px-1.5 py-1 min-h-[30px]" : "px-1.5 py-0.5 min-h-[24px]",
      habit.completed 
        ? "bg-gray-600 dark:bg-gray-600 border border-gray-500" 
        : "bg-gray-700 dark:bg-gray-700 hover:bg-gray-600 border border-gray-600"
    )}>
      <div className="flex-1 min-w-0">
        {/* Top Row: Emoji + Title */}
        <div className="flex items-center space-x-2">
          <span className={touchMode ? "text-lg" : "text-base"}>
            {habit.emoji}
          </span>
          <h4 className={cn(
            "font-medium truncate flex-1",
            touchMode ? "text-base" : "text-sm",
            habit.completed 
              ? "text-green-400 dark:text-green-300 line-through" 
              : "text-white dark:text-gray-100"
          )}>
            {habit.name}
          </h4>
        </div>
        
        {/* Bottom Row: Points + Frequency */}
        <div className="flex items-center justify-between mt-1">
          <span className={cn(
            "text-xs font-medium px-1.5 py-0.5 rounded",
            habit.completed 
              ? "text-green-400/80 bg-green-400/10" 
              : "text-yellow-400 bg-yellow-400/10"
          )}>
            {habit.basePoints} pts
          </span>
          <span className={cn(
            "text-xs opacity-60",
            habit.completed ? "text-green-400/60" : "text-gray-400"
          )}>
            {habit.frequency || 'Daily'}
          </span>
        </div>
      </div>
      
      <button
        onClick={onToggle}
        className={cn(
          "flex-shrink-0 ml-2 w-[15px] h-[15px] rounded flex items-center justify-center transition-colors",
          habit.completed 
            ? "bg-green-600 hover:bg-green-700 text-white" 
            : "bg-gray-500 hover:bg-gray-400 text-white"
        )}
      >
        <Check className="w-[10px] h-[10px]" />
      </button>
    </div>
  );
}

// Alternative: Vertical Stack Layout
export function Layout2_VerticalStack({ habit, touchMode = false, onToggle }: HabitLayoutProps) {
  return (
    <div className={cn(
      "relative flex justify-between rounded-lg transition-all duration-200",
      touchMode ? "px-2 py-1.5 min-h-[35px]" : "px-1.5 py-1 min-h-[28px]",
      habit.completed 
        ? "bg-gray-600 dark:bg-gray-600 border border-gray-500" 
        : "bg-gray-700 dark:bg-gray-700 hover:bg-gray-600 border border-gray-600"
    )}>
      <div className="flex-1 min-w-0">
        {/* Row 1: Title */}
        <div className="flex items-center space-x-2">
          <span className={touchMode ? "text-lg" : "text-base"}>
            {habit.emoji}
          </span>
          <h4 className={cn(
            "font-medium truncate",
            touchMode ? "text-base" : "text-sm",
            habit.completed 
              ? "text-green-400 dark:text-green-300 line-through" 
              : "text-white dark:text-gray-100"
          )}>
            {habit.name}
          </h4>
        </div>
        
        {/* Row 2: Metadata */}
        <div className="flex items-center space-x-2 mt-0.5">
          <span className={cn(
            "text-xs",
            habit.completed ? "text-green-400/80" : "text-yellow-400"
          )}>
            {habit.basePoints} pts
          </span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-400">
            {habit.frequency || 'Daily'}
          </span>
        </div>
      </div>
      
      <button
        onClick={onToggle}
        className={cn(
          "flex-shrink-0 w-[15px] h-[15px] rounded flex items-center justify-center transition-colors self-center",
          habit.completed 
            ? "bg-green-600 hover:bg-green-700 text-white" 
            : "bg-gray-500 hover:bg-gray-400 text-white"
        )}
      >
        <Check className="w-[10px] h-[10px]" />
      </button>
    </div>
  );
}

// Alternative: Side-by-Side Layout
export function Layout3_SideBySide({ habit, touchMode = false, onToggle }: HabitLayoutProps) {
  return (
    <div className={cn(
      "relative flex items-center justify-between rounded-lg transition-all duration-200",
      touchMode ? "px-2 py-1.5 min-h-[35px]" : "px-1.5 py-1 min-h-[28px]",
      habit.completed 
        ? "bg-gray-600 dark:bg-gray-600 border border-gray-500" 
        : "bg-gray-700 dark:bg-gray-700 hover:bg-gray-600 border border-gray-600"
    )}>
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <span className={touchMode ? "text-lg" : "text-base"}>
          {habit.emoji}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "font-medium truncate",
            touchMode ? "text-base" : "text-sm",
            habit.completed 
              ? "text-green-400 dark:text-green-300 line-through" 
              : "text-white dark:text-gray-100"
          )}>
            {habit.name}
          </h4>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="text-right">
          <div className={cn(
            "text-xs font-medium",
            habit.completed ? "text-green-400/80" : "text-yellow-400"
          )}>
            {habit.basePoints} pts
          </div>
          <div className="text-xs text-gray-400">
            {habit.frequency || 'Daily'}
          </div>
        </div>
        
        <button
          onClick={onToggle}
          className={cn(
            "w-[15px] h-[15px] rounded flex items-center justify-center transition-colors",
            habit.completed 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              : "bg-gray-500 hover:bg-gray-400 text-white"
          )}
        >
          <Check className="w-[10px] h-[10px]" />
        </button>
      </div>
    </div>
  );
}

// Alternative: Minimal Badge Layout
export function Layout4_MinimalBadge({ habit, touchMode = false, onToggle }: HabitLayoutProps) {
  return (
    <div className={cn(
      "relative flex items-center justify-between rounded-lg transition-all duration-200",
      touchMode ? "px-2 py-1 min-h-[30px]" : "px-1.5 py-0.5 min-h-[24px]",
      habit.completed 
        ? "bg-gray-600 dark:bg-gray-600 border border-gray-500" 
        : "bg-gray-700 dark:bg-gray-700 hover:bg-gray-600 border border-gray-600"
    )}>
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        <span className={touchMode ? "text-lg" : "text-base"}>
          {habit.emoji}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className={cn(
              "font-medium truncate",
              touchMode ? "text-base" : "text-sm",
              habit.completed 
                ? "text-green-400 dark:text-green-300 line-through" 
                : "text-white dark:text-gray-100"
            )}>
              {habit.name}
            </h4>
            <span className={cn(
              "text-xs px-1 py-0.5 rounded bg-opacity-20 flex-shrink-0",
              habit.completed 
                ? "text-green-400 bg-green-400" 
                : "text-yellow-400 bg-yellow-400"
            )}>
              {habit.basePoints}pt
            </span>
          </div>
        </div>
      </div>
      
      <button
        onClick={onToggle}
        className={cn(
          "flex-shrink-0 w-[15px] h-[15px] rounded flex items-center justify-center transition-colors",
          habit.completed 
            ? "bg-green-600 hover:bg-green-700 text-white" 
            : "bg-gray-500 hover:bg-gray-400 text-white"
        )}
      >
        <Check className="w-[10px] h-[10px]" />
      </button>
    </div>
  );
}