import React from 'react';
import { twMerge } from 'tailwind-merge';

export const BaseCard = ({ children, className, padding = 'md', hover }) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={twMerge(
      'bg-white border border-surface-200 rounded-[2rem] shadow-sm transition-all duration-300',
      paddings[padding],
      hover && 'hover:shadow-xl hover:shadow-brand-500/5 hover:border-brand-100',
      className
    )}>
      {children}
    </div>
  );
};