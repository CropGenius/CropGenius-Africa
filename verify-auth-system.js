#!/usr/bin/env node

/**
 * 🔍 CropGenius Authentication System Verification Script
 * 
 * This script verifies that the authentication system is production-ready
 * Run this before deploying to production to ensure 100% success rate
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.blue}🔍 ${msg}${colors.reset}\n`)
};

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID;
const SITE_URL = process.env.VITE_SITE_URL || 'http://localhost:8080';

let supabase;
let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0
};

async function initializeSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    log.error('Missing Supabase configuration. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  log.info(`Connected to Supabase: ${SUPABASE_URL}`);
}

async function testDatabaseTriggers() {
  log.header('Testing Database Triggers');
  
  try {
    // Query the triggers on auth.users table
    const { data, error } = await supabase.rpc('execute_sql', {
      sql: `
        SELECT COUNT(*) as trigger_count 
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'auth' AND c.relname = 'users'
      `
    });

    if (error) {
      log.warning('Could not check triggers directly (requires elevated permissions)');
      log.info('Manual check required: Run the trigger count query in Supabase SQL Editor');
      testResults.warnings++;
      return;
    }

    const triggerCount = data[0]?.trigger_count || 'unknown';
    
    if (triggerCount === 1) {
      log.success(`Database triggers: ${triggerCount} (CORRECT - Master trigger only)`);
      testResults.passed++;
    } else {
      log.error(`Database triggers: ${triggerCount} (WRONG - Should be exactly 1)`);
      log.error('❗ CRITICAL: Multiple triggers will cause registration failures');
      log.info('Fix: Run the definitive auth migration in Supabase SQL Editor');
      testResults.failed++;
    }
  } catch (err) {
    log.warning('Could not verify database triggers (requires admin access)');
    log.info('Manual verification required in Supabase Dashboard');
    testResults.warnings++;
  }
}

async function testSupabaseConnection() {
  log.header('Testing Supabase Connection');
  
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      log.error(`Supabase connection failed: ${error.message}`);
      testResults.failed++;
      return false;
    }
    
    log.success('Supabase connection successful');
    testResults.passed++;
    return true;
  } catch (err) {
    log.error(`Supabase connection error: ${err.message}`);
    testResults.failed++;
    return false;
  }
}

async function testProfilesTable() {
  log.header('Testing Profiles Table Structure');
  
  try {
    // Test if we can query the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('id, onboarding_completed')
      .limit(1);
    
    if (error && error.code === 'PGRST116') {
      log.error('Profiles table does not exist');
      log.info('Fix: Run the definitive auth migration');
      testResults.failed++;
      return;
    }
    
    if (error) {
      log.warning(`Profiles table query error: ${error.message}`);
      testResults.warnings++;
      return;
    }
    
    log.success('Profiles table exists and is accessible');
    testResults.passed++;
  } catch (err) {
    log.error(`Profiles table test failed: ${err.message}`);
    testResults.failed++;
  }
}

async function testUserCreditsTable() {
  log.header('Testing User Credits Table');
  
  try {
    const { data, error } = await supabase
      .from('user_credits')
      .select('user_id, credits')
      .limit(1);
    
    if (error && error.code === 'PGRST116') {
      log.error('User credits table does not exist');
      log.info('Fix: Run the definitive auth migration');
      testResults.failed++;
      return;
    }
    
    if (error) {
      log.warning(`User credits table query error: ${error.message}`);
      testResults.warnings++;
      return;
    }
    
    log.success('User credits table exists and is accessible');
    testResults.passed++;
  } catch (err) {
    log.error(`User credits table test failed: ${err.message}`);
    testResults.failed++;
  }
}

function testEnvironmentVariables() {
  log.header('Testing Environment Variables');
  
  const requiredVars = [
    { name: 'VITE_SUPABASE_URL', value: SUPABASE_URL, critical: true },
    { name: 'VITE_SUPABASE_ANON_KEY', value: SUPABASE_ANON_KEY, critical: true },
    { name: 'VITE_GOOGLE_CLIENT_ID', value: GOOGLE_CLIENT_ID, critical: true },
    { name: 'VITE_SITE_URL', value: SITE_URL, critical: false }
  ];

  for (const varCheck of requiredVars) {
    if (!varCheck.value) {
      if (varCheck.critical) {
        log.error(`Missing critical environment variable: ${varCheck.name}`);
        testResults.failed++;
      } else {
        log.warning(`Missing optional environment variable: ${varCheck.name}`);
        testResults.warnings++;
      }
    } else {
      // Don't log the full key values for security
      const displayValue = varCheck.value.length > 20 
        ? varCheck.value.substring(0, 20) + '...' 
        : varCheck.value;
      log.success(`${varCheck.name}: ${displayValue}`);
      testResults.passed++;
    }
  }

  // Check site URL format
  if (SITE_URL.includes('localhost') && process.env.NODE_ENV === 'production') {
    log.warning('SITE_URL is localhost but NODE_ENV is production');
    testResults.warnings++;
  }
}

function testOAuthConfiguration() {
  log.header('Testing OAuth Configuration');
  
  if (!GOOGLE_CLIENT_ID) {
    log.error('Google Client ID not configured');
    testResults.failed++;
    return;
  }

  if (GOOGLE_CLIENT_ID.includes('apps.googleusercontent.com')) {
    log.success('Google Client ID format looks correct');
    testResults.passed++;
  } else {
    log.warning('Google Client ID format may be incorrect');
    testResults.warnings++;
  }

  // Check if using localhost in production
  if (SITE_URL.includes('localhost') && process.env.NODE_ENV === 'production') {
    log.error('OAuth will fail - localhost URLs in production environment');
    log.info('Fix: Update VITE_SITE_URL and Google OAuth redirect URIs to production domain');
    testResults.failed++;
  } else {
    log.success('Site URL configuration looks appropriate for environment');
    testResults.passed++;
  }
}

async function testSessionDetection() {
  log.header('Testing Session Detection Configuration');
  
  // This is a simplified test - in a real app, you'd test the actual client config
  log.info('Note: Session detection should be enabled (detectSessionInUrl: true)');
  log.info('Manual check: Verify src/integrations/supabase/client.ts has detectSessionInUrl: true');
  testResults.warnings++; // Mark as warning since we can't automatically verify
}

function displayResults() {
  log.header('Test Results Summary');
  
  console.log(`${colors.green}✅ Passed: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Warnings: ${testResults.warnings}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${testResults.failed}${colors.reset}`);
  
  const total = testResults.passed + testResults.warnings + testResults.failed;
  const successRate = ((testResults.passed / total) * 100).toFixed(1);
  
  console.log(`\n${colors.bold}Success Rate: ${successRate}%${colors.reset}`);
  
  if (testResults.failed === 0) {
    log.success('🎉 Authentication system is ready for production!');
    log.info('Next steps: Deploy and test actual user flows');
  } else {
    log.error('🚨 Authentication system has critical issues');
    log.error('Fix all failed tests before deploying to production');
    log.info('Refer to PRODUCTION_DEPLOYMENT_GUIDE.md for detailed fixes');
  }

  if (testResults.warnings > 0) {
    log.warning('⚠️  Some items require manual verification');
    log.info('Check warnings and verify manually before going live');
  }
}

async function main() {
  console.log(`${colors.bold}${colors.blue}`);
  console.log('🌾 CropGenius Authentication System Verification');
  console.log('================================================');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Site URL: ${SITE_URL}`);
  console.log(`${colors.reset}\n`);

  await initializeSupabase();
  
  // Run all tests
  await testSupabaseConnection();
  testEnvironmentVariables();
  testOAuthConfiguration();
  await testDatabaseTriggers();
  await testProfilesTable();
  await testUserCreditsTable();
  await testSessionDetection();
  
  displayResults();
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Handle errors gracefully
process.on('uncaughtException', (err) => {
  log.error(`Uncaught exception: ${err.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log.error(`Unhandled rejection: ${reason}`);
  process.exit(1);
});

// Run the verification
main().catch(err => {
  log.error(`Verification failed: ${err.message}`);
  process.exit(1);
});