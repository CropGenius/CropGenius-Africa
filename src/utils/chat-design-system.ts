/**
 * CropGenius Chat Design System Utilities
 * Centralized design tokens and helper functions for consistent styling
 */

// Design Tokens extracted from existing CropGenius pages
export const CHAT_DESIGN_TOKENS = {
  // Colors (matching existing CropGenius theme)
  colors: {
    primary: '#10b981',      // --primary from index.css
    green50: '#ecfdf5',      // bg-crop-green-50
    green600: '#059669',     // bg-crop-green-600  
    green700: '#047857',     // bg-crop-green-700
    gray900: '#111827',      // text-gray-900
    gray600: '#4b5563',      // text-gray-600
    gray100: '#f3f4f6',      // bg-gray-100
  },
  
  // Spacing (matching Index.tsx patterns)
  spacing: {
    container: 'p-4',        // Match Index.tsx container padding
    section: 'space-y-6',    // Match Index.tsx section spacing
    content: 'max-w-2xl mx-auto', // Match Index.tsx content width
    header: 'mb-6',          // Match Index.tsx header margin
  },
  
  // Typography (matching existing headers)
  typography: {
    title: 'text-2xl font-bold text-gray-900 mb-2',
    subtitle: 'text-gray-600',
  },
  
  // Elevation (matching existing cards)
  elevation: {
    sm: 'shadow-sm',
    md: 'shadow-md', 
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  },
  
  // Border Radius (matching existing components)
  radius: {
    sm: 'rounded-md',   // 6px
    md: 'rounded-lg',   // 8px  
    lg: 'rounded-xl',   // 12px
    xl: 'rounded-2xl',  // 16px
  }
} as const;

/**
 * Get consistent chat container classes
 */
export const getChatContainerClasses = () => {
  return [
    'min-h-screen',
    CHAT_DESIGN_TOKENS.spacing.container,
    CHAT_DESIGN_TOKENS.spacing.section
  ].join(' ');
};

/**
 * Get consistent chat header classes  
 */
export const getChatHeaderClasses = () => {
  return CHAT_DESIGN_TOKENS.spacing.header;
};

/**
 * Get consistent chat content classes
 */
export const getChatContentClasses = () => {
  return [
    CHAT_DESIGN_TOKENS.spacing.content,
    CHAT_DESIGN_TOKENS.spacing.section
  ].join(' ');
};

/**
 * Get consistent title classes
 */
export const getChatTitleClasses = () => {
  return CHAT_DESIGN_TOKENS.typography.title;
};

/**
 * Get consistent subtitle classes
 */
export const getChatSubtitleClasses = () => {
  return CHAT_DESIGN_TOKENS.typography.subtitle;
};