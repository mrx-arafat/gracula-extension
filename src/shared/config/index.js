// Shared Configuration Index
// Central export point for all configuration

export { PLATFORMS } from './platforms.js';
export { TONES } from './tones.js';
export { API_CONFIG } from './api.js';

// Combined config for backward compatibility
export const GRACULA_CONFIG = {
  platforms: null, // Will be set dynamically
  tones: null,     // Will be set dynamically
  api: null        // Will be set dynamically
};

