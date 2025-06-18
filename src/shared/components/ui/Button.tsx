import React from 'react';
import { Button as AntButton, ButtonProps as AntButtonProps } from 'antd';
import { cn } from '../../utils/cn';

interface ButtonProps extends AntButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  fullWidth = false,
  className,
  children,
  ...props
}) => {
  const baseClasses = 'font-medium transition-all duration-200';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 border-blue-600 text-white',
    secondary: 'bg-slate-700 hover:bg-slate-600 border-slate-700 text-white',
    outline: 'border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 bg-transparent',
    ghost: 'border-none text-slate-300 hover:text-white bg-transparent hover:bg-slate-800',
  };

  return (
    <AntButton
      className={cn(
        baseClasses,
        variantClasses[variant],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </AntButton>
  );
};