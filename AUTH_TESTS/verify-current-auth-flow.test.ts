/**
 * 🧪 VERIFY CURRENT AUTHENTICATION FLOW
 * -------------------------------------------------------------
 * Simple test to verify the current authentication flow behavior
 * This test will help us understand if the fixes are working
 */

import { test, expect } from '@playwright/test';

test.describe('Verify Current Authentication Flow', () => {
  
  test('OAuth callback should redirect to dashboard', async ({ page }) => {
    // Navigate to OAuth callback URL (simulating OAuth completion)
    await page.goto('/auth/callback');
    
    // Wait for redirect
    await page.waitForTimeout(3000);
    
    // Check current URL
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Should redirect to dashboard (not onboarding)
    expect(currentUrl).toContain('/dashboard');
    expect(currentUrl).not.toContain('/onboarding');
  });

  test('Onboarding page should have skip functionality', async ({ page }) => {
    // Navigate to onboarding page
    await page.goto('/onboarding');
    
    // Check for skip button
    const skipButton = page.locator('text=Skip for now');
    const isVisible = await skipButton.isVisible();
    console.log('Skip button visible:', isVisible);
    
    // Skip button should be visible
    expect(isVisible).toBe(true);
    
    if (isVisible) {
      // Click skip button
      await skipButton.click();
      
      // Wait for redirect
      await page.waitForTimeout(2000);
      
      // Should redirect to dashboard
      const currentUrl = page.url();
      console.log('URL after skip:', currentUrl);
      expect(currentUrl).toContain('/dashboard');
    }
  });

  test('Protected routes should redirect unauthenticated users', async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Try to access protected route
    await page.goto('/dashboard');
    
    // Should redirect to auth page
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    console.log('URL for protected route:', currentUrl);
    
    expect(currentUrl).toContain('/auth');
  });
});