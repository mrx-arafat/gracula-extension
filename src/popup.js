// Gracula Popup Script

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();

  document.getElementById('settingsForm').addEventListener('submit', saveSettings);
  document.getElementById('voiceSettingsForm').addEventListener('submit', saveVoiceSettings);
  document.getElementById('reportIssue').addEventListener('click', reportIssue);
  document.getElementById('provider').addEventListener('change', toggleProviderFields);
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
      document.getElementById('aiToggle').checked = response.config.useAIForAutosuggestions || false;

      // Load voice settings
      document.getElementById('elevenlabsApiKey').value = response.config.elevenlabsApiKey || '';
      document.getElementById('voiceToggle').checked = response.config.voiceInputEnabled || false;

      toggleProviderFields();
    }
  });
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

  chrome.runtime.sendMessage({
    action: 'updateApiConfig',
    config: { useAIForAutosuggestions: useAI }
  }, (response) => {
    if (response.success) {
      console.log('AI toggle saved:', useAI);
    }
  });
}

function saveVoiceSettings(e) {
  e.preventDefault();

  const elevenlabsApiKey = document.getElementById('elevenlabsApiKey').value.trim();
  const voiceEnabled = document.getElementById('voiceToggle').checked;

  chrome.runtime.sendMessage({
    action: 'updateApiConfig',
    config: {
      elevenlabsApiKey: elevenlabsApiKey,
      voiceInputEnabled: voiceEnabled
    }
  }, (response) => {
    const statusEl = document.getElementById('voiceStatus');

    if (response.success) {
      statusEl.textContent = '✓ Voice settings saved successfully!';
      statusEl.className = 'status success';
      statusEl.style.display = 'block';

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

  chrome.runtime.sendMessage({
    action: 'updateApiConfig',
    config: { voiceInputEnabled: voiceEnabled }
  }, (response) => {
    if (response.success) {
      console.log('Voice toggle saved:', voiceEnabled);
    }
  });
}

function reportIssue(e) {
  e.preventDefault();

  const subject = encodeURIComponent('Gracula Issue Report');
  const body = encodeURIComponent('Please describe the issue you encountered:\n\n');

  window.open(`mailto:support@gracula.app?subject=${subject}&body=${body}`, '_blank');
}

