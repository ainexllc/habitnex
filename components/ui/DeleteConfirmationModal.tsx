'use client';

import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { theme } from '@/lib/theme';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isLoading = false
}: DeleteConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="sm"
      className="border-red-200 dark:border-red-800"
    >
      <div className="text-center">
        {/* Warning Icon */}
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>

        {/* Title */}
        <h3 className={`text-lg font-semibold ${theme.text.primary} mb-2`}>
          {title}
        </h3>

        {/* Description */}
        <p className={`text-sm ${theme.text.secondary} mb-6 leading-relaxed`}>
          {description}
        </p>

        {/* Warning Message */}
        <div className={`p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg mb-6`}>
          <div className="flex items-start gap-2">
            <Trash2 className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">
              This action cannot be undone. The habit and all its completion data will be permanently deleted.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {cancelText}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            loading={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white border-red-600"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
