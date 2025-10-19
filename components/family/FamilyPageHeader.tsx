'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface FamilyPageHeaderProps {
  /**
   * Main title displayed prominently at the top
   */
  title: string;
  
  /**
   * Subtitle/description text below the title
   */
  subtitle?: string;
  
  /**
   * URL path to navigate back to (defaults to /?tab=overview)
   */
  backPath?: string;
  
  /**
   * Custom text for the back button (defaults to "Back to Dashboard")
   */
  backText?: string;
  
  /**
   * Primary action button(s) displayed on the right side
   */
  actions?: ReactNode;
  
  /**
   * Additional CSS classes for the container
   */
  className?: string;
}

/**
 * Reusable header component for family dashboard pages
 * Follows the exact styling patterns from the members page
 */
export function FamilyPageHeader({
  title,
  subtitle,
  backPath = "/?tab=overview",
  backText = "Back to Workspace",
  actions,
  className = ""
}: FamilyPageHeaderProps) {
  return (
    <div className={`mb-8 ${className}`}>
      {/* Back Button */}
      <Link href={backPath}>
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {backText}
        </Button>
      </Link>
      
      {/* Title Section with Optional Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Action Buttons */}
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
