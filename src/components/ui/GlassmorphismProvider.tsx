/**
 * 🔥 CROPGENIUS GLASSMORPHISM DESIGN SYSTEM
 * Consistent glassmorphism styling across all components
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassmorphismConfig {
  enabled: boolean;
  intensity: 'light' | 'medium' | 'heavy';
  theme: 'light' | 'dark' | 'auto';
}

interface GlassmorphismContextType {
  config: GlassmorphismConfig;
  updateConfig: (config: Partial<GlassmorphismConfig>) => void;
  getGlassStyles: (variant: GlassVariant) => string;
}

type GlassVariant = 
  | 'card' 
  | 'modal' 
  | 'button' 
  | 'input' 
  | 'navigation' 
  | 'sidebar' 
  | 'badge' 
  | 'panel'
  | 'floating';

const GlassmorphismContext = createContext<GlassmorphismContextType | null>(null);

/**
 * Glassmorphism Provider Component
 */
export const GlassmorphismProvider: React.FC<{
  children: ReactNode;
  config?: Partial<GlassmorphismConfig>;
}> = ({ 
  children, 
  config: initialConfig = {} 
}) => {
  const [config, setConfig] = React.useState<GlassmorphismConfig>({
    enabled: true,
    intensity: 'medium',
    theme: 'auto',
    ...initialConfig
  });

  const updateConfig = (newConfig: Partial<GlassmorphismConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const getGlassStyles = (variant: GlassVariant): string => {
    if (!config.enabled) return '';

    const intensityMap = {
      light: {
        blur: 'backdrop-blur-sm',
        opacity: 'bg-white/5',
        border: 'border-white/10',
        shadow: 'shadow-sm'
      },
      medium: {
        blur: 'backdrop-blur-md',
        opacity: 'bg-white/10',
        border: 'border-white/20',
        shadow: 'shadow-lg'
      },
      heavy: {
        blur: 'backdrop-blur-xl',
        opacity: 'bg-white/15',
        border: 'border-white/30',
        shadow: 'shadow-2xl'
      }
    };

    const intensity = intensityMap[config.intensity];

    const variantStyles = {
      card: cn(
        intensity.opacity,
        intensity.blur,
        intensity.border,
        intensity.shadow,
        'border rounded-2xl',
        'relative overflow-hidden',
        'before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:pointer-events-none'
      ),
      modal: cn(
        'bg-white/5',
        'backdrop-blur-2xl',
        'border-white/20',
        'shadow-2xl',
        'border rounded-3xl',
        'relative overflow-hidden'
      ),
      button: cn(
        'bg-white/10',
        'backdrop-blur-md',
        'border-white/20',
        'shadow-lg',
        'border rounded-xl',
        'hover:bg-white/20 hover:shadow-xl',
        'transition-all duration-300',
        'relative overflow-hidden',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700'
      ),
      input: cn(
        'bg-white/5',
        'backdrop-blur-sm',
        'border-white/20',
        'border rounded-xl',
        'focus:bg-white/10 focus:border-white/30',
        'transition-all duration-200'
      ),
      navigation: cn(
        'bg-white/5',
        'backdrop-blur-xl',
        'border-white/10',
        'border-b',
        'shadow-sm'
      ),
      sidebar: cn(
        'bg-white/3',
        'backdrop-blur-lg',
        'border-white/10',
        'border-r'
      ),
      badge: cn(
        'bg-white/15',
        'backdrop-blur-sm',
        'border-white/25',
        'border rounded-full',
        'shadow-sm'
      ),
      panel: cn(
        intensity.opacity,
        intensity.blur,
        intensity.border,
        'border rounded-xl',
        'shadow-md'
      ),
      floating: cn(
        'bg-white/10',
        'backdrop-blur-lg',
        'border-white/20',
        'shadow-xl',
        'border rounded-2xl',
        'relative overflow-hidden'
      )
    };

    return variantStyles[variant];
  };

  return (
    <GlassmorphismContext.Provider value={{ config, updateConfig, getGlassStyles }}>
      {children}
    </GlassmorphismContext.Provider>
  );
};

/**
 * Hook to use glassmorphism context
 */
export const useGlassmorphism = () => {
  const context = useContext(GlassmorphismContext);
  if (!context) {
    throw new Error('useGlassmorphism must be used within a GlassmorphismProvider');
  }
  return context;
};

/**
 * Glass Card Component
 */
export const GlassCard: React.FC<{
  children: ReactNode;
  variant?: GlassVariant;
  className?: string;
  [key: string]: any;
}> = ({ 
  children, 
  variant = 'card', 
  className = '', 
  ...props 
}) => {
  const { getGlassStyles } = useGlassmorphism();
  
  return (
    <div 
      className={cn(getGlassStyles(variant), className)}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Glass Button Component
 */
export const GlassButton: React.FC<{
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  [key: string]: any;
}> = ({ 
  children, 
  onClick, 
  disabled = false, 
  className = '', 
  ...props 
}) => {
  const { getGlassStyles } = useGlassmorphism();
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        getGlassStyles('button'),
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * Glass Input Component
 */
export const GlassInput: React.FC<{
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  [key: string]: any;
}> = ({ 
  placeholder, 
  value, 
  onChange, 
  className = '', 
  ...props 
}) => {
  const { getGlassStyles } = useGlassmorphism();
  
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={cn(
        getGlassStyles('input'),
        'px-4 py-2 text-gray-900 placeholder-gray-500',
        'focus:outline-none focus:ring-2 focus:ring-white/20',
        className
      )}
      {...props}
    />
  );
};

/**
 * Glass Badge Component
 */
export const GlassBadge: React.FC<{
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}> = ({ 
  children, 
  variant = 'default', 
  className = '' 
}) => {
  const { getGlassStyles } = useGlassmorphism();
  
  const variantColors = {
    default: 'text-gray-700',
    success: 'text-green-700 bg-green-500/10',
    warning: 'text-yellow-700 bg-yellow-500/10',
    error: 'text-red-700 bg-red-500/10'
  };
  
  return (
    <span
      className={cn(
        getGlassStyles('badge'),
        'px-3 py-1 text-xs font-medium',
        variantColors[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

/**
 * Glass Panel Component
 */
export const GlassPanel: React.FC<{
  children: ReactNode;
  title?: string;
  className?: string;
}> = ({ 
  children, 
  title, 
  className = '' 
}) => {
  const { getGlassStyles } = useGlassmorphism();
  
  return (
    <div className={cn(getGlassStyles('panel'), 'p-6', className)}>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

/**
 * Glass Navigation Component
 */
export const GlassNavigation: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ 
  children, 
  className = '' 
}) => {
  const { getGlassStyles } = useGlassmorphism();
  
  return (
    <nav className={cn(getGlassStyles('navigation'), 'px-4 py-3', className)}>
      {children}
    </nav>
  );
};

export default GlassmorphismProvider;