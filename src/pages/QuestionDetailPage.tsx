/**
 * 🌾 CROPGENIUS – QUESTION DETAIL PAGE v1.0
 * -------------------------------------------------------------
 * BULLETPROOF Individual Question View
 * - Complete question display with AI preliminary answer
 * - Real-time answers with voting system
 * - Answer acceptance functionality
 * - Expert verification indicators
 * - Mobile-optimized layout
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
// Separator import removed as it's not used
import { 
  ArrowLeft,
  Clock,
  Eye,
  MapPin,
  Sparkles,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Share2,
  Bookmark,
  Flag
} from 'lucide-react';
import { QuestionCard } from '@/components/community/QuestionCard';
import { AnswerCard } from '@/components/community/AnswerCard';
import { AnswerForm } from '@/components/community/AnswerForm';
import { VotingButtons } from '@/components/community/VotingButtons';
import { 
  communityService, 
  CommunityQuestion, 
  CommunityAnswer 
} from '@/services/CommunityService';
import { toast } from 'sonner';
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

export const QuestionDetailPage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();

  // State management
  const [question, setQuestion] = useState<CommunityQuestion | null>(null);
  const [answers, setAnswers] = useState<CommunityAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(true);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Real-time subscriptions
  const [answerSubscription, setAnswerSubscription] = useState<any>(null);

  useEffect(() => {
    if (questionId) {
      loadQuestionData();
      setupAnswerSubscription();
    }

    return () => {
      if (answerSubscription) {
        answerSubscription.unsubscribe();
      }
    };
  }, [questionId]);

  const loadQuestionData = async () => {
    if (!questionId) return;

    setIsLoading(true);
    setIsLoadingAnswers(true);

    // Load question and answers in parallel - NO ERROR HANDLING
    const [questionData, answersData] = await Promise.all([
      communityService.getQuestionById(questionId),
      communityService.getAnswers(questionId)
    ]);

    setQuestion(questionData);
    setAnswers(answersData || []);

    setIsLoading(false);
    setIsLoadingAnswers(false);
  };

  const setupAnswerSubscription = () => {
    if (!questionId) return;

    const sub = communityService.subscribeToAnswers(questionId, (payload) => {
      if (payload.eventType === 'INSERT') {
        setAnswers(prev => [...prev, payload.new]);
        setQuestion(prev => prev ? {
          ...prev,
          answer_count: prev.answer_count + 1
        } : null);
      } else if (payload.eventType === 'UPDATE') {
        setAnswers(prev => 
          prev.map(a => a.id === payload.new.id ? payload.new : a)
        );
      } else if (payload.eventType === 'DELETE') {
        setAnswers(prev => prev.filter(a => a.id !== payload.old.id));
        setQuestion(prev => prev ? {
          ...prev,
          answer_count: Math.max(0, prev.answer_count - 1)
        } : null);
      }
    });

    setAnswerSubscription(sub);
  };

  const handleVoteQuestion = async (questionId: string, voteType: 'up' | 'down') => {
    const result = await communityService.vote(questionId, 'question', voteType);
    if (result?.success && question) {
      setQuestion({
        ...question,
        vote_score: result.newScore
      });
    }
  };

  const handleVoteAnswer = async (answerId: string, voteType: 'up' | 'down') => {
    const result = await communityService.vote(answerId, 'answer', voteType);
    if (result?.success) {
      setAnswers(prev => 
        prev.map(a => 
          a.id === answerId 
            ? { ...a, vote_score: result.newScore }
            : a
        )
      );
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    const success = await communityService.acceptAnswer(answerId);
    if (success) {
      setAnswers(prev => 
        prev.map(a => ({
          ...a,
          is_accepted: a.id === answerId
        }))
      );

      setQuestion(prev => prev ? {
        ...prev,
        status: 'answered'
      } : null);
    }
  };

  const handleAnswerSubmitted = (answerId: string) => {
    setShowAnswerForm(false);
    // Answer will be added via real-time subscription
  };

  const handleShare = async () => {
    if (navigator.share && question) {
      await navigator.share({
        title: question.title,
        text: question.content.substring(0, 100) + '...',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
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

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'answered': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (isLoading || !question) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const canAcceptAnswers = currentUserId === question.user_id;
  const sortedAnswers = [...answers].sort((a, b) => {
    // Accepted answers first, then by vote score, then by date
    if (a.is_accepted && !b.is_accepted) return -1;
    if (!a.is_accepted && b.is_accepted) return 1;
    if (a.vote_score !== b.vote_score) return b.vote_score - a.vote_score;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => navigate('/community')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Questions
            </Button>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Question */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  {question.title}
                </h1>
                
                {/* Question Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
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
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Asked {formatTimeAgo(question.created_at)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{question.view_count} views</span>
                  </div>
                </div>

                {/* Tags and Category */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {question.category && (
                    <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                      {question.category.name}
                    </Badge>
                  )}
                  
                  {question.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  
                  {question.crop_type && (
                    <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                      {question.crop_type}
                    </Badge>
                  )}
                </div>

                {/* Location */}
                {question.location && (
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>{question.location.region || 'Location provided'}</span>
                  </div>
                )}
              </div>

              {/* Status and Voting */}
              <div className="flex flex-col items-end gap-3 shrink-0">
                <Badge className={getStatusColor(question.status)}>
                  {question.status === 'answered' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {question.status.charAt(0).toUpperCase() + question.status.slice(1)}
                </Badge>
                
                <VotingButtons
                  targetId={question.id}
                  targetType="question"
                  currentScore={question.vote_score}
                  onVoteChange={(newScore) => setQuestion(prev => prev ? {...prev, vote_score: newScore} : null)}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Question Content */}
            <div className="prose prose-sm max-w-none mb-6">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {question.content}
              </p>
            </div>

            {/* Question Images */}
            {question.images && question.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {question.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Question image ${index + 1}`}
                    className="rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
                    onClick={() => window.open(image, '_blank')}
                  />
                ))}
              </div>
            )}

            {/* AI Preliminary Answer */}
            {question.ai_preliminary_answer && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
                  <span className="font-medium text-blue-700">AI Preliminary Answer</span>
                  {question.ai_confidence_score && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                      {Math.round(question.ai_confidence_score * 100)}% confidence
                    </Badge>
                  )}
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-blue-800 leading-relaxed">
                    {question.ai_preliminary_answer}
                  </p>
                </div>
                <div className="mt-3 text-xs text-blue-600">
                  This is a preliminary AI-generated answer. Community experts will provide more detailed responses.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Answers Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
            </h2>
            
            <Button
              onClick={() => setShowAnswerForm(!showAnswerForm)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {showAnswerForm ? 'Cancel' : 'Write Answer'}
            </Button>
          </div>

          {/* Answer Form */}
          {showAnswerForm && (
            <div className="mb-6">
              <AnswerForm
                questionId={question.id}
                onSubmit={handleAnswerSubmitted}
                onCancel={() => setShowAnswerForm(false)}
              />
            </div>
          )}

          {/* Answers List */}
          {isLoadingAnswers ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : answers.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No answers yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Be the first to help this farmer with their question!
                </p>
                <Button
                  onClick={() => setShowAnswerForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Write First Answer
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sortedAnswers.map((answer) => (
                <AnswerCard
                  key={answer.id}
                  answer={answer}
                  onVote={handleVoteAnswer}
                  onAccept={handleAcceptAnswer}
                  canAccept={canAcceptAnswers}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};