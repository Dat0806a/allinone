import React from 'react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Utility for tailwind classes */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Premium Button */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
}

export const PremiumButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary text-white premium-shadow hover:bg-primary-dark orange-glow',
      secondary: 'bg-secondary text-primary-dark premium-shadow hover:bg-orange-100',
      outline: 'border-2 border-primary text-primary hover:bg-primary/5',
      ghost: 'text-slate-600 hover:bg-slate-100',
      danger: 'bg-red-500 text-white shadow-red-200 shadow-lg hover:bg-red-600',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm rounded-xl font-medium',
      md: 'px-6 py-3 text-base rounded-2xl font-semibold',
      lg: 'px-8 py-4 text-lg font-bold rounded-2xl font-display tracking-tight leading-none',
      xl: 'px-10 py-5 text-xl font-black rounded-3xl font-display tracking-tighter leading-none',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'relative flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none',
          variants[variant as keyof typeof variants],
          sizes[size as keyof typeof sizes],
          className
        )}
        {...(props as any)}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

/** Premium Card */
export const PremiumCard = ({ 
  children, 
  className, 
  hover = true,
  onClick
}: { 
  children: React.ReactNode; 
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}) => (
  <motion.div
    whileHover={hover ? { y: -4, scale: 1.01 } : {}}
    onClick={onClick}
    className={cn(
      'bg-white rounded-[2.5rem] p-6 premium-shadow border border-slate-100',
      !className?.includes('overflow-') && 'overflow-hidden',
      className
    )}
  >
    {children}
  </motion.div>
);

/** Glass Section Header */
export const SectionHeader = ({ 
  title, 
  action,
  titleClassName
}: { 
  title: string; 
  action?: React.ReactNode;
  titleClassName?: string;
}) => (
  <div className="flex items-center justify-between px-2 mb-5">
    <h2 className={cn("text-xl md:text-2xl font-display font-black text-[#0F172A] dark:text-[#F8FAFC] tracking-tight leading-none", titleClassName)}>{title}</h2>
    {action}
  </div>
);

/** Floating Label Input */
export const PremiumInput = ({ label, icon: Icon, className, ...props }: any) => (
  <div className="space-y-2">
    {label && <label className="text-sm font-medium text-slate-500 ml-1">{label}</label>}
    <div className="relative group">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />}
        <input
          className={cn(
            "w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 transition-all outline-none text-lg font-sans placeholder:font-sans placeholder:text-slate-400 placeholder:opacity-60",
            Icon ? "pl-12 pr-4" : "px-4",
            "focus:bg-white focus:border-primary/40 focus:ring-8 focus:ring-primary/5",
            className
          )}
          {...props}
        />
    </div>
  </div>
);
