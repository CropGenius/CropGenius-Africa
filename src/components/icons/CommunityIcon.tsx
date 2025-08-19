import React from 'react';

interface CommunityIconProps {
  className?: string;
}

export const CommunityIcon: React.FC<CommunityIconProps> = ({ className = "w-6 h-6" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Three people figures */}
      <circle cx="12" cy="7" r="3" />
      <circle cx="6" cy="7" r="3" />
      <circle cx="18" cy="7" r="3" />
      <path d="M12 14v7M6 14v7M18 14v7" />
      
      {/* Handshake */}
      <path d="M9 16h6l2-2-2-2h-6l-2 2z" />
      <path d="M7 14l2 2M17 14l-2 2" />
    </svg>
  );
};