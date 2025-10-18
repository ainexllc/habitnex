'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { familyBackgrounds, familyText, familyIcons, familyAnimations } from '@/lib/familyThemes';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface FamilyPageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  backgroundVariant?: 'normal' | 'touch' | 'analytics' | 'celebration';
  backHref?: string;
  backLabel?: string;
  className?: string;
  showBackButton?: boolean;
}

export function FamilyPageLayout({
  children,
  title,
  subtitle,
  icon: Icon,
  iconColor = "text-white",
  iconBgColor = "bg-blue-600 dark:bg-blue-500",
  backgroundVariant = 'normal',
  backHref = '/workspace?tab=overview',
  backLabel = 'Back to Dashboard',
  className,
  showBackButton = true
}: FamilyPageLayoutProps) {
  return (
    <div className={cn(
      familyBackgrounds.page[backgroundVariant],
      "py-8 px-4",
      className
    )}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {Icon && (
            <div className="flex justify-center mb-4">
              <div className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center shadow-lg",
                iconBgColor,
                iconBgColor.includes('blue') && "dark:shadow-blue-500/20",
                iconBgColor.includes('green') && "dark:shadow-green-500/20", 
                iconBgColor.includes('purple') && "dark:shadow-purple-500/20",
                iconBgColor.includes('red') && "dark:shadow-red-500/20",
                iconBgColor.includes('amber') && "dark:shadow-amber-500/20",
                familyAnimations.hover
              )}>
                <Icon className={cn("w-10 h-10", iconColor)} />
              </div>
            </div>
          )}
          
          <h1 className={cn(
            familyText.primary,
            "text-3xl md:text-4xl font-bold mb-2"
          )}>
            {title}
          </h1>
          
          {subtitle && (
            <p className={cn(
              familyText.secondary,
              "text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
            )}>
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Back Button */}
        {showBackButton && (
          <div className="mb-6">
            <Link href={backHref}>
              <Button variant="ghost" className={cn(
                "flex items-center",
                familyAnimations.hover
              )}>
                <ArrowLeft className={cn("w-4 h-4 mr-2", familyIcons.primary)} />
                {backLabel}
              </Button>
            </Link>
          </div>
        )}
        
        {/* Content */}
        {children}
      </div>
    </div>
  );
}

// Progress indicator component for multi-step forms
interface FamilyProgressStepsProps {
  steps: Array<{
    label: string;
    completed: boolean;
    active: boolean;
  }>;
  className?: string;
}

export function FamilyProgressSteps({ steps, className }: FamilyProgressStepsProps) {
  return (
    <div className={cn("flex justify-center mb-8", className)}>
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200",
              step.active || step.completed
                ? "bg-blue-600 dark:bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            )}>
              {index + 1}
            </div>
            
            {index < steps.length - 1 && (
              <div className="w-8 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={cn(
                  "h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300",
                  step.completed ? "w-full" : "w-0"
                )} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Feature card component for onboarding/informational pages
interface FamilyFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor?: string;
  className?: string;
}

export function FamilyFeatureCard({
  icon: Icon,
  title,
  description,
  iconColor = "text-blue-600 dark:text-blue-400",
  className
}: FamilyFeatureCardProps) {
  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 border-2 border-blue-100 dark:border-blue-900/30",
      "hover:border-blue-200 dark:hover:border-blue-800/50 transition-all duration-200",
      "rounded-xl p-6 shadow-sm hover:shadow-md dark:shadow-gray-900/10",
      familyAnimations.hover,
      className
    )}>
      <div className="flex items-start space-x-4">
        <div className={cn(
          "flex-shrink-0 w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20",
          "flex items-center justify-center"
        )}>
          <Icon className={cn("w-6 h-6", iconColor)} />
        </div>
        
        <div>
          <h3 className={cn(
            familyText.primary,
            "text-lg font-semibold mb-2"
          )}>
            {title}
          </h3>
          <p className={familyText.secondary}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

// Action buttons for family pages
interface FamilyActionButtonsProps {
  buttons: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    icon?: LucideIcon;
    loading?: boolean;
    disabled?: boolean;
  }>;
  className?: string;
}

export function FamilyActionButtons({ buttons, className }: FamilyActionButtonsProps) {
  return (
    <div className={cn(
      "flex flex-col sm:flex-row gap-4 justify-center items-center",
      className
    )}>
      {buttons.map((button, index) => {
        const ButtonContent = (
          <Button
            variant={button.variant || 'primary'}
            size="lg"
            onClick={button.onClick}
            disabled={button.loading || button.disabled}
            className={cn(
              "w-full sm:w-auto min-w-[150px]",
              familyAnimations.hover,
              familyAnimations.press
            )}
          >
            {button.icon && <button.icon className="w-5 h-5 mr-2" />}
            {button.loading ? 'Loading...' : button.label}
          </Button>
        );

        return button.href ? (
          <Link key={index} href={button.href}>
            {ButtonContent}
          </Link>
        ) : (
          <div key={index}>{ButtonContent}</div>
        );
      })}
    </div>
  );
}
