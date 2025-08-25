'use client';

import { cn } from '@/lib/utils';

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
        "relative w-full bg-gray-200 rounded-full overflow-hidden h-2",
        className
      )}
      style={style}
    >
      <div
        className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
        style={{ 
          width: `${percentage}%`,
          backgroundColor: style?.backgroundColor ? undefined : '#3B82F6'
        }}
      />
    </div>
  );
}