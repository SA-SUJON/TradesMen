
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { getThemeClasses } from '../../utils/themeUtils';
import { useTheme } from '../../contexts/ThemeContext';
import { ChevronDown, Check, X } from 'lucide-react';

interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

// --- BUTTON COMPONENT ---
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
      className={`${baseClass} min-h-[48px] flex items-center justify-center cursor-pointer select-none ${className}`} 
      {...props as any}
    >
      {children}
    </motion.button>
  );
};

// --- CARD COMPONENT ---
interface CardProps extends HTMLMotionProps<"div"> {
    onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const Card: React.FC<CardProps> = ({ className = '', children, ...props }) => {
  const { theme } = useTheme();
  const styles = getThemeClasses(theme);
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`${styles.card} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// --- TOGGLE COMPONENT ---
interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    icon?: React.ReactNode; // Optional icon override
    className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, icon, className = '' }) => {
    const { theme } = useTheme();
    
    // Theme-specific styles for the toggle track and knob
    const getTrackStyles = () => {
        if (theme === 'neumorphism') {
            return checked 
                ? 'bg-[#E0E5EC] dark:bg-[#292d3e] shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff] dark:shadow-[inset_3px_3px_6px_#1f2330,inset_-3px_-3px_6px_#33374a]' 
                : 'bg-[#E0E5EC] dark:bg-[#292d3e] shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff] dark:shadow-[inset_3px_3px_6px_#1f2330,inset_-3px_-3px_6px_#33374a]';
        }
        if (theme === 'glass') {
            return checked
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 border border-white/20'
                : 'bg-black/10 dark:bg-white/10 border border-white/10 dark:border-white/5';
        }
        return checked 
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-indigo-400 dark:to-purple-500' 
            : 'bg-gray-200 dark:bg-gray-700';
    };

    const getKnobStyles = () => {
        if (theme === 'neumorphism') {
            return checked
                ? 'bg-blue-500 shadow-[2px_2px_5px_#a3b1c6,-2px_-2px_5px_#ffffff] dark:shadow-[2px_2px_5px_#1f2330,-2px_-2px_5px_#33374a]'
                : 'bg-[#E0E5EC] dark:bg-[#292d3e] shadow-[3px_3px_6px_#a3b1c6,-3px_-3px_6px_#ffffff] dark:shadow-[3px_3px_6px_#1f2330,-3px_-3px_6px_#33374a]';
        }
        return 'bg-white shadow-md';
    };

    return (
        <div 
            onClick={() => onChange(!checked)}
            className={`w-14 h-8 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 relative ${getTrackStyles()} ${className}`}
        >
            <motion.div
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${getKnobStyles()}`}
                style={{ marginLeft: checked ? 'auto' : '0' }}
            >
                <AnimatePresence mode="wait">
                    {checked ? (
                        <motion.div 
                            key="check"
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 90 }}
                        >
                            {icon || (theme === 'neumorphism' ? <Check className="w-4 h-4 text-white" /> : <Check className="w-4 h-4 text-blue-600" />)}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="cross"
                            initial={{ scale: 0, rotate: 90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: -90 }}
                        >
                            <X className="w-4 h-4 opacity-30 text-gray-500" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

// --- INPUT COMPONENT ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, BaseProps {
  label?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

export const Input: React.FC<InputProps> = ({ label, icon, rightIcon, className = '', wrapperClassName = '', type="text", ...props }) => {
  const { theme } = useTheme();
  const styles = getThemeClasses(theme);
  
  const inputMode = type === 'number' ? 'decimal' : props.inputMode;

  return (
    <div className={`w-full group ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={`${styles.inputWrapper} relative ${wrapperClassName}`}>
        {icon && <div className={`flex items-center justify-center ${styles.inputIcon} flex-shrink-0`}>{icon}</div>}
        <input 
          type={type}
          inputMode={inputMode}
          className={`${styles.inputField} bg-transparent flex-grow min-w-0`} 
          {...props} 
        />
        {rightIcon && <div className={`flex items-center gap-1 pl-2 flex-shrink-0 ${styles.inputIcon} mr-0`}>{rightIcon}</div>}
      </div>
    </div>
  );
};

// --- SELECT COMPONENT ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement>, BaseProps {
    label?: string;
    icon?: React.ReactNode;
    wrapperClassName?: string;
}

export const Select: React.FC<SelectProps> = ({ label, icon, className = '', wrapperClassName = '', children, ...props }) => {
    const { theme } = useTheme();
    const styles = getThemeClasses(theme);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Extract options
    const options = useMemo(() => {
        return React.Children.toArray(children).map((child: any) => {
             if (child.type === 'option') {
                 return { value: child.props.value, label: child.props.children };
             }
             return null;
        }).filter(Boolean) as { value: string | number, label: React.ReactNode }[];
    }, [children]);

    const selectedOption = options.find(o => String(o.value) === String(props.value));

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
            const event = { target: { value }, currentTarget: { value } } as any;
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
                className={`${styles.inputWrapper} cursor-pointer relative !pr-10 ${wrapperClassName}`}
             >
                {icon && <span className={styles.inputIcon}>{icon}</span>}
                <span className={`block w-full truncate ${styles.inputField} flex items-center ${!selectedOption?.value ? 'opacity-50' : ''}`}>
                    {selectedOption ? selectedOption.label : "Select..."}
                </span>
                <ChevronDown className={`w-5 h-5 transition-transform absolute right-5 opacity-60 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
             </div>

             {/* Dropdown Menu */}
             <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98, originY: 0 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`absolute left-0 right-0 max-h-64 overflow-y-auto custom-scrollbar z-[100] ${styles.dropdownMenu}`}
                    >
                        {options.map((opt, idx) => {
                            const isSelected = String(props.value) === String(opt.value);
                            return (
                                <div 
                                    key={idx}
                                    onClick={() => handleSelect(opt.value)}
                                    className={`${styles.dropdownItem} ${isSelected ? styles.dropdownItemActive : ''} mb-1 last:mb-0`}
                                >
                                    {isSelected && (
                                        <motion.div layoutId="check" className="absolute left-3 flex items-center justify-center text-blue-500">
                                            <Check className="w-4 h-4" />
                                        </motion.div>
                                    )}
                                    <span className={isSelected ? 'ml-6' : ''}>{opt.label}</span>
                                </div>
                            )
                        })}
                        {options.length === 0 && (
                            <div className="p-4 text-sm opacity-50 text-center italic">No options available</div>
                        )}
                    </motion.div>
                )}
             </AnimatePresence>
        </div>
    )
}
