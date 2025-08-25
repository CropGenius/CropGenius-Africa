import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import './index.css?v=whatsapp-fix-20250128';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);

// Wrap in StrictMode for development, remove for production
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register service worker after app loads
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .catch(() => console.log('SW registration failed'));
  });
}
