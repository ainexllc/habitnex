'use client';

import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingFeedbackButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  unreadCount?: number;
}

export function FloatingFeedbackButton({ 
  onClick, 
  className,
  disabled = false,
  unreadCount = 0
}: FloatingFeedbackButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Tooltip */}
      {isHovered && !disabled && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg shadow-lg whitespace-nowrap animate-fade-in">
          Share your feedback
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
        </div>
      )}
      
      <button
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          // Base styles
          "relative inline-flex items-center justify-center",
          "w-14 h-14 rounded-full",
          "transition-all duration-300 ease-in-out",
          "focus:outline-none focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-800",
          "shadow-lg hover:shadow-xl",
          
          // Theme colors
          "bg-primary-500 hover:bg-primary-600 text-white",
          "dark:bg-primary-600 dark:hover:bg-primary-700",
          
          // Animation effects
          "transform hover:scale-110 active:scale-95",
          "hover:-translate-y-1",
          
          // Pulse animation when there are unread items (for parents)
          unreadCount > 0 && "animate-pulse",
          
          // Disabled state
          disabled && "opacity-50 cursor-not-allowed hover:scale-100 hover:translate-y-0",
          
          className
        )}
        style={{
          // Subtle floating animation
          animation: disabled ? 'none' : 'float 3s ease-in-out infinite'
        }}
      >
        {/* Main icon */}
        <MessageSquare className={cn(
          "w-6 h-6 transition-transform duration-200",
          isHovered && !disabled && "scale-110"
        )} />
        
        {/* Notification badge for unread feedback (parents only) */}
        {unreadCount > 0 && (
          <span className={cn(
            "absolute -top-1 -right-1",
            "inline-flex items-center justify-center",
            "min-w-5 h-5 px-1",
            "text-xs font-bold text-white",
            "bg-red-500 rounded-full",
            "animate-bounce"
          )}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        
        {/* Ripple effect on click */}
        <span className={cn(
          "absolute inset-0 rounded-full",
          "bg-white/20 scale-0 opacity-0",
          "transition-all duration-300 ease-out",
          // This would be triggered by click state in a full implementation
          "group-active:scale-110 group-active:opacity-100 group-active:animate-ping"
        )} />
      </button>
      
      {/* Floating animation keyframes */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-6px) scale(1.02);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}