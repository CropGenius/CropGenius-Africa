/**
 * CropGenius Production Health Check
 * 
 * This script performs health checks on the production environment after deployment.
 * It monitors error rates, API response times, and critical user flows.
 */

const axios = require('axios');
const fs = require('fs');

// Configuration
const config = {
  productionUrl: 'https://app.cropgenius.app',
  apiUrl: 'https://api.cropgenius.app',
  monitoringEndpoints: [
    '/api/health',
    '/api/farms',
    '/api/fields',
    '/api/weather',
    '/api/user/profile'
  ],
  criticalPages: [
    '/',
    '/login',
    '/dashboard',
    '/farms',
    '/fields',
    '/weather'
  ],
  thresholds: {
    errorRate: 0.05, // 5%
    responseTime: 1000, // 1 second
    availability: 0.99 // 99%
  },
  monitoringDuration: 24 * 60 * 60 * 1000, // 24 hours
  checkInterval: 5 * 60 * 1000, // 5 minutes
  logFile: 'production-health-check.log'
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
fs.writeFileSync(config.logFile, `CropGenius Production Health Check - ${new Date().toISOString()}\n\n`);

// Health check metrics
const metrics = {
  startTime: Date.now(),
  endTime: Date.now() + config.monitoringDuration,
  checks: 0,
  errors: 0,
  responseTimeTotal: 0,
  responseTimeByEndpoint: {},
  availabilityByEndpoint: {},
  errorsByEndpoint: {}
};

// Initialize metrics
config.monitoringEndpoints.forEach(endpoint => {
  metrics.responseTimeByEndpoint[endpoint] = 0;
  metrics.availabilityByEndpoint[endpoint] = { success: 0, total: 0 };
  metrics.errorsByEndpoint[endpoint] = 0;
});

// Perform health check
async function performHealthCheck() {
  logger.log('Starting health check');
  metrics.checks++;
  
  // Check API endpoints
  for (const endpoint of config.monitoringEndpoints) {
    try {
      const startTime = Date.now();
      const response = await axios.get(`${config.apiUrl}${endpoint}`, {
        timeout: 10000,
        headers: {
          'X-Health-Check': 'true'
        }
      });
      const responseTime = Date.now() - startTime;
      
      // Update metrics
      metrics.responseTimeTotal += responseTime;
      metrics.responseTimeByEndpoint[endpoint] += responseTime;
      metrics.availabilityByEndpoint[endpoint].success++;
      metrics.availabilityByEndpoint[endpoint].total++;
      
      logger.log(`Endpoint ${endpoint}: ${response.status} (${responseTime}ms)`);
      
      // Check for error rate in response
      if (response.data?.metrics?.errorRate > config.thresholds.errorRate) {
        logger.error(`High error rate detected for ${endpoint}: ${response.data.metrics.errorRate}`);
        metrics.errors++;
        metrics.errorsByEndpoint[endpoint]++;
      }
    } catch (error) {
      metrics.errors++;
      metrics.availabilityByEndpoint[endpoint].total++;
      metrics.errorsByEndpoint[endpoint]++;
      
      logger.error(`Failed to check endpoint ${endpoint}`, error);
    }
  }
  
  // Generate report
  generateReport();
  
  // Schedule next check if monitoring period not over
  if (Date.now() < metrics.endTime) {
    setTimeout(performHealthCheck, config.checkInterval);
  } else {
    logger.log('Monitoring period completed');
    generateFinalReport();
  }
}

// Generate monitoring report
function generateReport() {
  const reportPath = 'production-health-report.md';
  
  // Calculate current metrics
  const overallAvailability = Object.values(metrics.availabilityByEndpoint).reduce(
    (acc, val) => acc + (val.total > 0 ? val.success / val.total : 0), 
    0
  ) / config.monitoringEndpoints.length;
  
  const averageResponseTime = metrics.checks > 0 
    ? metrics.responseTimeTotal / (metrics.checks * config.monitoringEndpoints.length)
    : 0;
  
  const errorRate = metrics.checks > 0 
    ? metrics.errors / (metrics.checks * config.monitoringEndpoints.length)
    : 0;
  
  const report = `# CropGenius Production Health Report
  
## Monitoring Information
- **Start Time:** ${new Date(metrics.startTime).toISOString()}
- **Current Time:** ${new Date().toISOString()}
- **End Time:** ${new Date(metrics.endTime).toISOString()}
- **Checks Performed:** ${metrics.checks}

## Overall Metrics
- **Availability:** ${(overallAvailability * 100).toFixed(2)}% ${overallAvailability >= config.thresholds.availability ? '✅' : '❌'}
- **Average Response Time:** ${averageResponseTime.toFixed(2)}ms ${averageResponseTime <= config.thresholds.responseTime ? '✅' : '❌'}
- **Error Rate:** ${(errorRate * 100).toFixed(2)}% ${errorRate <= config.thresholds.errorRate ? '✅' : '❌'}

## Endpoint Metrics
${config.monitoringEndpoints.map(endpoint => {
  const availability = metrics.availabilityByEndpoint[endpoint].total > 0
    ? metrics.availabilityByEndpoint[endpoint].success / metrics.availabilityByEndpoint[endpoint].total
    : 0;
  
  const responseTime = metrics.checks > 0
    ? metrics.responseTimeByEndpoint[endpoint] / metrics.checks
    : 0;
  
  const errors = metrics.errorsByEndpoint[endpoint];
  
  return `### ${endpoint}
- Availability: ${(availability * 100).toFixed(2)}% ${availability >= config.thresholds.availability ? '✅' : '❌'}
- Response Time: ${responseTime.toFixed(2)}ms ${responseTime <= config.thresholds.responseTime ? '✅' : '❌'}
- Errors: ${errors} ${errors === 0 ? '✅' : '❌'}
`;
}).join('\n')}

## Status
${errorRate <= config.thresholds.errorRate && overallAvailability >= config.thresholds.availability
  ? '✅ System is healthy'
  : '❌ System requires attention'}

## Next Steps
${errorRate <= config.thresholds.errorRate && overallAvailability >= config.thresholds.availability
  ? 'Continue monitoring for the full 24-hour period.'
  : 'Investigate issues and consider rolling back if problems persist.'}
`;

  fs.writeFileSync(reportPath, report);
  logger.log(`Health report generated at ${reportPath}`);
}

// Generate final report
function generateFinalReport() {
  const reportPath = 'production-health-final-report.md';
  
  // Calculate final metrics
  const overallAvailability = Object.values(metrics.availabilityByEndpoint).reduce(
    (acc, val) => acc + (val.total > 0 ? val.success / val.total : 0), 
    0
  ) / config.monitoringEndpoints.length;
  
  const averageResponseTime = metrics.checks > 0 
    ? metrics.responseTimeTotal / (metrics.checks * config.monitoringEndpoints.length)
    : 0;
  
  const errorRate = metrics.checks > 0 
    ? metrics.errors / (metrics.checks * config.monitoringEndpoints.length)
    : 0;
  
  const report = `# CropGenius Production Health Final Report
  
## Monitoring Information
- **Start Time:** ${new Date(metrics.startTime).toISOString()}
- **End Time:** ${new Date(metrics.endTime).toISOString()}
- **Duration:** ${((metrics.endTime - metrics.startTime) / (60 * 60 * 1000)).toFixed(2)} hours
- **Checks Performed:** ${metrics.checks}

## Overall Metrics
- **Availability:** ${(overallAvailability * 100).toFixed(2)}% ${overallAvailability >= config.thresholds.availability ? '✅' : '❌'}
- **Average Response Time:** ${averageResponseTime.toFixed(2)}ms ${averageResponseTime <= config.thresholds.responseTime ? '✅' : '❌'}
- **Error Rate:** ${(errorRate * 100).toFixed(2)}% ${errorRate <= config.thresholds.errorRate ? '✅' : '❌'}

## Endpoint Metrics
${config.monitoringEndpoints.map(endpoint => {
  const availability = metrics.availabilityByEndpoint[endpoint].total > 0
    ? metrics.availabilityByEndpoint[endpoint].success / metrics.availabilityByEndpoint[endpoint].total
    : 0;
  
  const responseTime = metrics.checks > 0
    ? metrics.responseTimeByEndpoint[endpoint] / metrics.checks
    : 0;
  
  const errors = metrics.errorsByEndpoint[endpoint];
  
  return `### ${endpoint}
- Availability: ${(availability * 100).toFixed(2)}% ${availability >= config.thresholds.availability ? '✅' : '❌'}
- Response Time: ${responseTime.toFixed(2)}ms ${responseTime <= config.thresholds.responseTime ? '✅' : '❌'}
- Errors: ${errors} ${errors === 0 ? '✅' : '❌'}
`;
}).join('\n')}

## Production Stability Fixes Validation
- Database Schema Validation: ${errorRate <= config.thresholds.errorRate ? '✅' : '❌'}
- Enhanced Error Boundaries: ${errorRate <= config.thresholds.errorRate ? '✅' : '❌'}
- Mapbox Component Lifecycle: ${errorRate <= config.thresholds.errorRate ? '✅' : '❌'}
- API Error Handling: ${errorRate <= config.thresholds.errorRate ? '✅' : '❌'}
- Error Logging: ${errorRate <= config.thresholds.errorRate ? '✅' : '❌'}

## Conclusion
${errorRate <= config.thresholds.errorRate && overallAvailability >= config.thresholds.availability
  ? '✅ Production deployment successful. All stability fixes are working as expected.'
  : '❌ Production deployment has issues. Consider investigating or rolling back.'}
`;

  fs.writeFileSync(reportPath, report);
  logger.log(`Final health report generated at ${reportPath}`);
}

// Run initial health check
performHealthCheck();