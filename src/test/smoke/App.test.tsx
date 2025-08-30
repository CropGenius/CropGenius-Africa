import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SimpleAuthProvider } from '@/providers/SimpleAuthProvider'
import App from '@/App'

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

const AppWithProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient()
  
  return (
    <QueryClientProvider client={queryClient}>
      <SimpleAuthProvider>
        {children}
      </SimpleAuthProvider>
    </QueryClientProvider>
  )
}

describe('App Smoke Tests', () => {
  it('should render without crashing', () => {
    render(
      <AppWithProviders>
        <App />
      </AppWithProviders>
    )
    
    // App should render some content
    expect(document.body).toBeTruthy()
  })

  it('should not throw unhandled errors during render', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    render(
      <AppWithProviders>
        <App />
      </AppWithProviders>
    )
    
    // Should not log any errors during render
    expect(consoleSpy).not.toHaveBeenCalled()
    
    consoleSpy.mockRestore()
  })
})