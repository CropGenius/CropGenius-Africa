import { renderHook, act } from '@testing-library/react-hooks';
import { FieldBrainProvider, useFieldBrain } from '../useFieldBrain';
import FieldBrainAgent from '@/agents/FieldBrainAgent';
import { toast } from 'sonner';

// Mock the FieldBrainAgent
jest.mock('@/agents/FieldBrainAgent');
const mockAgent = FieldBrainAgent.getInstance() as jest.Mocked<FieldBrainAgent>;

// Mock the toast
jest.mock('sonner');

describe('useFieldBrain', () => {
  it('should provide the field brain context', () => {
    const wrapper = ({ children }) => <FieldBrainProvider userId="test-user">{children}</FieldBrainProvider>;
    const { result } = renderHook(() => useFieldBrain(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.isInitialized).toBe(false);
    expect(result.current.isLoading).toBe(true);
  });
});
