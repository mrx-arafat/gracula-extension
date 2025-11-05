// Global Grammar Fix Feature
// Entry point for global grammar fix functionality

console.log('✅ Global Grammar Fix feature loaded');

// Initialize global grammar fix after a short delay
async function initGlobalGrammarIfNeeded() {
  // Wait a bit to see if GraculaApp initializes
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Check if GraculaApp already initialized grammar fix
  if (window.Gracula?.app?.grammarFixManager) {
    console.log('📝 [GLOBAL GRAMMAR] Already initialized by GraculaApp');
    return;
  }

  // Initialize standalone (for all pages)
  if (window.Gracula?.GlobalGrammarFixManager) {
    console.log('📝 [GLOBAL GRAMMAR] Initializing standalone mode...');
    window.Gracula = window.Gracula || {};
    window.Gracula.globalGrammarFix = new window.Gracula.GlobalGrammarFixManager();
    await window.Gracula.globalGrammarFix.init();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGlobalGrammarIfNeeded);
} else {
  initGlobalGrammarIfNeeded();
}

