import { useState, useEffect, useCallback, useContext, createContext, ReactNode, useRef } from 'react';
import FieldBrainAgent from '@/agents/FieldBrainAgent';
import { toast } from 'sonner';
import { FieldInsight } from '@/types/supabase';
import { useNavigate } from 'react-router-dom';
import { useCredits } from '@/hooks/useCredits';
import { useGrowthEngine } from '@/providers/GrowthEngineProvider';

// Define the context type
interface FieldBrainContextType {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  askAgent: (question: string) => Promise<{ response: string; insight?: FieldInsight }>;
  getFieldInsights: (fieldId?: string) => FieldInsight[];
  setFieldContext: (fieldId: string) => void;
  setVoiceStyle: (style: 'wise' | 'expert' | 'friendly') => void;
  voiceStyle: 'wise' | 'expert' | 'friendly';
  speakMessage: (message: string) => void;
  getSuggestedAction: () => { action: string; urgency: 'low' | 'medium' | 'high' };
  getFieldHealth: () => { score: number; assessment: string };
  generateWeeklySummary: () => FieldInsight;
}

// Create the context
const FieldBrainContext = createContext<FieldBrainContextType | null>(null);

// Provider component
export const FieldBrainProvider = ({ children, userId }: { children: ReactNode; userId: string }) => {
  const agent = FieldBrainAgent.getInstance();
  // Using toast directly from sonner
  const { balance: creditBalance, deductCredits, restoreCredits, isDeducting } = useCredits();
  const navigate = useNavigate();
  const isAskingRef = useRef(false);
  const { registerAIUsage } = useGrowthEngine();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voiceStyle, setVoiceStyleState] = useState<'wise' | 'expert' | 'friendly'>('friendly');
  
  // Initialize the agent
  useEffect(() => {
    if (!userId) return;
    
    const initAgent = async () => {
      try {
        setIsLoading(true);
        const success = await agent.initialize(userId);
        
        if (success) {
          setIsInitialized(true);
          setError(null);
        } else {
          setError("Failed to initialize FieldBrain. Please try again.");
        }
      } catch (err) {
        console.error("Error initializing FieldBrain:", err);
        setError("Something went wrong while setting up FieldBrain.");
      } finally {
        setIsLoading(false);
      }
    };
    
    initAgent();
    
    // Clean up on unmount
    return () => {
      agent.shutdown();
    };
  }, [userId]);
  
  // Ask the agent a question
  const askAgent = useCallback(async (question: string) => {
    if (isAskingRef.current || isDeducting) {
      toast.info("Please wait for the current request to complete.");
      return { response: "I'm already working on a request. Please wait." };
    }

    const cost = 1; // For now, all questions cost 1 credit
    
    if (creditBalance < cost) {
      toast.error("Insufficient Credits", {
        description: "You don't have enough credits to ask the AI. Please upgrade your plan."
      });
      return { response: "I'm sorry, but it seems you're out of credits." };
    }

    isAskingRef.current = true;

    try {
      // Optimistically deduct credits
      await deductCredits({ amount: cost, description: `AI Question: ${question.substring(0, 30)}...` });
      
      const response = await agent.ask(question);
      registerAIUsage();
      
      // The `onSuccess` toast from `useCredits` handles the success message.
      return response;

    } catch (err: any) {
      console.error("Error asking FieldBrain, rolling back credits:", err);
      
      // Rollback the transaction
      await restoreCredits({ amount: cost, description: `Failed AI Question: ${err.message}` });
      
      toast.error("AI Request Failed", {
        description: "An error occurred. Your credits for this action have been restored."
      });
      return { response: "I'm having trouble thinking right now. Your credits have been returned. Let's try again later." };
    } finally {
      isAskingRef.current = false;
    }
  }, [isInitialized, toast, creditBalance, deductCredits, restoreCredits, isDeducting, registerAIUsage]);
  
  // Set the field context
  const setFieldContext = useCallback((fieldId: string) => {
    if (!isInitialized) return;
    
    try {
      agent.setFieldContext(fieldId);
    } catch (err) {
      console.error("Error setting field context:", err);
    }
  }, [isInitialized]);
  
  // Set the voice style
  const setVoiceStyle = useCallback((style: 'wise' | 'expert' | 'friendly') => {
    if (!isInitialized) return;
    
    try {
      agent.setVoiceStyle(style);
      setVoiceStyleState(style);
      
      toast({
        title: `Voice style updated to ${style}`,
        description: "The AI assistant will now speak in this style."
      });
    } catch (err) {
      console.error("Error setting voice style:", err);
    }
  }, [isInitialized, toast]);
  
  // Speak a message
  const speakMessage = useCallback((message: string) => {
    if (!isInitialized) return;
    
    try {
      agent.speak(message);
    } catch (err) {
      console.error("Error speaking message:", err);
    }
  }, [isInitialized]);
  
  // Get field insights
  const getFieldInsights = useCallback((fieldId?: string) => {
    if (!isInitialized) return [];
    
    try {
      return agent.getFieldInsights(fieldId);
    } catch (err) {
      console.error("Error getting field insights:", err);
      return [];
    }
  }, [isInitialized]);
  
  // Get suggested action
  const getSuggestedAction = useCallback(() => {
    if (!isInitialized) {
      return { action: "Loading suggestions...", urgency: 'low' as const };
    }
    
    try {
      return agent.getSuggestedAction();
    } catch (err) {
      console.error("Error getting suggested action:", err);
      return { action: "Unable to suggest actions right now", urgency: 'low' as const };
    }
  }, [isInitialized]);
  
  // Get field health
  const getFieldHealth = useCallback(() => {
    if (!isInitialized) {
      return { score: 0, assessment: "Loading field assessment..." };
    }
    
    try {
      return agent.getFieldHealth();
    } catch (err) {
      console.error("Error getting field health:", err);
      return { score: 0, assessment: "Unable to assess field health right now" };
    }
  }, [isInitialized]);
  
  // Generate weekly summary
  const generateWeeklySummary = useCallback(() => {
    if (!isInitialized) {
      throw new Error("FieldBrain is not initialized yet");
    }
    
    try {
      return agent.generateWeeklySummary();
    } catch (err) {
      console.error("Error generating weekly summary:", err);
      throw new Error("Failed to generate weekly summary");
    }
  }, [isInitialized]);
  
  const contextValue: FieldBrainContextType = {
    isInitialized,
    isLoading,
    error,
    askAgent,
    getFieldInsights,
    setFieldContext,
    setVoiceStyle,
    voiceStyle,
    speakMessage,
    getSuggestedAction,
    getFieldHealth,
    generateWeeklySummary
  };
  
  return (
    <FieldBrainContext.Provider value={contextValue}>
      {children}
    </FieldBrainContext.Provider>
  );
};

// Custom hook to use the FieldBrain context
export const useFieldBrain = () => {
  const context = useContext(FieldBrainContext);
  
  if (!context) {
    throw new Error("useFieldBrain must be used within a FieldBrainProvider");
  }
  
  return context;
};

export default useFieldBrain;
