import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Container } from './Container';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  eyebrow?: string | React.ReactNode;
  title?: string;
  description?: string | React.ReactNode;
  action?: React.ReactNode;
  align?: 'left' | 'center';
  background?: 'default' | 'white' | 'subtle';
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Section: React.FC<SectionProps> = ({
  className,
  eyebrow,
  title,
  description,
  action,
  align = 'center',
  background = 'default',
  containerSize = 'lg',
  children,
  ...props
}) => {
  const bgStyles = {
    default: 'bg-[#FFF8EE]',
    white: 'bg-white border-y border-[#E9DED1]',
    subtle: 'bg-[#FBF4EA] border-y border-[#F2E8DC]',
  };

  const hasHeader = eyebrow || title || description || action;

  return (
    <section
      className={twMerge(clsx('py-12 sm:py-16 md:py-20', bgStyles[background], className))}
      {...props}
    >
      <Container size={containerSize}>
        {hasHeader && (
          <div
            className={twMerge(
              clsx(
                'mb-8 sm:mb-12',
                align === 'center'
                  ? 'text-center mx-auto max-w-3xl flex flex-col items-center'
                  : 'text-left flex flex-col md:flex-row md:items-end justify-between gap-6'
              )
            )}
          >
            <div className={align === 'center' ? 'w-full' : 'max-w-2xl'}>
              {eyebrow && (
                <div className="mb-2.5">
                  {typeof eyebrow === 'string' ? (
                    <span className="text-xs font-bold uppercase tracking-widest text-[#8B1E1E] bg-[#FEE2E2] px-3 py-1 rounded-full border border-[#FCA5A5]">
                      {eyebrow}
                    </span>
                  ) : (
                    eyebrow
                  )}
                </div>
              )}

              {title && (
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#241A17] tracking-tight mt-2">
                  {title}
                </h2>
              )}

              {description && (
                <div className="text-sm sm:text-base text-[#6B625D] mt-3 leading-relaxed">
                  {description}
                </div>
              )}
            </div>

            {action && <div className="shrink-0 mt-4 md:mt-0">{action}</div>}
          </div>
        )}

        {children}
      </Container>
    </section>
  );
};
