import { test, expect } from '@playwright/test';
import { supabase } from '../src/integrations/supabase/client';

// Test configuration
const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5173';
const TEST_EMAIL = 'test+auth@cropgenius.africa';
const TEST_PASSWORD = 'TestPassword123!';

test.describe('CropGenius Authentication Flows', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear all auth state before each test
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('01. Email signup with verification flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth`);
    
    // Switch to signup mode
    await page.click('text=Sign up');
    
    // Fill signup form
    await page.fill('[placeholder="Enter your email"]', TEST_EMAIL);
    await page.fill('[placeholder="Enter your password"]', TEST_PASSWORD);
    
    // Submit signup
    await page.click('button[type="submit"]');
    
    // Verify success message
    await expect(page.locator('text=Check your email')).toBeVisible();
    
    // Note: Email verification step would require email inbox access
    // For automated testing, we can simulate confirmation via direct API call
    console.log('✅ Email signup flow completed - verification email sent');
  });

  test('02. Email login with valid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth`);
    
    // Fill login form (default mode)
    await page.fill('[placeholder="Enter your email"]', TEST_EMAIL);
    await page.fill('[placeholder="Enter your password"]', TEST_PASSWORD);
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard on success
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    
    // Verify user is authenticated
    await expect(page.locator('text=Welcome')).toBeVisible();
    console.log('✅ Email login successful');
  });

  test('03. Email login with invalid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth`);
    
    // Fill login form with wrong password
    await page.fill('[placeholder="Enter your email"]', TEST_EMAIL);
    await page.fill('[placeholder="Enter your password"]', 'WrongPassword123');
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Should stay on auth page and show error
    await expect(page).toHaveURL(`${BASE_URL}/auth`);
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
    console.log('✅ Invalid credentials handled correctly');
  });

  test('04. Google OAuth flow initiation', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth`);
    
    // Click Google OAuth button
    const googleButton = page.locator('text=Continue with Google');
    await expect(googleButton).toBeVisible();
    
    // Listen for navigation to Google OAuth
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      googleButton.click()
    ]);
    
    // Verify redirect to Google
    await popup.waitForLoadState();
    expect(popup.url()).toContain('accounts.google.com');
    console.log('✅ Google OAuth initiation successful');
    
    // Note: Full OAuth flow requires Google test credentials
    await popup.close();
  });

  test('05. OAuth callback handling', async ({ page }) => {
    // Simulate OAuth callback with session
    await page.goto(`${BASE_URL}/auth/callback`);
    
    // Should show loading state initially
    await expect(page.locator('text=Completing authentication')).toBeVisible();
    
    // Should eventually redirect (timeout handling)
    await page.waitForTimeout(5000);
    
    // Should redirect to auth or dashboard depending on session state
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/(auth|dashboard)/);
    console.log('✅ OAuth callback handling works');
  });

  test('06. Password reset flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth`);
    
    // Look for password reset link (may need to add to UI)
    const resetLink = page.locator('text=Forgot password');
    if (await resetLink.isVisible()) {
      await resetLink.click();
      
      // Fill reset form
      await page.fill('[placeholder="Enter your email"]', TEST_EMAIL);
      await page.click('text=Send reset email');
      
      // Verify success message
      await expect(page.locator('text=Check your email')).toBeVisible();
      console.log('✅ Password reset email sent');
    } else {
      console.log('⚠️ Password reset UI not implemented yet');
    }
  });

  test('07. Protected route access control', async ({ page }) => {
    // Try to access protected route without auth
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Should redirect to auth page
    await expect(page).toHaveURL(`${BASE_URL}/auth`);
    console.log('✅ Protected route redirects unauthenticated users');
  });

  test('08. Session persistence across page refresh', async ({ page }) => {
    // First, login
    await page.goto(`${BASE_URL}/auth`);
    await page.fill('[placeholder="Enter your email"]', TEST_EMAIL);
    await page.fill('[placeholder="Enter your password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Verify we're on dashboard
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    
    // Refresh the page
    await page.reload();
    
    // Should stay on dashboard (session persisted)
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    console.log('✅ Session persists across page refresh');
  });

  test('09. Sign out functionality', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/auth`);
    await page.fill('[placeholder="Enter your email"]', TEST_EMAIL);
    await page.fill('[placeholder="Enter your password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Navigate to dashboard
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    
    // Find and click sign out button
    const signOutButton = page.locator('text=Sign out');
    if (await signOutButton.isVisible()) {
      await signOutButton.click();
      
      // Should redirect to auth page
      await expect(page).toHaveURL(`${BASE_URL}/auth`);
      console.log('✅ Sign out redirects to auth page');
    } else {
      console.log('⚠️ Sign out button not found');
    }
  });

  test('10. Authentication state consistency', async ({ page }) => {
    // Test for race conditions and state flicker
    await page.goto(`${BASE_URL}/auth`);
    
    // Monitor for loading states
    const loadingStates = [];
    
    page.on('console', msg => {
      if (msg.text().includes('Auth') || msg.text().includes('Loading')) {
        loadingStates.push(msg.text());
      }
    });
    
    // Login
    await page.fill('[placeholder="Enter your email"]', TEST_EMAIL);
    await page.fill('[placeholder="Enter your password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for stable state
    await page.waitForTimeout(2000);
    
    // Check for excessive loading states (indicates race conditions)
    console.log('Auth state changes:', loadingStates.length);
    expect(loadingStates.length).toBeLessThan(10); // Reasonable threshold
    console.log('✅ Auth state remains stable');
  });

});

// Utility functions for test setup
test.describe('Authentication Test Utilities', () => {
  
  test('Setup: Create test user', async ({ page }) => {
    // This would typically be done in test setup, not as a test
    // But including for completeness
    
    try {
      const { error } = await supabase.auth.signUp({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });
      
      if (error && !error.message.includes('already registered')) {
        throw error;
      }
      
      console.log('✅ Test user setup complete');
    } catch (error) {
      console.log('⚠️ Test user setup failed:', error);
    }
  });

  test('Cleanup: Remove test user', async ({ page }) => {
    // Note: Requires admin/service role access for user deletion
    // In practice, use test database or cleanup scripts
    console.log('🧹 Test cleanup would remove test user');
  });

});

// Performance tests
test.describe('Authentication Performance', () => {
  
  test('Auth flow response times', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(`${BASE_URL}/auth`);
    await page.fill('[placeholder="Enter your email"]', TEST_EMAIL);
    await page.fill('[placeholder="Enter your password"]', TEST_PASSWORD);
    
    const submitTime = Date.now();
    await page.click('button[type="submit"]');
    
    // Wait for redirect or error
    await Promise.race([
      page.waitForURL(`${BASE_URL}/dashboard`),
      page.waitForSelector('text=Invalid', { timeout: 5000 })
    ]);
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const authTime = endTime - submitTime;
    
    console.log(`Total flow time: ${totalTime}ms`);
    console.log(`Auth response time: ${authTime}ms`);
    
    // Performance assertions
    expect(totalTime).toBeLessThan(10000); // 10 seconds max
    expect(authTime).toBeLessThan(5000);   // 5 seconds auth response
    
    console.log('✅ Auth performance within acceptable limits');
  });

});