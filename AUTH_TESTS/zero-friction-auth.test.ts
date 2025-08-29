/**
 * 🧪 ZERO-FRICTION AUTHENTICATION VERIFICATION TEST
 * -------------------------------------------------------------
 * Deterministic test that proves the authentication fixes are working
 * This test MUST FAIL on the original code and PASS after fixes
 */

import { test, expect } from '@playwright/test';

test.describe('Zero-Friction Authentication Flow', () => {
  
  test('Google OAuth redirects to dashboard immediately', async ({ page }) => {
    // Navigate to auth page
    await page.goto('/auth');
    
    // This test would normally involve the Google OAuth flow
    // For verification purposes, we're testing the redirect behavior
    
    // Simulate OAuth callback (in a real test, this would be the actual OAuth flow)
    await page.goto('/auth/callback');
    
    // BEFORE FIX: This would redirect to /onboarding
    // AFTER FIX: This should redirect to /dashboard
    
    // Wait for redirect (with timeout)
    await Promise.race([
      page.waitForURL('/dashboard', { timeout: 5000 }),
      page.waitForURL('/onboarding', { timeout: 5000 })
    ]);
    
    // Verify we're on the dashboard (not onboarding)
    const currentUrl = page.url();
    expect(currentUrl).toContain('/dashboard');
    expect(currentUrl).not.toContain('/onboarding');
  });

  test('Onboarding page has skip functionality', async ({ page }) => {
    // Navigate to onboarding page
    await page.goto('/onboarding');
    
    // Verify skip button exists
    const skipButton = page.locator('text=Skip for now');
    await expect(skipButton).toBeVisible();
    
    // Click skip button
    await skipButton.click();
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('Onboarding form accepts minimal data', async ({ page }) => {
    // Navigate to onboarding page
    await page.goto('/onboarding');
    
    // Fill only farm name (all other fields optional)
    await page.fill('[placeholder="Enter your farm name (optional)"]', 'Test Farm');
    
    // Submit form
    await page.click('text=Complete Setup');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
  });
});