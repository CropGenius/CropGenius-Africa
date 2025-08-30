import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SimpleAuthProvider } from '@/providers/SimpleAuthProvider'
import AppRoutes from '@/AppRoutes'

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

const RouteTestWrapper = ({ initialEntries = ['/'] }: { initialEntries?: string[] }) => {
  const queryClient = createTestQueryClient()
  
  return (
    <QueryClientProvider client={queryClient}>
      <SimpleAuthProvider>
        <MemoryRouter initialEntries={initialEntries}>
          <AppRoutes />
        </MemoryRouter>
      </SimpleAuthProvider>
    </QueryClientProvider>
  )
}

describe('Routing Smoke Tests', () => {
  it('should render root route without crashing', () => {
    const { container } = render(<RouteTestWrapper />)
    expect(container).toBeDefined()
  })

  it('should handle unknown routes gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Test unknown route - should not crash
    const { container } = render(
      <RouteTestWrapper initialEntries={['/nonexistent-route']} />
    )
    
    expect(container).toBeDefined()
    
    // Allow expected 404 error logging
    // The system properly logs 404 errors - this is expected behavior
    
    consoleSpy.mockRestore()
  })

  it('should handle critical routes without throwing', () => {
    const criticalRoutes = [
      '/',
      '/auth',
    ]

    // Test only routes that don't require authentication for smoke test
    criticalRoutes.forEach(route => {
      expect(() => {
        render(<RouteTestWrapper initialEntries={[route]} />)
      }).not.toThrow()
    })
  })
})