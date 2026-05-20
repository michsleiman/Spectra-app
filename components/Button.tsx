import React from 'react';
import { motion } from 'motion/react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'ai';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  isLoading,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-black uppercase tracking-widest transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 border border-indigo-500/50",
    secondary: "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800",
    tertiary: "border border-zinc-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 text-zinc-500 hover:text-indigo-400",
    ghost: "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 border border-transparent",
    ai: "border border-dashed border-zinc-800 hover:border-indigo-500 hover:bg-indigo-500/5 text-zinc-500 hover:text-indigo-400 relative overflow-hidden group/ai"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-[9px] rounded-lg",
    md: "px-6 py-2.5 text-[10px] lg:text-[11px] rounded-full",
    lg: "px-8 py-3.5 text-[12px] rounded-full",
    icon: "p-2 rounded-lg"
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {variant === 'ai' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent -translate-x-full group-hover/ai:translate-x-full transition-transform duration-1000 ease-in-out" />
      )}
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
