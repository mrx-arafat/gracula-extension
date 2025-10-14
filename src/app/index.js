// Application Entry Point
// Initializes the Gracula application

import { GraculaApp } from './GraculaApp.js';

// Initialize app when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const app = new GraculaApp();
    app.init();
  });
} else {
  const app = new GraculaApp();
  app.init();
}

