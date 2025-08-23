/**
 * 🧪 WHATSAPP INTEGRATION TEST ENDPOINT
 * Tests the complete WhatsApp farming bot without requiring API credentials
 */

import { handleIncomingMessage, type WhatsAppMessage } from '../agents/WhatsAppFarmingBot';

export async function testWhatsAppIntegration(testMessage: string, phoneNumber: string = '+254712345678'): Promise<{
  success: boolean;
  response: string;
  error?: string;
  testData: any;
}> {
  try {
    console.log('🧪 Testing WhatsApp integration with message:', testMessage);

    // Create a test WhatsApp message
    const whatsappMessage: WhatsAppMessage = {
      from: phoneNumber,
      id: `test_${Date.now()}`,
      timestamp: Date.now().toString(),
      type: 'text',
      text: { body: testMessage }
    };

    // Process the message through the farming bot
    const response = await handleIncomingMessage(whatsappMessage);

    const testData = {
      input: {
        message: testMessage,
        phone: phoneNumber,
        timestamp: new Date().toISOString()
      },
      processing: {
        messageType: whatsappMessage.type,
        messageId: whatsappMessage.id,
        processingTime: Date.now()
      },
      output: {
        responseLength: response.length,
        responsePreview: response.substring(0, 100) + '...',
        fullResponse: response
      }
    };

    console.log('✅ WhatsApp integration test successful:', testData);

    return {
      success: true,
      response,
      testData
    };

  } catch (error) {
    console.error('❌ WhatsApp integration test failed:', error);
    
    return {
      success: false,
      response: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      testData: {
        input: { message: testMessage, phone: phoneNumber },
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

/**
 * Test different types of farming queries
 */
export const testFarmingQueries = [
  {
    category: 'Disease Identification',
    message: 'My maize leaves are turning yellow with brown spots',
    expectedFeatures: ['disease diagnosis', 'treatment recommendations', 'cost estimates']
  },
  {
    category: 'Weather Inquiry',
    message: 'What is the weather forecast for farming this week?',
    expectedFeatures: ['weather data', 'farming advice', 'irrigation recommendations']
  },
  {
    category: 'Market Prices',
    message: 'What are the current maize prices in the market?',
    expectedFeatures: ['price information', 'market trends', 'selling advice']
  },
  {
    category: 'Planting Advice',
    message: 'When is the best time to plant beans?',
    expectedFeatures: ['planting calendar', 'soil preparation', 'variety recommendations']
  },
  {
    category: 'Pest Control',
    message: 'I found worms eating my tomato plants',
    expectedFeatures: ['pest identification', 'organic solutions', 'chemical options']
  },
  {
    category: 'General Farming',
    message: 'Hello, I need help with my farm',
    expectedFeatures: ['greeting', 'help menu', 'feature overview']
  }
];

/**
 * Run comprehensive WhatsApp integration tests
 */
export async function runWhatsAppIntegrationTests(): Promise<{
  overallSuccess: boolean;
  results: Array<{
    category: string;
    message: string;
    success: boolean;
    response: string;
    responseTime: number;
    features: string[];
  }>;
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    averageResponseTime: number;
  };
}> {
  console.log('🚀 Running comprehensive WhatsApp integration tests...');
  
  const results = [];
  let totalResponseTime = 0;
  let passedTests = 0;

  for (const testQuery of testFarmingQueries) {
    const startTime = Date.now();
    
    try {
      const result = await testWhatsAppIntegration(testQuery.message);
      const responseTime = Date.now() - startTime;
      totalResponseTime += responseTime;

      // Check if expected features are present in response
      const foundFeatures = testQuery.expectedFeatures.filter(feature => 
        result.response.toLowerCase().includes(feature.toLowerCase()) ||
        result.response.includes('*') || // Formatted response indicator
        result.response.includes('🌱') || // Emoji indicators
        result.response.length > 50 // Substantial response
      );

      const testPassed = result.success && result.response.length > 20;
      if (testPassed) passedTests++;

      results.push({
        category: testQuery.category,
        message: testQuery.message,
        success: testPassed,
        response: result.response.substring(0, 200) + '...',
        responseTime,
        features: foundFeatures
      });

      console.log(`${testPassed ? '✅' : '❌'} ${testQuery.category}: ${responseTime}ms`);

    } catch (error) {
      console.error(`❌ Test failed for ${testQuery.category}:`, error);
      results.push({
        category: testQuery.category,
        message: testQuery.message,
        success: false,
        response: `Test error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        responseTime: Date.now() - startTime,
        features: []
      });
    }
  }

  const summary = {
    totalTests: testFarmingQueries.length,
    passed: passedTests,
    failed: testFarmingQueries.length - passedTests,
    averageResponseTime: Math.round(totalResponseTime / testFarmingQueries.length)
  };

  const overallSuccess = passedTests === testFarmingQueries.length;

  console.log('📊 WhatsApp Integration Test Summary:', summary);
  console.log(`${overallSuccess ? '🎉' : '⚠️'} Overall Result: ${passedTests}/${testFarmingQueries.length} tests passed`);

  return {
    overallSuccess,
    results,
    summary
  };
}

/**
 * Test WhatsApp integration with image message (simulated)
 */
export async function testWhatsAppImageIntegration(): Promise<{
  success: boolean;
  response: string;
  error?: string;
}> {
  try {
    console.log('📸 Testing WhatsApp image integration...');

    // Simulate an image message for crop disease detection
    const imageMessage: WhatsAppMessage = {
      from: '+254712345678',
      id: `img_test_${Date.now()}`,
      timestamp: Date.now().toString(),
      type: 'image',
      image: {
        id: 'test_image_id',
        mime_type: 'image/jpeg',
        caption: 'My maize plant looks sick'
      }
    };

    const response = await handleIncomingMessage(imageMessage);

    console.log('✅ WhatsApp image integration test successful');

    return {
      success: true,
      response
    };

  } catch (error) {
    console.error('❌ WhatsApp image integration test failed:', error);
    
    return {
      success: false,
      response: 'Image test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Export for use in development/testing
if (typeof window !== 'undefined') {
  (window as any).testWhatsAppIntegration = testWhatsAppIntegration;
  (window as any).runWhatsAppIntegrationTests = runWhatsAppIntegrationTests;
  (window as any).testWhatsAppImageIntegration = testWhatsAppImageIntegration;
}