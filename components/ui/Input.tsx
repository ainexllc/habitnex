import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { theme } from '@/lib/theme';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className={`block text-sm font-medium ${theme.text.secondary}`}>
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            `w-full ${theme.components.input.base} ${theme.components.input.focus} ${theme.animation.transition}`,
            'px-3 py-2 rounded-lg border-2 focus:outline-none',
            error && `${theme.components.input.error} focus:ring-red-500/30`,
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className={`text-sm ${theme.status.error.text}`}>{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };