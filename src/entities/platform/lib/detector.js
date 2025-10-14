// Platform Detector
// Detects which messaging platform the user is on

window.Gracula = window.Gracula || {};

/**
 * Detect current platform based on hostname
 */
window.Gracula.detectPlatform = function() {
  console.log('🧛 [PLATFORM DETECTOR] detectPlatform() called');

  const hostname = window.location.hostname;
  console.log('🧛 [PLATFORM DETECTOR] Current hostname:', hostname);

  if (!window.Gracula?.logger) {
    console.error('❌ [PLATFORM DETECTOR] ERROR: window.Gracula.logger not found!');
  } else {
    window.Gracula.logger.debug('Detecting platform for hostname:', hostname);
  }

  // Check if PLATFORMS config exists
  if (!window.Gracula?.Config?.PLATFORMS) {
    console.error('❌ [PLATFORM DETECTOR] ERROR: window.Gracula.Config.PLATFORMS not found!');
    console.log('🧛 [PLATFORM DETECTOR] Available Config:', window.Gracula?.Config ? Object.keys(window.Gracula.Config) : 'Config not found');
    return null;
  }

  console.log('🧛 [PLATFORM DETECTOR] Available platforms:', Object.keys(window.Gracula.Config.PLATFORMS));

  // Check if Platform class exists
  if (!window.Gracula?.Platform) {
    console.error('❌ [PLATFORM DETECTOR] ERROR: window.Gracula.Platform class not found!');
    return null;
  }

  for (const [key, config] of Object.entries(window.Gracula.Config.PLATFORMS)) {
    console.log(`🧛 [PLATFORM DETECTOR] Checking platform: ${key}`, config);
    try {
      const platform = new window.Gracula.Platform(config);
      console.log(`🧛 [PLATFORM DETECTOR] Created platform instance for ${key}`);

      if (platform.matches(hostname)) {
        console.log(`✅ [PLATFORM DETECTOR] Platform matched: ${platform.name}`);
        if (window.Gracula?.logger) {
          window.Gracula.logger.success(`Detected platform: ${platform.name}`);
        }
        return platform;
      } else {
        console.log(`⚠️ [PLATFORM DETECTOR] Platform ${key} did not match`);
      }
    } catch (error) {
      console.error(`❌ [PLATFORM DETECTOR] ERROR creating platform ${key}:`, error);
    }
  }

  console.log('⚠️ [PLATFORM DETECTOR] No platform matched for hostname:', hostname);
  if (window.Gracula?.logger) {
    window.Gracula.logger.warn('Platform not supported:', hostname);
  }
  return null;
};

