import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantClasses: Record<string, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-container',
  secondary: 'bg-secondary-fixed text-black hover:bg-secondary-fixed-dim',
  tertiary: 'bg-tertiary-fixed text-on-tertiary-fixed',
  error: 'bg-error text-on-error hover:bg-error-container',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-base min-h-10',
  lg: 'px-8 py-4 text-lg min-h-14',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'lg',
  className = '',
  style,
  ...rest
}) => {
  return (
    <button
      {...rest}
      className={`
        rounded-base font-bold transition-all duration-200
        active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed
        border border-black
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      style={style}
    >
      {children}
    </button>
  );
};
