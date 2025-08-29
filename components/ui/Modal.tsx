'use client';

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { theme } from '@/lib/theme';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className,
  size = 'md' 
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 ${theme.components.modal.backdrop} ${theme.animation.transition}`}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={cn(
          `relative w-full rounded-lg ${theme.shadow.xl} transform ${theme.animation.transitionSlow}`,
          theme.components.modal.content,
          sizeClasses[size],
          className
        )}>
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${theme.border.default}`}>
            <h3 className={`text-lg font-semibold ${theme.text.primary}`}>
              {title}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={theme.text.muted}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}