import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'input w-full',
            error && 'border-error-500 focus:ring-error-500/30 focus:border-error-500 focus:bg-error-50/30 dark:focus:bg-error-950/30',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-error-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };