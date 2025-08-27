import { Timestamp } from 'firebase/firestore';

// Feedback types available for users to select
export type FeedbackType = 
  | 'Bug Report' 
  | 'Feature Request' 
  | 'Suggestion' 
  | 'Compliment' 
  | 'Other';

// Status tracking for feedback items
export type FeedbackStatus = 
  | 'submitted'    // Initial status when feedback is created
  | 'read'         // Parent has viewed the feedback
  | 'in_progress'  // Parent is working on addressing it
  | 'resolved'     // Issue has been resolved
  | 'archived';    // No longer active/relevant

// Priority levels for feedback (internal use)
export type FeedbackPriority = 
  | 'low'
  | 'medium' 
  | 'high'
  | 'urgent';

// Main feedback interface
export interface Feedback {
  id: string;
  familyId: string;
  
  // Content
  type: FeedbackType;
  subject: string;
  message: string;
  rating: 1 | 2 | 3 | 4 | 5; // Star rating
  
  // Submission details
  submittedBy: string;        // Member ID who submitted
  memberName: string;         // Display name for easy reference
  memberRole: 'parent' | 'child' | 'teen' | 'adult';
  timestamp: Timestamp;
  
  // Status tracking
  status: FeedbackStatus;
  priority?: FeedbackPriority; // Set by parents
  
  // Response tracking
  readBy?: string[];          // Array of member IDs who have read it
  readAt?: Timestamp;         // When first read by a parent
  responseNotes?: string;     // Internal notes from parents
  
  // Metadata
  device?: string;            // Device type for bug reports
  version?: string;           // App version for bug reports
  url?: string;               // Page where feedback was submitted
}

// Interface for creating new feedback
export interface CreateFeedbackRequest {
  type: FeedbackType;
  subject: string;
  message: string;
  rating: 1 | 2 | 3 | 4 | 5;
  
  // Optional technical details
  device?: string;
  version?: string;
  url?: string;
}

// Interface for updating feedback status (parent actions)
export interface UpdateFeedbackRequest {
  status?: FeedbackStatus;
  priority?: FeedbackPriority;
  responseNotes?: string;
}

// Analytics interface for feedback insights
export interface FeedbackAnalytics {
  familyId: string;
  period: 'week' | 'month' | 'year' | 'all';
  
  totalFeedback: number;
  byType: Record<FeedbackType, number>;
  byStatus: Record<FeedbackStatus, number>;
  averageRating: number;
  
  mostActiveMember: {
    memberId: string;
    memberName: string;
    feedbackCount: number;
  };
  
  recentTrends: {
    thisMonth: number;
    lastMonth: number;
    percentageChange: number;
  };
}

// Form validation rules
export interface FeedbackValidationRules {
  subject: {
    minLength: number;
    maxLength: number;
    required: boolean;
  };
  message: {
    minLength: number;
    maxLength: number;
    required: boolean;
  };
  rating: {
    required: boolean;
    min: number;
    max: number;
  };
}

// Default validation rules
export const DEFAULT_FEEDBACK_VALIDATION: FeedbackValidationRules = {
  subject: {
    minLength: 3,
    maxLength: 100,
    required: true
  },
  message: {
    minLength: 10,
    maxLength: 1000,
    required: true
  },
  rating: {
    required: true,
    min: 1,
    max: 5
  }
};

// Feedback type configurations with descriptions and icons
export const FEEDBACK_TYPE_CONFIG: Record<FeedbackType, {
  label: string;
  description: string;
  icon: string;
  placeholder: {
    subject: string;
    message: string;
  };
}> = {
  'Bug Report': {
    label: 'Bug Report',
    description: 'Something isn\'t working correctly',
    icon: '🐛',
    placeholder: {
      subject: 'Briefly describe the bug',
      message: 'Tell us what happened, what you expected, and how to reproduce the issue...'
    }
  },
  'Feature Request': {
    label: 'Feature Request',
    description: 'Suggest a new feature or improvement',
    icon: '💡',
    placeholder: {
      subject: 'What feature would you like to see?',
      message: 'Describe the feature and why it would be helpful for your family...'
    }
  },
  'Suggestion': {
    label: 'Suggestion',
    description: 'Ideas to make the app better',
    icon: '🌟',
    placeholder: {
      subject: 'Your suggestion in a few words',
      message: 'Share your idea to improve the family experience...'
    }
  },
  'Compliment': {
    label: 'Compliment',
    description: 'Tell us what you love!',
    icon: '❤️',
    placeholder: {
      subject: 'What do you love about the app?',
      message: 'Share what\'s working well for your family...'
    }
  },
  'Other': {
    label: 'Other',
    description: 'Something else on your mind',
    icon: '💬',
    placeholder: {
      subject: 'Let us know what\'s on your mind',
      message: 'Share any other thoughts or feedback...'
    }
  }
};

// Utility type for feedback lists with filtering/sorting
export interface FeedbackListOptions {
  types?: FeedbackType[];
  statuses?: FeedbackStatus[];
  memberIds?: string[];
  sortBy?: 'timestamp' | 'rating' | 'status' | 'type';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Export utility functions as types for consistency
export type FeedbackSubmissionHandler = (feedback: CreateFeedbackRequest) => Promise<void>;
export type FeedbackUpdateHandler = (feedbackId: string, updates: UpdateFeedbackRequest) => Promise<void>;
export type FeedbackListHandler = (options?: FeedbackListOptions) => Promise<Feedback[]>;