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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  AlertCircle,
  BookOpen,
  Play,
  Award,
  Star,
  Users,
  Check
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

interface TrainingResource {
  id: number;
  title: string;
  description: string;
  category: string;
  type: 'course' | 'tutorial' | 'video' | 'article';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  author: string;
  authorType: 'expert' | 'organization' | 'ai';
  datePublished: string;
  thumbnail?: string;
  popularity: number;
  isFree: boolean;
  isAICertified: boolean;
  isRecommended?: boolean;
  progress?: number;
  tags: string[];
}

export const QuestionsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State management
  const [activeTab, setActiveTab] = useState('questions');
  const [questions, setQuestions] = useState<CommunityQuestion[]>([]);
  const [categories, setCategories] = useState<CommunityCategory[]>([]);
  const [trendingQuestions, setTrendingQuestions] = useState<CommunityQuestion[]>([]);
  const [trainingResources, setTrainingResources] = useState<TrainingResource[]>([]);
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
    
    // Load training resources
    setTrainingResources([
      {
        id: 1,
        title: "Organic Pest Management Master Course",
        description: "Comprehensive training on controlling pests without chemical pesticides. Learn natural solutions that protect crops and biodiversity.",
        category: "Pest Management",
        type: 'course',
        level: 'intermediate',
        duration: "4 hours",
        author: "International Organic Farming Institute",
        authorType: 'organization',
        datePublished: "2 months ago",
        thumbnail: "https://images.unsplash.com/photo-1632634415872-7d402cd7fa32",
        popularity: 1245,
        isFree: false,
        isAICertified: true,
        tags: ["Organic", "Pest Control", "Certification"]
      },
      {
        id: 2,
        title: "Soil Health Fundamentals",
        description: "Learn testing, maintaining, and improving your soil quality for maximum crop yields.",
        category: "Soil Management",
        type: 'tutorial',
        level: 'beginner',
        duration: "2 hours",
        author: "Dr. Fertility",
        authorType: 'expert',
        datePublished: "3 weeks ago",
        popularity: 856,
        isFree: true,
        isAICertified: true,
        isRecommended: true,
        progress: 65,
        tags: ["Soil", "Nutrients", "Testing"]
      },
      {
        id: 3,
        title: "Drip Irrigation Implementation",
        description: "Step-by-step guide to set up water-efficient irrigation systems for small farms.",
        category: "Water Management",
        type: 'video',
        level: 'intermediate',
        duration: "1.5 hours",
        author: "WaterWise Farming",
        authorType: 'organization',
        datePublished: "1 month ago",
        popularity: 723,
        isFree: true,
        isAICertified: true,
        tags: ["Irrigation", "Water Conservation", "Installation"]
      }
    ]);
    
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

  const enrollInTraining = (resourceId: number) => {
    setTrainingResources(trainingResources.map(r => 
      r.id === resourceId ? { ...r, progress: 10 } : r
    ));
    const resource = trainingResources.find(r => r.id === resourceId);
    toast.success(`Enrolled in "${resource?.title}"`, {
      description: "Start learning with expert-led content"
    });
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
              <h1 className="text-2xl font-bold text-green-700">Community Hub</h1>
              <p className="text-sm text-gray-600">
                {activeTab === 'questions' 
                  ? `${totalQuestions.toLocaleString()} questions from farmers worldwide`
                  : `${trainingResources.length} AI-certified learning resources`
                }
              </p>
            </div>
            
            {activeTab === 'questions' && (
              <Button
                onClick={() => setShowAskForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ask Question
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Questions
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Training
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questions">
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
            {/* Compact Search and Filter Bar */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {/* Top Row: Search and Category */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <Input
                        placeholder="Search questions..."
                        value={filters.search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>

                    {/* Category Filter */}
                    <div className="w-full sm:w-64">
                      <Select
                        value={filters.category_id}
                        onValueChange={(value) => handleFilterChange('category_id', value)}
                      >
                        <SelectTrigger className="w-full">
                          <Filter className="h-4 w-4 mr-2 text-gray-500" />
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border shadow-lg z-50">
                          <SelectItem value="">All Categories</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <span className="flex items-center gap-2">
                                <span>{category.icon}</span>
                                {category.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Bottom Row: Status and Sort filters */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Status Filter */}
                    <div className="flex-1">
                      <Select
                        value={filters.status}
                        onValueChange={(value) => handleFilterChange('status', value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border shadow-lg z-50">
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="answered">Answered</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sort */}
                    <div className="flex-1">
                      <Select
                        value={filters.sort_by}
                        onValueChange={(value) => handleFilterChange('sort_by', value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border shadow-lg z-50">
                          <SelectItem value="created_at">Latest</SelectItem>
                          <SelectItem value="vote_score">Most Voted</SelectItem>
                          <SelectItem value="answer_count">Most Answered</SelectItem>
                          <SelectItem value="view_count">Most Viewed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Clear Filters */}
                    {getActiveFiltersCount() > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="shrink-0"
                      >
                        Clear ({getActiveFiltersCount()})
                      </Button>
                    )}
                  </div>
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
      </TabsContent>

      {/* Training Tab */}
      <TabsContent value="training">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI-Certified Learning Resources</h2>
              <p className="text-sm text-gray-600">
                Expert-curated training modules to boost your farming expertise
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainingResources.map(resource => (
              <Card key={resource.id} className="group hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  {/* Resource Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {resource.type === 'course' && <BookOpen className="h-5 w-5 text-blue-600" />}
                      {resource.type === 'video' && <Play className="h-5 w-5 text-red-600" />}
                      {resource.type === 'tutorial' && <BookOpen className="h-5 w-5 text-green-600" />}
                      <Badge variant="outline" className="text-xs">
                        {resource.type}
                      </Badge>
                    </div>
                    {resource.isAICertified && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                        <Award className="h-3 w-3 mr-1" />
                        AI Certified
                      </Badge>
                    )}
                  </div>

                  {/* Resource Content */}
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {resource.description}
                  </p>

                  {/* Resource Meta */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Duration: {resource.duration}</span>
                      <span>Level: {resource.level}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">by {resource.author}</span>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span className="text-gray-500">{resource.popularity}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {resource.progress && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Progress</span>
                          <span className="text-green-600 font-medium">{resource.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${resource.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {resource.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs px-2 py-0.5">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {resource.isFree ? (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                          FREE
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Premium
                        </Badge>
                      )}
                      {resource.isRecommended && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    
                    {resource.progress ? (
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        Continue
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 text-xs"
                        onClick={() => enrollInTraining(resource.id)}
                      >
                        {resource.isFree ? 'Start Free' : 'Enroll'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </TabsContent>
    </Tabs>
      </div>
    </div>
  );
};