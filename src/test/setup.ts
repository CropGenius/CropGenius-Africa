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

// Mock React Router to prevent router-in-router conflicts
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    useLocation: vi.fn(() => ({ pathname: '/' })),
    useParams: vi.fn(() => ({})),
  }
})

// Mock critical hooks to prevent crashes
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
  }))
}))

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'eyJ0ZXN0IjoidG9rZW4ifQ==',
    MODE: 'test',
    DEV: false,
    PROD: false,
  },
  writable: false,
})

// Set test environment variables
vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'eyJ0ZXN0IjoidG9rZW4ifQ==')

afterEach(() => {
  cleanup()
})