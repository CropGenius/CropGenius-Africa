import { createRoot } from 'react-dom/client';
import React from 'react';

// Minimal test component
function MinimalApp() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <h1>🌾 CropGenius - MINIMAL TEST</h1>
      <p>✅ React is working!</p>
      <p>✅ Main.tsx is executing!</p>
      <p>✅ DOM is rendering!</p>
      
      <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
        <h2>🔍 Debug Information:</h2>
        <p>Timestamp: {new Date().toISOString()}</p>
        <p>Environment: {import.meta.env.MODE}</p>
        <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Configured' : '❌ Missing'}</p>
        <p>Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing'}</p>
      </div>
      
      <button 
        onClick={() => alert('Button works!')}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          background: 'white',
          color: '#16a34a',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Test Button
      </button>
    </div>
  );
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = '<h1 style="color: red;">❌ FATAL: Root element not found!</h1>';
} else {
  console.log('🚀 Creating React root...');
  const root = createRoot(rootElement);
  
  console.log('🚀 Rendering minimal app...');
  root.render(<MinimalApp />);
  
  console.log('✅ Minimal app rendered successfully!');
}