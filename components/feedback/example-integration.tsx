// Example integration of FeedbackSystem into family dashboard
// This file shows how to add the feedback system to existing pages

import React from 'react';
import { FeedbackSystem } from './FeedbackSystem';

// Method 1: Simple integration - just add the component
export function FamilyDashboardWithFeedback() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Your existing dashboard content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Family Dashboard
        </h1>
        
        {/* Dashboard content goes here */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Member cards, habit tracking, stats, etc. */}
        </div>
      </div>
      
      {/* Feedback system - automatically shows for family members */}
      <FeedbackSystem />
    </div>
  );
}

// Method 2: Using Higher-Order Component
import { withFeedbackSystem } from './FeedbackSystem';

function FamilyDashboard() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Your dashboard content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Family Dashboard
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dashboard content */}
        </div>
      </div>
    </div>
  );
}

// Export with feedback system automatically included
export const FamilyDashboardWithFeedbackHOC = withFeedbackSystem(FamilyDashboard);

// Method 3: Conditional display (only for parents, or specific conditions)
export function ConditionalFeedbackDashboard() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Dashboard content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Family Dashboard
        </h1>
      </div>
      
      {/* Only show for parents, or add other conditions */}
      <FeedbackSystem 
        showForMembers={true}  // true = all members, false = parents only
        disabled={false}       // disable if needed
      />
    </div>
  );
}

// Method 4: Programmatic usage with custom triggers
import { useFeedbackSystem } from './FeedbackSystem';

export function CustomFeedbackIntegration() {
  const { 
    canSubmitFeedback, 
    submitFeedback, 
    isParent,
    memberName 
  } = useFeedbackSystem();

  const handleCustomFeedback = async () => {
    if (canSubmitFeedback) {
      try {
        await submitFeedback({
          type: 'Feature Request',
          subject: 'Custom feedback trigger',
          message: 'This was triggered programmatically from a custom button',
          rating: 5
        });
        
        alert('Feedback submitted successfully!');
      } catch (error) {
        console.error('Failed to submit feedback:', error);
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Custom Feedback Integration</h2>
      
      {canSubmitFeedback && (
        <div className="space-y-4">
          <p>Welcome, {memberName}!</p>
          
          <button
            onClick={handleCustomFeedback}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Send Custom Feedback
          </button>
          
          {isParent && (
            <p className="text-sm text-gray-600">
              As a parent, you can view all family feedback.
            </p>
          )}
        </div>
      )}
      
      {/* Still include the floating button for regular feedback */}
      <FeedbackSystem />
    </div>
  );
}