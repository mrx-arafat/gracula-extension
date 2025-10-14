// Logging Utility
// Centralized logging with consistent formatting

const PREFIX = '🧛 Gracula:';
const ENABLED = true; // Set to false to disable all logs

export const logger = {
  info: (...args) => {
    if (ENABLED) console.log(PREFIX, ...args);
  },
  
  success: (...args) => {
    if (ENABLED) console.log(PREFIX, '✅', ...args);
  },
  
  error: (...args) => {
    if (ENABLED) console.error(PREFIX, '❌', ...args);
  },
  
  warn: (...args) => {
    if (ENABLED) console.warn(PREFIX, '⚠️', ...args);
  },
  
  debug: (...args) => {
    if (ENABLED) console.debug(PREFIX, '🔍', ...args);
  },
  
  group: (title) => {
    if (ENABLED) console.group(PREFIX, title);
  },
  
  groupEnd: () => {
    if (ENABLED) console.groupEnd();
  },
  
  separator: () => {
    if (ENABLED) console.log(PREFIX, '========================================');
  }
};

export default logger;

