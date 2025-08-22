
import React from 'react';
import TopNav from '@/components/navigation/TopNav';
import UnifiedNavigation from '@/components/navigation/UnifiedNavigation';
import InstallPrompt from '@/components/pwa/InstallPrompt';

interface MobileLayoutProps {
  children?: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 relative">
      <div className="pt-14 pb-16">
        {children}
      </div>
      
      <TopNav />
      <UnifiedNavigation />
      <InstallPrompt />
    </div>
  );
};
