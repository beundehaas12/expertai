import { forwardRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { IconButtonVariant } from '@/types';

interface IconButtonProps {
    variant?: IconButtonVariant;
    icon: ReactNode;
    size?: 'sm' | 'md' | 'lg';
    isActive?: boolean;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    'aria-label'?: string;
}

const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
};

const variantClasses = {
    default: 'bg-transparent text-gray-700 hover:bg-gray-100',
    primary: 'bg-gray-900 text-white hover:bg-gray-700',
    ghost: 'bg-transparent text-gray-400 hover:text-gray-600',
};

const activeClasses = {
    default: 'bg-gray-100',
    primary: 'bg-gray-700',
    ghost: 'text-gray-600',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ variant = 'default', icon, size = 'md', isActive, className = '', disabled, onClick, ...props }, ref) => {
        const baseClasses = 'flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50';

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: disabled ? 1 : 1.05 }}
                whileTap={{ scale: disabled ? 1 : 0.95 }}
                className={`
          ${baseClasses}
          ${sizeClasses[size]}
          ${variantClasses[variant]}
          ${isActive ? activeClasses[variant] : ''}
          ${className}
        `}
                disabled={disabled}
                onClick={onClick}
                aria-label={props['aria-label']}
            >
                {icon}
            </motion.button>
        );
    }
);

IconButton.displayName = 'IconButton';
