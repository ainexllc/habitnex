'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FloatingFeedbackButton } from './FloatingFeedbackButton';
import { FeedbackModal } from './FeedbackModal';
import { useFamily } from '@/contexts/FamilyContext';
import { useAuth } from '@/contexts/AuthContext';
import { submitFeedback, getUnreadFeedbackCount } from '@/lib/feedbackDb';
import { CreateFeedbackRequest } from '@/types/feedback';
import { toast } from 'react-hot-toast';

interface FeedbackSystemProps {
  className?: string;
  disabled?: boolean;
  showForMembers?: boolean; // Show for all family members, not just parents
}

export function FeedbackSystem({ 
  className,
  disabled = false,
  showForMembers = true // Default to showing for all family members
}: FeedbackSystemProps) {
  const { user } = useAuth();
  const { currentFamily, currentMember, isParent } = useFamily();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check if feedback system should be shown
  const shouldShowFeedback = Boolean(
    user && 
    currentFamily && 
    currentMember &&
    (showForMembers || isParent) && // Show for all members if showForMembers is true
    !disabled
  );

  // Load unread count for parents
  const loadUnreadCount = useCallback(async () => {
    if (!currentFamily?.id || !isParent) return;
    
    try {
      const count = await getUnreadFeedbackCount(
        currentFamily.id, 
        currentMember?.id
      );
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread feedback count:', error);
    }
  }, [currentFamily?.id, currentMember?.id, isParent]);

  // Load unread count on mount and family change
  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  // Refresh unread count periodically (every 5 minutes)
  useEffect(() => {
    if (!isParent) return;

    const interval = setInterval(loadUnreadCount, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadUnreadCount, isParent]);

  // Handle feedback submission
  const handleSubmitFeedback = async (feedbackData: CreateFeedbackRequest) => {
    if (!currentFamily || !currentMember || !user) {
      throw new Error('Missing required data for feedback submission');
    }

    setIsSubmitting(true);

    try {
      await submitFeedback(
        currentFamily.id,
        currentMember.id,
        currentMember.displayName,
        currentMember.role,
        feedbackData
      );

      // Show success toast
      toast.success('Feedback submitted successfully! Thank you for helping improve our app.', {
        duration: 4000,
        position: 'top-center',
      });

      // Refresh unread count for parents
      if (isParent) {
        await loadUnreadCount();
      }

    } catch (error) {
      console.error('Failed to submit feedback:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to submit feedback. Please try again.';
      
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-center',
      });
      
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle opening feedback modal
  const handleOpenModal = () => {
    if (!shouldShowFeedback) return;
    
    setIsModalOpen(true);
    
    // Track feedback modal opened (for analytics)
    console.log('Feedback modal opened by:', currentMember?.displayName);
  };

  // Handle closing feedback modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Don't render anything if conditions aren't met
  if (!shouldShowFeedback) {
    return null;
  }

  return (
    <>
      {/* Floating Feedback Button */}
      <FloatingFeedbackButton
        onClick={handleOpenModal}
        className={className}
        disabled={disabled || isSubmitting}
        unreadCount={isParent ? unreadCount : 0} // Only show unread count to parents
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitFeedback}
        memberName={currentMember?.displayName}
        isSubmitting={isSubmitting}
      />
    </>
  );
}

// Export a higher-order component for easy integration
export function withFeedbackSystem<P extends object>(
  Component: React.ComponentType<P>,
  feedbackProps?: Partial<FeedbackSystemProps>
) {
  return function WithFeedbackSystem(props: P) {
    return (
      <>
        <Component {...props} />
        <FeedbackSystem {...feedbackProps} />
      </>
    );
  };
}

// Hook for programmatic feedback access
export function useFeedbackSystem() {
  const { currentFamily, currentMember, isParent } = useFamily();
  const { user } = useAuth();
  
  const canSubmitFeedback = Boolean(
    user && currentFamily && currentMember
  );
  
  const submitFeedbackProgrammatically = useCallback(async (
    feedbackData: CreateFeedbackRequest
  ) => {
    if (!canSubmitFeedback || !currentFamily || !currentMember) {
      throw new Error('Cannot submit feedback: missing required data');
    }

    return submitFeedback(
      currentFamily.id,
      currentMember.id,
      currentMember.displayName,
      currentMember.role,
      feedbackData
    );
  }, [canSubmitFeedback, currentFamily, currentMember]);

  const getUnreadCount = useCallback(async () => {
    if (!currentFamily?.id || !currentMember?.id) return 0;
    
    return getUnreadFeedbackCount(currentFamily.id, currentMember.id);
  }, [currentFamily?.id, currentMember?.id]);

  return {
    canSubmitFeedback,
    isParent,
    submitFeedback: submitFeedbackProgrammatically,
    getUnreadCount,
    familyId: currentFamily?.id,
    memberId: currentMember?.id,
    memberName: currentMember?.displayName
  };
}