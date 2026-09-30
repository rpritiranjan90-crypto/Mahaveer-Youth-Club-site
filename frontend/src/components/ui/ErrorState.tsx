import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Button } from './Button';

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  className,
  title = 'Something went wrong',
  description,
  message,
  onRetry,
  retryLabel = 'Try Again',
  ...props
}) => {
  const displayDesc = message || description || 'We encountered an issue while loading this content. Please try again later.';

  return (
    <div
      role="alert"
      className={twMerge(
        clsx(
          'flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-xl border border-rose-200 shadow-xs',
          className
        )
      )}
      {...props}
    >
      <div className="w-14 h-14 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 mb-4">
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h4 className="text-base sm:text-lg font-bold text-stone-900 mb-1.5">{title}</h4>
      <p className="text-xs sm:text-sm text-stone-600 max-w-sm mb-6">{displayDesc}</p>
      {onRetry && (
        <Button variant="primary" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
};
