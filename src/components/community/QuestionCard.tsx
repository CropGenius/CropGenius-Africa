/**
 * 🌾 CROPGENIUS – QUESTION CARD COMPONENT v1.0
 * -------------------------------------------------------------
 * BULLETPROOF Question Display Component
 * - Follows exact shadcn/ui design patterns
 * - AI preliminary answer display
 * - Real-time voting and statistics
 * - Mobile-optimized touch interface
 * - Reputation badges and user info
 */

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  ThumbsUp, 
  MessageCircle, 
  Eye, 
  Clock,
  CheckCircle,
  Sparkles,
  MapPin
} from 'lucide-react';
import { CommunityQuestion } from '@/services/CommunityService';
// Simple date formatting utility
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

interface QuestionCardProps {
  question: CommunityQuestion;
  onClick?: () => void;
  showFullContent?: boolean;
  onVote?: (questionId: string, voteType: 'up' | 'down') => void;
  className?: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  onClick, 
  showFullContent = false,
  onVote,
  className = ""
}) => {
  
  const truncateContent = (content: string, maxLength: number = 150): string => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'answered': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getBadgeLevel = (level: string): string => {
    switch (level) {
      case 'guru': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'master': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'expert': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleVote = (e: React.MouseEvent, voteType: 'up' | 'down') => {
    e.stopPropagation();
    onVote?.(question.id, voteType);
  };

  const handleCardClick = () => {
    onClick?.();
  };

  return (
    <Card 
      className={`hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 border-l-transparent hover:border-l-green-500 ${className}`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
              {question.title}
            </h3>
            
            {/* User Info */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Avatar className="h-6 w-6">
                {question.user_avatar_url && (
                  <AvatarImage src={question.user_avatar_url} alt={question.user_display_name} />
                )}
                <AvatarFallback className="text-xs bg-green-100 text-green-700">
                  {question.user_display_name?.charAt(0).toUpperCase() || question.user_id.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <span className="font-medium">
                {question.user_display_name || `User ${question.user_id.substring(0, 8)}`}
              </span>
              
              {/* Reputation Badge - Temporarily disabled */}
              {/* Will be re-enabled once user_reputation relationships are fixed */}
              
              <span className="text-gray-400">•</span>
              
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatTimeAgo(question.created_at)}</span>
              </div>
            </div>
          </div>
          
          {/* Status Badge */}
          <Badge className={`${getStatusColor(question.status)} shrink-0`}>
            {question.status === 'answered' && <CheckCircle className="h-3 w-3 mr-1" />}
            {question.status.charAt(0).toUpperCase() + question.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Question Content */}
        <p className="text-gray-700 mb-3 leading-relaxed">
          {showFullContent ? question.content : truncateContent(question.content)}
        </p>
        
        {/* Category and Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {question.category && (
            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
              {question.category.name}
            </Badge>
          )}
          
          {question.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          
          {question.tags.length > 3 && (
            <Badge variant="outline" className="text-xs text-gray-500">
              +{question.tags.length - 3} more
            </Badge>
          )}
        </div>

        {/* Location */}
        {question.location && (
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
            <MapPin className="h-3 w-3" />
            <span>{question.location.region || 'Location provided'}</span>
          </div>
        )}

        {/* AI Preliminary Answer */}
        {question.ai_preliminary_answer && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
              <span className="text-xs font-medium text-blue-700">AI Preliminary Answer</span>
              {question.ai_confidence_score && (
                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                  {Math.round(question.ai_confidence_score * 100)}% confidence
                </Badge>
              )}
            </div>
            <p className="text-sm text-blue-800 leading-relaxed">
              {showFullContent 
                ? question.ai_preliminary_answer 
                : truncateContent(question.ai_preliminary_answer, 120)
              }
            </p>
          </div>
        )}

        {/* Stats and Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4">
            {/* Vote Score */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 hover:bg-green-50 hover:text-green-700"
                onClick={(e) => handleVote(e, 'up')}
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium text-gray-700 min-w-[20px] text-center">
                {question.vote_score}
              </span>
            </div>
            
            {/* Answer Count */}
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MessageCircle className="h-4 w-4" />
              <span>{question.answer_count}</span>
            </div>
            
            {/* View Count */}
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Eye className="h-4 w-4" />
              <span>{question.view_count}</span>
            </div>
          </div>

          {/* Crop Type */}
          {question.crop_type && (
            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
              {question.crop_type}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};