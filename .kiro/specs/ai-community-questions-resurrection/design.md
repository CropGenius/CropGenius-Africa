# AI Expert Community Questions Feature - Design Document

## Overview
This design resurrects the AI Expert Community Questions feature with bulletproof Supabase integration and Gemini 2.5 Flash AI power, following the same implementation pattern as the successful AI Crop Scanner feature.

## Architecture Overview
The system transforms the current mock Community page into Africa's largest AI-powered farming knowledge network with:
- **Complete Supabase database schema** with all tables, functions, and RLS policies
- **Gemini 2.5 Flash AI integration** following the CropDiseaseOracle pattern
- **Real-time features** with Supabase subscriptions
- **Mobile optimization** with offline support
- **Comprehensive gamification** with reputation and badges

## Database Design (Supabase)

### Core Tables Schema

#### community_categories
```sql
CREATE TABLE community_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  question_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### community_questions
```sql
CREATE TABLE community_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category_id UUID REFERENCES community_categories(id),
  tags TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  location JSONB, -- {lat, lng, region}
  crop_type TEXT,
  farming_method TEXT, -- organic, conventional, mixed
  status TEXT DEFAULT 'open', -- open, answered, closed
  view_count INTEGER DEFAULT 0,
  vote_score INTEGER DEFAULT 0,
  answer_count INTEGER DEFAULT 0,
  ai_preliminary_answer TEXT,
  ai_confidence_score FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### community_answers
```sql
CREATE TABLE community_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES community_questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  is_ai_generated BOOLEAN DEFAULT FALSE,
  is_accepted BOOLEAN DEFAULT FALSE,
  vote_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### community_votes
```sql
CREATE TABLE community_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_id UUID NOT NULL, -- question_id or answer_id
  target_type TEXT NOT NULL CHECK (target_type IN ('question', 'answer')),
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, target_id, target_type)
);
```

#### user_reputation
```sql
CREATE TABLE user_reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER DEFAULT 0,
  questions_asked INTEGER DEFAULT 0,
  answers_given INTEGER DEFAULT 0,
  best_answers INTEGER DEFAULT 0,
  helpful_votes INTEGER DEFAULT 0,
  expertise_areas TEXT[] DEFAULT '{}',
  badge_level TEXT DEFAULT 'novice' CHECK (badge_level IN ('novice', 'expert', 'master', 'guru')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Database Functions

#### Vote Score Calculation
```sql
CREATE OR REPLACE FUNCTION update_vote_score(target_id UUID, target_type TEXT)
RETURNS void AS $$
DECLARE
  up_votes INTEGER;
  down_votes INTEGER;
  final_score INTEGER;
BEGIN
  SELECT 
    COUNT(*) FILTER (WHERE vote_type = 'up'),
    COUNT(*) FILTER (WHERE vote_type = 'down')
  INTO up_votes, down_votes
  FROM community_votes 
  WHERE community_votes.target_id = update_vote_score.target_id 
    AND community_votes.target_type = update_vote_score.target_type;
  
  final_score := up_votes - down_votes;
  
  IF target_type = 'question' THEN
    UPDATE community_questions 
    SET vote_score = final_score, updated_at = NOW()
    WHERE id = target_id;
  ELSIF target_type = 'answer' THEN
    UPDATE community_answers 
    SET vote_score = final_score, updated_at = NOW()
    WHERE id = target_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Reputation Management
```sql
CREATE OR REPLACE FUNCTION update_user_reputation(user_id UUID, action TEXT)
RETURNS void AS $$
DECLARE
  points_to_add INTEGER := 0;
BEGIN
  CASE action
    WHEN 'question_asked' THEN points_to_add := 5;
    WHEN 'answer_given' THEN points_to_add := 10;
    WHEN 'best_answer' THEN points_to_add := 25;
    WHEN 'helpful_vote' THEN points_to_add := 2;
    ELSE points_to_add := 0;
  END CASE;
  
  INSERT INTO user_reputation (user_id, total_points, questions_asked, answers_given, best_answers, helpful_votes)
  VALUES (
    user_id, 
    points_to_add,
    CASE WHEN action = 'question_asked' THEN 1 ELSE 0 END,
    CASE WHEN action = 'answer_given' THEN 1 ELSE 0 END,
    CASE WHEN action = 'best_answer' THEN 1 ELSE 0 END,
    CASE WHEN action = 'helpful_vote' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = user_reputation.total_points + points_to_add,
    questions_asked = user_reputation.questions_asked + CASE WHEN action = 'question_asked' THEN 1 ELSE 0 END,
    answers_given = user_reputation.answers_given + CASE WHEN action = 'answer_given' THEN 1 ELSE 0 END,
    best_answers = user_reputation.best_answers + CASE WHEN action = 'best_answer' THEN 1 ELSE 0 END,
    helpful_votes = user_reputation.helpful_votes + CASE WHEN action = 'helpful_vote' THEN 1 ELSE 0 END,
    updated_at = NOW();
  
  -- Update badge level based on total points
  UPDATE user_reputation SET
    badge_level = CASE
      WHEN total_points >= 1000 THEN 'guru'
      WHEN total_points >= 500 THEN 'master'
      WHEN total_points >= 100 THEN 'expert'
      ELSE 'novice'
    END
  WHERE user_reputation.user_id = update_user_reputation.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Row Level Security (RLS) Policies
```sql
-- Enable RLS on all tables
ALTER TABLE community_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_categories ENABLE ROW LEVEL SECURITY;

-- Questions policies
CREATE POLICY "Questions are viewable by everyone" ON community_questions FOR SELECT USING (true);
CREATE POLICY "Users can insert their own questions" ON community_questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own questions" ON community_questions FOR UPDATE USING (auth.uid() = user_id);

-- Answers policies
CREATE POLICY "Answers are viewable by everyone" ON community_answers FOR SELECT USING (true);
CREATE POLICY "Users can manage their own answers" ON community_answers FOR ALL USING (auth.uid() = user_id);

-- Votes policies
CREATE POLICY "Votes are viewable by everyone" ON community_votes FOR SELECT USING (true);
CREATE POLICY "Users can manage their own votes" ON community_votes FOR ALL USING (auth.uid() = user_id);

-- Categories are public
CREATE POLICY "Categories are viewable by everyone" ON community_categories FOR SELECT USING (true);

-- Reputation is public read, user write
CREATE POLICY "Reputation is viewable by everyone" ON user_reputation FOR SELECT USING (true);
CREATE POLICY "Users can update their own reputation" ON user_reputation FOR ALL USING (auth.uid() = user_id);
```

## AI Integration (Gemini 2.5 Flash)

### CommunityQuestionOracle Agent
Following the same pattern as `CropDiseaseOracle.ts`, create `CommunityQuestionOracle.ts`:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface QuestionAnalysis {
  category: string;
  tags: string[];
  preliminaryAnswer: string;
  confidenceScore: number;
  similarQuestions: string[];
  urgencyLevel: 'low' | 'medium' | 'high';
  isAppropriate: boolean;
  moderationReason?: string;
}

class CommunityQuestionOracle {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async analyzeQuestion(title: string, content: string): Promise<QuestionAnalysis> {
    const prompt = this.buildAnalysisPrompt(title, content);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const analysis = this.parseAnalysisResponse(response.text());
      return analysis;
    } catch (error) {
      console.error('Question analysis failed:', error);
      return this.getDefaultAnalysis();
    }
  }

  async generatePreliminaryAnswer(question: string, context?: string): Promise<string> {
    const prompt = this.buildAnswerPrompt(question, context);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Preliminary answer generation failed:', error);
      return 'I\'m analyzing your question. Community experts will provide detailed answers soon!';
    }
  }

  private buildAnalysisPrompt(title: string, content: string): string {
    return `
      You are an expert agricultural AI assistant analyzing farming questions for Africa's largest farming community.
      
      Analyze this question and provide comprehensive insights:
      
      Title: ${title}
      Content: ${content}
      
      Provide analysis in JSON format:
      {
        "category": "Most appropriate category (Crop Management, Pest Control, Soil Health, Livestock, Weather & Climate, Equipment & Tools, Market & Economics, Organic Farming)",
        "tags": ["relevant", "farming", "tags"],
        "preliminaryAnswer": "Helpful preliminary answer with specific farming advice",
        "confidenceScore": 0.85,
        "similarQuestions": ["Similar question 1", "Similar question 2"],
        "urgencyLevel": "high/medium/low based on farming urgency",
        "isAppropriate": true,
        "moderationReason": "explanation if inappropriate"
      }
      
      Focus on:
      - East African farming context
      - Practical, actionable advice
      - Seasonal considerations
      - Local farming practices
      - Economic impact for small-scale farmers
    `;
  }

  private buildAnswerPrompt(question: string, context?: string): string {
    return `
      You are an expert agricultural advisor providing preliminary answers to farming questions in East Africa.
      
      Question: ${question}
      ${context ? `Context: ${context}` : ''}
      
      Provide a helpful preliminary answer that:
      1. Addresses the specific question
      2. Considers East African farming conditions
      3. Provides practical, actionable advice
      4. Mentions when to seek expert help
      5. Is encouraging and supportive
      
      Keep the answer concise but informative (2-3 paragraphs).
      End with: "Community experts will provide more detailed answers soon!"
    `;
  }

  private parseAnalysisResponse(responseText: string): QuestionAnalysis {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse analysis response:', error);
    }
    return this.getDefaultAnalysis();
  }

  private getDefaultAnalysis(): QuestionAnalysis {
    return {
      category: 'General',
      tags: [],
      preliminaryAnswer: 'I\'m analyzing your question. Community experts will provide detailed answers soon!',
      confidenceScore: 0.3,
      similarQuestions: [],
      urgencyLevel: 'medium',
      isAppropriate: true
    };
  }
}

export const communityQuestionOracle = new CommunityQuestionOracle();
```

## Service Layer Architecture

### CommunityService.ts
```typescript
import { supabase } from '@/integrations/supabase/client';
import { communityQuestionOracle } from '@/agents/CommunityQuestionOracle';

export interface CommunityQuestion {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category_id: string;
  tags: string[];
  images: string[];
  location?: { lat: number; lng: number; region?: string };
  crop_type?: string;
  farming_method?: string;
  status: 'open' | 'answered' | 'closed';
  view_count: number;
  vote_score: number;
  answer_count: number;
  ai_preliminary_answer?: string;
  ai_confidence_score?: number;
  created_at: string;
  updated_at: string;
  // Joined data
  category?: { name: string; icon: string; color: string };
  user?: { email: string; user_metadata?: any };
  user_reputation?: { total_points: number; badge_level: string };
}

class CommunityService {
  async createQuestion(questionData: {
    title: string;
    content: string;
    category_id?: string;
    crop_type?: string;
    farming_method?: string;
    location?: { lat: number; lng: number; region?: string };
  }): Promise<CommunityQuestion | null> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Analyze question with AI
      const analysis = await communityQuestionOracle.analyzeQuestion(
        questionData.title,
        questionData.content
      );

      // Check if content is appropriate
      if (!analysis.isAppropriate) {
        throw new Error(analysis.moderationReason || 'Content violates community guidelines');
      }

      // Auto-categorize if not provided
      let categoryId = questionData.category_id;
      if (!categoryId) {
        const categories = await this.getCategories();
        const matchingCategory = categories.find(c => 
          c.name.toLowerCase().includes(analysis.category.toLowerCase())
        );
        categoryId = matchingCategory?.id || categories[0]?.id;
      }

      // Create question with AI insights
      const { data, error } = await supabase
        .from('community_questions')
        .insert({
          ...questionData,
          user_id: user.id,
          category_id: categoryId,
          tags: analysis.tags,
          ai_preliminary_answer: analysis.preliminaryAnswer,
          ai_confidence_score: analysis.confidenceScore
        })
        .select(`
          *,
          category:community_categories(name, icon, color),
          user:auth.users(email, user_metadata),
          user_reputation(total_points, badge_level)
        `)
        .single();

      if (error) throw error;

      // Update user reputation
      await supabase.rpc('update_user_reputation', {
        user_id: user.id,
        action: 'question_asked'
      });

      return data;
    } catch (error) {
      console.error('Failed to create question:', error);
      throw error;
    }
  }

  async getQuestions(options: {
    page?: number;
    limit?: number;
    category_id?: string;
    status?: string;
    search?: string;
    sort_by?: 'created_at' | 'vote_score' | 'answer_count';
    sort_order?: 'asc' | 'desc';
  } = {}): Promise<{ questions: CommunityQuestion[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      category_id,
      status = 'open',
      search,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = options;

    let query = supabase
      .from('community_questions')
      .select(`
        *,
        category:community_categories(name, icon, color),
        user:auth.users(email, user_metadata),
        user_reputation(total_points, badge_level)
      `, { count: 'exact' });

    // Apply filters
    if (category_id) query = query.eq('category_id', category_id);
    if (status) query = query.eq('status', status);
    if (search) query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);

    // Apply sorting and pagination
    query = query.order(sort_by, { ascending: sort_order === 'asc' });
    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return { questions: data || [], total: count || 0 };
  }

  async vote(targetId: string, targetType: 'question' | 'answer', voteType: 'up' | 'down'): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check existing vote
      const { data: existingVote } = await supabase
        .from('community_votes')
        .select('*')
        .eq('user_id', user.id)
        .eq('target_id', targetId)
        .eq('target_type', targetType)
        .single();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote
          await supabase.from('community_votes').delete().eq('id', existingVote.id);
        } else {
          // Update vote
          await supabase
            .from('community_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);
        }
      } else {
        // Create new vote
        await supabase.from('community_votes').insert({
          user_id: user.id,
          target_id: targetId,
          target_type: targetType,
          vote_type: voteType
        });
      }

      // Update vote score
      await supabase.rpc('update_vote_score', { target_id: targetId, target_type: targetType });

      return true;
    } catch (error) {
      console.error('Voting failed:', error);
      return false;
    }
  }

  async getCategories(): Promise<Array<{ id: string; name: string; icon: string; color: string }>> {
    const { data, error } = await supabase
      .from('community_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }
}

export const communityService = new CommunityService();
```

## Component Architecture

### Page Components

#### QuestionsPage.tsx
- Main questions listing page
- Filtering and search functionality
- Pagination
- Real-time updates via Supabase subscriptions

#### QuestionDetailPage.tsx
- Individual question view
- Answers display
- Voting interface
- AI preliminary answer display

#### AskQuestionPage.tsx
- Question creation form
- AI-powered categorization
- Image upload support
- Location selection

### UI Components

#### QuestionCard.tsx
```typescript
interface QuestionCardProps {
  question: CommunityQuestion;
  onClick?: () => void;
  showFullContent?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onClick, showFullContent }) => {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{question.title}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Avatar className="h-6 w-6">
                <AvatarImage src={question.user?.user_metadata?.avatar_url} />
                <AvatarFallback>{question.user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span>{question.user?.user_metadata?.full_name || question.user?.email}</span>
              {question.user_reputation && (
                <Badge variant="outline">
                  {question.user_reputation.badge_level}
                </Badge>
              )}
            </div>
          </div>
          <Badge className={getStatusColor(question.status)}>
            {question.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-3">
          {showFullContent ? question.content : truncateContent(question.content)}
        </p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {question.tags.map((tag, index) => (
            <Badge key={index} variant="secondary">{tag}</Badge>
          ))}
        </div>

        {/* AI Preliminary Answer */}
        {question.ai_preliminary_answer && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-blue-700">AI Preliminary Answer</span>
              <Badge variant="outline" className="text-xs">
                {Math.round((question.ai_confidence_score || 0) * 100)}% confidence
              </Badge>
            </div>
            <p className="text-sm text-blue-800">
              {truncateContent(question.ai_preliminary_answer, 100)}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              <span>{question.vote_score}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{question.answer_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{question.view_count}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

#### VotingButtons.tsx
```typescript
interface VotingButtonsProps {
  targetId: string;
  targetType: 'question' | 'answer';
  currentScore: number;
  onVoteChange?: (newScore: number) => void;
}

export const VotingButtons: React.FC<VotingButtonsProps> = ({
  targetId,
  targetType,
  currentScore,
  onVoteChange
}) => {
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [score, setScore] = useState(currentScore);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (voteType: 'up' | 'down') => {
    if (isVoting) return;
    setIsVoting(true);

    try {
      const success = await communityService.vote(targetId, targetType, voteType);
      if (success) {
        // Update local state optimistically
        let newScore = score;
        if (userVote === voteType) {
          // Removing vote
          newScore = userVote === 'up' ? score - 1 : score + 1;
          setUserVote(null);
        } else if (userVote === null) {
          // Adding new vote
          newScore = voteType === 'up' ? score + 1 : score - 1;
          setUserVote(voteType);
        } else {
          // Changing vote
          newScore = voteType === 'up' ? score + 2 : score - 2;
          setUserVote(voteType);
        }
        setScore(newScore);
        onVoteChange?.(newScore);
      }
    } catch (error) {
      console.error('Vote failed:', error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        variant={userVote === 'up' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleVote('up')}
        disabled={isVoting}
        className="p-2"
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      <span className="font-medium text-sm">{score}</span>
      <Button
        variant={userVote === 'down' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleVote('down')}
        disabled={isVoting}
        className="p-2"
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  );
};
```

## Real-Time Features

### Supabase Subscriptions
```typescript
// Real-time question updates
useEffect(() => {
  const subscription = supabase
    .channel('community_questions')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'community_questions' },
      (payload) => {
        // Handle real-time question updates
        handleQuestionUpdate(payload);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);

// Real-time answer updates
useEffect(() => {
  const subscription = supabase
    .channel('community_answers')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'community_answers' },
      (payload) => {
        // Handle real-time answer updates
        handleAnswerUpdate(payload);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

## Mobile Optimization

### Touch-Friendly Interface
- Large tap targets for voting buttons
- Swipe gestures for navigation
- Optimized keyboard handling
- Responsive design for all screen sizes

### Offline Support
- Cache frequently accessed questions
- Queue actions when offline
- Sync when connection restored
- Progressive loading

## Performance Optimizations

### Database Indexes
```sql
-- Performance indexes
CREATE INDEX idx_community_questions_user_id ON community_questions(user_id);
CREATE INDEX idx_community_questions_category_id ON community_questions(category_id);
CREATE INDEX idx_community_questions_status ON community_questions(status);
CREATE INDEX idx_community_questions_created_at ON community_questions(created_at DESC);
CREATE INDEX idx_community_questions_vote_score ON community_questions(vote_score DESC);
CREATE INDEX idx_community_questions_search ON community_questions USING gin(to_tsvector('english', title || ' ' || content));
```

### Component Optimizations
- React.memo for expensive components
- useMemo for computed values
- useCallback for event handlers
- Lazy loading for images
- Virtual scrolling for long lists

## Security Considerations

### Input Validation
- Sanitize all user inputs
- Validate question/answer content
- Check image uploads
- Rate limiting for API calls

### Content Moderation
- AI-powered content filtering
- Spam detection
- Inappropriate content flagging
- Community reporting system

## Success Metrics
- Questions load in <2 seconds
- AI provides preliminary answers in <5 seconds
- 90% of questions auto-categorized correctly
- Real-time updates work without page refresh
- Mobile experience scores 90+ on Lighthouse
- Voting system prevents fraud and maintains integrity
- Content moderation catches 95% of inappropriate content

This design provides a comprehensive foundation for resurrecting the AI Expert Community Questions feature with bulletproof Supabase integration and powerful Gemini 2.5 Flash AI capabilities!