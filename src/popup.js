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
    if (response.success && response.config) {
      const provider = response.config.provider || 'openai';
      document.getElementById('provider').value = provider;
      document.getElementById('apiKey').value = response.config.apiKey || '';
      document.getElementById('openaiModel').value = response.config.model || 'gpt-3.5-turbo';
      document.getElementById('googleModel').value = response.config.googleModel || 'gemini-2.0-flash-exp';
      document.getElementById('openrouterModel').value = response.config.openrouterModel || 'google/gemini-2.0-flash-exp:free';
      document.getElementById('huggingfaceModel').value = response.config.huggingfaceModel || 'mistralai/Mistral-7B-Instruct-v0.2';

      // Load AI toggle state (default: false/disabled)
      const aiEnabled = response.config.useAIForAutosuggestions || false;
      document.getElementById('aiToggle').checked = aiEnabled;
      currentState.aiEnabled = aiEnabled;

      // Load voice settings
      document.getElementById('voiceProvider').value = response.config.voiceProvider || 'webspeech';
      document.getElementById('elevenlabsApiKey').value = response.config.elevenlabsApiKey || '';
      document.getElementById('googleVoiceApiKey').value = response.config.googleApiKey || '';
      document.getElementById('deepgramApiKey').value = response.config.deepgramApiKey || '';
      document.getElementById('voiceLanguage').value = response.config.voiceLanguage || 'en';
      const voiceEnabled = response.config.voiceInputEnabled || false;
      document.getElementById('voiceToggle').checked = voiceEnabled;
      currentState.voiceEnabled = voiceEnabled;
      currentState.provider = provider;

      toggleProviderFields();
      toggleVoiceProviderFields();
      updateStatusIndicator();
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

  let config = {
    provider: provider,
    apiKey: apiKey
  };

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

  chrome.runtime.sendMessage({
    action: 'updateApiConfig',
    config: config
  }, (response) => {
    const statusEl = document.getElementById('status');

    if (response.success) {
      statusEl.textContent = '✓ Settings saved successfully! Reload messaging pages to apply.';
      statusEl.className = 'status success';
      statusEl.style.display = 'block';

      setTimeout(() => {
        statusEl.style.display = 'none';
      }, 5000);
    } else {
      statusEl.textContent = '✗ Error saving settings';
      statusEl.className = 'status error';
      statusEl.style.display = 'block';
    }
  });
}

function saveAIToggle(e) {
  const useAI = e.target.checked;
  currentState.aiEnabled = useAI;

  chrome.runtime.sendMessage({
    action: 'updateApiConfig',
    config: { useAIForAutosuggestions: useAI }
  }, (response) => {
    if (response.success) {
      console.log('AI toggle saved:', useAI);
      updateStatusIndicator();

      // Show feedback
      const statusEl = document.getElementById('status');
      statusEl.textContent = useAI ? '✓ AI Mode enabled' : '✓ Offline Mode enabled';
      statusEl.className = 'status success';
      statusEl.style.display = 'block';

      setTimeout(() => {
        statusEl.style.display = 'none';
      }, 3000);
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

  chrome.runtime.sendMessage({
    action: 'updateApiConfig',
    config: {
      voiceProvider: voiceProvider,
      elevenlabsApiKey: elevenlabsApiKey,
      googleApiKey: googleVoiceApiKey,
      deepgramApiKey: deepgramApiKey,
      voiceLanguage: voiceLanguage,
      voiceInputEnabled: voiceEnabled
    }
  }, (response) => {
    const statusEl = document.getElementById('voiceStatus');

    if (response.success) {
      statusEl.textContent = '✓ Voice settings saved successfully!';
      statusEl.className = 'status success';
      statusEl.style.display = 'block';
      currentState.voiceEnabled = voiceEnabled;
      updateStatusIndicator();

      setTimeout(() => {
        statusEl.style.display = 'none';
      }, 3000);
    } else {
      statusEl.textContent = '✗ Error saving voice settings';
      statusEl.className = 'status error';
      statusEl.style.display = 'block';
    }
  });
}

function saveVoiceToggle(e) {
  const voiceEnabled = e.target.checked;
  currentState.voiceEnabled = voiceEnabled;

  chrome.runtime.sendMessage({
    action: 'updateApiConfig',
    config: { voiceInputEnabled: voiceEnabled }
  }, (response) => {
    if (response.success) {
      console.log('Voice toggle saved:', voiceEnabled);

      // Show feedback
      const statusEl = document.getElementById('voiceStatus');
      statusEl.textContent = voiceEnabled ? '✓ Voice input enabled' : '✓ Voice input disabled';
      statusEl.className = 'status success';
      statusEl.style.display = 'block';

      setTimeout(() => {
        statusEl.style.display = 'none';
      }, 3000);
    }
  });
}

function reportIssue(e) {
  e.preventDefault();

  const subject = encodeURIComponent('Gracula Issue Report');
  const body = encodeURIComponent('Please describe the issue you encountered:\n\n');

  window.open(`mailto:support@gracula.app?subject=${subject}&body=${body}`, '_blank');
}

