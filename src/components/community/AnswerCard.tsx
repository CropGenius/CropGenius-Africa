/**
 * 🌾 CROPGENIUS – ANSWER CARD COMPONENT v1.0
 * -------------------------------------------------------------
 * BULLETPROOF Answer Display Component
 * - Expert answer display with reputation
 * - Voting interface integration
 * - Answer acceptance functionality
 * - AI-generated answer indicators
 * - Mobile-optimized layout
 */

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  CheckCircle, 
  Clock,
  Sparkles,
  Award,
  Shield
} from 'lucide-react';
import { CommunityAnswer } from '@/services/CommunityService';
import { VotingButtons } from './VotingButtons';
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
import { cn } from '@/lib/utils';

interface AnswerCardProps {
  answer: CommunityAnswer;
  onVote?: (answerId: string, voteType: 'up' | 'down') => void;
  onAccept?: (answerId: string) => void;
  canAccept?: boolean;
  className?: string;
}

export const AnswerCard: React.FC<AnswerCardProps> = ({
  answer,
  onVote,
  onAccept,
  canAccept = false,
  className = ""
}) => {

  const getBadgeLevel = (level: string): string => {
    switch (level) {
      case 'guru': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'master': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'expert': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleVoteChange = (newScore: number) => {
    // This will be handled by the parent component through real-time updates
    console.log(`Answer ${answer.id} new score: ${newScore}`);
  };

  const handleAccept = () => {
    onAccept?.(answer.id);
  };

  return (
    <Card 
      className={cn(
        "transition-all duration-200",
        answer.is_accepted && "border-green-500 bg-green-50 shadow-md",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            {/* User Avatar */}
            <Avatar className="h-10 w-10 shrink-0">
              {answer.user_avatar_url && (
                <AvatarImage src={answer.user_avatar_url} alt={answer.user_display_name} />
              )}
              <AvatarFallback className="bg-green-100 text-green-700 font-medium">
                {answer.user_display_name?.charAt(0).toUpperCase() || answer.user_id.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900">
                  {answer.user_display_name || `User ${answer.user_id.substring(0, 8)}`}
                </h4>
                
                {/* Reputation Badge - Temporarily disabled */}
                {/* Will be re-enabled once user_reputation relationships are fixed */}

                {answer.is_ai_generated && (
                  <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Generated
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                {/* User reputation points - Temporarily disabled */}
                
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimeAgo(answer.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Accepted Answer Badge */}
          {answer.is_accepted && (
            <Badge className="bg-green-600 text-white border-green-600 shrink-0">
              <CheckCircle className="h-3 w-3 mr-1" />
              Accepted Answer
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex gap-4">
          {/* Voting Buttons */}
          <div className="shrink-0">
            <VotingButtons
              targetId={answer.id}
              targetType="answer"
              currentScore={answer.vote_score}
              onVoteChange={handleVoteChange}
              size="sm"
            />
          </div>

          {/* Answer Content */}
          <div className="flex-1 min-w-0">
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {answer.content}
              </p>
            </div>

            {/* Answer Images */}
            {answer.images && answer.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                {answer.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Answer image ${index + 1}`}
                    className="rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                    onClick={() => {
                      // TODO: Implement image modal/lightbox
                      window.open(image, '_blank');
                    }}
                  />
                ))}
              </div>
            )}

            {/* Accept Answer Button */}
            {canAccept && !answer.is_accepted && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAccept}
                  className="text-green-700 border-green-300 hover:bg-green-50 hover:border-green-400"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept as Best Answer
                </Button>
              </div>
            )}

            {/* AI Generated Answer Info */}
            {answer.is_ai_generated && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">AI-Generated Answer</p>
                    <p className="text-xs">
                      This answer was generated by our AI system based on agricultural knowledge. 
                      Please verify with local experts and consider your specific conditions.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Expert Verification - Temporarily disabled */}
            {false ? (
              <div className="mt-3 flex items-center gap-2 text-sm text-green-700">
                <Shield className="h-4 w-4" />
                <span>Verified by agricultural expert</span>
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};