// Test script to check if Gracula extension is loaded
// Run this in the browser console on web.whatsapp.com

console.log('=== GRACULA EXTENSION TEST ===');

// Check if window.Gracula exists
if (typeof window.Gracula === 'undefined') {
  console.error('❌ window.Gracula is not defined - Extension not loaded!');
} else {
  console.log('✅ window.Gracula exists');
  
  // Check all required components
  const components = [
    'Config',
    'logger',
    'DOMUtils',
    'Platform',
    'Message',
    'Tone',
    'detectPlatform',
    'SpeakerDetector',
    'ConversationAnalyzer',
    'ContextExtractor',
    'FloatingButton',
    'Modal',
    'ToneSelector',
    'ContextViewer',
    'ReplyList',
    'GraculaApp'
  ];
  
  console.log('\n=== Component Check ===');
  components.forEach(comp => {
    if (window.Gracula[comp]) {
      console.log(`✅ window.Gracula.${comp}`);
    } else {
      console.error(`❌ window.Gracula.${comp} is missing!`);
    }
  });
  
  // Check Config sub-components
  if (window.Gracula.Config) {
    console.log('\n=== Config Check ===');
    const configs = ['PLATFORMS', 'TONES', 'API_CONFIG'];
    configs.forEach(conf => {
      if (window.Gracula.Config[conf]) {
        console.log(`✅ window.Gracula.Config.${conf}`);
      } else {
        console.error(`❌ window.Gracula.Config.${conf} is missing!`);
      }
    });
  }
  
  // Check DOMUtils functions
  if (window.Gracula.DOMUtils) {
    console.log('\n=== DOMUtils Check ===');
    const utils = [
      'safeQuerySelector',
      'safeQuerySelectorAll',
      'waitForElement',
      'isElementVisible',
      'getElementPosition',
      'escapeHtml',
      'createElement',
      'triggerInputEvent'
    ];
    utils.forEach(util => {
      if (window.Gracula.DOMUtils[util]) {
        console.log(`✅ window.Gracula.DOMUtils.${util}`);
      } else {
        console.error(`❌ window.Gracula.DOMUtils.${util} is missing!`);
      }
    });
  }
  
  // Check if app is initialized
  console.log('\n=== App Status ===');
  const floatingBtn = document.getElementById('gracula-floating-btn');
  if (floatingBtn) {
    console.log('✅ Floating button found in DOM');
  } else {
    console.warn('⚠️  Floating button not found - may not be initialized yet');
  }
}

console.log('\n=== END TEST ===');

