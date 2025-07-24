import { FieldBrainAgent } from '../FieldBrainAgent';

// Mock the v4 as uuidv4
jest.mock('uuid', () => ({
  v4: () => 'test-uuid',
}));

describe('FieldBrainAgent', () => {
  let agent: FieldBrainAgent;

  beforeEach(() => {
    agent = FieldBrainAgent.getInstance();
  });

  it('should initialize correctly', async () => {
    const result = await agent.initialize('test-user');
    expect(result).toBe(true);
    expect(agent.getIsInitialized()).toBe(true);
  });

  it('should add a memory', () => {
    agent.addMemory({
      fieldId: 'test-field',
      content: 'Test memory',
      source: 'user',
      timestamp: Date.now(),
      tags: ['test'],
    });

    const memories = agent.getRecentMemories();
    expect(memories).toHaveLength(1);
    expect(memories[0].content).toBe('Test memory');
  });
});
