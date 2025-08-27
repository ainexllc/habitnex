'use client';

import React, { useState } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { 
  Copy, 
  Share2, 
  Mail, 
  MessageSquare, 
  Check, 
  Users, 
  QrCode,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InviteCodeDisplayProps {
  className?: string;
  variant?: 'card' | 'inline';
  showTitle?: boolean;
}

export function InviteCodeDisplay({ 
  className, 
  variant = 'card',
  showTitle = true 
}: InviteCodeDisplayProps) {
  const { currentFamily, loading } = useFamily();
  const [copied, setCopied] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const inviteCode = currentFamily?.inviteCode;
  const familyName = currentFamily?.name || 'Your Family';

  const handleCopyCode = async () => {
    if (!inviteCode) return;
    
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy invite code:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = inviteCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyInviteMessage = async () => {
    if (!inviteCode) return;
    
    const message = `Hey! Join our "${familyName}" family on NextVibe - our habit tracking app! 

Use this invite code: ${inviteCode}

Download the app and enter the code to start tracking habits together! 🎯`;
    
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy invite message:', err);
    }
  };

  const shareOptions = [
    {
      id: 'message',
      label: 'Copy Invite Message',
      description: 'Full message with instructions',
      icon: <MessageSquare className="w-5 h-5 text-blue-600" />,
      action: handleCopyInviteMessage
    },
    {
      id: 'code',
      label: 'Copy Code Only',
      description: 'Just the 6-digit code',
      icon: <Copy className="w-5 h-5 text-gray-600" />,
      action: handleCopyCode
    },
    {
      id: 'email',
      label: 'Send Email',
      description: 'Open email app',
      icon: <Mail className="w-5 h-5 text-green-600" />,
      action: () => {
        const subject = encodeURIComponent(`Join "${familyName}" on NextVibe`);
        const body = encodeURIComponent(`Hey! Join our "${familyName}" family on NextVibe - our habit tracking app! 

Use this invite code: ${inviteCode}

Download the app and enter the code to start tracking habits together! 🎯`);
        window.open(`mailto:?subject=${subject}&body=${body}`);
      }
    },
    {
      id: 'text',
      label: 'Send Text Message',
      description: 'Open messaging app',
      icon: <MessageSquare className="w-5 h-5 text-blue-600" />,
      action: () => {
        const message = encodeURIComponent(`Join our "${familyName}" family on NextVibe! Use invite code: ${inviteCode}`);
        window.open(`sms:?body=${message}`);
      }
    }
  ];

  // Loading state
  if (loading || !currentFamily) {
    return (
      <div className={cn(
        variant === 'card' ? 'card' : 'inline-flex items-center space-x-3',
        'animate-pulse',
        className
      )}>
        {variant === 'card' ? (
          <>
            <CardHeader>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            </CardHeader>
            <CardContent>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            </CardContent>
          </>
        ) : (
          <>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </>
        )}
      </div>
    );
  }

  // Error state - no invite code
  if (!inviteCode) {
    return (
      <div className={cn(
        variant === 'card' ? 'card' : 'inline-flex items-center space-x-3',
        'border-error-200 dark:border-error-800',
        className
      )}>
        {variant === 'card' ? (
          <>
            {showTitle && (
              <CardHeader>
                <CardTitle className="text-error-600 dark:text-error-400">
                  Invite Code Unavailable
                </CardTitle>
              </CardHeader>
            )}
            <CardContent>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Unable to load family invite code. Please try refreshing the page.
              </p>
            </CardContent>
          </>
        ) : (
          <span className="text-sm text-error-600 dark:text-error-400">
            Code unavailable
          </span>
        )}
      </div>
    );
  }

  // Inline variant
  if (variant === 'inline') {
    return (
      <div className={cn('inline-flex items-center space-x-3', className)}>
        <div className="font-mono text-lg font-bold bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-lg border border-primary-200 dark:border-primary-800">
          {inviteCode}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyCode}
          className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
    );
  }

  // Card variant (default)
  return (
    <>
      <Card className={cn('hover:shadow-lg transition-shadow', className)}>
        {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-text-primary-light dark:text-text-primary-dark">
              <Users className="w-5 h-5 text-primary-500" />
              <span>Family Invite Code</span>
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className={showTitle ? '' : 'pt-6'}>
          <div className="text-center space-y-4">
            {/* Large invite code display */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl p-6 border border-primary-200 dark:border-primary-800">
              <div className="font-mono text-3xl font-bold text-primary-700 dark:text-primary-300 tracking-wider mb-2">
                {inviteCode}
              </div>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Share this code for others to join "{familyName}"
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2 justify-center">
              <Button
                variant="primary"
                size="sm"
                onClick={handleCopyCode}
                className="flex-1 max-w-32"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy Code
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShareModalOpen(true)}
                className="flex-1 max-w-32"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>

            {/* Instructions */}
            <div className="bg-secondary-50 dark:bg-secondary-900/50 rounded-lg p-4 text-left">
              <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                How to invite someone:
              </h4>
              <ol className="text-sm text-text-secondary-light dark:text-text-secondary-dark space-y-1">
                <li className="flex items-start">
                  <span className="inline-block w-5 text-primary-500 font-medium">1.</span>
                  <span>Share the code above with family members</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-5 text-primary-500 font-medium">2.</span>
                  <span>They create an account on NextVibe</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-5 text-primary-500 font-medium">3.</span>
                  <span>They enter the code to join your family</span>
                </li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Modal */}
      <Modal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Share Family Invite"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 mb-4">
              <div className="font-mono text-xl font-bold text-primary-700 dark:text-primary-300 mb-1">
                {inviteCode}
              </div>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Family: {familyName}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark">
              Choose how to share:
            </h4>
            
            {shareOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  option.action();
                  setShareModalOpen(false);
                }}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors text-left"
              >
                {option.icon}
                <div>
                  <div className="font-medium text-text-primary-light dark:text-text-primary-dark">
                    {option.label}
                  </div>
                  <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    {option.description}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-text-muted-light dark:text-text-muted-dark ml-auto" />
              </button>
            ))}
          </div>

          <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <div className="text-warning-600 dark:text-warning-400 mt-0.5">⚠️</div>
              <div className="text-warning-800 dark:text-warning-300 text-sm">
                <div className="font-medium mb-1">Keep your code safe</div>
                <div>Only share this code with people you want in your family. Anyone with this code can join.</div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}