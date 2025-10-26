import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ThemeToggle({ className = '', size = 'md' }: ThemeToggleProps) {
  const { isDarkMode, toggleDarkMode } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={toggleDarkMode}
      className={`
        ${sizeClasses[size]}
        relative overflow-hidden rounded-lg
        bg-gray-200 dark:bg-gray-700
        hover:bg-gray-300 dark:hover:bg-gray-600
        transition-all duration-300 ease-in-out
        flex items-center justify-center
        group
        ${className}
      `}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <Sun
          className={`
            ${iconSizes[size]}
            text-yellow-500
            transition-all duration-300 ease-in-out
            ${isDarkMode ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}
            absolute
          `}
        />
        <Moon
          className={`
            ${iconSizes[size]}
            text-blue-400
            transition-all duration-300 ease-in-out
            ${isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}
            absolute
          `}
        />
      </div>
      
      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-lg bg-white dark:bg-gray-800 opacity-0 group-active:opacity-20 transition-opacity duration-150" />
    </button>
  );
}
