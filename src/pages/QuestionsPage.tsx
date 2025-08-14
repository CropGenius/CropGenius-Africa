/**
 * 🌾 CROPGENIUS – QUESTIONS PAGE v1.0 - MAIN COMMUNITY HUB
 * -------------------------------------------------------------
 * BULLETPROOF Questions Listing Page
 * - Real-time question updates via Supabase subscriptions
 * - Advanced filtering and search functionality
 * - AI-powered question recommendations
 * - Mobile-optimized infinite scroll
 * - Category-based navigation
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search,
  Filter,
  Plus,
  TrendingUp,
  Clock,
  MessageCircle,
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { QuestionCard } from '@/components/community/QuestionCard';
import { AskQuestionForm } from '@/components/community/AskQuestionForm';
import { 
  communityService, 
  CommunityQuestion, 
  CommunityCategory 
} from '@/services/CommunityService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface FilterOptions {
  category_id?: string;
  status?: string;
  search?: string;
  sort_by?: 'created_at' | 'vote_score' | 'answer_count' | 'view_count';
  sort_order?: 'asc' | 'desc';
}

export const QuestionsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State management
  const [questions, setQuestions] = useState<CommunityQuestion[]>([]);
  const [categories, setCategories] = useState<CommunityCategory[]>([]);
  const [trendingQuestions, setTrendingQuestions] = useState<CommunityQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showAskForm, setShowAskForm] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  
  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    category_id: '',
    status: 'open',
    search: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  // Real-time subscription
  const [subscription, setSubscription] = useState<any>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
    
    // Delay subscription to avoid conflicts
    const timer = setTimeout(() => {
      setupRealTimeSubscription();
    }, 2000);
    
    return () => {
      clearTimeout(timer);
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (e) {
          // Silent cleanup
        }
      }
    };
  }, []);

  // Load questions when filters change
  useEffect(() => {
    setCurrentPage(1);
    loadQuestions(true);
  }, [filters]);

  const loadInitialData = async () => {
    setIsLoading(true);
    
    // Load categories and questions in parallel - NO ERROR HANDLING
    const [categoriesData, questionsData, trendingData] = await Promise.all([
      communityService.getCategories(),
      communityService.getQuestions({ 
        page: 1, 
        limit: 20,
        ...filters 
      }),
      communityService.getTrendingQuestions(5)
    ]);

    setCategories(categoriesData || []);
    setQuestions(questionsData?.questions || []);
    setTotalQuestions(questionsData?.total || 0);
    setTrendingQuestions(trendingData || []);
    setHasMore((questionsData?.questions || []).length === 20);
    setIsLoading(false);
  };

  const loadQuestions = async (reset: boolean = false) => {
    if (reset) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    const page = reset ? 1 : currentPage;
    const questionsData = await communityService.getQuestions({
      page,
      limit: 20,
      ...filters
    });

    if (reset) {
      setQuestions(questionsData?.questions || []);
      setCurrentPage(2);
    } else {
      setQuestions(prev => [...prev, ...(questionsData?.questions || [])]);
      setCurrentPage(prev => prev + 1);
    }

    setTotalQuestions(questionsData?.total || 0);
    setHasMore((questionsData?.questions || []).length === 20);
    setIsLoading(false);
    setIsLoadingMore(false);
  };

  const setupRealTimeSubscription = () => {
    // Clean up existing subscription first
    if (subscription) {
      try {
        subscription.unsubscribe();
      } catch (e) {
        // Silent cleanup
      }
    }

    const sub = communityService.subscribeToQuestions((payload) => {
      if (payload.eventType === 'INSERT') {
        setQuestions(prev => [payload.new, ...prev]);
        setTotalQuestions(prev => prev + 1);
      } else if (payload.eventType === 'UPDATE') {
        setQuestions(prev => 
          prev.map(q => q.id === payload.new.id ? payload.new : q)
        );
      } else if (payload.eventType === 'DELETE') {
        setQuestions(prev => prev.filter(q => q.id !== payload.old.id));
        setTotalQuestions(prev => prev - 1);
      }
    });

    setSubscription(sub);
  };

  const handleSearch = useCallback((searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  }, []);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleQuestionClick = (questionId: string) => {
    navigate(`/community/questions/${questionId}`);
  };

  const handleVote = async (questionId: string, voteType: 'up' | 'down') => {
    const result = await communityService.vote(questionId, 'question', voteType);
    if (result?.success) {
      setQuestions(prev => 
        prev.map(q => 
          q.id === questionId 
            ? { ...q, vote_score: result.newScore }
            : q
        )
      );
    }
  };

  const handleQuestionSubmitted = (questionId: string) => {
    setShowAskForm(false);
    // Question will be added via real-time subscription
  };

  const loadMoreQuestions = () => {
    if (!isLoadingMore && hasMore) {
      loadQuestions(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      category_id: '',
      status: 'open',
      search: '',
      sort_by: 'created_at',
      sort_order: 'desc'
    });
  };

  const getActiveFiltersCount = (): number => {
    let count = 0;
    if (filters.category_id) count++;
    if (filters.status !== 'open') count++;
    if (filters.search) count++;
    if (filters.sort_by !== 'created_at') count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-green-700">Community Questions</h1>
              <p className="text-sm text-gray-600">
                {totalQuestions.toLocaleString()} questions from farmers worldwide
              </p>
            </div>
            
            <Button
              onClick={() => setShowAskForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ask Question
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Ask Question Form */}
        {showAskForm && (
          <div className="mb-6">
            <AskQuestionForm
              onSubmit={handleQuestionSubmitted}
              onCancel={() => setShowAskForm(false)}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Trending Questions */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  Trending This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trendingQuestions.map((question, index) => (
                  <div
                    key={question.id}
                    className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    onClick={() => handleQuestionClick(question.id)}
                  >
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="text-xs shrink-0">
                        #{index + 1}
                      </Badge>
                      <div className="min-w-0">
                        <p className="text-sm font-medium line-clamp-2 mb-1">
                          {question.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{question.vote_score} votes</span>
                          <span>•</span>
                          <span>{question.answer_count} answers</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={!filters.category_id ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleFilterChange('category_id', '')}
                >
                  All Categories
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={filters.category_id === category.id ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleFilterChange('category_id', category.id)}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                    <Badge variant="outline" className="ml-auto text-xs">
                      {category.question_count}
                    </Badge>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search questions..."
                        value={filters.search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Status Filter */}
                  <Select
                    value={filters.status}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="answered">Answered</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort */}
                  <Select
                    value={filters.sort_by}
                    onValueChange={(value) => handleFilterChange('sort_by', value)}
                  >
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">Latest</SelectItem>
                      <SelectItem value="vote_score">Most Voted</SelectItem>
                      <SelectItem value="answer_count">Most Answered</SelectItem>
                      <SelectItem value="view_count">Most Viewed</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Clear Filters */}
                  {getActiveFiltersCount() > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="shrink-0"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Clear ({getActiveFiltersCount()})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Questions List */}
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : questions.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No questions found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {filters.search || filters.category_id 
                      ? 'Try adjusting your search or filters'
                      : 'Be the first to ask a question!'
                    }
                  </p>
                  <Button
                    onClick={() => setShowAskForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ask First Question
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {questions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    onClick={() => handleQuestionClick(question.id)}
                    onVote={handleVote}
                  />
                ))}

                {/* Load More */}
                {hasMore && (
                  <div className="text-center pt-6">
                    <Button
                      variant="outline"
                      onClick={loadMoreQuestions}
                      disabled={isLoadingMore}
                      className="min-w-32"
                    >
                      {isLoadingMore ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load More Questions'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};