'use client';

import { cn } from '@/lib/utils';
import { theme } from '@/lib/theme';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Progress({ value, max = 100, className, style }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div 
      className={cn(
        "relative w-full rounded-full overflow-hidden h-2",
        theme.surface.secondary,
        className
      )}
      style={style}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300 ease-out",
          style?.backgroundColor ? '' : 'bg-blue-600'
        )}
        style={{ 
          width: `${percentage}%`,
          backgroundColor: style?.backgroundColor
        }}
      />
    </div>
  );
}