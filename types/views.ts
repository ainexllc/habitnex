// View types for habit display
export enum HabitViewType {
  COMPACT = 'compact',
  GRID = 'grid',
  LIST = 'list',
  CALENDAR = 'calendar',
  TABLE = 'table',
  HEATMAP = 'heatmap',
  AI_COACH = 'ai_coach',
  MOMENTUM = 'momentum',
  TIMELINE = 'timeline'
}

export interface ViewOption {
  type: HabitViewType;
  label: string;
  description: string;
  icon: string;
  enabled: boolean;
  phase: 1 | 2 | 3; // Implementation phase
}

export const VIEW_OPTIONS: ViewOption[] = [
  {
    type: HabitViewType.COMPACT,
    label: 'Compact',
    description: 'Mobile-optimized with expand/collapse',
    icon: 'smartphone',
    enabled: true,
    phase: 1
  },
  {
    type: HabitViewType.GRID,
    label: 'Cards',
    description: 'Card grid view with quick actions',
    icon: 'grid-3x3',
    enabled: true,
    phase: 1
  },
  {
    type: HabitViewType.LIST,
    label: 'List',
    description: 'Compact list with inline actions',
    icon: 'list',
    enabled: true,
    phase: 1
  },
  {
    type: HabitViewType.CALENDAR,
    label: 'Calendar',
    description: 'Monthly calendar with completion dots',
    icon: 'calendar',
    enabled: true,
    phase: 1
  },
  {
    type: HabitViewType.TABLE,
    label: 'Table',
    description: 'Sortable table with detailed data',
    icon: 'table',
    enabled: true,
    phase: 2
  },
  {
    type: HabitViewType.HEATMAP,
    label: 'Heatmap',
    description: 'GitHub-style contribution graph',
    icon: 'activity',
    enabled: true,
    phase: 2
  },
  {
    type: HabitViewType.AI_COACH,
    label: 'AI Coach',
    description: 'Personalized recommendations and insights',
    icon: 'bot',
    enabled: true,
    phase: 3
  },
  {
    type: HabitViewType.MOMENTUM,
    label: 'Momentum',
    description: 'Visual waves showing habit momentum',
    icon: 'waves',
    enabled: true,
    phase: 3
  },
  {
    type: HabitViewType.TIMELINE,
    label: 'Timeline',
    description: 'Predictive timeline with future projections',
    icon: 'clock',
    enabled: true,
    phase: 3
  }
];

export interface ViewSwitcherProps {
  currentView: HabitViewType;
  onViewChange: (view: HabitViewType) => void;
  enabledViews?: HabitViewType[];
  showPhaseLabels?: boolean;
}