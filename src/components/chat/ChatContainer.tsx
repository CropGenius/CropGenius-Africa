import React from 'react';
import { cn } from '@/lib/utils';
import { 
  getChatContainerClasses,
  getChatHeaderClasses,
  getChatContentClasses,
  getChatTitleClasses,
  getChatSubtitleClasses
} from '@/utils/chat-design-system';

interface ChatContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * ChatContainer - Unified container that matches CropGenius design system
 * Uses the same background, spacing, and visual hierarchy as Index and Weather pages
 */
export const ChatContainer: React.FC<ChatContainerProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn(
      getChatContainerClasses(),
      className
    )}>
      {children}
    </div>
  );
};

/**
 * ChatHeader - Consistent header styling matching other pages
 */
interface ChatHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  title, 
  subtitle, 
  className 
}) => {
  return (
    <div className={cn(getChatHeaderClasses(), className)}>
      <h1 className={getChatTitleClasses()}>
        {title}
      </h1>
      {subtitle && (
        <p className={getChatSubtitleClasses()}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

/**
 * ChatContent - Main content area with consistent max-width and spacing
 */
interface ChatContentProps {
  children: React.ReactNode;
  className?: string;
}

export const ChatContent: React.FC<ChatContentProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn(
      getChatContentClasses(),
      className
    )}>
      {children}
    </div>
  );
};