import { 
  schemaValidator, 
  validateColumns, 
  suggestMapping, 
  autoCorrectQuery 
} from '../schemaValidator';

// Mock supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    then: jest.fn().mockImplementation(callback => {
      // Mock database schema response
      const mockData = {
        fields: [
          { column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: null },
          { column_name: 'name', data_type: 'text', is_nullable: 'YES', column_default: null },
          { column_name: 'created_at', data_type: 'timestamp', is_nullable: 'NO', column_default: 'now()' },
          { column_name: 'updated_at', data_type: 'timestamp', is_nullable: 'YES', column_default: null }
        ],
        farms: [
          { column_name: 'id', data_type: 'uuid', is_nullable: 'NO', column_default: null },
          { column_name: 'name', data_type: 'text', is_nullable: 'YES', column_default: null },
          { column_name: 'user_id', data_type: 'uuid', is_nullable: 'NO', column_default: null },
          { column_name: 'created_at', data_type: 'timestamp', is_nullable: 'NO', column_default: 'now()' }
        ]
      };
      
      // Get table name from the query
      const tableName = this.fromTable;
      
      return Promise.resolve({
        data: mockData[tableName] || [],
        error: null
      });
    })
  }
}));

describe('SchemaValidator', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Reset schema cache
    schemaValidator.clearCache();
  });
  
  describe('validateColumns', () => {
    test('validates existing columns correctly', async () => {
      const result = await validateColumns('fields', ['id', 'name', 'created_at']);
      
      expect(result.isValid).toBe(true);
      expect(result.missingColumns).toEqual([]);
      expect(result.errors).toEqual([]);
    });
    
    test('detects missing columns', async () => {
      const result = await validateColumns('fields', ['id', 'name', 'created_by']);
      
      expect(result.isValid).toBe(false);
      expect(result.missingColumns).toContain('created_by');
      expect(result.errors.length).toBeGreaterThan(0);
    });
    
    test('suggests column mappings for missing columns', async () => {
      const result = await validateColumns('fields', ['id', 'name', 'created_by']);
      
      expect(result.suggestions).toHaveProperty('created_by');
      expect(result.suggestions.created_by).toBe('created_at');
    });
  });
  
  describe('suggestMapping', () => {
    test('suggests similar column names', async () => {
      const availableColumns = ['id', 'name', 'created_at', 'updated_at'];
      const result = await suggestMapping('created_by', availableColumns);
      
      expect(result).not.toBeNull();
      expect(result?.mappedColumn).toBe('created_at');
      expect(result?.confidence).toBeGreaterThan(0.5);
    });
    
    test('returns null for columns with no good match', async () => {
      const availableColumns = ['id', 'name', 'created_at', 'updated_at'];
      const result = await suggestMapping('completely_different', availableColumns);
      
      expect(result).toBeNull();
    });
    
    test('uses predefined mappings when available', async () => {
      // Register a mapping
      schemaValidator.registerColumnMapping('fields', 'author_id', 'user_id');
      
      const availableColumns = ['id', 'name', 'user_id', 'created_at'];
      const result = await suggestMapping('author_id', availableColumns, 'fields');
      
      expect(result).not.toBeNull();
      expect(result?.mappedColumn).toBe('user_id');
      expect(result?.confidence).toBeGreaterThan(0.9);
    });
  });
  
  describe('autoCorrectQuery', () => {
    test('corrects column names in queries', async () => {
      const query = 'SELECT id, name, created_by FROM fields';
      const result = await autoCorrectQuery('fields', query, ['id', 'name', 'created_by']);
      
      expect(result.correctedQuery).not.toEqual(query);
      expect(result.correctedQuery).toContain('created_at');
      expect(result.mappings.length).toBeGreaterThan(0);
    });
    
    test('returns original query when no corrections needed', async () => {
      const query = 'SELECT id, name, created_at FROM fields';
      const result = await autoCorrectQuery('fields', query, ['id', 'name', 'created_at']);
      
      expect(result.correctedQuery).toEqual(query);
      expect(result.mappings.length).toBe(0);
    });
  });
  
  describe('schemaValidator', () => {
    test('caches schema information', async () => {
      // First call should fetch schema
      await schemaValidator.getTableSchema('fields');
      
      // Second call should use cache
      await schemaValidator.getTableSchema('fields');
      
      // Supabase should only be called once
      expect(jest.mocked(supabase.from)).toHaveBeenCalledTimes(1);
    });
    
    test('registers and retrieves column mappings', () => {
      schemaValidator.registerColumnMapping('fields', 'test_column', 'actual_column');
      
      const mappings = schemaValidator.getAllMappings();
      
      expect(mappings).toHaveProperty('fields');
      expect(mappings.fields).toHaveProperty('test_column');
      expect(mappings.fields.test_column).toBe('actual_column');
    });
  });
});