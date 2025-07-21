import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// Mock console.error to avoid test output pollution
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Component that throws an error
const ErrorComponent = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Custom fallback component for testing
const TestFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
  <div>
    <h2>Error fallback</h2>
    <p data-testid="error-message">{error.message}</p>
    <button onClick={resetError} data-testid="reset-button">
      Reset
    </button>
  </div>
);

describe('ErrorBoundary', () => {
  test('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
  
  test('renders default fallback UI when an error occurs', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });
  
  test('renders custom fallback UI when provided', () => {
    render(
      <ErrorBoundary fallback={TestFallback}>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Error fallback')).toBeInTheDocument();
    expect(screen.getByTestId('error-message')).toHaveTextContent('Test error');
  });
  
  test('resets error state when reset button is clicked', () => {
    const TestComponent = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true);
      
      return (
        <ErrorBoundary fallback={({ resetError }) => (
          <div>
            <button onClick={() => {
              setShouldThrow(false);
              resetError();
            }} data-testid="reset-button">
              Reset
            </button>
          </div>
        )}>
          {shouldThrow ? <ErrorComponent /> : <div>Recovered</div>}
        </ErrorBoundary>
      );
    };
    
    render(<TestComponent />);
    
    // Error boundary should show fallback
    expect(screen.getByTestId('reset-button')).toBeInTheDocument();
    
    // Click reset button
    fireEvent.click(screen.getByTestId('reset-button'));
    
    // Component should recover
    expect(screen.getByText('Recovered')).toBeInTheDocument();
  });
  
  test('calls onError prop when an error occurs', () => {
    const handleError = jest.fn();
    
    render(
      <ErrorBoundary onError={handleError}>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    expect(handleError).toHaveBeenCalledTimes(1);
    expect(handleError.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(handleError.mock.calls[0][0].message).toBe('Test error');
  });
  
  test('resets error state when props change and resetOnPropsChange is true', () => {
    const TestContainer = () => {
      const [key, setKey] = React.useState(1);
      
      return (
        <div>
          <button onClick={() => setKey(k => k + 1)} data-testid="change-props">
            Change Props
          </button>
          
          <ErrorBoundary resetOnPropsChange={true} key={`error-boundary-${key}`}>
            {key % 2 === 1 ? <ErrorComponent /> : <div>No error</div>}
          </ErrorBoundary>
        </div>
      );
    };
    
    render(<TestContainer />);
    
    // Error boundary should show fallback
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    // Change props
    fireEvent.click(screen.getByTestId('change-props'));
    
    // Component should recover
    expect(screen.getByText('No error')).toBeInTheDocument();
  });
  
  test('logs error to storage', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    // Check if error was logged to storage
    const errorLog = JSON.parse(localStorage.getItem('cropgenius_error_log') || '[]');
    expect(errorLog.length).toBeGreaterThan(0);
    expect(errorLog[0].message).toBe('Test error');
  });
});