'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, Plus, ArrowRight } from 'lucide-react';
import { useFamily } from '@/contexts/FamilyContext';
import { useAuth } from '@/contexts/AuthContext';

interface FamilyCreationBannerProps {
  onCreateFamily?: () => void;
  onJoinFamily?: () => void;
}

export function FamilyCreationBanner({ onCreateFamily, onJoinFamily }: FamilyCreationBannerProps) {
  const { currentFamily, loading } = useFamily();
  const { user } = useAuth();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Check if banner was previously dismissed
  useEffect(() => {
    if (!user) return;
    
    const dismissedKey = `familyBannerDismissed_${user.uid}`;
    const wasDismissed = localStorage.getItem(dismissedKey) === 'true';
    setIsDismissed(wasDismissed);
    
    // Show banner if user has no family and hasn't dismissed it
    const shouldShow = !loading && !currentFamily && !wasDismissed;
    setIsVisible(shouldShow);
  }, [user, currentFamily, loading]);

  const handleDismiss = () => {
    if (!user) return;
    
    const dismissedKey = `familyBannerDismissed_${user.uid}`;
    localStorage.setItem(dismissedKey, 'true');
    setIsDismissed(true);
    setIsVisible(false);
  };

  const handleCreateFamily = () => {
    onCreateFamily?.();
  };

  const handleJoinFamily = () => {
    onJoinFamily?.();
  };

  if (!isVisible || currentFamily || loading) {
    return null;
  }

  return (
    <div className="relative bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border border-primary-200 dark:border-primary-700 rounded-lg p-4 mb-6 shadow-sm">
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 rounded-full text-primary-400 hover:text-primary-600 hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3 pr-8">
        <div className="flex-shrink-0 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
          <Users className="w-5 h-5 text-white" />
        </div>
        
        <div className="flex-grow">
          <h3 className="font-semibold text-primary-900 dark:text-primary-100 text-lg mb-1">
            Ready to get started?
          </h3>
          <p className="text-primary-700 dark:text-primary-300 text-sm mb-4 leading-relaxed">
            Create a family to track habits together, or use it as your personal space. 
            You can also join an existing family if you have an invitation code.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCreateFamily}
              className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Create New Family
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleJoinFamily}
              className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-primary-600 dark:text-primary-400 border border-primary-300 dark:border-primary-600 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              <Users className="w-4 h-4" />
              Join Existing Family
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-primary-200 dark:border-primary-700">
        <p className="text-xs text-primary-600 dark:text-primary-400">
          💡 <strong>Tip:</strong> You can always create or join families later from Settings
        </p>
      </div>
    </div>
  );
}