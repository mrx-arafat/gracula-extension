// Application Entry Point
// Initializes the Gracula application

// console.log('🧛 [GRACULA] Entry point script loaded');
// console.log('🧛 [GRACULA] Document readyState:', document.readyState);
// console.log('🧛 [GRACULA] Current URL:', window.location.href);

// Check if window.Gracula exists
if (!window.Gracula) {
  // console.error('❌ [GRACULA] ERROR: window.Gracula namespace not found!');
  // console.log('🧛 [GRACULA] Available window properties:', Object.keys(window).filter(k => k.includes('Gracula')));
} else {
  // console.log('✅ [GRACULA] window.Gracula namespace found');
  // console.log('🧛 [GRACULA] Available Gracula properties:', Object.keys(window.Gracula));
}

// Check if GraculaApp class exists
if (!window.Gracula?.GraculaApp) {
  // console.error('❌ [GRACULA] ERROR: window.Gracula.GraculaApp class not found!');
} else {
  // console.log('✅ [GRACULA] window.Gracula.GraculaApp class found');
}

// Initialize app when page loads
try {
  if (document.readyState === 'loading') {
    // console.log('🧛 [GRACULA] Document still loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', () => {
      // console.log('🧛 [GRACULA] DOMContentLoaded event fired');
      try {
        const app = new window.Gracula.GraculaApp();
        // console.log('✅ [GRACULA] GraculaApp instance created');
        app.init();
      } catch (error) {
        // console.error('❌ [GRACULA] ERROR creating/initializing app:', error);
        // console.error('❌ [GRACULA] Error stack:', error.stack);
      }
    });
  } else {
    // console.log('🧛 [GRACULA] Document already loaded, initializing immediately...');
    const app = new window.Gracula.GraculaApp();
    // console.log('✅ [GRACULA] GraculaApp instance created');
    app.init();
  }
} catch (error) {
  // console.error('❌ [GRACULA] FATAL ERROR during initialization:', error);
  // console.error('❌ [GRACULA] Error stack:', error.stack);
}

