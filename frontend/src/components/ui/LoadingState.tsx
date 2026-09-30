import React from 'react';
import { Spinner } from './Spinner';

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading content...',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-stone-200 ${className}`}
      role="status"
      aria-live="polite"
    >
      <Spinner size="lg" className="text-orange-600 mb-4" />
      <p className="text-sm font-medium text-stone-600">{message}</p>
    </div>
  );
};
