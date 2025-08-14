/**
 * 🔧 ENVIRONMENT VARIABLE TEST COMPONENT
 * Debug component to check if environment variables are properly loaded
 */

import React from 'react';

export const EnvTest: React.FC = () => {
  const envCheck = {
    hasImportMeta: !!import.meta.env,
    viteGeminiKey: import.meta.env.VITE_GEMINI_API_KEY,
    hasViteGeminiKey: !!import.meta.env.VITE_GEMINI_API_KEY,
    keyLength: import.meta.env.VITE_GEMINI_API_KEY?.length || 0,
    keyPreview: import.meta.env.VITE_GEMINI_API_KEY ? 
      import.meta.env.VITE_GEMINI_API_KEY.substring(0, 10) + '...' : 'NO KEY',
    allViteKeys: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
  };

  console.log('🔧 ENVIRONMENT TEST RESULTS:', envCheck);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '2px solid red', 
      padding: '10px',
      zIndex: 9999,
      fontSize: '12px',
      maxWidth: '300px'
    }}>
      <h3>🔧 ENV TEST</h3>
      <div>Has import.meta.env: {envCheck.hasImportMeta ? '✅' : '❌'}</div>
      <div>Has VITE_GEMINI_API_KEY: {envCheck.hasViteGeminiKey ? '✅' : '❌'}</div>
      <div>Key Length: {envCheck.keyLength}</div>
      <div>Key Preview: {envCheck.keyPreview}</div>
      <div>All VITE_ keys: {envCheck.allViteKeys.join(', ')}</div>
    </div>
  );
};