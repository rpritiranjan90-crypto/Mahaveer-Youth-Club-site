import React from 'react';

export interface ContainerProps {
  size?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
  children: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ({
  size = 'lg',
  className = '',
  children,
}) => {
  const sizeClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 w-full ${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  );
};
