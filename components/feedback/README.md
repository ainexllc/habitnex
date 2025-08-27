# NextVibe Feedback System

A comprehensive feedback collection system for the NextVibe family dashboard, allowing family members to submit bug reports, feature requests, suggestions, compliments, and general feedback.

## Features

- **Floating Feedback Button**: Unobtrusive floating button in bottom-right corner
- **Comprehensive Modal Form**: Multi-step feedback form with validation
- **Multiple Feedback Types**: Bug reports, feature requests, suggestions, compliments, and other
- **Star Rating System**: 5-star rating with visual feedback
- **Real-time Validation**: Form validation with helpful error messages
- **Database Integration**: Full Firestore integration for feedback storage
- **Unread Notifications**: Badge notifications for parents on unread feedback
- **Responsive Design**: Works on both desktop and mobile devices
- **Dark/Light Theme**: Follows app theme preferences

## Quick Start

### Basic Integration

```tsx
import { FeedbackSystem } from '@/components/feedback';

export default function FamilyDashboard() {
  return (
    <div>
      {/* Your dashboard content */}
      
      {/* Add feedback system - it will automatically show for family members */}
      <FeedbackSystem />
    </div>
  );
}
```

### Using Higher-Order Component

```tsx
import { withFeedbackSystem } from '@/components/feedback';

function FamilyDashboard() {
  return (
    <div>
      {/* Your dashboard content */}
    </div>
  );
}

// Export with feedback system included
export default withFeedbackSystem(FamilyDashboard);
```

### Programmatic Usage

```tsx
import { useFeedbackSystem } from '@/components/feedback';

function CustomComponent() {
  const { canSubmitFeedback, submitFeedback, getUnreadCount } = useFeedbackSystem();
  
  const handleCustomFeedback = async () => {
    if (canSubmitFeedback) {
      await submitFeedback({
        type: 'Bug Report',
        subject: 'Custom bug report',
        message: 'Description of the bug...',
        rating: 4
      });
    }
  };
  
  // ... rest of component
}
```

## Component API

### FeedbackSystem

Main component that includes both the floating button and modal.

```tsx
interface FeedbackSystemProps {
  className?: string;
  disabled?: boolean;
  showForMembers?: boolean; // Show for all family members (default: true)
}
```

### FloatingFeedbackButton

Standalone floating button component.

```tsx
interface FloatingFeedbackButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  unreadCount?: number;
}
```

### FeedbackModal

Standalone modal component with form.

```tsx
interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: CreateFeedbackRequest) => Promise<void>;
  memberName?: string;
  isSubmitting?: boolean;
}
```

## Database Operations

### Core Functions

```tsx
import { 
  submitFeedback,
  getFamilyFeedback,
  updateFeedbackStatus,
  getFeedbackAnalytics 
} from '@/components/feedback';

// Submit new feedback
await submitFeedback(familyId, memberId, memberName, memberRole, feedbackData);

// Get all family feedback with filtering
const feedback = await getFamilyFeedback(familyId, {
  types: ['Bug Report', 'Feature Request'],
  statuses: ['submitted', 'read'],
  sortBy: 'timestamp',
  sortOrder: 'desc',
  limit: 20
});

// Update feedback status (parent action)
await updateFeedbackStatus(familyId, feedbackId, {
  status: 'resolved',
  priority: 'high',
  responseNotes: 'Fixed in latest update'
}, parentMemberId);

// Get feedback analytics
const analytics = await getFeedbackAnalytics(familyId, 'month');
```

### Real-time Subscriptions

```tsx
import { subscribeFamilyFeedback } from '@/components/feedback';

// Subscribe to feedback changes
const unsubscribe = subscribeFamilyFeedback(
  familyId,
  (feedback) => {
    console.log('Updated feedback:', feedback);
  },
  { limit: 50 }
);

// Clean up subscription
unsubscribe();
```

## Types

### Feedback Types Available

- `'Bug Report'` - Something isn't working correctly
- `'Feature Request'` - Suggest a new feature or improvement
- `'Suggestion'` - Ideas to make the app better
- `'Compliment'` - Tell us what you love!
- `'Other'` - Something else on your mind

### Feedback Status Flow

1. `'submitted'` - Initial status when feedback is created
2. `'read'` - Parent has viewed the feedback
3. `'in_progress'` - Parent is working on addressing it
4. `'resolved'` - Issue has been resolved
5. `'archived'` - No longer active/relevant

## Styling and Customization

### Theme Integration

The feedback system automatically follows the app's blue theme and dark/light mode preferences:

- Uses `primary-500`, `primary-600` colors for buttons
- Follows existing UI component patterns
- Responsive design with Tailwind CSS
- Consistent with app's design system

### Animations

- Floating animation on the feedback button
- Smooth transitions and hover effects
- Pulse animation for unread notifications
- Success state animations

## Security and Permissions

### Member Permissions

- **All Family Members**: Can submit feedback
- **Parents**: Can view, update status, and respond to all feedback
- **Children/Teens**: Can only submit feedback

### Data Security

- Feedback is stored in family-specific subcollections
- User authentication required for all operations
- Proper Firestore security rules should be implemented
- No sensitive data is collected beyond feedback content

## Performance Considerations

- Lazy loading of feedback data
- Efficient real-time subscriptions
- Proper cleanup of listeners
- Optimized form validation
- Minimal bundle impact

## Future Enhancements

- Email notifications for parents
- Feedback analytics dashboard
- Bulk actions for feedback management
- Integration with external tools (Slack, email)
- Advanced filtering and search
- Feedback voting/prioritization system

## Firestore Structure

```
families/{familyId}/feedback/{feedbackId}
├── id: string
├── familyId: string
├── type: FeedbackType
├── subject: string
├── message: string
├── rating: 1-5
├── submittedBy: string (memberId)
├── memberName: string
├── memberRole: 'parent' | 'child' | 'teen' | 'adult'
├── timestamp: Timestamp
├── status: FeedbackStatus
├── priority?: 'low' | 'medium' | 'high' | 'urgent'
├── readBy?: string[]
├── readAt?: Timestamp
├── responseNotes?: string
├── device?: string
├── version?: string
└── url?: string
```

## Installation Requirements

Make sure these dependencies are available:

```json
{
  "firebase": "^12.1.0",
  "react-hot-toast": "^2.4.0",
  "lucide-react": "latest",
  "@tailwindcss/forms": "latest"
}
```