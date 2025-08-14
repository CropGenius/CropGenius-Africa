import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X } from 'lucide-react';

interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface AIInputFieldProps {
  onSendMessage: (message: string, files?: FileUpload[]) => void;
  isLoading?: boolean;
  placeholder?: string;
}

const AIInputField: React.FC<AIInputFieldProps> = ({ 
  onSendMessage, 
  isLoading = false, 
  placeholder = "Type your farming question..." 
}) => {
  const [message, setMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 80) + 'px';
    }
  }, [message]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFiles = files.map(file => ({
      id: (Date.now() + Math.random()).toString(),
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i)) + sizes[i];
  };

  const handleSubmit = () => {
    if (message.trim() || uploadedFiles.length > 0) {
      onSendMessage(message, uploadedFiles);
      setMessage('');
      setUploadedFiles([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Voice recording removed as requested

  return (
    <div className="w-full max-w-4xl mx-auto px-2">
      {/* Compact Input Container - Reduced Height */}
      <div className="relative">
        {/* Input Container - Minimal Height */}
        <div className="relative bg-white/90 border border-gray-200 rounded-2xl shadow-sm">
          
          {/* Uploaded Files - Compact */}
          {uploadedFiles.length > 0 && (
            <div className="px-3 py-2 border-b border-gray-100">
              <div className="flex flex-wrap gap-1">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="group flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1 text-xs">
                    <span className="truncate max-w-20">{file.name}</span>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Input Area - Compact */}
          <div className="flex items-center px-2 py-2 gap-2">
            {/* Left Action - Smaller, Edge-aligned */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Upload files"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              className="hidden"
              accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.csv,.json"
            />

            {/* Text Input - Expanded Width */}
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full resize-none border-none outline-none text-gray-800 placeholder-gray-400 text-base leading-relaxed min-h-[24px] max-h-20 bg-transparent"
                rows={1}
                style={{ background: 'transparent' }}
              />
            </div>

            {/* Send Button - Smaller, Edge-aligned */}
            <button
              onClick={handleSubmit}
              disabled={(!message.trim() && uploadedFiles.length === 0) || isLoading}
              className={`p-2 rounded-lg transition-colors ${
                (message.trim() || uploadedFiles.length > 0) && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { AIInputField };
export default AIInputField;