import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'error';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

const variantClasses = {
  primary: 'bg-primary text-on-primary hover:bg-primary-container',
  secondary: 'bg-secondary-fixed text-on-surface hover:bg-secondary-fixed-dim',
  tertiary: 'bg-tertiary-fixed text-on-tertiary-fixed hover:bg-tertiary-fixed-dim',
  error: 'bg-error text-on-error hover:bg-error-container',
  ghost: 'bg-transparent text-on-primary border border-outline',
};

const sizeClasses = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-base min-h-10',
  lg: 'px-8 py-4 text-lg min-h-14',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-base font-bold transition-all duration-200
        active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      style={{ fontFamily: 'Quicksand' }}
    >
      {children}
    </button>
  );
};
