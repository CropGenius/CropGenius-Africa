/**
 * 🔥 VIRAL SHARE BUTTON - ULTRA SIMPLE ONE-TAP VIRAL SPREAD
 * Maximum viral potential with minimal code
 */

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Share2, MessageCircle, Copy, Check } from 'lucide-react';
import { viralEngine } from '../../services/ViralEngine';

interface ViralShareButtonProps {
  message: string;
  type?: 'whatsapp' | 'social' | 'copy';
  size?: 'sm' | 'lg' | 'default';
  className?: string;
}

export const ViralShareButton: React.FC<ViralShareButtonProps> = ({ 
  message, 
  type = 'whatsapp',
  size = 'default',
  className = ''
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (type === 'whatsapp') {
      viralEngine.shareToWhatsApp(message);
    } else if (type === 'copy') {
      const success = await viralEngine.copyToClipboard(message);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      // Try native sharing first, fallback to WhatsApp
      if (navigator.share) {
        try {
          await navigator.share({ text: message });
        } catch (error) {
          viralEngine.shareToWhatsApp(message);
        }
      } else {
        viralEngine.shareToWhatsApp(message);
      }
    }
  };

  const icons = {
    whatsapp: MessageCircle,
    social: Share2,
    copy: copied ? Check : Copy
  };

  const Icon = icons[type];
  const colors = {
    whatsapp: 'bg-green-600 hover:bg-green-700',
    social: 'bg-blue-600 hover:bg-blue-700', 
    copy: copied ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-700'
  };

  return (
    <Button
      onClick={handleShare}
      size={size}
      className={`${colors[type]} text-white ${className}`}
    >
      <Icon className="h-4 w-4 mr-2" />
      {type === 'whatsapp' ? 'WhatsApp' : 
       type === 'copy' ? (copied ? 'Copied!' : 'Copy') : 'Share'}
    </Button>
  );
};