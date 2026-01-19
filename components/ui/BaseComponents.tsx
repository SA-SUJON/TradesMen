
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { getThemeClasses } from '../../utils/themeUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { ChevronDown, Check } from 'lucide-react';

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
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      className={`${baseClass} min-h-[48px] flex items-center justify-center ${className}`} 
      {...props as any}
    >
      {children}
    </motion.button>
  );
};

interface CardProps extends HTMLMotionProps<"div"> {
    onClick?: React.MouseEventHandler<HTMLDivElement>;
}

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
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, icon, rightIcon, className = '', type="text", ...props }) => {
  const { theme } = useTheme();
  const styles = getThemeClasses(theme);
  
  // Use inputMode for better mobile keyboards
  const inputMode = type === 'number' ? 'decimal' : props.inputMode;

  return (
    <div className={`w-full group ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputWrapper}>
        {icon && <span className={styles.inputIcon}>{icon}</span>}
        <input 
          type={type}
          inputMode={inputMode}
          className={styles.inputField} 
          {...props} 
        />
        {rightIcon && <span className={`${styles.inputIcon} mr-0 ml-2`}>{rightIcon}</span>}
      </div>
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement>, BaseProps {
    label?: string;
    icon?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ label, icon, className = '', children, ...props }) => {
    const { theme } = useTheme();
    const styles = getThemeClasses(theme);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Extract options from children to build custom list
    const options = useMemo(() => {
        return React.Children.toArray(children).map((child: any) => {
             if (child.type === 'option') {
                 return { value: child.props.value, label: child.props.children };
             }
             return null;
        }).filter(Boolean) as { value: string | number, label: React.ReactNode }[];
    }, [children]);

    const selectedOption = options.find(o => String(o.value) === String(props.value));

    // Handle Click Outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (value: string | number) => {
        if (props.onChange) {
            // Create synthetic event to maintain compatibility
            const event = {
                target: { value },
                currentTarget: { value }
            } as any;
            props.onChange(event);
        }
        setIsOpen(false);
    }

    return (
        <div className={`w-full relative group ${className}`} ref={containerRef}>
             {label && <label className={styles.label}>{label}</label>}
             
             {/* Trigger */}
             <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`${styles.inputWrapper} cursor-pointer relative !pr-10`}
             >
                {icon && <span className={styles.inputIcon}>{icon}</span>}
                <span className={`block w-full truncate ${styles.inputField} flex items-center ${!selectedOption?.value ? 'opacity-50' : ''}`}>
                    {selectedOption ? selectedOption.label : "Select..."}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform opacity-50 absolute right-4 ${isOpen ? 'rotate-180' : ''}`} />
             </div>

             {/* Dropdown Menu */}
             <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`absolute left-0 right-0 max-h-60 overflow-y-auto custom-scrollbar ${styles.dropdownMenu} z-[100]`}
                    >
                        {options.map((opt, idx) => (
                            <div 
                                key={idx}
                                onClick={() => handleSelect(opt.value)}
                                className={`${styles.dropdownItem} min-h-[44px] ${String(props.value) === String(opt.value) ? styles.dropdownItemActive : ''}`}
                            >
                                {String(props.value) === String(opt.value) && (
                                    <Check className="w-4 h-4 text-green-500 mr-2" />
                                )}
                                {opt.label}
                            </div>
                        ))}
                        {options.length === 0 && (
                            <div className="p-3 text-sm opacity-50 text-center">No options available</div>
                        )}
                    </motion.div>
                )}
             </AnimatePresence>
        </div>
    )
}
