'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, Plus, ArrowRight } from 'lucide-react';
import { useFamily } from '@/contexts/FamilyContext';
import { useAuth } from '@/contexts/AuthContext';
import { theme } from '@/lib/theme';

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
    if (!user) {
      setIsVisible(false);
      return;
    }
    
    const dismissedKey = `familyBannerDismissed_${user.uid}`;
    const wasDismissed = localStorage.getItem(dismissedKey) === 'true';
    setIsDismissed(wasDismissed);
    
    // Show banner immediately for new users (don't wait for family loading)
    // Hide it only if user has a family OR has dismissed it
    const shouldShow = !wasDismissed && !currentFamily;
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

  // Don't show if user has a family or dismissed it
  if (!isVisible || currentFamily) {
    return null;
  }

  return (
    <div className={`relative ${theme.gradients.primary} border ${theme.status.info.border} rounded-lg p-4 mb-6 ${theme.shadow.sm}`}>
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className={`absolute top-3 right-3 p-1 rounded-full ${theme.text.muted} hover:${theme.status.info.text} ${theme.surface.hover} transition-colors`}
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3 pr-8">
        <div className={`flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center`}>
          <Users className="w-5 h-5 text-white" />
        </div>
        
        <div className="flex-grow">
          <h3 className={`font-semibold ${theme.text.primary} text-lg mb-1`}>
            Ready to get started?
          </h3>
          <p className={`${theme.status.info.text} text-sm mb-4 leading-relaxed`}>
            Create a family to track habits together, or use it as your personal space. 
            You can also join an existing family if you have an invitation code.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCreateFamily}
              className={`flex items-center justify-center gap-2 ${theme.components.button.primary} px-4 py-2 rounded-lg font-medium ${theme.animation.transition} text-sm`}
            >
              <Plus className="w-4 h-4" />
              Create New Family
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleJoinFamily}
              className={`flex items-center justify-center gap-2 ${theme.components.button.outline} px-4 py-2 rounded-lg font-medium ${theme.animation.transition} text-sm`}
            >
              <Users className="w-4 h-4" />
              Join Existing Family
            </button>
          </div>
        </div>
      </div>
      
      <div className={`mt-3 pt-3 border-t ${theme.status.info.border}`}>
        <p className={`text-xs ${theme.status.info.text}`}>
          💡 <strong>Tip:</strong> You can always create or join families later from Settings
        </p>
      </div>
    </div>
  );
}