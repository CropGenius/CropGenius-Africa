/**
 * CropGenius Staging Validation Script
 * 
 * This script performs validation tests on the staging environment to verify
 * that the production stability fixes are working correctly.
 */

const { chromium } = require('playwright');
const axios = require('axios');
const fs = require('fs');

// Configuration
const config = {
  stagingUrl: 'https://staging.cropgenius.app',
  apiUrl: 'https://api-staging.cropgenius.app',
  testUser: {
    email: 'test@cropgenius.app',
    password: 'TestPassword123'
  },
  logFile: 'staging-validation.log'
};

// Logger
const logger = {
  log: (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    fs.appendFileSync(config.logFile, logMessage + '\n');
  },
  error: (message, error) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ERROR: ${message}\n${error?.stack || error}`;
    console.error(logMessage);
    fs.appendFileSync(config.logFile, logMessage + '\n');
  }
};

// Initialize log file
fs.writeFileSync(config.logFile, `CropGenius Staging Validation - ${new Date().toISOString()}\n\n`);

// Test results
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0
};

// Test runner
async function runTest(name, testFn) {
  testResults.total++;
  logger.log(`Running test: ${name}`);
  
  try {
    await testFn();
    testResults.passed++;
    logger.log(`✅ Test passed: ${name}`);
    return true;
  } catch (error) {
    testResults.failed++;
    logger.error(`❌ Test failed: ${name}`, error);
    return false;
  }
}

// Skip test
function skipTest(name, reason) {
  testResults.total++;
  testResults.skipped++;
  logger.log(`⚠️ Test skipped: ${name} - ${reason}`);
}

// Main validation function
async function validateStaging() {
  let browser;
  
  try {
    logger.log('Starting staging validation');
    
    // Launch browser
    browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Test 1: Application loads without errors
    await runTest('Application loads without errors', async () => {
      await page.goto(config.stagingUrl);
      await page.waitForSelector('h1');
      
      // Check for error messages
      const errorElements = await page.$$('.error-message');
      if (errorElements.length > 0) {
        throw new Error('Error messages found on page load');
      }
      
      // Check console for errors
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // Wait for any potential errors
      await page.waitForTimeout(2000);
      
      if (consoleErrors.length > 0) {
        throw new Error(`Console errors found: ${consoleErrors.join(', ')}`);
      }
    });
    
    // Test 2: Login works correctly
    await runTest('Login functionality', async () => {
      await page.goto(`${config.stagingUrl}/login`);
      await page.fill('input[type="email"]', config.testUser.email);
      await page.fill('input[type="password"]', config.testUser.password);
      await page.click('button[type="submit"]');
      
      // Wait for dashboard to load
      await page.waitForSelector('.dashboard', { timeout: 10000 });
      
      // Verify user is logged in
      const userProfileElement = await page.$('.user-profile');
      if (!userProfileElement) {
        throw new Error('User profile element not found after login');
      }
    });
    
    // Test 3: Error boundaries work correctly
    await runTest('Error boundaries catch errors', async () => {
      // Navigate to a page with error boundaries
      await page.goto(`${config.stagingUrl}/debug/error-test`);
      
      // Trigger an error
      await page.click('#trigger-error-button');
      
      // Check that error boundary caught the error
      await page.waitForSelector('.error-boundary-fallback');
      
      // Verify error boundary content
      const errorMessage = await page.textContent('.error-boundary-fallback');
      if (!errorMessage.includes('Something went wrong')) {
        throw new Error('Error boundary fallback not displayed correctly');
      }
      
      // Test error recovery
      await page.click('.error-boundary-fallback button');
      
      // Verify component recovered
      await page.waitForSelector('#recovered-component');
    });
    
    // Test 4: API error handling and retry logic
    await runTest('API error handling and retry', async () => {
      // Use axios to test API error handling
      try {
        await axios.get(`${config.apiUrl}/api/test-error-handling`, {
          headers: {
            'X-Test-Error': 'timeout',
            'Authorization': `Bearer ${await getAuthToken(page)}`
          }
        });
      } catch (error) {
        // Expected to fail, check retry headers
        if (!error.response?.headers['x-retry-attempt']) {
          throw new Error('API retry mechanism not working');
        }
      }
      
      // Test successful retry
      const response = await axios.get(`${config.apiUrl}/api/test-error-handling`, {
        headers: {
          'X-Test-Error': 'retry-success',
          'Authorization': `Bearer ${await getAuthToken(page)}`
        }
      });
      
      if (response.status !== 200 || !response.headers['x-retry-success']) {
        throw new Error('API retry success mechanism not working');
      }
    });
    
    // Test 5: Schema validation
    await runTest('Database schema validation', async () => {
      // Navigate to farm health page
      await page.goto(`${config.stagingUrl}/farms/123/health`);
      
      // Wait for data to load
      await page.waitForSelector('.farm-health-score');
      
      // Check console for schema validation messages
      const consoleMessages = [];
      page.on('console', msg => {
        if (msg.text().includes('[SchemaValidator]')) {
          consoleMessages.push(msg.text());
        }
      });
      
      // Trigger a schema validation
      await page.click('#refresh-farm-health');
      
      // Wait for validation to complete
      await page.waitForTimeout(2000);
      
      // Verify schema validation occurred
      if (consoleMessages.length === 0) {
        throw new Error('No schema validation messages found in console');
      }
    });
    
    // Test 6: Offline mode
    await runTest('Offline mode functionality', async () => {
      // Navigate to fields page
      await page.goto(`${config.stagingUrl}/fields`);
      
      // Wait for data to load
      await page.waitForSelector('.field-list-item');
      
      // Simulate offline mode
      await page.evaluate(() => {
        window.dispatchEvent(new Event('offline'));
      });
      
      // Wait for offline banner to appear
      await page.waitForSelector('.offline-banner');
      
      // Verify cached data is used
      const fieldCount = await page.$$eval('.field-list-item', items => items.length);
      if (fieldCount === 0) {
        throw new Error('No cached field data displayed in offline mode');
      }
      
      // Restore online mode
      await page.evaluate(() => {
        window.dispatchEvent(new Event('online'));
      });
      
      // Wait for online notification
      await page.waitForSelector('.online-notification');
    });
    
    // Test 7: Production monitoring dashboard
    await runTest('Production monitoring dashboard', async () => {
      // Navigate to monitoring dashboard
      await page.goto(`${config.stagingUrl}/admin/monitoring`);
      
      // Wait for dashboard to load
      await page.waitForSelector('.monitoring-dashboard');
      
      // Check error metrics are displayed
      await page.waitForSelector('.error-metrics');
      
      // Check performance metrics are displayed
      await page.waitForSelector('.performance-metrics');
      
      // Test refresh functionality
      await page.click('#refresh-metrics');
      
      // Verify data was refreshed
      await page.waitForSelector('.last-updated');
    });
    
    // Generate validation report
    generateValidationReport();
    
    logger.log('Staging validation completed');
    return testResults.failed === 0;
  } catch (error) {
    logger.error('Validation process failed', error);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Helper function to get auth token
async function getAuthToken(page) {
  return await page.evaluate(() => {
    return localStorage.getItem('auth_token');
  });
}

// Generate validation report
function generateValidationReport() {
  const reportPath = 'staging-validation-report.md';
  
  const report = `# CropGenius Staging Validation Report
  
## Validation Information
- **Date:** ${new Date().toISOString()}
- **Environment:** Staging
- **URL:** ${config.stagingUrl}

## Test Results
- **Total Tests:** ${testResults.total}
- **Passed:** ${testResults.passed}
- **Failed:** ${testResults.failed}
- **Skipped:** ${testResults.skipped}

## Validation Status
${testResults.failed === 0 ? '✅ All tests passed' : '❌ Some tests failed'}

## Detailed Results
1. Application loads without errors: ${testResults.passed > 0 ? '✅' : '❌'}
2. Login functionality: ${testResults.passed > 1 ? '✅' : '❌'}
3. Error boundaries catch errors: ${testResults.passed > 2 ? '✅' : '❌'}
4. API error handling and retry: ${testResults.passed > 3 ? '✅' : '❌'}
5. Database schema validation: ${testResults.passed > 4 ? '✅' : '❌'}
6. Offline mode functionality: ${testResults.passed > 5 ? '✅' : '❌'}
7. Production monitoring dashboard: ${testResults.passed > 6 ? '✅' : '❌'}

## Recommendations
${testResults.failed === 0 
  ? 'The application is stable and ready for production deployment.' 
  : 'Fix the failed tests before proceeding with production deployment.'}
`;

  fs.writeFileSync(reportPath, report);
  logger.log(`Validation report generated at ${reportPath}`);
}

// Run validation
validateStaging().then(success => {
  if (success) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});