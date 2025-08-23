import React, { useState, useEffect } from 'react';
import { AIInputField } from '@/components/ui/ai-input';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';
import { ChatContainer, ChatHeader, ChatContent } from '@/components/chat/ChatContainer';
import { LoaderFive } from '@/components/ui/loader';
import { toast } from 'sonner';
import { WhatsAppIntegration } from '@/components/communication/WhatsAppIntegration';
import { WhatsAppSetup } from '@/components/communication/WhatsAppSetup';
import { ProductionWhatsAppBot } from '@/agents/ProductionWhatsAppBot';
import { handleIncomingMessage } from '@/agents/WhatsAppFarmingBot';
import { testWhatsAppIntegration, testFarmingQueries } from '@/utils/whatsappTesting';
import { supabase } from '@/integrations/supabase/client';


const Chat = () => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string, id?: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [whatsappBot] = useState(() => new ProductionWhatsAppBot());
  const [isWhatsAppConfigured, setIsWhatsAppConfigured] = useState(false);
  const [userPhone, setUserPhone] = useState<string>('');
  const [showWhatsAppSetup, setShowWhatsAppSetup] = useState(false);

  useEffect(() => {
    checkWhatsAppConfiguration();
    loadUserProfile();
  }, []);

  const checkWhatsAppConfiguration = () => {
    const accessToken = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID;
    setIsWhatsAppConfigured(!!(accessToken && phoneNumberId && 
      accessToken !== 'your_whatsapp_access_token_here' && 
      phoneNumberId !== 'your_whatsapp_phone_number_id_here'));
  };

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('phone_number')
          .eq('id', user.id)
          .single();
        if (profile?.phone_number) {
          setUserPhone(profile.phone_number);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleSendMessage = async (message: string, files?: any[]) => {
    if (!message.trim()) return;

    setIsLoading(true);
    const userMessage = { role: 'user' as const, content: message, id: Date.now().toString() };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyC1Ql3ozHA0em2CvlMAyxltA9DB9PTparQ', {
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





  const handleWhatsAppClick = async () => {
    setIsLoading(true);
    
    try {
      // Get user from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to use WhatsApp farming assistant');
        return;
      }

      // Create farming assistant welcome message
      const welcomeMessage = {
        from: userPhone || user.phone || '+254700000000',
        id: Date.now().toString(),
        timestamp: Date.now().toString(),
        type: 'text' as const,
        text: { body: 'Hello CropGenius! I need farming assistance.' }
      };

      // Process through WhatsApp farming bot
      const response = await handleIncomingMessage(welcomeMessage);
      
      // Add to chat with clean UI
      const userMessage = { 
        role: 'user' as const, 
        content: '🌱 WhatsApp Farming Assistant Activated', 
        id: Date.now().toString() 
      };
      const botResponse = { 
        role: 'assistant' as const, 
        content: response 
      };
      
      setMessages([userMessage, botResponse]);
      
      // Log to Supabase for analytics
      await supabase.from('farmer_interactions').insert({
        user_id: user.id,
        phone_number: userPhone || user.phone,
        direction: 'whatsapp_activation',
        message: 'WhatsApp farming assistant activated',
        category: 'system',
        timestamp: new Date().toISOString()
      }).catch(console.error);
      
      toast.success('🚀 WhatsApp Farming Assistant is LIVE!');
      
    } catch (error) {
      console.error('WhatsApp activation error:', error);
      toast.error('Failed to activate farming assistant');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden relative">
      {/* WhatsApp Icon - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleWhatsAppClick}
          disabled={isLoading}
          className="group relative p-4 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 transform-gpu animate-pulse hover:animate-none disabled:opacity-50"
          title="🌱 Activate CropGenius Farming Assistant - AI-Powered Agricultural Intelligence"
        >
          <WhatsAppIcon className="w-6 h-6" />
          
          {/* Premium Glass Effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* WhatsApp Green Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-green-400/30 blur-lg scale-150 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

          {/* Live Status Indicator */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-bounce shadow-lg">
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping"></div>
          </div>
          
          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-600/90 rounded-full">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
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
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="ai-thinking-indicator">
                    <LoaderFive text="WhatsApp Farming Assistant..." />
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-6">
                <div className="text-center w-full max-w-md">
                  {/* Hero Section */}
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-xl">
                      <span className="text-2xl">🌱</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">CropGenius AI</h2>
                    <p className="text-gray-600">Your Personal Agricultural Superintelligence</p>
                  </div>
                  
                  {showWhatsAppSetup ? (
                    <div className="space-y-4">
                      <WhatsAppSetup onSetupComplete={() => {
                        setShowWhatsAppSetup(false);
                        loadUserProfile();
                        toast.success('WhatsApp setup complete! You can now use the farming assistant.');
                      }} />
                      <button 
                        onClick={() => setShowWhatsAppSetup(false)}
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                      >
                        Cancel setup
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {!isWhatsAppConfigured && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
                          <p className="font-medium">⚠️ WhatsApp Integration Not Configured</p>
                          <p>Contact support to enable WhatsApp Business API</p>
                        </div>
                      )}
                      
                      {isWhatsAppConfigured && !userPhone && (
                        <div className="space-y-3">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-sm">
                            <p className="font-medium">📱 WhatsApp Ready to Setup</p>
                            <p>Add your phone number to enable WhatsApp farming assistance</p>
                          </div>
                          <button
                            onClick={() => setShowWhatsAppSetup(true)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Setup WhatsApp Integration
                          </button>
                        </div>
                      )}
                      
                      {isWhatsAppConfigured && userPhone && (
                        <div className="space-y-3">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800 text-sm">
                            <p className="font-medium">✅ WhatsApp Farming Assistant Active</p>
                            <p>Phone: {userPhone}</p>
                            <p className="text-xs mt-1">Click the WhatsApp button above or start typing below</p>
                          </div>
                          <button
                            onClick={async () => {
                              setIsLoading(true);
                              try {
                                const testQuery = testFarmingQueries[Math.floor(Math.random() * testFarmingQueries.length)];
                                const result = await testWhatsAppIntegration(testQuery.message, userPhone);
                                
                                const userMessage = { role: 'user' as const, content: `[TEST] ${testQuery.message}`, id: Date.now().toString() };
                                const botResponse = { role: 'assistant' as const, content: result.response };
                                
                                setMessages([userMessage, botResponse]);
                                toast.success(`WhatsApp farming assistant test: ${testQuery.category}`);
                              } catch (error) {
                                toast.error('Test failed. Please try again.');
                              } finally {
                                setIsLoading(false);
                              }
                            }}
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            {isLoading ? 'Testing...' : 'Test Farming Assistant'}
                          </button>
                        </div>
                      )}
                      
                      {/* Instant Demo - Always Available */}
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 text-center">
                          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-xl">🧪</span>
                          </div>
                          <p className="font-semibold text-gray-800 mb-2">Experience the Magic</p>
                          <p className="text-sm text-gray-600 mb-4">See CropGenius AI in action with instant farming intelligence</p>
                          <button
                            onClick={async () => {
                              setIsLoading(true);
                              try {
                                const testQuery = testFarmingQueries[Math.floor(Math.random() * testFarmingQueries.length)];
                                const result = await testWhatsAppIntegration(testQuery.message);
                                
                                const userMessage = { role: 'user' as const, content: testQuery.message, id: Date.now().toString() };
                                const botResponse = { role: 'assistant' as const, content: result.response };
                                
                                setMessages([userMessage, botResponse]);
                                toast.success(`🎆 ${testQuery.category} Intelligence Activated!`);
                              } catch (error) {
                                toast.error('Please try again');
                              } finally {
                                setIsLoading(false);
                              }
                            }}
                            disabled={isLoading}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50"
                          >
                            {isLoading ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Activating AI...
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span>⚡</span>
                                Try Farming AI Now
                              </div>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Features Grid */}
                  <div className="grid grid-cols-2 gap-3 mt-6 text-xs">
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-lg mb-1">🔬</div>
                      <div className="font-medium text-green-800">Disease Detection</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <div className="text-lg mb-1">🌦️</div>
                      <div className="font-medium text-blue-800">Weather Intelligence</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                      <div className="text-lg mb-1">💰</div>
                      <div className="font-medium text-yellow-800">Market Prices</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="text-lg mb-1">🌱</div>
                      <div className="font-medium text-purple-800">Planting Advice</div>
                    </div>
                  </div>
                </div>
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
            onSendMessage={async (message, files) => {
              // Handle both regular chat and WhatsApp integration
              if (isWhatsAppConfigured && userPhone) {
                // Process through WhatsApp farming bot
                const whatsappMessage = {
                  from: userPhone,
                  id: Date.now().toString(),
                  timestamp: Date.now().toString(),
                  type: 'text' as const,
                  text: { body: message }
                };
                
                setIsLoading(true);
                const userMessage = { role: 'user' as const, content: message, id: Date.now().toString() };
                setMessages(prev => [...prev, userMessage]);
                
                try {
                  const response = await handleIncomingMessage(whatsappMessage);
                  const botResponse = { role: 'assistant' as const, content: response };
                  setMessages(prev => [...prev, botResponse]);
                } catch (error) {
                  console.error('WhatsApp bot error:', error);
                  const errorResponse = { role: 'assistant' as const, content: 'Sorry, I had trouble processing your request. Please try again.' };
                  setMessages(prev => [...prev, errorResponse]);
                } finally {
                  setIsLoading(false);
                }
              } else {
                // Fallback to regular Gemini chat
                await handleSendMessage(message, files);
              }
            }}
            isLoading={isLoading}
            placeholder={isWhatsAppConfigured && userPhone ? "Ask your farming question (WhatsApp enabled)..." : "Type your farming question..."}
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;