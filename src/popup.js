// Gracula Popup Script

// State management
let currentState = {
  aiEnabled: false,
  provider: 'openai',
  voiceEnabled: false
};

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  updateStatusIndicator();

  document.getElementById('settingsForm').addEventListener('submit', saveSettings);
  document.getElementById('voiceSettingsForm').addEventListener('submit', saveVoiceSettings);
  document.getElementById('reportIssue').addEventListener('click', reportIssue);
  document.getElementById('provider').addEventListener('change', toggleProviderFields);
  document.getElementById('voiceProvider').addEventListener('change', toggleVoiceProviderFields);
  document.getElementById('aiToggle').addEventListener('change', saveAIToggle);
  document.getElementById('voiceToggle').addEventListener('change', saveVoiceToggle);

  // Voice shortcut customization
  setupShortcutCapture();
});

function toggleProviderFields() {
  const provider = document.getElementById('provider').value;
  const openaiGroup = document.getElementById('openaiModelGroup');
  const googleGroup = document.getElementById('googleModelGroup');
  const openrouterGroup = document.getElementById('openrouterModelGroup');
  const huggingfaceGroup = document.getElementById('huggingfaceModelGroup');

  // Hide all groups first
  openaiGroup.style.display = 'none';
  googleGroup.style.display = 'none';
  openrouterGroup.style.display = 'none';
  huggingfaceGroup.style.display = 'none';

  // Show the selected provider's group
  if (provider === 'openai') {
    openaiGroup.style.display = 'block';
  } else if (provider === 'google') {
    googleGroup.style.display = 'block';
  } else if (provider === 'openrouter') {
    openrouterGroup.style.display = 'block';
  } else {
    huggingfaceGroup.style.display = 'block';
  }
}

function toggleVoiceProviderFields() {
  const provider = document.getElementById('voiceProvider').value;
  const elevenlabsGroup = document.getElementById('elevenlabsKeyGroup');
  const googleGroup = document.getElementById('googleVoiceKeyGroup');
  const deepgramGroup = document.getElementById('deepgramKeyGroup');

  // Hide all groups first
  elevenlabsGroup.style.display = 'none';
  googleGroup.style.display = 'none';
  deepgramGroup.style.display = 'none';

  // Show the selected provider's group
  if (provider === 'elevenlabs') {
    elevenlabsGroup.style.display = 'block';
  } else if (provider === 'google') {
    googleGroup.style.display = 'block';
  } else if (provider === 'deepgram') {
    deepgramGroup.style.display = 'block';
  }
  // webspeech and openai don't need additional fields
}

function loadSettings() {
  chrome.runtime.sendMessage({ action: 'getApiConfig' }, (response) => {
    if (response && response.success && response.config) {
      const config = response.config;

      // Store the full config in currentState for later use
      currentState.fullConfig = config;

      const provider = config.provider || 'openai';
      document.getElementById('provider').value = provider;
      document.getElementById('apiKey').value = config.apiKey || '';
      document.getElementById('openaiModel').value = config.model || 'gpt-4o';  // Default to latest GPT-4o
      document.getElementById('googleModel').value = config.googleModel || 'gemini-2.0-flash-exp';
      document.getElementById('openrouterModel').value = config.openrouterModel || 'anthropic/claude-3.5-sonnet';  // Default to Claude 3.5
      document.getElementById('huggingfaceModel').value = config.huggingfaceModel || 'mistralai/Mistral-7B-Instruct-v0.2';

      // Load AI toggle state (default: false/disabled)
      const aiEnabled = config.useAIForAutosuggestions === true;
      document.getElementById('aiToggle').checked = aiEnabled;
      currentState.aiEnabled = aiEnabled;

      // Load voice settings
      document.getElementById('voiceProvider').value = config.voiceProvider || 'webspeech';
      document.getElementById('elevenlabsApiKey').value = config.elevenlabsApiKey || '';
      document.getElementById('googleVoiceApiKey').value = config.googleApiKey || '';
      document.getElementById('deepgramApiKey').value = config.deepgramApiKey || '';
      document.getElementById('voiceLanguage').value = config.voiceLanguage || 'en';
      const voiceEnabled = config.voiceInputEnabled === true;
      document.getElementById('voiceToggle').checked = voiceEnabled;
      currentState.voiceEnabled = voiceEnabled;
      currentState.provider = provider;

      // Load keyboard shortcut (default: Ctrl+Shift+V)
      const shortcut = config.voiceShortcut || 'Ctrl+Shift+V';
      document.getElementById('voiceShortcut').value = shortcut;

      toggleProviderFields();
      toggleVoiceProviderFields();
      updateStatusIndicator();

      console.log('✅ Settings loaded successfully:', {
        provider,
        hasApiKey: !!config.apiKey,
        aiEnabled,
        voiceEnabled
      });
    } else {
      console.warn('⚠️ Failed to load settings:', response);
    }
  });
}

/**
 * Update status indicator based on current state
 */
function updateStatusIndicator() {
  const statusText = document.getElementById('statusText');
  const modeBadge = document.getElementById('modeBadge');
  const aiModeIndicator = document.getElementById('aiModeIndicator');

  if (currentState.aiEnabled) {
    statusText.textContent = 'AI Mode Active';
    modeBadge.textContent = '🤖 AI Mode';
    modeBadge.className = 'status-badge ai';
    if (aiModeIndicator) {
      aiModeIndicator.innerHTML = '<span class="mode-badge ai-mode">🤖 AI Mode Active</span>';
    }
  } else {
    statusText.textContent = 'Offline Mode Active';
    modeBadge.textContent = '📊 Offline Mode';
    modeBadge.className = 'status-badge offline';
    if (aiModeIndicator) {
      aiModeIndicator.innerHTML = '<span class="mode-badge offline-mode">📊 Offline Mode Active</span>';
    }
  }
}

function saveSettings(e) {
  e.preventDefault();

  const provider = document.getElementById('provider').value;
  const apiKey = document.getElementById('apiKey').value.trim();

  // Start with the existing full config to preserve all settings
  let config = currentState.fullConfig ? { ...currentState.fullConfig } : {};

  // Update with new values
  config.provider = provider;
  config.apiKey = apiKey;

  if (provider === 'openai') {
    config.model = document.getElementById('openaiModel').value;
  } else if (provider === 'google') {
    config.googleModel = document.getElementById('googleModel').value;
  } else if (provider === 'openrouter') {
    config.openrouterModel = document.getElementById('openrouterModel').value;
  } else {
    config.huggingfaceModel = document.getElementById('huggingfaceModel').value;
  }

  // Validate API key for OpenAI, Google AI, and OpenRouter
  if ((provider === 'openai' || provider === 'google' || provider === 'openrouter') && !apiKey) {
    const statusEl = document.getElementById('status');
    let providerName = 'OpenAI';
    if (provider === 'google') providerName = 'Google AI Studio';
    else if (provider === 'openrouter') providerName = 'OpenRouter';

    statusEl.textContent = `✗ ${providerName} API key is required`;
    statusEl.className = 'status error';
    statusEl.style.display = 'block';
    return;
  }

  console.log('💾 Saving settings:', {
    provider: config.provider,
    hasApiKey: !!config.apiKey,
    model: config.model || config.googleModel || config.openrouterModel || config.huggingfaceModel
  });

  chrome.runtime.sendMessage({
    action: 'updateApiConfig',
    config: config
  }, (response) => {
    const statusEl = document.getElementById('status');

    if (chrome.runtime.lastError) {
      console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
      statusEl.textContent = `✗ Error: ${chrome.runtime.lastError.message}`;
      statusEl.className = 'status error';
      statusEl.style.display = 'block';
      return;
    }

    if (response && response.success) {
      // Update the stored config
      currentState.fullConfig = config;

      statusEl.textContent = '✓ Settings saved and applied in real-time! No reload needed.';
      statusEl.className = 'status success';
      statusEl.style.display = 'block';

      console.log('✅ Settings saved successfully');

      setTimeout(() => {
        statusEl.style.display = 'none';
      }, 5000);
    } else {
      console.error('❌ Save failed:', response);
      statusEl.textContent = '✗ Error saving settings';
      statusEl.className = 'status error';
      statusEl.style.display = 'block';
    }
  });
}

function saveAIToggle(e) {
  const useAI = e.target.checked;
  currentState.aiEnabled = useAI;

  // Preserve full config
  let config = currentState.fullConfig ? { ...currentState.fullConfig } : {};
  config.useAIForAutosuggestions = useAI;

  chrome.runtime.sendMessage({
    action: 'updateApiConfig',
    config: config
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
      return;
    }

    if (response && response.success) {
      // Update stored config
      currentState.fullConfig = config;

      console.log('✅ AI toggle saved:', useAI);
      updateStatusIndicator();

      // Show feedback
      const statusEl = document.getElementById('status');
      statusEl.textContent = useAI ? '✓ AI Mode enabled' : '✓ Offline Mode enabled';
      statusEl.className = 'status success';
      statusEl.style.display = 'block';

      setTimeout(() => {
        statusEl.style.display = 'none';
      }, 3000);
    } else {
      console.error('❌ AI toggle save failed:', response);
    }
  });
}

function saveVoiceSettings(e) {
  e.preventDefault();

  const voiceProvider = document.getElementById('voiceProvider').value;
  const elevenlabsApiKey = document.getElementById('elevenlabsApiKey').value.trim();
  const googleVoiceApiKey = document.getElementById('googleVoiceApiKey').value.trim();
  const deepgramApiKey = document.getElementById('deepgramApiKey').value.trim();
  const voiceLanguage = document.getElementById('voiceLanguage').value;
  const voiceEnabled = document.getElementById('voiceToggle').checked;
  const voiceShortcut = document.getElementById('voiceShortcut').value || 'Ctrl+Shift+V';

  // Preserve full config
  let config = currentState.fullConfig ? { ...currentState.fullConfig } : {};

  // Update voice settings
  config.voiceProvider = voiceProvider;
  config.elevenlabsApiKey = elevenlabsApiKey;
  config.googleApiKey = googleVoiceApiKey;
  config.deepgramApiKey = deepgramApiKey;
  config.voiceLanguage = voiceLanguage;
  config.voiceInputEnabled = voiceEnabled;
  config.voiceShortcut = voiceShortcut;

  console.log('💾 Saving voice settings:', {
    voiceProvider,
    voiceEnabled,
    voiceLanguage
  });

  chrome.runtime.sendMessage({
    action: 'updateApiConfig',
    config: config
  }, (response) => {
    const statusEl = document.getElementById('voiceStatus');

    if (chrome.runtime.lastError) {
      console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
      statusEl.textContent = `✗ Error: ${chrome.runtime.lastError.message}`;
      statusEl.className = 'status error';
      statusEl.style.display = 'block';
      return;
    }

    if (response && response.success) {
      // Update stored config
      currentState.fullConfig = config;
      currentState.voiceEnabled = voiceEnabled;

      statusEl.textContent = '✓ Voice settings saved and applied in real-time! No reload needed.';
      statusEl.className = 'status success';
      statusEl.style.display = 'block';
      updateStatusIndicator();

      console.log('✅ Voice settings saved successfully');

      setTimeout(() => {
        statusEl.style.display = 'none';
      }, 5000);
    } else {
      console.error('❌ Voice settings save failed:', response);
      statusEl.textContent = '✗ Error saving voice settings';
      statusEl.className = 'status error';
      statusEl.style.display = 'block';
    }
  });
}

function saveVoiceToggle(e) {
  const voiceEnabled = e.target.checked;
  currentState.voiceEnabled = voiceEnabled;

  // Preserve full config
  let config = currentState.fullConfig ? { ...currentState.fullConfig } : {};
  config.voiceInputEnabled = voiceEnabled;

  chrome.runtime.sendMessage({
    action: 'updateApiConfig',
    config: config
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
      return;
    }

    if (response && response.success) {
      // Update stored config
      currentState.fullConfig = config;

      console.log('✅ Voice toggle saved:', voiceEnabled);

      // Show feedback
      const statusEl = document.getElementById('voiceStatus');
      statusEl.textContent = voiceEnabled ? '✓ Voice input enabled' : '✓ Voice input disabled';
      statusEl.className = 'status success';
      statusEl.style.display = 'block';

      setTimeout(() => {
        statusEl.style.display = 'none';
      }, 3000);
    } else {
      console.error('❌ Voice toggle save failed:', response);
    }
  });
}

function reportIssue(e) {
  e.preventDefault();

  const subject = encodeURIComponent('Gracula Issue Report');
  const body = encodeURIComponent('Please describe the issue you encountered:\n\n');

  window.open(`mailto:support@gracula.app?subject=${subject}&body=${body}`, '_blank');
}

// Keyboard shortcut capture
function setupShortcutCapture() {
  const shortcutInput = document.getElementById('voiceShortcut');

  shortcutInput.addEventListener('click', () => {
    shortcutInput.value = 'Press keys...';
    shortcutInput.style.background = '#fff3cd';
  });

  shortcutInput.addEventListener('keydown', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const keys = [];

    // Modifiers
    if (e.ctrlKey || e.metaKey) keys.push('Ctrl');
    if (e.altKey) keys.push('Alt');
    if (e.shiftKey) keys.push('Shift');

    // Main key (ignore modifier keys alone)
    const mainKey = e.key;
    if (!['Control', 'Alt', 'Shift', 'Meta'].includes(mainKey)) {
      keys.push(mainKey.toUpperCase());
    }

    // Require at least one modifier + one key
    if (keys.length >= 2) {
      const shortcut = keys.join('+');
      shortcutInput.value = shortcut;
      shortcutInput.style.background = '#d4edda';

      setTimeout(() => {
        shortcutInput.style.background = '#f8f9fa';
      }, 1000);
    } else if (keys.length === 1) {
      // Show warning if only one key pressed
      shortcutInput.value = 'Need modifier (Ctrl/Alt/Shift) + key';
      shortcutInput.style.background = '#f8d7da';

      setTimeout(() => {
        shortcutInput.value = 'Ctrl+Shift+V';
        shortcutInput.style.background = '#f8f9fa';
      }, 1500);
    }
  });

  shortcutInput.addEventListener('blur', () => {
    if (shortcutInput.value === 'Press keys...') {
      shortcutInput.value = 'Ctrl+Shift+V';
    }
    shortcutInput.style.background = '#f8f9fa';
  });
}

