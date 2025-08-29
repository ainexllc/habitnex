'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { theme } from '@/lib/theme';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          theme.components.input.base,
          theme.components.input.focus,
          "disabled:" + theme.components.input.disabled,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };