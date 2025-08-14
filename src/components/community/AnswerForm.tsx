/**
 * 🌾 CROPGENIUS – ANSWER FORM COMPONENT v1.0
 * -------------------------------------------------------------
 * BULLETPROOF Answer Creation Form
 * - Rich text answer composition
 * - Image upload support
 * - Real-time character counting
 * - Form validation and error handling
 * - Mobile-optimized interface
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Loader2, 
  Upload,
  X,
  AlertCircle,
  MessageCircle,
  Image as ImageIcon
} from 'lucide-react';
import { communityService } from '@/services/CommunityService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AnswerFormProps {
  questionId: string;
  onSubmit?: (answerId: string) => void;
  onCancel?: () => void;
  className?: string;
  placeholder?: string;
}

export const AnswerForm: React.FC<AnswerFormProps> = ({
  questionId,
  onSubmit,
  onCancel,
  className = "",
  placeholder = "Share your farming knowledge and help fellow farmers..."
}) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const MIN_CONTENT_LENGTH = 20;
  const MAX_CONTENT_LENGTH = 2000;
  const MAX_IMAGES = 3;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!content.trim()) {
      newErrors.content = 'Answer content is required';
    } else if (content.trim().length < MIN_CONTENT_LENGTH) {
      newErrors.content = `Answer must be at least ${MIN_CONTENT_LENGTH} characters`;
    } else if (content.length > MAX_CONTENT_LENGTH) {
      newErrors.content = `Answer must be less than ${MAX_CONTENT_LENGTH} characters`;
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
    
    const answer = await communityService.createAnswer({
      question_id: questionId,
      content: content.trim(),
      images: images
    });

    if (answer) {
      // Reset form
      setContent('');
      setImages([]);
      setErrors({});
      
      onSubmit?.(answer.id);
    }
    
    setIsSubmitting(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > MAX_IMAGES) {
      return;
    }

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setImages(prev => [...prev, imageUrl]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const getCharacterCountColor = (): string => {
    const length = content.length;
    if (length < MIN_CONTENT_LENGTH) return 'text-red-500';
    if (length > MAX_CONTENT_LENGTH * 0.9) return 'text-amber-500';
    return 'text-gray-500';
  };

  const isFormValid = content.trim().length >= MIN_CONTENT_LENGTH && 
                     content.length <= MAX_CONTENT_LENGTH;

  return (
    <Card className={cn("border-green-200", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-green-700 flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Share Your Answer
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Answer Content */}
          <div className="space-y-2">
            <Label htmlFor="answer-content" className="text-sm font-medium">
              Your Answer *
            </Label>
            <Textarea
              id="answer-content"
              placeholder={placeholder}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={cn(
                "min-h-[120px] resize-none",
                errors.content ? 'border-red-500' : ''
              )}
              maxLength={MAX_CONTENT_LENGTH}
            />
            
            {/* Character Count */}
            <div className="flex justify-between items-center text-xs">
              <div>
                {errors.content && (
                  <span className="text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.content}
                  </span>
                )}
              </div>
              <span className={getCharacterCountColor()}>
                {content.length}/{MAX_CONTENT_LENGTH}
                {content.length < MIN_CONTENT_LENGTH && (
                  <span className="ml-1">
                    (min {MIN_CONTENT_LENGTH})
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Images (Optional)
            </Label>
            
            {images.length < MAX_IMAGES && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="relative overflow-hidden"
                  disabled={isSubmitting}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </Button>
                <span className="text-xs text-gray-500">
                  {images.length}/{MAX_IMAGES} images
                </span>
              </div>
            )}

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isSubmitting || !isFormValid}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting Answer...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Post Answer
                </>
              )}
            </Button>
          </div>

          {/* Helpful Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <MessageCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Tips for a great answer:</p>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  <li>Be specific and provide actionable advice</li>
                  <li>Share your experience and what worked for you</li>
                  <li>Include relevant details about timing, quantities, or methods</li>
                  <li>Consider local conditions and farming practices</li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};