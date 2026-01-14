import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { getThemeClasses } from '../../utils/themeUtils';
import { useTheme } from '../../contexts/ThemeContext';

interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, BaseProps {
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', children, ...props }) => {
  const { theme } = useTheme();
  const styles = getThemeClasses(theme);
  const baseClass = variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary;
  
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`${baseClass} ${className}`}
      {...props as any}
    >
      {children}
    </motion.button>
  );
};

interface CardProps extends HTMLMotionProps<"div">, BaseProps {}

export const Card: React.FC<CardProps> = ({ className = '', children, ...props }) => {
  const { theme } = useTheme();
  const styles = getThemeClasses(theme);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`${styles.card} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, BaseProps {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  const { theme } = useTheme();
  const styles = getThemeClasses(theme);
  return (
    <div className="w-full">
      {label && <label className={styles.label}>{label}</label>}
      <input className={`${styles.input} w-full ${className}`} {...props} />
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement>, BaseProps {
    label?: string;
}

export const Select: React.FC<SelectProps> = ({ label, className = '', children, ...props }) => {
    const { theme } = useTheme();
    const styles = getThemeClasses(theme);
    return (
        <div className="w-full">
             {label && <label className={styles.label}>{label}</label>}
             <div className="relative">
                <select className={`${styles.input} w-full appearance-none ${className}`} {...props}>
                    {children}
                </select>
                <div className={`absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none opacity-50 ${theme === 'glass' ? 'text-white' : ''}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
             </div>
        </div>
    )
}
