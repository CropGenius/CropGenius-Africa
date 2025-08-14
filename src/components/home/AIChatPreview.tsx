
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquareText, ArrowRight, Bot, User, Zap, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export default function AIChatPreview() {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [quickQuestions, setQuickQuestions] = useState([
    "When should I plant maize this season?",
    "How do I identify tomato blight?",
    "What's the best organic fertilizer for beans?",
    "How can I improve my soil health?"
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Add initial AI assistant message
    setMessages([{
      role: 'assistant',
      content: "Hello farmer! I'm your AI farming assistant. How can I help you today?"
    }]);
    
    // Load contextual questions based on real farm data
    loadPersonalizedQuestions();
  }, []);

  const loadPersonalizedQuestions = async () => {
    try {
      // Get user's farm data to personalize questions
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user's crops and recent activities
      const { data: farmData } = await supabase
        .from('farm_plans')
        .select('crop_types, planting_date')
        .eq('user_id', user.id)
        .limit(3);

      const contextualQuestions = farmData?.length > 0 
        ? [
          `When should I harvest my ${farmData[0]?.crop_types?.split(',')[0] || 'crops'}?`,
          `Best fertilizer for ${farmData[0]?.crop_types?.split(',')[0] || 'my crops'}?`,
          `Market prices for ${farmData[0]?.crop_types?.split(',')[0] || 'my harvest'}?`
        ]
        : [
          "When should I plant maize this season?",
          "How do I identify tomato blight?",
          "What's the best organic fertilizer for beans?",
          "How can I improve my soil health?"
        ];

      setQuickQuestions(contextualQuestions);
      
    } catch (error) {
      console.error('Failed to load personalized questions:', error);
      // Use default questions on error
      setQuickQuestions([
        "When should I plant maize this season?",
        "How do I identify tomato blight?",
        "What's the best organic fertilizer for beans?",
        "How can I improve my soil health?"
      ]);
    }
  };
  
  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // Add user message
    const userMessage = {
      role: 'user' as const,
      content: content
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    
    try {
      // Call real AI assistant API via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('agricultural-ai-chat', {
        body: { message: content }
      });

      if (error) throw error;

      const response = data?.response || "I'm processing your question about farming. Let me provide you with expert agricultural advice based on current conditions and best practices.";

      // Add AI response with typing effect
      let displayedResponse = "";
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: ""
      }]);
      
      const interval = setInterval(() => {
        if (displayedResponse.length < response.length) {
          displayedResponse = response.substring(0, displayedResponse.length + 3);
          
          setMessages(prev => [
            ...prev.slice(0, prev.length - 1),
            {
              role: 'assistant',
              content: displayedResponse
            }
          ]);
        } else {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 30);
      
    } catch (error) {
      console.error('Failed to get AI response:', error);
      
      // Fallback response
      const fallbackResponse = "I'm connecting to our AI farming expert. In the meantime, please check our Knowledge Base for detailed guides on crop management, pest control, and market insights.";
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: fallbackResponse
      }]);
      setIsTyping(false);
    }
  };

  return (
    <Card className="h-full overflow-hidden border-2 hover:border-primary/50 transition-all">
      <CardHeader className="pb-3 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30">
        <CardTitle className="flex items-center gap-2">
          <MessageSquareText className="h-5 w-5 text-violet-500" />
          AI Farm Expert
        </CardTitle>
        <CardDescription>
          Get instant answers to all your farming questions
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4">
          <p className="text-sm font-medium mb-2">Quick AI Insights:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickQuestions.map((question, index) => (
              <Button 
                key={index} 
                variant="outline" 
                size="sm" 
                className="h-auto py-2 justify-start text-left"
                onClick={() => handleSendMessage(question)}
              >
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3 flex-shrink-0 text-violet-500" />
                  <span className="text-xs overflow-hidden text-ellipsis whitespace-nowrap">{question}</span>
                </span>
              </Button>
            ))}
          </div>
        </div>
        
        <div className="p-3 border-t max-h-[180px] overflow-y-auto">
          <div className="space-y-3">
            {messages.map((message, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className={`rounded-full p-1 ${
                  message.role === 'assistant' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  {message.role === 'assistant' 
                    ? <Bot className="h-4 w-4" /> 
                    : <User className="h-4 w-4" />
                  }
                </div>
                <div className="flex-1">
                  <p className="text-xs leading-relaxed">{message.content}</p>
                  {index === messages.length - 1 && isTyping && (
                    <div className="flex space-x-1 mt-1">
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-100"></div>
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-200"></div>
                      <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-300"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <div className="p-3 pt-0 border-t">
          <div className="flex gap-2">
            <Input
              className="text-sm"
              placeholder="Ask about crops, weather, pests..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }
              }}
            />
            <Button 
              size="icon"
              disabled={isTyping || !inputValue.trim()}
              onClick={() => handleSendMessage(inputValue)}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <Link to="/chat">
            <Button className="w-full mt-3 group">
              <span className="flex items-center gap-2">
                <MessageSquareText className="h-4 w-4" />
                Full AI Farm Assistant
                <ArrowRight className="h-3 w-3 ml-auto group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
