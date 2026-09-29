import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, required, ...props }, ref) => {
    const inputId = id || `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className="flex flex-col gap-1 text-left">
        <label htmlFor={inputId} className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            id={inputId}
            ref={ref}
            type="checkbox"
            required={required}
            className={twMerge(
              clsx(
                'mt-0.5 h-4 w-4 rounded border-[#D1C0AF] text-[#F97316] focus:ring-[#F97316]/30 cursor-pointer accent-[#F97316]',
                error && 'border-[#B91C1C]',
                className
              )
            )}
            {...props}
          />
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-medium text-[#241A17] flex items-center gap-1">
              <span>{label}</span>
              {required && <span className="text-[#B91C1C]">*</span>}
            </span>
            {description && <span className="text-xs text-[#6B625D] mt-0.5">{description}</span>}
          </div>
        </label>
        {error && <p className="text-xs text-[#B91C1C] pl-6">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
