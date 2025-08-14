import React, { useState } from 'react';
import { Send, MessageSquare, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Message { id: string; content: string; isUser: boolean; }

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');

  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    const userMessage = { id: Date.now().toString(), content: inputValue, isUser: true };
    const messageText = inputValue;
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    const { data } = await supabase.functions.invoke('ai-chat', { body: { message: messageText } });
    const aiMessage = { id: (Date.now() + 1).toString(), content: data?.response || 'I\'m here to help!', isUser: false };
    setMessages(prev => [...prev, aiMessage]);
  };

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="fixed bottom-4 right-4 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700">
        <MessageSquare className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden flex flex-col z-50" style={{ height: '500px' }}>
      <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between">
        <h3 className="font-medium">AI Farm Assistant</h3>
        <button onClick={() => setIsOpen(false)} className="text-white hover:text-green-100">×</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
            <Bot className="h-10 w-10 text-gray-300 mb-4" />
            <p className="text-sm">Ask me anything about farming!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-3 py-2 rounded-lg ${message.isUser ? 'bg-green-600 text-white' : 'bg-white border text-gray-900'}`}>
                {message.content}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-gray-200 bg-white p-3">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about crops, weather, diseases..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
          <Button onClick={sendMessage} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};



export default AIChatWidget;
