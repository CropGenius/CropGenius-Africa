/**
 * 🎉 DOPAMINE TOAST - Production Ready
 * Gamified notifications for farmer engagement
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Toast {
  id: string;
  title: string;
  message: string;
  emoji: string;
  type: 'success' | 'warning' | 'info' | 'error';
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((title: string, message: string, emoji: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(7);
    const toast: Toast = { id, title, message, emoji, type };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((title: string, message: string, emoji = '✅') => {
    addToast(title, message, emoji, 'success');
  }, [addToast]);

  const warning = useCallback((title: string, message: string, emoji = '⚠️') => {
    addToast(title, message, emoji, 'warning');
  }, [addToast]);

  const info = useCallback((title: string, message: string, emoji = 'ℹ️') => {
    addToast(title, message, emoji, 'info');
  }, [addToast]);

  const error = useCallback((title: string, message: string, emoji = '❌') => {
    addToast(title, message, emoji, 'error');
  }, [addToast]);

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            className={`bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-lg max-w-sm ${
              toast.type === 'success' ? 'border-green-500/20' :
              toast.type === 'warning' ? 'border-yellow-500/20' :
              toast.type === 'error' ? 'border-red-500/20' : 'border-blue-500/20'
            }`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{toast.emoji}</span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{toast.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  return {
    success,
    warning,
    info,
    error,
    ToastContainer
  };
};