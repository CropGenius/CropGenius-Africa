/**
 * 🌾 CROPGENIUS – MOBILE COMMUNITY CARD v1.0
 * -------------------------------------------------------------
 * MOBILE-OPTIMIZED Question Card Component
 * - Touch-friendly interactions
 * - Swipe gestures for actions
 * - Optimized for small screens
 * - Haptic feedback support
 * - Offline indicators
 */

import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  ThumbsUp, 
  MessageCircle, 
  Eye, 
  Clock,
  Sparkles,
  ChevronRight,
  Wifi,
  WifiOff
} from 'lucide-react';
import { CommunityQuestion } from '@/services/CommunityService';
import { cn } from '@/lib/utils';

interface MobileCommunityCardProps {
  question: CommunityQuestion;
  onClick?: () => void;
  onVote?: (questionId: string, voteType: 'up' | 'down') => void;
  isOffline?: boolean;
  className?: string;
}

export const MobileCommunityCard: React.FC<MobileCommunityCardProps> = ({
  question,
  onClick,
  onVote,
  isOffline = false,
  className = ""
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Simple date formatting for mobile
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getBadgeLevel = (level: string): string => {
    switch (level) {
      case 'guru': return 'bg-purple-100 text-purple-800';
      case 'master': return 'bg-amber-100 text-amber-800';
      case 'expert': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'answered': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  // Touch event handlers for mobile interactions
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    setIsPressed(true);
    
    // Haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    
    // Only allow horizontal swipe if vertical movement is minimal
    if (deltaY < 50) {
      setSwipeOffset(Math.max(-100, Math.min(100, deltaX)));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touchEnd = e.changedTouches[0];
    const deltaX = touchEnd.clientX - touchStartRef.current.x;
    const deltaY = Math.abs(touchEnd.clientY - touchStartRef.current.y);
    const deltaTime = Date.now() - touchStartRef.current.time;
    
    setIsPressed(false);
    
    // Handle swipe actions
    if (Math.abs(deltaX) > 50 && deltaY < 50) {
      if (deltaX > 0) {
        // Swipe right - upvote
        onVote?.(question.id, 'up');
      } else {
        // Swipe left - downvote  
        onVote?.(question.id, 'down');
      }
    } else if (deltaTime < 300 && Math.abs(deltaX) < 10 && deltaY < 10) {
      // Quick tap - open question
      onClick?.();
    }
    
    // Reset swipe offset
    setTimeout(() => setSwipeOffset(0), 200);
    touchStartRef.current = null;
  };

  const handleClick = (e: React.MouseEvent) => {
    // Prevent click if we're swiping
    if (Math.abs(swipeOffset) > 10) {
      e.preventDefault();
      return;
    }
    onClick?.();
  };

  const handleVoteClick = (e: React.MouseEvent, voteType: 'up' | 'down') => {
    e.stopPropagation();
    onVote?.(question.id, voteType);
  };

  return (
    <Card 
      ref={cardRef}
      className={cn(
        "transition-all duration-200 cursor-pointer border-l-4 border-l-transparent active:scale-[0.98]",
        isPressed && "shadow-lg border-l-green-500",
        swipeOffset > 20 && "border-l-green-500 bg-green-50",
        swipeOffset < -20 && "border-l-red-500 bg-red-50",
        isOffline && "opacity-75",
        className
      )}
      style={{
        transform: `translateX(${swipeOffset * 0.3}px)`,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-gray-900 line-clamp-2 mb-2">
              {question.title}
            </h3>
            
            {/* User info - compact for mobile */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Avatar className="h-5 w-5">
                {question.user_avatar_url && (
                  <AvatarImage src={question.user_avatar_url} alt={question.user_display_name} />
                )}
                <AvatarFallback className="text-xs bg-green-100 text-green-700">
                  {question.user_display_name?.charAt(0).toUpperCase() || question.user_id.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <span className="truncate max-w-20">
                {question.user_display_name || `User ${question.user_id.substring(0, 6)}`}
              </span>
              
              {/* Reputation Badge - Temporarily disabled */}
              {/* Will be re-enabled once user_reputation relationships are fixed */}
              
              <div className="flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                <span>{formatTimeAgo(question.created_at)}</span>
              </div>
            </div>
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center gap-2 shrink-0">
            {isOffline && <WifiOff className="h-4 w-4 text-gray-400" />}
            <div className={`w-2 h-2 rounded-full ${getStatusColor(question.status)}`} />
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Content preview */}
        <p className="text-sm text-gray-700 line-clamp-2 mb-3">
          {question.content}
        </p>

        {/* Tags - show only first 2 on mobile */}
        {question.tags.length > 0 && (
          <div className="flex gap-1 mb-3 overflow-hidden">
            {question.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                {tag}
              </Badge>
            ))}
            {question.tags.length > 2 && (
              <Badge variant="outline" className="text-xs px-2 py-0 text-gray-500">
                +{question.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* AI Answer indicator */}
        {question.ai_preliminary_answer && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">AI Answer Available</span>
              {question.ai_confidence_score && (
                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">
                  {Math.round(question.ai_confidence_score * 100)}%
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Stats and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Vote score */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 hover:bg-green-50"
              onClick={(e) => handleVoteClick(e, 'up')}
            >
              <ThumbsUp className="h-3 w-3 mr-1" />
              <span className="text-sm">{question.vote_score}</span>
            </Button>
            
            {/* Answer count */}
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MessageCircle className="h-3 w-3" />
              <span>{question.answer_count}</span>
            </div>
            
            {/* View count */}
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Eye className="h-3 w-3" />
              <span>{question.view_count}</span>
            </div>
          </div>

          {/* Category */}
          {question.category && (
            <Badge variant="secondary" className="text-xs bg-green-50 text-green-700">
              {question.category.name.split(' ')[0]} {/* Show first word only */}
            </Badge>
          )}
        </div>

        {/* Swipe hint */}
        {Math.abs(swipeOffset) > 10 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10 rounded-lg">
            <div className={cn(
              "px-3 py-1 rounded-full text-white text-sm font-medium",
              swipeOffset > 0 ? "bg-green-500" : "bg-red-500"
            )}>
              {swipeOffset > 0 ? "👍 Upvote" : "👎 Downvote"}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};