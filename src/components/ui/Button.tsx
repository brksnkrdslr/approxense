'use client';

import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

export default function Button({
  variant = 'primary',
  fullWidth = true,
  className,
  style,
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-[12px] text-base font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'text-white min-h-[52px] px-6 py-3',
    secondary: 'border min-h-[52px] px-6 py-3',
    ghost: 'min-h-[44px] px-4 py-2',
  };

  const baseStyle: React.CSSProperties =
    variant === 'primary'
      ? { backgroundColor: 'var(--color-accent)' }
      : variant === 'secondary'
      ? { borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }
      : { color: 'var(--color-text-secondary)' };

  return (
    <button
      className={cn(base, variants[variant], fullWidth ? 'w-full' : '', className)}
      style={{ ...baseStyle, ...style }}
      {...props}
    >
      {children}
    </button>
  );
}
