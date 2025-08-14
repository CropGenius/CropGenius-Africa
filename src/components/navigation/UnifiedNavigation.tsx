import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Camera, MessageCircle, Cloud, MapPin } from 'lucide-react';

const UnifiedNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Camera, label: 'Scan', path: '/scan' },
    { icon: MessageCircle, label: 'Chat', path: '/chat' },
    { icon: Cloud, label: 'Weather', path: '/weather' },
    { icon: MapPin, label: 'Fields', path: '/fields' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 premium-bottom-nav px-4 py-2 z-50">
      <div className="flex justify-around">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'text-green-600 bg-green-50 scale-105' 
                  : 'text-gray-600 hover:text-green-600'
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default UnifiedNavigation;