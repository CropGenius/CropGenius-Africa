import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon';

interface WhatsAppSetupProps {
  onSetupComplete?: () => void;
}

export const WhatsAppSetup: React.FC<WhatsAppSetupProps> = ({ onSetupComplete }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [currentPhone, setCurrentPhone] = useState('');

  useEffect(() => {
    checkCurrentSetup();
  }, []);

  const checkCurrentSetup = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('phone_number')
          .eq('id', user.id)
          .single();
        
        if (profile?.phone_number) {
          setCurrentPhone(profile.phone_number);
          setPhoneNumber(profile.phone_number);
          setIsConfigured(true);
        }
      }
    } catch (error) {
      console.error('Error checking WhatsApp setup:', error);
    }
  };

  const handleSetup = async () => {
    if (!phoneNumber.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      toast.error('Please enter a valid phone number (e.g., +254712345678)');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to set up WhatsApp');
        return;
      }

      // Update user profile with phone number
      const { error } = await supabase
        .from('profiles')
        .update({ phone_number: phoneNumber.trim() })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setCurrentPhone(phoneNumber.trim());
      setIsConfigured(true);
      toast.success('WhatsApp integration set up successfully!');
      
      if (onSetupComplete) {
        onSetupComplete();
      }

    } catch (error) {
      console.error('Error setting up WhatsApp:', error);
      toast.error('Failed to set up WhatsApp integration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestMessage = async () => {
    if (!currentPhone) return;

    setIsLoading(true);
    try {
      // Test the WhatsApp integration by sending a welcome message
      const testMessage = {
        from: currentPhone,
        id: Date.now().toString(),
        timestamp: Date.now().toString(),
        type: 'text' as const,
        text: { body: 'Test WhatsApp integration' }
      };

      // Import and use the WhatsApp farming bot
      const { handleIncomingMessage } = await import('@/agents/WhatsAppFarmingBot');
      const response = await handleIncomingMessage(testMessage);
      
      toast.success('WhatsApp integration test successful!');
      console.log('Test response:', response);

    } catch (error) {
      console.error('WhatsApp test failed:', error);
      toast.error('WhatsApp integration test failed. Please check configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  const isWhatsAppConfigured = () => {
    const accessToken = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID;
    return !!(accessToken && phoneNumberId && 
      accessToken !== 'your_whatsapp_access_token_here' && 
      phoneNumberId !== 'your_whatsapp_phone_number_id_here');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WhatsAppIcon className="w-5 h-5 text-green-600" />
          WhatsApp Farming Assistant
          {isConfigured && <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isWhatsAppConfigured() && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-800 text-sm">
            <p className="font-medium">⚠️ WhatsApp API Not Configured</p>
            <p>Contact support to enable WhatsApp Business API integration</p>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Your Phone Number
            </label>
            <Input
              type="tel"
              placeholder="+254712345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isLoading}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Include country code (e.g., +254 for Kenya)
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSetup}
              disabled={isLoading || !phoneNumber.trim()}
              className="flex-1"
              variant={isConfigured ? "outline" : "default"}
            >
              {isLoading ? 'Setting up...' : isConfigured ? 'Update Phone' : 'Setup WhatsApp'}
            </Button>
            
            {isConfigured && isWhatsAppConfigured() && (
              <Button 
                onClick={handleTestMessage}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                Test
              </Button>
            )}
          </div>
        </div>

        {isConfigured && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-800 text-sm">
            <p className="font-medium">✅ WhatsApp Ready</p>
            <p>Phone: {currentPhone}</p>
            <p className="text-xs mt-1">
              You can now receive farming advice via WhatsApp and use the integrated chat
            </p>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Features:</strong></p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>Crop disease identification via photos</li>
            <li>Weather forecasts and farming advice</li>
            <li>Market prices and selling recommendations</li>
            <li>Pest control and fertilizer guidance</li>
            <li>24/7 agricultural support</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};