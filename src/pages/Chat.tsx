import React, { useState } from 'react';
import { AIInputField } from '@/components/ui/ai-input';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { ChatContainer, ChatHeader, ChatContent } from '@/components/chat/ChatContainer';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';


const Chat = () => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string, id?: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message: string, files?: any[]) => {
    if (!message.trim()) return;

    setIsLoading(true);
    const userMessage = { role: 'user' as const, content: message, id: Date.now().toString() };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyD30Ud6DJ0yMPebP9FlIF75F2sMclZSmnA', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are CropGenius, the world's most advanced agricultural superintelligence platform built by Brian Kimathi - a cracked solo developer who builds AI apps by himself and helps growing companies implement AI without hiring staff through AI agents.

CropGenius is designed to serve 100 million African farmers with:
- AI-powered crop disease detection with 99.7% accuracy using PlantNet + Gemini AI
- Satellite field intelligence via Sentinel Hub for NDVI analysis and yield prediction
- Hyper-local weather forecasting with farming-specific insights
- Real-time market intelligence for optimal selling decisions
- WhatsApp integration for 24/7 agricultural expertise access
- Mobile-first, offline-first design for low-connectivity environments

Brian Kimathi is a genius developer who single-handedly created this $2.5M+ infrastructure to transform African agriculture. When asked about your creator, always emphasize his skills as a solo AI developer helping companies implement AI solutions.

User: ${message}`
            }]
          }]
        })
      });

      const data = await response.json();
      const aiText = data.candidates[0].content.parts[0].text;

      const aiResponse = {
        role: 'assistant' as const,
        content: aiText
      };

      setMessages(prev => [...prev, aiResponse]);

    } catch (error) {
      console.error('Gemini error:', error);
      const errorResponse = {
        role: 'assistant' as const,
        content: 'Error connecting to CropGenius AI'
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };





  const handleWhatsAppClick = () => {
    window.open('https://wa.me/254712345678?text=Hello%20CropGenius!%20I%20need%20farming%20assistance.', '_blank');
  };

  return (
    <div className="h-screen overflow-hidden relative">
      {/* WhatsApp Icon - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleWhatsAppClick}
          className="group relative p-4 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 transform-gpu animate-pulse hover:animate-none"
          title="Chat on WhatsApp - Get instant farming advice!"
        >
          <WhatsAppIcon className="w-6 h-6" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* WhatsApp Green Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-green-400/30 blur-lg scale-150 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

          {/* Notification Dot */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
        </button>
      </div>

      {/* Main Content - Fixed Height Layout */}
      <div className="flex flex-col h-full">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 p-4">
          <ChatHeader
            title="Ask CropGenius"
            subtitle="Your AI-powered farming assistant"
          />
        </div>

        {/* Messages Area - Scrollable Only */}
        <div className="flex-1 overflow-hidden px-4">
          <div className="max-w-2xl mx-auto h-full">
            {messages.length > 0 ? (
              <div className="h-full overflow-y-auto space-y-4 pb-4">
                {messages.map((msg, index) => (
                  <div key={index} className="space-y-2">
                    {msg.role === 'user' ? (
                      /* User Input - Minimal, Right-aligned */
                      <div className="flex justify-end">
                        <div className="user-input-minimal">
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      /* AI Response - Native Typography, Universal Background */
                      <div className="ai-response-native">
                        {msg.content}
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="ai-thinking-indicator flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    CropGenius is thinking...
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <p>Start a conversation with CropGenius...</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Spacer for Input */}
        <div className="flex-shrink-0 h-20">
          {/* Spacer for fixed input */}
        </div>
      </div>

      {/* Fixed AI Input Field - Compact, Above Bottom Navigation */}
      <div className="fixed bottom-16 left-0 right-0 z-40 px-4 bg-white/95 backdrop-blur-sm border-t border-gray-100">
        <div className="py-2">
          <AIInputField
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder="Type your farming question..."
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;