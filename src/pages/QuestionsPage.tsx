import React, { useState } from 'react';
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
  MessageCircle,
  BookOpen,
  Play,
  Award,
  Star,
  Users
} from 'lucide-react';

// Simple interface - no complexity cancer

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
  // SIMPLE STATE - NO CANCER
  const [activeTab, setActiveTab] = useState('questions');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [resources, setResources] = useState([
    {
      id: 1,
      title: "Organic Pest Management Master Course",
      description: "Comprehensive training on controlling pests without chemical pesticides.",
      category: "Pest Management",
      type: 'course' as const,
      level: 'intermediate' as const,
      duration: "4 hours",
      author: "International Organic Farming Institute",
      authorType: 'organization' as const,
      datePublished: "2 months ago",
      popularity: 1245,
      isFree: false,
      isAICertified: true,
      tags: ["Organic", "Pest Control", "Certification"]
    },
    {
      id: 2,
      title: "Soil Health Fundamentals",
      description: "Learn testing, maintaining, and improving your soil quality.",
      category: "Soil Management",
      type: 'tutorial' as const,
      level: 'beginner' as const,
      duration: "2 hours",
      author: "Dr. Fertility",
      authorType: 'expert' as const,
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
      description: "Step-by-step guide to set up water-efficient irrigation systems.",
      category: "Water Management",
      type: 'video' as const,
      level: 'intermediate' as const,
      duration: "1.5 hours",
      author: "WaterWise Farming",
      authorType: 'organization' as const,
      datePublished: "1 month ago",
      popularity: 723,
      isFree: true,
      isAICertified: true,
      tags: ["Irrigation", "Water Conservation", "Installation"]
    }
  ]);

  // Handle training enrollment
  const enrollInTraining = (resourceId: number) => {
    setResources(prevResources => {
      const updatedResources = prevResources.map(resource => 
        resource.id === resourceId 
          ? { ...resource, progress: resource.progress ? resource.progress : 10 } 
          : resource
      );
      return updatedResources;
    });
  };

  // STATIC MOCK DATA - NO LOADING COMPLEXITY
  const mockQuestions = [
    {
      id: '1',
      title: 'How to identify early signs of tomato blight?',
      content: 'My tomato plants are showing some strange spots...',
      user_id: 'user1',
      category_id: 'diseases',
      status: 'open' as const,
      vote_score: 15,
      answer_count: 3,
      view_count: 124,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: ['tomatoes', 'diseases', 'identification'],
      user_display_name: 'John Farmer'
    }
  ];

  const mockCategories = [
    { id: 'diseases', name: 'Plant Diseases', icon: '🦠', color: '#ef4444', question_count: 45 },
    { id: 'soil', name: 'Soil Management', icon: '🌱', color: '#10b981', question_count: 32 },
    { id: 'irrigation', name: 'Water & Irrigation', icon: '💧', color: '#3b82f6', question_count: 28 }
  ];

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
                  ? 'Questions from farmers worldwide'
                  : 'AI-certified learning resources'
                }
              </p>
            </div>
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
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Categories</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant={!selectedCategory ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory('')}
                    >
                      All Categories
                    </Button>
                    {mockCategories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(category.id)}
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
                {/* Search and Filter Bar */}
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <Input
                          placeholder="Search questions..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <div className="w-full sm:w-64">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="w-full">
                            <Filter className="h-4 w-4 mr-2 text-gray-500" />
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Categories</SelectItem>
                            {mockCategories.map((category) => (
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
                  </CardContent>
                </Card>

                {/* Simple Questions List */}
                <div className="space-y-4">
                  {mockQuestions.map((question) => (
                    <Card key={question.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{question.title}</h3>
                            <p className="text-gray-600 mb-4">{question.content}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>👤 {question.user_display_name}</span>
                              <span>⬆️ {question.vote_score}</span>
                              <span>💬 {question.answer_count}</span>
                              <span>👁️ {question.view_count}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">AI-Certified Learning Resources</h2>
                  <p className="text-sm text-gray-600">Expert training modules to boost your farming skills</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map(resource => (
                  <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {resource.type === 'course' && <BookOpen className="h-5 w-5 text-blue-600" />}
                          {resource.type === 'video' && <Play className="h-5 w-5 text-red-600" />}
                          {resource.type === 'tutorial' && <BookOpen className="h-5 w-5 text-green-600" />}
                          <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                        </div>
                        {resource.isAICertified && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                            <Award className="h-3 w-3 mr-1" />
                            AI Certified
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-2">{resource.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{resource.description}</p>

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

                        {resource.progress && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Progress</span>
                              <span className="text-green-600 font-medium">{resource.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${resource.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1">
                          {resource.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs px-2 py-0.5">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {resource.isFree ? (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">FREE</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Premium</Badge>
                          )}
                          {resource.isRecommended && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                        </div>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 text-xs"
                          onClick={() => enrollInTraining(resource.id)}
                        >
                          {resource.progress ? 'Continue' : (resource.isFree ? 'Start Free' : 'Enroll')}
                        </Button>
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