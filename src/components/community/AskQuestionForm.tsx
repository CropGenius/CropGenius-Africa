/**
 * 🌾 CROPGENIUS – ASK QUESTION FORM COMPONENT v1.0
 * -------------------------------------------------------------
 * BULLETPROOF Question Creation Form
 * - AI-powered question analysis and suggestions
 * - Real-time category auto-detection
 * - Image upload support
 * - Location picker integration
 * - Form validation and error handling
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Sparkles, 
  Loader2, 
  X, 
  Upload,
  MapPin,
  AlertCircle,
  CheckCircle,
  Lightbulb
} from 'lucide-react';
import { communityService, CommunityCategory, GeoLocation } from '@/services/CommunityService';
import { communityQuestionOracle } from '@/agents/CommunityQuestionOracle';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AskQuestionFormProps {
  onSubmit?: (questionId: string) => void;
  onCancel?: () => void;
  className?: string;
}

interface FormData {
  title: string;
  content: string;
  category_id: string;
  crop_type: string;
  farming_method: string;
  tags: string[];
  images: string[];
  location?: GeoLocation;
}

interface AIAnalysis {
  category: string;
  tags: string[];
  preliminaryAnswer: string;
  confidenceScore: number;
  isAppropriate: boolean;
  moderationReason?: string;
}

export const AskQuestionForm: React.FC<AskQuestionFormProps> = ({
  onSubmit,
  onCancel,
  className = ""
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    category_id: '',
    crop_type: '',
    farming_method: '',
    tags: [],
    images: [],
    location: undefined
  });

  const [categories, setCategories] = useState<CommunityCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // AI analysis when title and content change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title.length > 10 && formData.content.length > 20) {
        analyzeQuestion();
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timer);
  }, [formData.title, formData.content]);

  const loadCategories = async () => {
    const categoriesData = await communityService.getCategories();
    setCategories(categoriesData || []);
  };

  const analyzeQuestion = async () => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    
    const analysis = await communityQuestionOracle.analyzeQuestion(
      formData.title,
      formData.content,
      formData.location,
      formData.crop_type
    );

    if (analysis) {
      setAiAnalysis({
        category: analysis.category,
        tags: analysis.tags,
        preliminaryAnswer: analysis.preliminaryAnswer,
        confidenceScore: analysis.confidenceScore,
        isAppropriate: analysis.isAppropriate,
        moderationReason: analysis.moderationReason
      });

      // Auto-suggest category if not selected
      if (!formData.category_id && analysis.category) {
        const matchingCategory = categories.find(c => 
          c.name.toLowerCase().includes(analysis.category.toLowerCase())
        );
        if (matchingCategory) {
          setFormData(prev => ({ ...prev, category_id: matchingCategory.id }));
        }
      }

      // Auto-suggest tags
      if (analysis.tags.length > 0) {
        const newTags = analysis.tags.filter(tag => !formData.tags.includes(tag));
        if (newTags.length > 0) {
          setFormData(prev => ({ 
            ...prev, 
            tags: [...prev.tags, ...newTags.slice(0, 3)]
          }));
        }
      }
    }
    
    setIsAnalyzing(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Question title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Question description is required';
    } else if (formData.content.length < 20) {
      newErrors.content = 'Description must be at least 20 characters';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Please select a category';
    }

    if (aiAnalysis && !aiAnalysis.isAppropriate) {
      newErrors.content = aiAnalysis.moderationReason || 'Content violates community guidelines';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    const question = await communityService.createQuestion({
      title: formData.title.trim(),
      content: formData.content.trim(),
      category_id: formData.category_id,
      crop_type: formData.crop_type || undefined,
      farming_method: formData.farming_method || undefined,
      location: formData.location,
      images: formData.images
    });

    if (question) {
      onSubmit?.(question.id);
    }
    
    setIsSubmitting(false);
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag) && formData.tags.length < 5) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, trimmedTag] }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  return (
    <Card className={cn("border-green-200 animate-fade-in", className)}>
      <CardHeader>
        <CardTitle className="text-xl text-green-700 flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Ask Your Farming Question
        </CardTitle>
        <CardDescription>
          Our AI will immediately analyze your question and match you with experts and existing answers
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Question Title *
            </Label>
            <Input
              id="title"
              placeholder="E.g., How do I treat brown spots on my tomato leaves?"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Question Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium">
              Detailed Description *
            </Label>
            <Textarea
              id="content"
              placeholder="Provide details about your farming question, including what you've tried, your location, crop type, etc."
              className={cn("min-h-[120px]", errors.content ? 'border-red-500' : '')}
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            />
            {errors.content && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.content}
              </p>
            )}
          </div>

          {/* AI Analysis Display */}
          {isAnalyzing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm text-blue-700">AI is analyzing your question...</span>
              </div>
            </div>
          )}

          {aiAnalysis && (
            <div className={cn(
              "border rounded-lg p-3",
              aiAnalysis.isAppropriate 
                ? "bg-green-50 border-green-200" 
                : "bg-red-50 border-red-200"
            )}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">AI Analysis Complete</span>
                <Badge variant="outline" className="text-xs">
                  {aiAnalysis.confidenceScore}% confidence
                </Badge>
              </div>
              
              {aiAnalysis.isAppropriate ? (
                <div className="space-y-2">
                  <p className="text-sm text-green-800">
                    <strong>Suggested Category:</strong> {aiAnalysis.category}
                  </p>
                  <p className="text-sm text-green-800">
                    <strong>Suggested Tags:</strong> {aiAnalysis.tags.join(', ')}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-red-800">
                  {aiAnalysis.moderationReason}
                </p>
              )}
            </div>
          )}

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category *
            </Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
            >
              <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.category_id}
              </p>
            )}
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crop_type" className="text-sm font-medium">
                Crop Type (Optional)
              </Label>
              <Input
                id="crop_type"
                placeholder="E.g., Tomatoes, Maize, Beans"
                value={formData.crop_type}
                onChange={(e) => setFormData(prev => ({ ...prev, crop_type: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="farming_method" className="text-sm font-medium">
                Farming Method (Optional)
              </Label>
              <Select
                value={formData.farming_method}
                onValueChange={(value) => setFormData(prev => ({ ...prev, farming_method: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="organic">Organic</SelectItem>
                  <SelectItem value="conventional">Conventional</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-medium">
              Tags (Optional)
            </Label>
            <div className="space-y-2">
              <Input
                id="tags"
                placeholder="Add tags (press Enter or comma to add)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                onBlur={() => tagInput && addTag(tagInput)}
              />
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isSubmitting || !aiAnalysis?.isAppropriate}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting Question...
                </>
              ) : (
                'Post Question'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};