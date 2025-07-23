import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// =================================================================
//  CROPGENIUS SUPABASE CONNECTION VERIFIER (INFINITY IQ EDITION)
//  Purpose: To bypass faulty local tooling and verify production
//           credentials directly against the Supabase API.
// =================================================================

console.log('🔥 [START] Supabase Connection Verification Script');

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// --- Step 1: Environment Variable Validation ---
console.log('🕵️  [STEP 1] Validating environment variables...');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ [FAIL] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing in .env file.');
  console.error('Please ensure the .env file at the project root is correctly configured.');
  process.exit(1);
}

console.log('✅ [PASS] Environment variables loaded successfully.');
console.log(`   - Supabase URL: ${supabaseUrl.replace(/https://([^.]+)\..*/, 'https://$1.supabase.co')}`);

// --- Step 2: Supabase Client Initialization ---
console.log('🚀 [STEP 2] Initializing Supabase client...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('✅ [PASS] Supabase client initialized.');

// --- Step 3: API Connection Test ---
async function verifyConnection() {
  console.log('📡 [STEP 3] Attempting to connect to Supabase and fetch schemas...');
  
  try {
    // A simple, low-impact query to verify authentication and connectivity.
    // Fetching schemas is a metadata operation that confirms the key is valid.
    const { data, error } = await supabase
      .from('information_schema.schemata')
      .select('schema_name');

    if (error) {
      console.error('❌ [FAIL] An error occurred while querying Supabase:');
      console.error(`   - Error Code: ${error.code}`);
      console.error(`   - Error Message: ${error.message}`);
      console.error(`   - Error Details: ${error.details}`);
      console.error('\n🔧 TROUBLESHOOTING:');
      console.error('   1. Verify the VITE_SUPABASE_URL in your .env file is correct.');
      console.error('   2. Ensure the VITE_SUPABASE_ANON_KEY is valid and has not been revoked.');
      console.error('   3. Check for any network firewalls or policies blocking traffic to Supabase.');
      process.exit(1);
    }

    if (data && data.length > 0) {
      console.log('✅ [PASS] Successfully connected to Supabase and fetched data!');
      console.log('   - Connection to the empire is stable. The credentials are valid.');
      console.log('   - Found Schemas:', data.map(d => d.schema_name).join(', '));
      console.log('\n👑 [CONCLUSION] The Supabase credentials in the .env file are CORRECT.');
    } else {
      console.warn('⚠️  [WARN] Connection successful, but no schemas were returned. This is unusual.');
      console.warn('   - The credentials are likely correct, but there might be a permissions issue.');
    }

  } catch (err) {
    console.error('❌ [FATAL] A fatal exception occurred during the connection test:', err);
    process.exit(1);
  }
}

verifyConnection();
