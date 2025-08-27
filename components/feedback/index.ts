// Feedback System Components
export { FloatingFeedbackButton } from './FloatingFeedbackButton';
export { FeedbackModal } from './FeedbackModal';
export { FeedbackSystem, withFeedbackSystem, useFeedbackSystem } from './FeedbackSystem';

// Re-export types and utilities for convenience
export type {
  Feedback,
  FeedbackType,
  FeedbackStatus,
  CreateFeedbackRequest,
  UpdateFeedbackRequest,
  FeedbackAnalytics
} from '@/types/feedback';

export {
  FEEDBACK_TYPE_CONFIG,
  DEFAULT_FEEDBACK_VALIDATION
} from '@/types/feedback';

// Re-export database functions for advanced use cases
export {
  submitFeedback,
  getFamilyFeedback,
  updateFeedbackStatus,
  markFeedbackAsRead,
  subscribeFamilyFeedback,
  getFeedbackAnalytics,
  getUnreadFeedbackCount
} from '@/lib/feedbackDb';