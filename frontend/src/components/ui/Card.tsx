import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', interactive = false, ...props }) => {
  return (
    <div
      className={`bg-white border border-stone-200 rounded-xl p-6 shadow-soft ${
        interactive ? 'card-interactive' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
