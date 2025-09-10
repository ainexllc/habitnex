import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { theme } from '@/lib/theme';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, ...props }, ref) => {
    // Check if backgroundColor is set in style prop - if so, remove bg-* classes from className
    const hasCustomBackground = props.style && 'backgroundColor' in props.style;

    // Filter out background classes if custom background is provided
    const filteredClassName = hasCustomBackground && className
      ? className.split(' ').filter(cls => !cls.startsWith('bg-')).join(' ')
      : className;

    return (
      <div
        ref={ref}
        className={cn(
          // Apply theme card styles but filter out background classes if custom background exists
          hasCustomBackground
            ? 'border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm'
            : theme.components.card,
          // Apply hover styles
          hover && `${theme.components.cardHover} cursor-pointer`,
          filteredClassName
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5 pb-4', className)}
        {...props}
      />
    );
  }
);

CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(`text-lg font-semibold leading-none tracking-tight ${theme.text.primary}`, className)}
        {...props}
      />
    );
  }
);

CardTitle.displayName = 'CardTitle';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('pt-0', className)}
        {...props}
      />
    );
  }
);

CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardContent };