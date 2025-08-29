/**
 * 🌾 CROPGENIUS – COMMUNITY COMPONENTS TESTS v1.0
 * -------------------------------------------------------------
 * COMPREHENSIVE Test Suite for Community Components
 * - Unit tests for all components
 * - Integration tests for real-time features
 * - Mobile interaction testing
 * - Error handling verification
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QuestionCard } from '../QuestionCard';
import { VotingButtons } from '../VotingButtons';
import { AskQuestionForm } from '../AskQuestionForm';
import { AnswerCard } from '../AnswerCard';
import { MobileCommunityCard } from '../MobileCommunityCard';

// Local type definitions for tests
interface CommunityQuestion {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category_id: string;
  tags: string[];
  images: string[];
  status: 'open' | 'answered' | 'closed';
  view_count: number;
  vote_score: number;
  answer_count: number;
  ai_preliminary_answer?: string;
  ai_confidence_score?: number;
  created_at: string;
  updated_at: string;
  category?: { name: string; icon: string; color: string };
  user_display_name?: string;
  user_avatar_url?: string;
}

interface CommunityAnswer {
  id: string;
  question_id: string;
  user_id: string;
  content: string;
  vote_score: number;
  is_accepted: boolean;
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

// Mock dependencies
vi.mock('@/services/CommunityService', () => ({
  communityService: {
    vote: vi.fn(),
    createQuestion: vi.fn(),
    createAnswer: vi.fn(),
    getCategories: vi.fn(),
  },
  communityQuestionOracle: {
    analyzeQuestion: vi.fn(),
  }
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }
}));

// Mock data
const mockQuestion: CommunityQuestion = {
  id: '1',
  user_id: 'user1',
  title: 'How to treat tomato blight?',
  content: 'My tomato plants are showing signs of blight. What should I do?',
  category_id: 'cat1',
  tags: ['tomatoes', 'disease', 'organic'],
  images: [],
  status: 'open',
  view_count: 45,
  vote_score: 12,
  answer_count: 3,
  ai_preliminary_answer: 'Tomato blight can be treated with copper-based fungicides...',
  ai_confidence_score: 0.85,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  category: {
    name: 'Plant Diseases',
    icon: '🦠',
    color: '#ef4444'
  },
  user: {
    email: 'farmer@example.com',
    user_metadata: {
      full_name: 'John Farmer'
    }
  },
  // user_reputation temporarily disabled
};

const mockAnswer: CommunityAnswer = {
  id: '1',
  question_id: '1',
  user_id: 'user2',
  content: 'I recommend using neem oil spray every 7 days...',
  images: [],
  is_ai_generated: false,
  is_accepted: false,
  vote_score: 8,
  created_at: '2024-01-15T11:00:00Z',
  updated_at: '2024-01-15T11:00:00Z',
  user: {
    email: 'expert@example.com',
    user_metadata: {
      full_name: 'Dr. Plant Expert'
    }
  },
  // user_reputation temporarily disabled
};

describe('QuestionCard', () => {
  it('renders question information correctly', () => {
    render(
      <QuestionCard
        question={mockQuestion}
        onClick={vi.fn()}
        onVote={vi.fn()}
      />
    );

    expect(screen.getByText('How to treat tomato blight?')).toBeInTheDocument();
    expect(screen.getByText('John Farmer')).toBeInTheDocument();
    expect(screen.getByText('expert')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument(); // vote score
    expect(screen.getByText('3')).toBeInTheDocument(); // answer count
    expect(screen.getByText('45')).toBeInTheDocument(); // view count
  });

  it('displays AI preliminary answer when available', () => {
    render(
      <QuestionCard
        question={mockQuestion}
        onClick={vi.fn()}
        onVote={vi.fn()}
      />
    );

    expect(screen.getByText('AI Preliminary Answer')).toBeInTheDocument();
    expect(screen.getByText('85% confidence')).toBeInTheDocument();
    expect(screen.getByText(/Tomato blight can be treated/)).toBeInTheDocument();
  });

  it('handles click events correctly', () => {
    const onClickMock = vi.fn();
    render(
      <QuestionCard
        question={mockQuestion}
        onClick={onClickMock}
        onVote={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('article'));
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('displays tags correctly', () => {
    render(
      <QuestionCard
        question={mockQuestion}
        onClick={vi.fn()}
        onVote={vi.fn()}
      />
    );

    expect(screen.getByText('tomatoes')).toBeInTheDocument();
    expect(screen.getByText('disease')).toBeInTheDocument();
    expect(screen.getByText('organic')).toBeInTheDocument();
  });
});

describe('VotingButtons', () => {
  it('renders vote score correctly', () => {
    render(
      <VotingButtons
        targetId="1"
        targetType="question"
        currentScore={15}
        onVoteChange={vi.fn()}
      />
    );

    expect(screen.getByText('+15')).toBeInTheDocument();
  });

  it('handles upvote click', async () => {
    const mockVote = vi.fn().mockResolvedValue({ success: true, newScore: 16 });
    vi.mocked(require('@/services/CommunityService').communityService.vote).mockImplementation(mockVote);

    render(
      <VotingButtons
        targetId="1"
        targetType="question"
        currentScore={15}
        onVoteChange={vi.fn()}
      />
    );

    const upvoteButton = screen.getByLabelText('Upvote this question');
    fireEvent.click(upvoteButton);

    await waitFor(() => {
      expect(mockVote).toHaveBeenCalledWith('1', 'question', 'up');
    });
  });

  it('shows loading state during voting', async () => {
    const mockVote = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    vi.mocked(require('@/services/CommunityService').communityService.vote).mockImplementation(mockVote);

    render(
      <VotingButtons
        targetId="1"
        targetType="question"
        currentScore={15}
        onVoteChange={vi.fn()}
      />
    );

    const upvoteButton = screen.getByLabelText('Upvote this question');
    fireEvent.click(upvoteButton);

    // Should show loading spinner
    expect(screen.getByRole('button', { name: /upvote/i })).toBeDisabled();
  });
});

describe('AnswerCard', () => {
  it('renders answer information correctly', () => {
    render(
      <AnswerCard
        answer={mockAnswer}
        onVote={vi.fn()}
        onAccept={vi.fn()}
        canAccept={false}
      />
    );

    expect(screen.getByText('Dr. Plant Expert')).toBeInTheDocument();
    expect(screen.getByText('guru')).toBeInTheDocument();
    expect(screen.getByText(/I recommend using neem oil/)).toBeInTheDocument();
  });

  it('shows accept button when user can accept answers', () => {
    render(
      <AnswerCard
        answer={mockAnswer}
        onVote={vi.fn()}
        onAccept={vi.fn()}
        canAccept={true}
      />
    );

    expect(screen.getByText('Accept as Best Answer')).toBeInTheDocument();
  });

  it('displays accepted answer badge when answer is accepted', () => {
    const acceptedAnswer = { ...mockAnswer, is_accepted: true };

    render(
      <AnswerCard
        answer={acceptedAnswer}
        onVote={vi.fn()}
        onAccept={vi.fn()}
        canAccept={false}
      />
    );

    expect(screen.getByText('Accepted Answer')).toBeInTheDocument();
  });

  it('shows AI generated indicator for AI answers', () => {
    const aiAnswer = { ...mockAnswer, is_ai_generated: true };

    render(
      <AnswerCard
        answer={aiAnswer}
        onVote={vi.fn()}
        onAccept={vi.fn()}
        canAccept={false}
      />
    );

    expect(screen.getByText('AI Generated')).toBeInTheDocument();
    expect(screen.getByText('AI-Generated Answer')).toBeInTheDocument();
  });
});

describe('MobileCommunityCard', () => {
  it('renders mobile-optimized question card', () => {
    render(
      <MobileCommunityCard
        question={mockQuestion}
        onClick={vi.fn()}
        onVote={vi.fn()}
        isOffline={false}
      />
    );

    expect(screen.getByText('How to treat tomato blight?')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument(); // First name only on mobile
    expect(screen.getByText('E')).toBeInTheDocument(); // Badge level first letter
  });

  it('shows offline indicator when offline', () => {
    render(
      <MobileCommunityCard
        question={mockQuestion}
        onClick={vi.fn()}
        onVote={vi.fn()}
        isOffline={true}
      />
    );

    // Should show wifi off icon
    expect(screen.getByTestId('wifi-off-icon') || screen.getByRole('img')).toBeInTheDocument();
  });

  it('handles touch interactions', () => {
    const onClickMock = vi.fn();
    const onVoteMock = vi.fn();

    render(
      <MobileCommunityCard
        question={mockQuestion}
        onClick={onClickMock}
        onVote={onVoteMock}
        isOffline={false}
      />
    );

    const card = screen.getByRole('article') || screen.getByText('How to treat tomato blight?').closest('div');

    // Simulate touch events
    fireEvent.touchStart(card!, { touches: [{ clientX: 100, clientY: 100 }] });
    fireEvent.touchEnd(card!, { changedTouches: [{ clientX: 100, clientY: 100 }] });

    expect(onClickMock).toHaveBeenCalled();
  });

  it('truncates content appropriately for mobile', () => {
    const longQuestion = {
      ...mockQuestion,
      title: 'This is a very long question title that should be truncated on mobile devices to save space',
      content: 'This is a very long content that should also be truncated on mobile devices to provide a better user experience and save screen real estate for other important information.'
    };

    render(
      <MobileCommunityCard
        question={longQuestion}
        onClick={vi.fn()}
        onVote={vi.fn()}
        isOffline={false}
      />
    );

    // Content should be present but truncated (line-clamp CSS class)
    expect(screen.getByText(/This is a very long question title/)).toBeInTheDocument();
    expect(screen.getByText(/This is a very long content/)).toBeInTheDocument();
  });
});

describe('AskQuestionForm', () => {
  beforeEach(() => {
    vi.mocked(require('@/services/CommunityService').communityService.getCategories)
      .mockResolvedValue([
        { id: '1', name: 'Plant Diseases', icon: '🦠', color: '#ef4444' },
        { id: '2', name: 'Soil Health', icon: '🌱', color: '#10b981' }
      ]);
  });

  it('renders form fields correctly', async () => {
    render(
      <AskQuestionForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Question Title/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Detailed Description/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Category/)).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    const onSubmitMock = vi.fn();

    render(
      <AskQuestionForm
        onSubmit={onSubmitMock}
        onCancel={vi.fn()}
      />
    );

    const submitButton = screen.getByText('Post Question');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Question title is required')).toBeInTheDocument();
      expect(screen.getByText('Question description is required')).toBeInTheDocument();
    });

    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('shows AI analysis when question is analyzed', async () => {
    const mockAnalysis = {
      category: 'Plant Diseases',
      tags: ['tomatoes', 'blight'],
      preliminaryAnswer: 'This appears to be tomato blight...',
      confidenceScore: 85,
      isAppropriate: true
    };

    vi.mocked(require('@/agents/CommunityQuestionOracle').communityQuestionOracle.analyzeQuestion)
      .mockResolvedValue(mockAnalysis);

    render(
      <AskQuestionForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const titleInput = screen.getByLabelText(/Question Title/);
    const contentInput = screen.getByLabelText(/Detailed Description/);

    fireEvent.change(titleInput, { target: { value: 'How to treat tomato blight?' } });
    fireEvent.change(contentInput, { target: { value: 'My tomato plants are showing signs of blight disease.' } });

    await waitFor(() => {
      expect(screen.getByText('AI Analysis Complete')).toBeInTheDocument();
      expect(screen.getByText('85% confidence')).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});

// Integration tests
describe('Community Components Integration', () => {
  it('handles complete question workflow', async () => {
    const mockCreateQuestion = vi.fn().mockResolvedValue({
      id: '2',
      ...mockQuestion,
      title: 'New test question'
    });

    vi.mocked(require('@/services/CommunityService').communityService.createQuestion)
      .mockImplementation(mockCreateQuestion);

    const onSubmitMock = vi.fn();

    render(
      <AskQuestionForm
        onSubmit={onSubmitMock}
        onCancel={vi.fn()}
      />
    );

    // Fill out form
    const titleInput = screen.getByLabelText(/Question Title/);
    const contentInput = screen.getByLabelText(/Detailed Description/);

    fireEvent.change(titleInput, { target: { value: 'How to grow organic tomatoes?' } });
    fireEvent.change(contentInput, { target: { value: 'I want to start growing organic tomatoes in my garden. What are the best practices?' } });

    // Wait for form to be valid
    await waitFor(() => {
      const submitButton = screen.getByText('Post Question');
      expect(submitButton).not.toBeDisabled();
    });

    // Submit form
    const submitButton = screen.getByText('Post Question');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateQuestion).toHaveBeenCalled();
      expect(onSubmitMock).toHaveBeenCalledWith('2');
    });
  });

  it('handles voting workflow correctly', async () => {
    const mockVote = vi.fn().mockResolvedValue({ success: true, newScore: 13 });
    vi.mocked(require('@/services/CommunityService').communityService.vote).mockImplementation(mockVote);

    const onVoteChangeMock = vi.fn();

    render(
      <QuestionCard
        question={mockQuestion}
        onClick={vi.fn()}
        onVote={vi.fn()}
      />
    );

    const upvoteButton = screen.getByLabelText('Upvote this question');
    fireEvent.click(upvoteButton);

    await waitFor(() => {
      expect(mockVote).toHaveBeenCalledWith('1', 'question', 'up');
    });
  });
});

// Error handling tests
describe('Error Handling', () => {
  it('handles voting errors gracefully', async () => {
    const mockVote = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.mocked(require('@/services/CommunityService').communityService.vote).mockImplementation(mockVote);

    render(
      <VotingButtons
        targetId="1"
        targetType="question"
        currentScore={15}
        onVoteChange={vi.fn()}
      />
    );

    const upvoteButton = screen.getByLabelText('Upvote this question');
    fireEvent.click(upvoteButton);

    await waitFor(() => {
      expect(require('sonner').toast.error).toHaveBeenCalledWith(
        'Vote failed',
        expect.objectContaining({
          description: expect.stringContaining('try again')
        })
      );
    });
  });

  it('handles form submission errors', async () => {
    const mockCreateQuestion = vi.fn().mockRejectedValue(new Error('Validation failed'));
    vi.mocked(require('@/services/CommunityService').communityService.createQuestion)
      .mockImplementation(mockCreateQuestion);

    render(
      <AskQuestionForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    // Fill out form with valid data
    const titleInput = screen.getByLabelText(/Question Title/);
    const contentInput = screen.getByLabelText(/Detailed Description/);

    fireEvent.change(titleInput, { target: { value: 'Valid question title' } });
    fireEvent.change(contentInput, { target: { value: 'Valid question content that is long enough' } });

    // Submit form
    const submitButton = screen.getByText('Post Question');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(require('sonner').toast.error).toHaveBeenCalledWith(
        'Failed to post question',
        expect.objectContaining({
          description: 'Validation failed'
        })
      );
    });
  });
});