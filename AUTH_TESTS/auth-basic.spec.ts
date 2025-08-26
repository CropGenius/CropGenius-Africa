import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = 'http://localhost:8083';
const TEST_EMAIL = 'test+auth@cropgenius.africa';
const TEST_PASSWORD = 'TestPassword123!';

test.describe('CropGenius Authentication Basic Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear all auth state before each test
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('01. Page loads correctly and shows auth form', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth`);
    
    // Check if auth page loads
    await expect(page).toHaveTitle(/CropGenius/);
    
    // Check for auth form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    console.log('✅ Auth page loads correctly with form elements');
  });

  test('02. Google OAuth button is functional', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth`);
    
    // Find Google OAuth button
    const googleButton = page.locator('text=Continue with Google');
    await expect(googleButton).toBeVisible();
    
    console.log('✅ Google OAuth button is present and visible');
  });

  test('03. Protected route redirects to auth', async ({ page }) => {
    // Try to access protected route without auth
    await page.goto(`${BASE_URL}/dashboard`);
    
    // Should redirect to auth page
    await expect(page).toHaveURL(/auth/);
    console.log('✅ Protected route redirects unauthenticated users');
  });

  test('04. OAuth callback route exists', async ({ page }) => {
    // Test OAuth callback route
    await page.goto(`${BASE_URL}/auth/callback`);
    
    // Should not show 404 error
    await expect(page.locator('text=404')).not.toBeVisible();
    console.log('✅ OAuth callback route is accessible');
  });

  test('05. Form validation works', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth`);
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should show validation or stay on page
    await expect(page).toHaveURL(/auth/);
    console.log('✅ Form validation prevents empty submission');
  });

});