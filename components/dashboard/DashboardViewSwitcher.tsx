'use client';

import { useState } from 'react';
import { DashboardViewType, DASHBOARD_VIEW_OPTIONS, DashboardViewSwitcherProps } from '@/types/dashboard';
import { Button } from '@/components/ui/Button';
import { 
  Target,
  Grid3X3, 
  List, 
  Layers,
  Folder,
  ChevronDown,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const ICON_MAP = {
  'target': Target,
  'grid-3x3': Grid3X3,
  'list': List,
  'layers': Layers,
  'folder': Folder,
};

export function DashboardViewSwitcher({ 
  currentView, 
  onViewChange, 
  habitCount 
}: DashboardViewSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentViewOption = DASHBOARD_VIEW_OPTIONS.find(view => view.type === currentView);
  const CurrentIcon = currentViewOption ? ICON_MAP[currentViewOption.icon as keyof typeof ICON_MAP] : Target;

  const handleViewSelect = (viewType: DashboardViewType) => {
    onViewChange(viewType);
    setIsOpen(false);
    
    // Store preference in localStorage
    localStorage.setItem('preferredDashboardView', viewType);
  };

  // Get view recommendations based on habit count
  const getViewRecommendation = (view: typeof DASHBOARD_VIEW_OPTIONS[0]) => {
    if (!view.maxHabits) return null;
    
    if (habitCount > view.maxHabits) {
      return { type: 'warning', message: `${habitCount} habits might feel crowded` };
    } else if (habitCount <= view.maxHabits * 0.7) {
      return { type: 'good', message: `Perfect for ${habitCount} habits` };
    }
    return null;
  };

  return (
    <div className="relative">
      {/* Current View Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 min-w-[100px] justify-between"
      >
        <div className="flex items-center gap-2">
          <CurrentIcon className="w-4 h-4" />
          <span className="hidden sm:inline">{currentViewOption?.label || 'View'}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-3">
            <div className="mb-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Dashboard View
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Choose how to display your {habitCount} habits
              </p>
            </div>
            
            <div className="space-y-1">
              {DASHBOARD_VIEW_OPTIONS.map((view) => {
                const Icon = ICON_MAP[view.icon as keyof typeof ICON_MAP];
                const isSelected = view.type === currentView;
                const recommendation = getViewRecommendation(view);

                return (
                  <button
                    key={view.type}
                    onClick={() => handleViewSelect(view.type)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{view.label}</span>
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {view.description}
                      </p>
                      
                      {/* View recommendation */}
                      {recommendation && (
                        <div className={`flex items-center gap-1 mt-1 text-xs ${
                          recommendation.type === 'warning' 
                            ? 'text-amber-600 dark:text-amber-400' 
                            : 'text-green-600 dark:text-green-400'
                        }`}>
                          {recommendation.type === 'warning' ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          <span>{recommendation.message}</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Helpful tip */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                💡 Tip: Focus view is best for daily use, Cards for details, Compact for overview
              </p>
            </div>
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