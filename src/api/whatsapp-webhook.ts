/**
 * 📱 WHATSAPP BUSINESS API WEBHOOK
 * Real-time message handling for African farmers
 * Processes incoming WhatsApp messages and sends intelligent responses
 */

import { handleIncomingMessage, type WhatsAppMessage } from '../agents/WhatsAppFarmingBot';

const WEBHOOK_VERIFY_TOKEN = import.meta.env.VITE_WHATSAPP_WEBHOOK_VERIFY_TOKEN;

/**
 * Handle WhatsApp webhook verification (GET request)
 */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  console.log('📱 WhatsApp webhook verification request:', { mode, token });

  // Verify the webhook
  if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
    console.log('✅ WhatsApp webhook verified successfully');
    return new Response(challenge, { status: 200 });
  } else {
    console.error('❌ WhatsApp webhook verification failed');
    return new Response('Forbidden', { status: 403 });
  }
}

/**
 * Handle incoming WhatsApp messages (POST request)
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    console.log('📱 Incoming WhatsApp webhook:', JSON.stringify(body, null, 2));

    // Verify this is a WhatsApp Business Account webhook
    if (body.object !== 'whatsapp_business_account') {
      console.warn('⚠️ Invalid webhook object type:', body.object);
      return new Response('Invalid webhook', { status: 400 });
    }

    // Process each entry in the webhook
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'messages') {
          // Process incoming messages
          for (const message of change.value.messages || []) {
            try {
              await processIncomingMessage(message, change.value);
            } catch (error) {
              console.error('❌ Error processing message:', error);
              // Continue processing other messages even if one fails
            }
          }

          // Process message status updates
          for (const status of change.value.statuses || []) {
            try {
              await processMessageStatus(status);
            } catch (error) {
              console.error('❌ Error processing status:', error);
            }
          }
        }
      }
    }

    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('❌ WhatsApp webhook error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

/**
 * Process incoming WhatsApp message
 */
async function processIncomingMessage(message: any, value: any): Promise<void> {
  console.log(`📨 Processing message from ${message.from}:`, message);

  // Convert WhatsApp API message format to our internal format
  const whatsappMessage: WhatsAppMessage = {
    from: message.from,
    id: message.id,
    timestamp: message.timestamp,
    type: message.type,
    text: message.text,
    image: message.image,
    location: message.location
  };

  // Handle the message using our farming bot
  try {
    const response = await handleIncomingMessage(whatsappMessage);
    console.log(`✅ Message processed successfully. Response: ${response.substring(0, 100)}...`);
  } catch (error) {
    console.error('❌ Error handling message:', error);
    
    // Send error response to user
    try {
      await sendErrorResponse(message.from);
    } catch (sendError) {
      console.error('❌ Failed to send error response:', sendError);
    }
  }
}

/**
 * Process message status updates (delivered, read, etc.)
 */
async function processMessageStatus(status: any): Promise<void> {
  console.log(`📊 Message status update:`, status);
  
  // Log message delivery status for analytics
  try {
    // You could store this in your database for analytics
    const statusData = {
      message_id: status.id,
      recipient_id: status.recipient_id,
      status: status.status,
      timestamp: status.timestamp,
      conversation_id: status.conversation?.id
    };
    
    console.log('📈 Message status logged:', statusData);
  } catch (error) {
    console.error('❌ Error logging message status:', error);
  }
}

/**
 * Send error response to user
 */
async function sendErrorResponse(phoneNumber: string): Promise<void> {
  const WHATSAPP_ACCESS_TOKEN = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN;
  const WHATSAPP_PHONE_NUMBER_ID = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID;

  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.warn('⚠️ WhatsApp credentials not configured for error response');
    return;
  }

  const errorMessage = `🤖 I'm sorry, I'm having trouble processing your request right now. Please try again in a few minutes or contact our support team.

🌱 CropGenius is here to help with:
• Crop disease identification
• Weather forecasts
• Market prices
• Farming advice

Type "help" for more options.`;

  try {
    const response = await fetch(`https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "text",
        text: { body: errorMessage }
      })
    });

    if (response.ok) {
      console.log('✅ Error response sent successfully');
    } else {
      console.error('❌ Failed to send error response:', response.status);
    }
  } catch (error) {
    console.error('❌ Error sending error response:', error);
  }
}

/**
 * Validate webhook signature (for production security)
 */
function validateWebhookSignature(body: string, signature: string): boolean {
  // In production, you should validate the webhook signature
  // using your app secret to ensure the request is from WhatsApp
  
  // const crypto = require('crypto');
  // const expectedSignature = crypto
  //   .createHmac('sha256', process.env.WHATSAPP_APP_SECRET)
  //   .update(body)
  //   .digest('hex');
  
  // return `sha256=${expectedSignature}` === signature;
  
  // For now, return true (implement proper validation in production)
  return true;
}

/**
 * Health check endpoint
 */
export async function healthCheck(): Promise<Response> {
  const WHATSAPP_ACCESS_TOKEN = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN;
  const WHATSAPP_PHONE_NUMBER_ID = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID;
  
  const status = {
    webhook: 'active',
    whatsapp_configured: !!(WHATSAPP_ACCESS_TOKEN && WHATSAPP_PHONE_NUMBER_ID),
    timestamp: new Date().toISOString()
  };
  
  return new Response(JSON.stringify(status), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}

console.log('📱 WhatsApp webhook handler loaded and ready');