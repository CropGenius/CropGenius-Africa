import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Zap, ZapOff } from 'lucide-react';
import { CommunityIcon } from '@/components/icons/CommunityIcon';

const TopNav = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 premium-navbar">
      <div className="max-w-full mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          {/* Hamburger Menu */}
          <button 
            onClick={() => navigate('/more')}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          {/* CropGenius Logo with Pro Badge */}
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              CropGenius
            </h1>
            {useMemo(() => {
              const isPro = localStorage.getItem('plan_is_pro') === 'true';
              return isPro ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-900 border border-amber-300">
                  <Zap className="h-3 w-3 mr-1" />
                  PRO
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 border border-gray-400">
                  <ZapOff className="h-3 w-3 mr-1" />
                  FREE
                </span>
              );
            }, [])}
          </div>
          
          {/* Community */}
          <button 
            onClick={() => navigate('/community')}
            className="p-2 text-purple-300 hover:text-purple-200 hover:bg-purple-500/20 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-purple-500/30"
          >
            <CommunityIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;