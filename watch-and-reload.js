// Hot Reload Script for Gracula Extension
// Watches for file changes and automatically reloads the extension

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Extension ID
const EXTENSION_ID = 'pecmikhnnepnfohgajjebijngdddgjgf';

// Directories to watch
const WATCH_DIRS = [
  './src'
];

// Debounce timer
let reloadTimer = null;
const DEBOUNCE_DELAY = 1000; // ms

console.log('🔥 Hot Reload Watcher Started');
console.log('📁 Watching:', WATCH_DIRS.join(', '));
console.log('🔌 Extension ID:', EXTENSION_ID);
console.log('');

// Function to reload the extension via Chrome DevTools Protocol
function reloadExtension() {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`\n⏰ [${timestamp}] 🔄 Reloading extension...`);

  // Open extensions page - user needs to manually click reload once
  // After that, the hot reload system in the extension will handle updates
  const command = `powershell -Command "& {Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('^r')}"`;

  exec(command, (error) => {
    if (error) {
      console.log('💡 Please reload the extension manually in chrome://extensions/');
    } else {
      console.log('✅ Reload signal sent');
    }
  });
}

// Debounced reload function
function scheduleReload(filename) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`⏰ [${timestamp}] 📝 Changed: ${filename}`);

  if (reloadTimer) {
    clearTimeout(reloadTimer);
  }

  reloadTimer = setTimeout(() => {
    reloadExtension();
    reloadTimer = null;
  }, DEBOUNCE_DELAY);
}

// Watch directories recursively
function watchDirectory(dir) {
  try {
    fs.watch(dir, { recursive: true }, (eventType, filename) => {
      if (filename) {
        // Ignore certain files
        if (filename.includes('node_modules') ||
            filename.includes('.git') ||
            filename.endsWith('.md') ||
            filename.includes('watch-and-reload')) {
          return;
        }

        scheduleReload(filename);
      }
    });

    console.log('👀 Watching:', dir);
  } catch (error) {
    console.error('❌ Error watching directory:', dir, error.message);
  }
}

// Start watching
WATCH_DIRS.forEach(watchDirectory);

console.log('');
console.log('✅ Hot reload is active!');
console.log('');
console.log('📋 Instructions:');
console.log('   1. Go to chrome://extensions/');
console.log('   2. Enable "Developer mode" (top right)');
console.log('   3. Click "Reload" button on Gracula extension');
console.log('   4. Open WhatsApp Web');
console.log('   5. Make changes to your code');
console.log('   6. Extension will auto-reload and WhatsApp will update WITHOUT refresh!');
console.log('');
console.log('🛑 Press Ctrl+C to stop watching');
console.log('');

