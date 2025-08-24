
import React, { useState, useEffect } from 'react';
import { useMemoryStore } from '@/hooks/useMemoryStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MessageCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WhatsAppOptInProps {
  onClose?: () => void;
}

const WhatsAppOptIn = ({ onClose }: WhatsAppOptInProps) => {
  const { memory, setWhatsAppPreference } = useMemoryStore();
  const [optIn, setOptIn] = useState(memory.whatsappOptIn || false);
  const [countryCode, setCountryCode] = useState('+254');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing phone number from Supabase
  useEffect(() => {
    loadExistingPhone();
  }, []);

  const loadExistingPhone = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('phone_number')
          .eq('id', user.id)
          .single();
        
        if (profile?.phone_number) {
          // Parse existing phone number
          const phone = profile.phone_number;
          if (phone.startsWith('+')) {
            const match = phone.match(/^(\+\d{1,4})(\d+)$/);
            if (match) {
              setCountryCode(match[1]);
              setPhoneNumber(match[2]);
            }
          } else {
            setPhoneNumber(phone);
          }
        }
      }
    } catch (error) {
      console.error('Error loading phone number:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (optIn && !phoneNumber.trim()) {
      toast.error("Please enter your WhatsApp number");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to save WhatsApp preferences');
        return;
      }

      const fullPhoneNumber = optIn ? `${countryCode}${phoneNumber.trim()}` : null;
      
      // Save to Supabase profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ phone_number: fullPhoneNumber })
        .eq('id', user.id);
      
      if (profileError) {
        throw profileError;
      }
      
      // Save WhatsApp preference to memory store
      await setWhatsAppPreference(optIn, fullPhoneNumber);
      
      if (optIn) {
        toast.success("WhatsApp farming assistant activated!", {
          description: `Alerts will be sent to ${fullPhoneNumber}`
        });
      } else {
        toast.info("WhatsApp alerts disabled", {
          description: "You won't receive alerts via WhatsApp"
        });
      }
      
      if (onClose) onClose();
    } catch (error) {
      console.error('Error saving WhatsApp preferences:', error);
      toast.error("Failed to update WhatsApp preferences", {
        description: "Please try again later"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Common African country codes
  const countryCodes = [
    { code: '+254', country: 'Kenya' },
    { code: '+234', country: 'Nigeria' },
    { code: '+233', country: 'Ghana' },
    { code: '+256', country: 'Uganda' },
    { code: '+255', country: 'Tanzania' },
    { code: '+251', country: 'Ethiopia' },
    { code: '+27', country: 'South Africa' },
    { code: '+225', country: 'Ivory Coast' },
    { code: '+226', country: 'Burkina Faso' },
    { code: '+223', country: 'Mali' }
  ];

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading WhatsApp settings...</span>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-green-600" />
          AI WhatsApp Alerts
        </CardTitle>
        <CardDescription>
          Get timely, personalized AI farm insights sent directly to WhatsApp
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-medium">Enable WhatsApp Alerts</h3>
              <p className="text-sm text-muted-foreground">
                Receive AI insights about weather changes, pest alerts and more
              </p>
            </div>
            <Switch
              checked={optIn}
              onCheckedChange={setOptIn}
            />
          </div>
          
          {optIn && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Your WhatsApp Number</label>
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countryCodes.map(({ code, country }) => (
                      <SelectItem key={code} value={code}>
                        {code} {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="tel"
                  placeholder="700000000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your phone number without the country code
              </p>
            </div>
          )}
          
          <div className="bg-amber-50 p-3 rounded-md border border-amber-100">
            <h4 className="text-sm font-medium text-amber-800">Types of alerts you'll receive:</h4>
            <ul className="text-sm text-amber-700 mt-1 space-y-1">
              <li>• Critical weather changes affecting your crops</li>
              <li>• Pest and disease alerts in your region</li>
              <li>• Market price opportunities for your crops</li>
              <li>• Optimal times for planting and harvesting</li>
            </ul>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end gap-3">
          {onClose && (
            <Button 
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export { WhatsAppOptIn };
export default WhatsAppOptIn;
