import React from 'react';
import AIChatWidget from '@/components/AIChatWidget';

const Chat = () => {
  return (
    <div className="h-full">
      <AIChatWidget 
        className="h-full"
        title="CropGenius AI Assistant"
        defaultOpen={true}
      />
    </div>
  );
};

export default Chat;