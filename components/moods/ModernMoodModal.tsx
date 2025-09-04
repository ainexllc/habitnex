'use client';

import { useState, useEffect } from 'react';
import { ModernMoodForm } from './ModernMoodForm';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTodayDateString } from '@/lib/utils';

interface ModernMoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (moodData: any) => Promise<void>;
  loading?: boolean;
  date?: string;
  initialData?: any;
  mode?: 'create' | 'edit';
}

export function ModernMoodModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  loading = false, 
  date,
  initialData,
  mode = 'create'
}: ModernMoodModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Reset state when modal opens/closes
    if (isOpen) {
      setShowSuccess(false);
      setIsSubmitting(false);
    }
    
    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, isSubmitting]);

  const handleSubmit = async (moodData: any) => {
    try {
      setIsSubmitting(true);
      await onSubmit(moodData);
      setShowSuccess(true);
      
      // Show success animation then close
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      // Error handling is done in the parent component
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const currentDate = date || getTodayDateString();

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-md z-[9999]",
          "animate-in fade-in duration-300"
        )}
        onClick={handleOverlayClick}
      >
        {/* Modal Container */}
        <div className="fixed inset-0 z-[10000] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Modal Content */}
            <div 
              className={cn(
                "relative w-full max-w-4xl",
                "animate-in slide-in-from-bottom-8 duration-500"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Success Overlay */}
              {showSuccess && (
                <div className={cn(
                  "absolute inset-0 z-50 flex items-center justify-center",
                  "bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-3xl",
                  "animate-in zoom-in-50 duration-300"
                )}>
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                      <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Mood Saved!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your mood entry has been recorded successfully
                    </p>
                  </div>
                </div>
              )}

              {/* Form Content */}
              <div className={cn(
                "relative bg-gradient-to-br from-gray-50 to-white",
                "dark:from-gray-900 dark:to-gray-800",
                "rounded-3xl shadow-2xl overflow-hidden",
                "border border-gray-200 dark:border-gray-700"
              )}>
                {/* Decorative gradient background */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
                  <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
                  <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
                </div>

                {/* Content */}
                <div className="relative p-6 sm:p-8">
                  <ModernMoodForm
                    onSubmit={handleSubmit}
                    onClose={onClose}
                    loading={loading || isSubmitting}
                    date={currentDate}
                    initialData={initialData}
                    mode={mode}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
}