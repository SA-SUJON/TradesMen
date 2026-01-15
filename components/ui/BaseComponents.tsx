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
      whileTap={{ scale: 0.96 }}
      className={`${baseClass} min-h-[48px] flex items-center justify-center ${className}`} // Enforce min-height for touch
      {...props as any}
    >
      {children}
    </motion.button>
  );
};

interface CardProps extends HTMLMotionProps<"div">, BaseProps {
    onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const Card: React.FC<CardProps> = ({ className = '', children, ...props }) => {
  const { theme } = useTheme();
  const styles = getThemeClasses(theme);
  // Adjusted padding: p-4 on mobile, p-6 on desktop
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`${styles.card} p-4 md:p-6 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, BaseProps {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', type="text", ...props }) => {
  const { theme } = useTheme();
  const styles = getThemeClasses(theme);
  
  // Use inputMode for better mobile keyboards
  const inputMode = type === 'number' ? 'decimal' : props.inputMode;

  return (
    <div className="w-full">
      {label && <label className={styles.label}>{label}</label>}
      <input 
        type={type}
        inputMode={inputMode}
        className={`${styles.input} w-full min-h-[48px] ${className}`} // Enforce min-height
        {...props} 
      />
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement>, BaseProps {
    label?: string;
}

export const Select: React.FC<SelectProps> = ({ label, className = '', children, ...props }) => {
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
        <div className="w-full relative" ref={containerRef}>
             {label && <label className={styles.label}>{label}</label>}
             
             {/* Trigger */}
             <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`${styles.input} w-full min-h-[48px] flex items-center justify-between cursor-pointer relative ${className}`}
             >
                <span className={`truncate block w-full pr-6 ${!selectedOption?.value ? 'opacity-50' : ''}`}>
                    {selectedOption ? selectedOption.label : "Select..."}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform opacity-50 absolute right-3 ${isOpen ? 'rotate-180' : ''}`} />
             </div>

             {/* Dropdown Menu */}
             <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute left-0 right-0 max-h-60 overflow-y-auto custom-scrollbar ${styles.dropdownMenu} z-[100]`}
                    >
                        {options.map((opt, idx) => (
                            <div 
                                key={idx}
                                onClick={() => handleSelect(opt.value)}
                                className={`${styles.dropdownItem} min-h-[44px] flex items-center ${String(props.value) === String(opt.value) ? styles.dropdownItemActive : ''}`}
                            >
                                {opt.label}
                                {String(props.value) === String(opt.value) && (
                                    <Check className="w-4 h-4 absolute right-3 opacity-70" />
                                )}
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