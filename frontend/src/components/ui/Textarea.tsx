import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, required, rows = 3, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-[#241A17] flex items-center gap-1">
            <span>{label}</span>
            {required && <span className="text-[#B91C1C] text-sm">*</span>}
          </label>
        )}

        <textarea
          id={inputId}
          ref={ref}
          rows={rows}
          required={required}
          className={twMerge(
            clsx(
              'w-full bg-white text-[#241A17] placeholder:text-[#8C827C] text-sm rounded-md border border-[#E9DED1] p-3 transition-colors shadow-xs resize-y',
              'focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]',
              'disabled:bg-[#F6EDE1] disabled:text-[#8C827C] disabled:cursor-not-allowed',
              error && 'border-[#B91C1C] focus:border-[#B91C1C] focus:ring-[#B91C1C]/20',
              className
            )
          )}
          {...props}
        />

        {error ? (
          <p className="text-xs font-medium text-[#B91C1C] flex items-center gap-1 mt-0.5" role="alert">
            <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-xs text-[#6B625D] mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
