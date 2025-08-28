'use client';

import { ReactNode } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface FamilyDashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  loading?: boolean;
  loadingMessage?: string;
  actionButton?: {
    label: string;
    icon?: LucideIcon;
    href?: string;
    onClick?: () => void;
    show?: boolean;
  };
  backButton?: {
    href?: string;
    label?: string;
  };
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl';
  backgroundVariant?: 'blue' | 'purple' | 'analytics';
  className?: string;
  showBackButton?: boolean;
}

export function FamilyDashboardLayout({
  children,
  title,
  subtitle,
  loading = false,
  loadingMessage = 'Loading...',
  actionButton,
  backButton = {
    href: '/dashboard/family',
    label: 'Back to Dashboard'
  },
  maxWidth = '6xl',
  backgroundVariant = 'blue',
  className,
  showBackButton = true
}: FamilyDashboardLayoutProps) {
  const { currentFamily, currentMember, loading: familyLoading } = useFamily();
  
  // Determine background gradient based on variant
  const getBackgroundClass = () => {
    switch (backgroundVariant) {
      case 'purple':
        return 'min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800';
      case 'analytics':
        return 'min-h-screen bg-gradient-to-br from-purple-50 to-pink-100';
      case 'blue':
      default:
        return 'min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800';
    }
  };

  // Determine container max width
  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case '2xl': return 'max-w-2xl';
      case '4xl': return 'max-w-4xl';
      case '6xl': return 'max-w-6xl';
      case '7xl': return 'max-w-7xl';
      default: return 'max-w-6xl';
    }
  };

  const isLoading = loading || familyLoading;

  // Loading state
  if (isLoading) {
    return (
      <div className={getBackgroundClass()}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className={cn(
              "animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4",
              backgroundVariant === 'purple' 
                ? "border-purple-600 dark:border-purple-400" 
                : "border-blue-600 dark:border-blue-400"
            )}></div>
            <p className={cn(
              "font-medium",
              backgroundVariant === 'purple' 
                ? "text-purple-600 dark:text-purple-400" 
                : "text-blue-600 dark:text-blue-400"
            )}>
              {loadingMessage}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No family state
  if (!currentFamily || !currentMember) {
    return (
      <div className={getBackgroundClass()}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Family Found</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">You need to create or join a family first.</p>
            <Link href="/family/create">
              <Button>Create Family</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(getBackgroundClass(), className)}>
      <div className={cn(getMaxWidthClass(), "mx-auto p-6")}>
        {/* Header */}
        <div className="mb-8">
          {/* Back Button */}
          {showBackButton && (
            <Link href={backButton.href || '/dashboard/family'}>
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {backButton.label || 'Back to Dashboard'}
              </Button>
            </Link>
          )}
          
          {/* Title and Action Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
              {subtitle && (
                <p className="text-gray-600 dark:text-gray-300 mt-1">{subtitle}</p>
              )}
            </div>
            
            {/* Action Button */}
            {actionButton && (actionButton.show !== false) && (
              <div>
                {actionButton.href ? (
                  <Link href={actionButton.href}>
                    <Button>
                      {actionButton.icon && <actionButton.icon className="w-5 h-5 mr-2" />}
                      {actionButton.label}
                    </Button>
                  </Link>
                ) : (
                  <Button onClick={actionButton.onClick}>
                    {actionButton.icon && <actionButton.icon className="w-5 h-5 mr-2" />}
                    {actionButton.label}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}

// Enhanced loading states for specific content
interface FamilyDashboardLoadingProps {
  type?: 'cards' | 'list' | 'table' | 'analytics';
  count?: number;
  className?: string;
}

export function FamilyDashboardLoading({ 
  type = 'cards', 
  count = 3,
  className 
}: FamilyDashboardLoadingProps) {
  const renderSkeletons = () => {
    switch (type) {
      case 'cards':
        return (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
              <div 
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'list':
        return (
          <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
              <div 
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'table':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 animate-pulse">
              <div className="space-y-4">
                {/* Header */}
                <div className="grid grid-cols-6 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
                {/* Rows */}
                {Array.from({ length: count }).map((_, i) => (
                  <div key={i} className="grid grid-cols-6 gap-4">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <div key={j} className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'analytics':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div 
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div className="ml-4 flex-1">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {Array.from({ length: 2 }).map((_, i) => (
                <div 
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                  <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={className}>
      {renderSkeletons()}
    </div>
  );
}

// Access control wrapper component
interface FamilyDashboardProtectedProps {
  children: ReactNode;
  requireParent?: boolean;
  title?: string;
  subtitle?: string;
  backHref?: string;
  backgroundVariant?: 'blue' | 'purple' | 'analytics';
}

export function FamilyDashboardProtected({ 
  children, 
  requireParent = false,
  title = "Access Denied",
  subtitle = "You don't have permission to view this page.",
  backHref = "/dashboard/family",
  backgroundVariant = 'blue'
}: FamilyDashboardProtectedProps) {
  const { currentFamily, isParent } = useFamily();
  
  if (requireParent && !isParent) {
    return (
      <FamilyDashboardLayout
        title={title}
        subtitle={subtitle}
        backButton={{ href: backHref, label: "Back to Dashboard" }}
        backgroundVariant={backgroundVariant}
      >
        <div className="text-center py-12">
          <Link href={backHref}>
            <Button>Go Back</Button>
          </Link>
        </div>
      </FamilyDashboardLayout>
    );
  }
  
  return <>{children}</>;
}

// Empty state component
interface FamilyDashboardEmptyProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionButton?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

export function FamilyDashboardEmpty({
  icon: Icon,
  title,
  description,
  actionButton,
  className
}: FamilyDashboardEmptyProps) {
  return (
    <div className={cn("text-center py-12", className)}>
      <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6">{description}</p>
      {actionButton && (
        <div>
          {actionButton.href ? (
            <Link href={actionButton.href}>
              <Button>
                {actionButton.icon && <actionButton.icon className="w-5 h-5 mr-2" />}
                {actionButton.label}
              </Button>
            </Link>
          ) : (
            <Button onClick={actionButton.onClick}>
              {actionButton.icon && <actionButton.icon className="w-5 h-5 mr-2" />}
              {actionButton.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}