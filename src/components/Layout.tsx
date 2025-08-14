
import React from "react";
import UnifiedNavigation from "@/components/navigation/UnifiedNavigation";

interface LayoutProps {
  children: React.ReactNode;
  showTopNav?: boolean;
  showBottomNav?: boolean;
}

const Layout = ({ children, showTopNav = true, showBottomNav = true }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-4 pb-20 min-h-screen w-full max-w-full overflow-x-hidden">
        {children}
      </main>
      
      <UnifiedNavigation />
    </div>
  );
};

export default Layout;
