'use client';

import { useState } from 'react';
import { HabitViewType, VIEW_OPTIONS, ViewSwitcherProps } from '@/types/views';
import { Button } from '@/components/ui/Button';
import { 
  Grid3X3, 
  List, 
  Calendar, 
  Table, 
  Activity, 
  Bot, 
  TrendingUp, 
  Clock,
  ChevronDown,
  Sparkles
} from 'lucide-react';

const ICON_MAP = {
  'grid-3x3': Grid3X3,
  'list': List,
  'calendar': Calendar,
  'table': Table,
  'activity': Activity,
  'bot': Bot,
  'trending-up': TrendingUp,
  'clock': Clock,
};

const PHASE_COLORS = {
  1: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  2: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  3: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
};

export function ViewSwitcher({ 
  currentView, 
  onViewChange, 
  enabledViews,
  showPhaseLabels = false 
}: ViewSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const availableViews = VIEW_OPTIONS.filter(view => 
    view.enabled && (!enabledViews || enabledViews.includes(view.type))
  );

  const currentViewOption = availableViews.find(view => view.type === currentView);
  const CurrentIcon = currentViewOption ? ICON_MAP[currentViewOption.icon as keyof typeof ICON_MAP] : Grid3X3;

  const handleViewSelect = (viewType: HabitViewType) => {
    onViewChange(viewType);
    setIsOpen(false);
    
    // Store preference in localStorage
    localStorage.setItem('preferredHabitView', viewType);
  };

  return (
    <div className="relative">
      {/* Current View Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 min-w-[120px] justify-between"
      >
        <div className="flex items-center gap-2">
          <CurrentIcon className="w-4 h-4" />
          <span>{currentViewOption?.label || 'View'}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="grid grid-cols-1 gap-1">
              {availableViews.map((view) => {
                const Icon = ICON_MAP[view.icon as keyof typeof ICON_MAP];
                const isSelected = view.type === currentView;
                const isAI = view.phase === 3;

                return (
                  <button
                    key={view.type}
                    onClick={() => handleViewSelect(view.type)}
                    className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {isAI && <Sparkles className="w-3 h-3 text-purple-500" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{view.label}</span>
                        {showPhaseLabels && (
                          <span className={`px-2 py-0.5 text-xs rounded-full ${PHASE_COLORS[view.phase]}`}>
                            Phase {view.phase}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {view.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Phase Legend */}
            {showPhaseLabels && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Implementation Phases:</p>
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded bg-green-500"></div>
                    <span>Essential</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded bg-blue-500"></div>
                    <span>Enhanced</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded bg-purple-500"></div>
                    <span>AI-Powered</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}