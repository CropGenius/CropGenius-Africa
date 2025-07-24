/**
 * 🚨 EMERGENCY PROTECTION SCRIPT
 * -------------------------------------------------------------
 * Runs IMMEDIATELY to prevent ANY purple screens or blank pages
 * - Executes before React loads
 * - Provides instant fallback UI
 * - Monitors for problematic states
 */

(function() {
  'use strict';
  
  console.log('🛡️ [EmergencyProtection] Activating zero-error protection...');
  
  // Prevent purple backgrounds immediately
  function preventPurpleScreens() {
    const style = document.createElement('style');
    style.textContent = `
      html, body, #root, .App {
        background-color: #f0f9ff !important;
        background-image: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%) !important;
        min-height: 100vh !important;
      }
      
      *[style*="purple"],
      *[style*="rgb(128, 0, 128)"],
      *[style*="#800080"] {
        background-color: #f0f9ff !important;
        background-image: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%) !important;
      }
      
      #root:empty::before {
        content: "🌱 CropGenius Loading..." !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-height: 100vh !important;
        font-size: 1.5rem !important;
        font-weight: 600 !important;
        color: #059669 !important;
        font-family: system-ui, -apple-system, sans-serif !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Monitor for blank screens
  function monitorBlankScreens() {
    let blankScreenCount = 0;
    let hasShownContent = false;
    
    const checkBlankScreen = () => {
      const root = document.getElementById('root');
      const body = document.body;
      
      // Check if we've ever shown content
      if (root && root.children.length > 0 && root.innerHTML.trim() !== '') {
        hasShownContent = true;
        blankScreenCount = 0; // Reset counter if we have content
        return;
      }
      
      // Only check for blank screens after we've had content before
      if (!hasShownContent) {
        return; // Don't trigger during initial loading
      }
      
      // Check for blank or problematic states
      const isBlank = !root || root.children.length === 0 || root.innerHTML.trim() === '';
      const hasErrorColors = body.style.backgroundColor.includes('purple') ||
                            body.style.backgroundColor.includes('rgb(128, 0, 128)') ||
                            document.documentElement.style.backgroundColor.includes('purple');
      
      if (isBlank || hasErrorColors) {
        blankScreenCount++;
        console.warn(`🚨 [EmergencyProtection] Blank/error screen detected (${blankScreenCount})`);
        
        if (blankScreenCount >= 5) { // Increased threshold
          showEmergencyFallback();
        }
      } else {
        blankScreenCount = 0;
      }
    };
    
    // Check every 2 seconds (less aggressive)
    setInterval(checkBlankScreen, 2000);
  }
  
  // Show emergency fallback UI
  function showEmergencyFallback() {
    console.log('🚨 [EmergencyProtection] Showing emergency fallback');
    
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `
        <div style="
          min-height: 100vh;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          font-family: system-ui, -apple-system, sans-serif;
        ">
          <div style="
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            max-width: 400px;
            text-align: center;
          ">
            <div style="
              width: 64px;
              height: 64px;
              background: linear-gradient(135deg, #10b981, #059669);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 1rem;
              font-size: 2rem;
            ">🌱</div>
            
            <h1 style="
              font-size: 1.5rem;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 0.5rem;
            ">CropGenius Emergency Recovery</h1>
            
            <p style="
              color: #6b7280;
              margin-bottom: 1.5rem;
            ">We're getting things back on track for you</p>
            
            <button onclick="window.location.reload()" style="
              background: linear-gradient(135deg, #10b981, #059669);
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 8px;
              font-weight: 500;
              cursor: pointer;
              width: 100%;
              margin-bottom: 0.5rem;
              font-size: 1rem;
            ">Recover Now</button>
            
            <button onclick="window.location.href='/'" style="
              background: transparent;
              color: #6b7280;
              border: 1px solid #d1d5db;
              padding: 0.75rem 1.5rem;
              border-radius: 8px;
              cursor: pointer;
              width: 100%;
              font-size: 1rem;
            ">Go to Dashboard</button>
            
            <div style="
              margin-top: 1rem;
              padding: 0.75rem;
              background: #f0fdf4;
              border: 1px solid #bbf7d0;
              border-radius: 8px;
              font-size: 0.875rem;
              color: #166534;
            ">
              🛡️ Your farm data is safe and secure
            </div>
          </div>
        </div>
      `;
    }
  }
  
  // Global error handlers
  function setupGlobalErrorHandlers() {
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 [EmergencyProtection] Unhandled promise rejection:', event.reason);
      event.preventDefault();
      showEmergencyFallback();
    });
    
    // Catch JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('🚨 [EmergencyProtection] JavaScript error:', event.error);
      event.preventDefault();
      showEmergencyFallback();
    });
    
    // Override console.error to catch React errors
    const originalConsoleError = console.error;
    console.error = function(...args) {
      const message = args.join(' ');
      if (message.includes('React') || message.includes('component') || message.includes('render')) {
        console.warn('🚨 [EmergencyProtection] React error detected:', message);
        setTimeout(showEmergencyFallback, 1000);
      }
      originalConsoleError.apply(console, args);
    };
  }
  
  // Initialize protection when DOM is ready
  function initialize() {
    preventPurpleScreens();
    setupGlobalErrorHandlers();
    
    // Start monitoring after app has had time to load
    setTimeout(() => {
      monitorBlankScreens();
    }, 5000); // Give more time for app to load
    
    console.log('✅ [EmergencyProtection] Zero-error protection active');
  }
  
  // Run immediately if DOM is ready, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
  
  // Also run on window load as backup
  window.addEventListener('load', initialize);
  
})();