import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function globalSetup() {
  // Load the appropriate environment file for testing
  const envPath = path.join(__dirname, '../.env');
  dotenv.config({ path: envPath });
  
  // Set test-specific environment variables
  process.env.PLAYWRIGHT_TEST_BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:8082';
  process.env.NODE_ENV = 'test';
  
  // Set required Supabase environment variables for client initialization
  process.env.VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://bapqlyvfwxsichlyjxpd.supabase.co';
  process.env.VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhcHFseXZmd3hzaWNobHlqeHBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MDgyMzIsImV4cCI6MjA1NzI4NDIzMn0.hk2D1tvqIM7id40ajPE9_2xtAIC7_thqQN9m0b_4m5g';
  
  console.log('🔧 Playwright global setup completed');
  console.log('📍 Base URL:', process.env.PLAYWRIGHT_TEST_BASE_URL);
  console.log('🔗 Supabase URL:', process.env.VITE_SUPABASE_URL);
  
  return async () => {
    // Global teardown function
    console.log('🧹 Playwright global teardown completed');
  };
}

export default globalSetup;