// Dashboard view types for habit display on dashboard
export enum DashboardViewType {
  FOCUS = 'focus',          // Today's habits + upcoming (default)
  CARDS = 'cards',          // Current card grid view
  COMPACT = 'compact',      // Compact list view
  PRIORITY = 'priority',    // Priority matrix 2x2
  CATEGORIES = 'categories' // Grouped by tags/categories
}

export interface DashboardViewOption {
  type: DashboardViewType;
  label: string;
  description: string;
  icon: string;
  maxHabits?: number; // Recommended max habits for this view
}

export const DASHBOARD_VIEW_OPTIONS: DashboardViewOption[] = [
  {
    type: DashboardViewType.FOCUS,
    label: 'Focus',
    description: 'Today\'s priorities and upcoming habits',
    icon: 'target',
    maxHabits: 6
  },
  {
    type: DashboardViewType.CARDS,
    label: 'Cards',
    description: 'Full habit cards with all details',
    icon: 'grid-3x3',
    maxHabits: 8
  },
  {
    type: DashboardViewType.COMPACT,
    label: 'Compact',
    description: 'Dense list view with essential info',
    icon: 'list',
    maxHabits: 12
  },
  {
    type: DashboardViewType.PRIORITY,
    label: 'Priority',
    description: 'Urgent/Important matrix layout',
    icon: 'layers',
    maxHabits: 16
  },
  {
    type: DashboardViewType.CATEGORIES,
    label: 'Groups',
    description: 'Organized by tags and categories',
    icon: 'folder',
    maxHabits: 20
  }
];

export interface DashboardViewSwitcherProps {
  currentView: DashboardViewType;
  onViewChange: (view: DashboardViewType) => void;
  habitCount: number;
}

export interface DashboardFilter {
  dueToday: boolean;
  overdue: boolean;
  completed: boolean;
  all: boolean;
}

export interface DashboardSection {
  title: string;
  habits: any[]; // Will be Habit[] when imported
  priority: 'high' | 'medium' | 'low';
  collapsible?: boolean;
  defaultExpanded?: boolean;
}