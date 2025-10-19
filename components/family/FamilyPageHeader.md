# FamilyPageHeader Component

A reusable header component for family dashboard pages that provides consistent styling and behavior across all family-related pages.

## Features

- ✅ Standard back button with configurable navigation
- ✅ Configurable title and subtitle
- ✅ Optional action button(s) on the right side
- ✅ Consistent styling matching the design system
- ✅ TypeScript support with proper interfaces
- ✅ Flexible enough for all family pages

## Usage Examples

### Basic Usage
```tsx
import { FamilyPageHeader } from '@/components/family/FamilyPageHeader';

<FamilyPageHeader
  title="Family Members"
  subtitle="Manage your family members and their roles"
/>
```

### With Actions
```tsx
import { FamilyPageHeader } from '@/components/family/FamilyPageHeader';
import { Button } from '@/components/ui/Button';
import { UserPlus } from 'lucide-react';

<FamilyPageHeader
  title="Family Members"
  subtitle="Manage your family members and their roles"
  actions={
    <Button onClick={() => setShowAddModal(true)}>
      <UserPlus className="w-5 h-5 mr-2" />
      Add Member
    </Button>
  }
/>
```

### Multiple Actions
```tsx
<FamilyPageHeader
  title="Family Analytics"
  subtitle="Track your family's progress and achievements"
  actions={
    <>
      <Button variant="outline">
        Export Data
      </Button>
      <Button>
        Generate Report
      </Button>
    </>
  }
/>
```

### Custom Back Navigation
```tsx
<FamilyPageHeader
  title="Family Challenges"
  subtitle="Create and manage family challenges"
  backPath="/family/activities"
  backText="Back to Activities"
  actions={
    <Link href="/family/challenges/create">
      <Button>Create Challenge</Button>
    </Link>
  }
/>
```

## Props Interface

```typescript
interface FamilyPageHeaderProps {
  /**
   * Main title displayed prominently at the top
   */
  title: string;
  
  /**
   * Subtitle/description text below the title
   */
  subtitle?: string;
  
  /**
   * URL path to navigate back to (defaults to /?tab=overview)
   */
  backPath?: string;
  
  /**
   * Custom text for the back button (defaults to "Back to Dashboard")
   */
  backText?: string;
  
  /**
   * Primary action button(s) displayed on the right side
   */
  actions?: ReactNode;
  
  /**
   * Additional CSS classes for the container
   */
  className?: string;
}
```

## Real-World Examples

### Family Members Page
```tsx
<FamilyPageHeader
  title="Family Members"
  subtitle="Manage your family members and their roles"
  actions={
    isParent && (
      <Button onClick={() => setShowAddModal(true)}>
        <UserPlus className="w-5 h-5 mr-2" />
        Add Member
      </Button>
    )
  }
/>
```

### Family Habits Page
```tsx
<FamilyPageHeader
  title="Family Habits"
  subtitle="Manage all family habits in one place"
  actions={
    <Button onClick={() => setShowCreateHabitModal(true)}>
      <Plus className="w-5 h-5 mr-2" />
      Create Habit
    </Button>
  }
/>
```

### Family Rewards Page
```tsx
<FamilyPageHeader
  title="Family Rewards"
  subtitle="Set up rewards for achieving family goals"
  actions={
    <>
      <Link href="/family/rewards/manage">
        <Button variant="outline">Manage Rewards</Button>
      </Link>
      <Link href="/family/rewards/create">
        <Button>
          <Gift className="w-5 h-5 mr-2" />
          Add Reward
        </Button>
      </Link>
    </>
  }
/>
```

### Family Challenges Page
```tsx
<FamilyPageHeader
  title="Family Challenges"
  subtitle="Create exciting challenges for the whole family"
  actions={
    <Link href="/family/challenges/create">
      <Button>
        <Trophy className="w-5 h-5 mr-2" />
        New Challenge
      </Button>
    </Link>
  }
/>
```

### Family Analytics Page
```tsx
<FamilyPageHeader
  title="Family Analytics"
  subtitle="Track your family's progress and achievements"
  actions={
    <>
      <Button variant="outline" onClick={handleExport}>
        <Download className="w-5 h-5 mr-2" />
        Export Data
      </Button>
      <Button onClick={handleGenerateReport}>
        <BarChart className="w-5 h-5 mr-2" />
        Generate Report
      </Button>
    </>
  }
/>
```

## Styling Details

The component follows the exact styling patterns from the original members page:
- Uses `mb-8` for consistent bottom margin
- Back button styled as `ghost` variant with `sm` size
- Title uses `text-3xl font-bold text-gray-900 dark:text-white`
- Subtitle uses `text-gray-600 dark:text-gray-300 mt-1`
- Actions are wrapped in `flex items-center space-x-3` for proper spacing
- Fully supports dark mode with appropriate color variants

## File Location

Place this component at: `/components/family/FamilyPageHeader.tsx`

The component is exported through the family components index file for easy importing.
