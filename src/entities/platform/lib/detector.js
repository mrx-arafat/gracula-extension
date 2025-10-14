// Platform Detector
// Detects which messaging platform the user is on

import { PLATFORMS } from '../../../shared/config/index.js';
import { Platform } from '../model/Platform.js';
import { logger } from '../../../shared/lib/index.js';

/**
 * Detect current platform based on hostname
 */
export function detectPlatform() {
  const hostname = window.location.hostname;
  logger.debug('Detecting platform for hostname:', hostname);

  for (const [key, config] of Object.entries(PLATFORMS)) {
    const platform = new Platform(config);
    if (platform.matches(hostname)) {
      logger.success(`Detected platform: ${platform.name}`);
      return platform;
    }
  }

  logger.warn('Platform not supported:', hostname);
  return null;
}

export default detectPlatform;

