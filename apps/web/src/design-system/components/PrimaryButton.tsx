import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'md' | 'lg';

interface PrimaryButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-pitch-500 text-white shadow-md hover:bg-pitch-600',
  secondary: 'bg-electric-500 text-white shadow-md hover:bg-electric-600',
  ghost: 'bg-transparent text-pitch-700 border-2 border-pitch-300 hover:bg-pitch-50',
  destructive: 'bg-red-500 text-white shadow-md hover:bg-red-600',
};

const sizeStyles: Record<ButtonSize, string> = {
  md: 'h-12 px-6 text-base',
  lg: 'h-14 px-8 text-lg',
};

export function PrimaryButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  onClick,
  className = '',
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileTap={isDisabled ? undefined : { scale: 0.95 }}
      whileHover={isDisabled ? undefined : { scale: 1.02 }}
      transition={{ duration: 0.15 }}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      aria-busy={loading}
      aria-disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2 rounded-game font-bold
        transition-colors duration-150 select-none min-h-tap-min
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {loading ? (
        <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      ) : icon ? (
        <span className="text-xl">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  );
}
