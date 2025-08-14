import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Tractor } from 'lucide-react';

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
          
          {/* CropGenius Logo */}
          <h1 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            CropGenius
          </h1>
          
          {/* Manage Fields */}
          <button 
            onClick={() => navigate('/manage-fields')}
            className="p-2 text-purple-300 hover:text-purple-200 hover:bg-purple-500/20 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-purple-500/30"
          >
            <Tractor className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;