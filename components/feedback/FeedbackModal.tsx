'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Star, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  FeedbackType, 
  CreateFeedbackRequest, 
  FEEDBACK_TYPE_CONFIG,
  DEFAULT_FEEDBACK_VALIDATION
} from '@/types/feedback';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: CreateFeedbackRequest) => Promise<void>;
  memberName?: string;
  isSubmitting?: boolean;
}

interface FormData {
  type: FeedbackType;
  subject: string;
  message: string;
  rating: number;
}

interface FormErrors {
  type?: string;
  subject?: string;
  message?: string;
  rating?: string;
}

const initialFormData: FormData = {
  type: 'Suggestion',
  subject: '',
  message: '',
  rating: 5
};

export function FeedbackModal({
  isOpen,
  onClose,
  onSubmit,
  memberName = 'Family Member',
  isSubmitting = false
}: FeedbackModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
      setErrors({});
      setShowSuccess(false);
      setHoveredRating(0);
    }
  }, [isOpen]);

  // Get current feedback type config
  const currentTypeConfig = FEEDBACK_TYPE_CONFIG[formData.type];

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const { subject, message, rating } = DEFAULT_FEEDBACK_VALIDATION;

    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < subject.minLength) {
      newErrors.subject = `Subject must be at least ${subject.minLength} characters`;
    } else if (formData.subject.trim().length > subject.maxLength) {
      newErrors.subject = `Subject must be no more than ${subject.maxLength} characters`;
    }

    // Message validation (optional field)
    if (formData.message.trim() && formData.message.trim().length < message.minLength) {
      newErrors.message = `Message must be at least ${message.minLength} characters`;
    } else if (formData.message.trim().length > message.maxLength) {
      newErrors.message = `Message must be no more than ${message.maxLength} characters`;
    }

    // Rating validation
    if (formData.rating < rating.min || formData.rating > rating.max) {
      newErrors.rating = `Rating must be between ${rating.min} and ${rating.max}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const feedbackData: CreateFeedbackRequest = {
        type: formData.type,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        rating: formData.rating as 1 | 2 | 3 | 4 | 5
      };

      await onSubmit(feedbackData);
      
      // Show success message
      setShowSuccess(true);
      
      // Close modal after a delay
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Failed to submit feedback:', error);
      // Error handling is managed by parent component
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Render star rating
  const renderStarRating = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleInputChange('rating', star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className={cn(
              "p-1 rounded transition-all duration-150",
              "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800"
            )}
          >
            <Star 
              className={cn(
                "w-8 h-8 transition-colors duration-150",
                (hoveredRating >= star || formData.rating >= star)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 dark:text-gray-600"
              )}
            />
          </button>
        ))}
        <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
          {formData.rating === 1 && "Poor"}
          {formData.rating === 2 && "Fair"}
          {formData.rating === 3 && "Good"}
          {formData.rating === 4 && "Very Good"}
          {formData.rating === 5 && "Excellent"}
        </span>
      </div>
    );
  };

  // Success state
  if (showSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={() => {}} title="Thank You!" size="md">
        <div className="text-center py-8">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Feedback Submitted Successfully!
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Thank you for your feedback, {memberName}. We appreciate you taking the time to help make our app better for your family!
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Share Your Feedback" 
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Feedback Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            What type of feedback do you have?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(Object.keys(FEEDBACK_TYPE_CONFIG) as FeedbackType[]).map((type) => {
              const config = FEEDBACK_TYPE_CONFIG[type];
              const isSelected = formData.type === type;
              
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleInputChange('type', type)}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all duration-200",
                    "text-left hover:border-primary-300 dark:hover:border-primary-600",
                    "focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800",
                    isSelected 
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30" 
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800",
                    "hover:shadow-md"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                      <div className={cn(
                        "font-medium",
                        isSelected 
                          ? "text-primary-900 dark:text-primary-100" 
                          : "text-gray-900 dark:text-gray-100"
                      )}>
                        {config.label}
                      </div>
                      <div className={cn(
                        "text-sm",
                        isSelected 
                          ? "text-primary-700 dark:text-primary-300" 
                          : "text-gray-600 dark:text-gray-400"
                      )}>
                        {config.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {errors.type && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.type}
            </p>
          )}
        </div>

        {/* Subject Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subject
          </label>
          <Input
            type="text"
            value={formData.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            placeholder={currentTypeConfig.placeholder.subject}
            maxLength={DEFAULT_FEEDBACK_VALIDATION.subject.maxLength}
            className={cn(
              errors.subject && "border-red-500 focus:border-red-500 focus:ring-red-200"
            )}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.subject ? (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.subject}
              </p>
            ) : (
              <div />
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formData.subject.length}/{DEFAULT_FEEDBACK_VALIDATION.subject.maxLength}
            </span>
          </div>
        </div>

        {/* Message Textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Message <span className="text-gray-500">(optional)</span>
          </label>
          <Textarea
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            placeholder={currentTypeConfig.placeholder.message}
            rows={5}
            maxLength={DEFAULT_FEEDBACK_VALIDATION.message.maxLength}
            className={cn(
              errors.message && "border-red-500 focus:border-red-500 focus:ring-red-200",
              "resize-none"
            )}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.message ? (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.message}
              </p>
            ) : (
              <div />
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formData.message.length}/{DEFAULT_FEEDBACK_VALIDATION.message.maxLength}
            </span>
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Overall Rating
          </label>
          {renderStarRating()}
          {errors.rating && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.rating}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="flex-1"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Feedback
          </Button>
        </div>
      </form>
    </Modal>
  );
}