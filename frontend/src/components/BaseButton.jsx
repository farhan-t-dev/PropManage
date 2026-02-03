import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const BaseButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  loading, 
  icon: Icon,
  ...props 
}) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 px-6 py-3.5 font-bold rounded-2xl transition-all'
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3.5 text-sm',
    lg: 'px-8 py-4 text-base'
  };

  return (
    <button
      className={twMerge(variants[variant], sizes[size], className)}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4" />}
          {children}
        </>
      )}
    </button>
  );
};