import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

// Mock Supabase for tests
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({ 
        eq: vi.fn(() => ({ single: vi.fn() }))
      })),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }))
  }
}))

// Mock CommunityService
vi.mock('@/services/CommunityService', () => ({
  communityService: {
    getQuestions: vi.fn(),
    createQuestion: vi.fn(),
    voteOnQuestion: vi.fn(),
    voteOnAnswer: vi.fn(),
  },
  CommunityQuestion: {},
  CommunityAnswer: {},
}))

// Set test environment variables
vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'eyJ0ZXN0IjoidG9rZW4ifQ==')

afterEach(() => {
  cleanup()
})