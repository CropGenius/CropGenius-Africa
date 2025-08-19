import React from 'react';

interface GlowingTabProps {
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const GlowingTab: React.FC<GlowingTabProps> = ({ 
  children, 
  isActive = false, 
  onClick, 
  className = "" 
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center group ${className}`}>
      {isActive && (
        <div className="absolute inset-0 duration-1000 opacity-60 transition-all bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-md blur-lg filter group-hover:opacity-100 group-hover:duration-200" />
      )}
      <button
        onClick={onClick}
        className={`group relative inline-flex items-center justify-center text-sm rounded-md px-4 py-2 font-medium transition-all duration-200 hover:-translate-y-0.5 ${
          isActive 
            ? 'bg-gray-900 text-white shadow-lg' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {children}
      </button>
    </div>
  );
};