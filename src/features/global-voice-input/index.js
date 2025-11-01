// Global Voice Input Feature
// Universal voice input that works with ANY input field on ANY webpage

console.log('✅ Global Voice Input feature loaded');

// Auto-initialize on non-supported platforms (where GraculaApp doesn't run)
// On supported platforms, GraculaApp will initialize it
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGlobalVoiceIfNeeded);
} else {
  initGlobalVoiceIfNeeded();
}

async function initGlobalVoiceIfNeeded() {
  // Wait a bit to see if GraculaApp initializes
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Check if GraculaApp already initialized global voice
  if (window.Gracula?.app?.globalVoiceInputManager) {
    console.log('🎤 [GLOBAL VOICE] Already initialized by GraculaApp');
    return;
  }

  // Initialize standalone (for non-supported platforms)
  if (window.Gracula?.GlobalVoiceInputManager) {
    console.log('🎤 [GLOBAL VOICE] Initializing standalone mode...');
    window.Gracula = window.Gracula || {};
    window.Gracula.globalVoiceInput = new window.Gracula.GlobalVoiceInputManager();
    await window.Gracula.globalVoiceInput.init();
  }
}
