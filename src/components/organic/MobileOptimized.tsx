/**
 * 🔥 MOBILE OPTIMIZED - ULTRA SIMPLE MOBILE-FIRST DESIGN
 * Works perfectly on feature phones and smartphones
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Smartphone, Wifi, WifiOff, Download, Volume2 } from 'lucide-react';
import { offlineEngine } from '../../services/OfflineEngine';
import { lowBandwidthEngine } from '../../services/LowBandwidthEngine';
import { multiLanguageEngine } from '../../services/MultiLanguageEngine';

export const MobileOptimized: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [connectionSpeed, setConnectionSpeed] = useState<'fast' | 'slow' | 'offline'>('slow');
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    // Monitor connection status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Detect connection speed
    setConnectionSpeed(lowBandwidthEngine.getConnectionSpeed());
    
    // Set language
    setCurrentLanguage(multiLanguageEngine.getCurrentLanguage());
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const recipes = offlineEngine.getOfflineRecipes();
  const practices = offlineEngine.getOfflinePractices();

  const handleLanguageChange = (langCode: string) => {
    multiLanguageEngine.setLanguage(langCode);
    setCurrentLanguage(langCode);
  };

  const handleSpeak = (text: string) => {
    multiLanguageEngine.speak(text);
  };

  const downloadOfflineGuide = () => {
    const content = recipes.map(recipe => 
      lowBandwidthEngine.getTextOnlyContent(recipe)
    ).join('\n\n---\n\n');
    
    const pdf = offlineEngine.generatePrintablePDF(content);
    
    // Create download link
    const blob = new Blob([pdf], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cropgenius-offline-guide.txt';
    a.click();
  };

  return (
    <div className="max-w-md mx-auto space-y-4 p-4">
      {/* Connection Status */}
      <Card className={`${isOffline ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            {isOffline ? <WifiOff className="h-4 w-4 text-red-600" /> : <Wifi className="h-4 w-4 text-green-600" />}
            <span className="text-sm font-medium">
              {isOffline ? 'Offline Mode' : `Online (${connectionSpeed})`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Language Selector */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium">Language:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {multiLanguageEngine.getLanguages().slice(0, 4).map(lang => (
              <Button
                key={lang.code}
                variant={currentLanguage === lang.code ? "default" : "outline"}
                size="sm"
                onClick={() => handleLanguageChange(lang.code)}
                className="text-xs"
              >
                {lang.nativeName}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-3">
          <h3 className="font-bold mb-3">{multiLanguageEngine.t('daily_actions', 'Daily Actions')}</h3>
          <div className="space-y-2">
            {recipes.slice(0, 2).map(recipe => (
              <div key={recipe.id} className="p-2 bg-gray-50 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{recipe.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSpeak(recipe.name)}
                  >
                    <Volume2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {multiLanguageEngine.t('ingredients')}: {recipe.ingredients.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Offline Features */}
      <Card>
        <CardContent className="p-3">
          <h3 className="font-bold mb-3">Offline Features</h3>
          <div className="space-y-2">
            <Button
              onClick={downloadOfflineGuide}
              className="w-full"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Offline Guide
            </Button>
            
            <div className="text-xs text-gray-600 text-center">
              Works without internet • Print friendly • SMS ready
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Phone Mode */}
      {lowBandwidthEngine.isFeaturePhone() && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3 text-center">
            <Smartphone className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <div className="text-sm font-medium text-blue-800">Feature Phone Mode</div>
            <div className="text-xs text-blue-600">Optimized for your device</div>
          </CardContent>
        </Card>
      )}

      {/* Emergency Contact */}
      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="p-3 text-center">
          <div className="text-sm font-medium text-orange-800">Need Help?</div>
          <div className="text-xs text-orange-600 mb-2">SMS *123# for farming tips</div>
          <Button size="sm" variant="outline" className="text-xs">
            <a href="tel:*123#">Call Support</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};