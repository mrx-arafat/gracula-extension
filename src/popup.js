// Gracula Popup Script

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();

  document.getElementById('settingsForm').addEventListener('submit', saveSettings);
  document.getElementById('reportIssue').addEventListener('click', reportIssue);
  document.getElementById('provider').addEventListener('change', toggleProviderFields);
});

function toggleProviderFields() {
  const provider = document.getElementById('provider').value;
  const openaiGroup = document.getElementById('openaiModelGroup');
  const huggingfaceGroup = document.getElementById('huggingfaceModelGroup');

  if (provider === 'openai') {
    openaiGroup.style.display = 'block';
    huggingfaceGroup.style.display = 'none';
  } else {
    openaiGroup.style.display = 'none';
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
      document.getElementById('huggingfaceModel').value = response.config.huggingfaceModel || 'mistralai/Mistral-7B-Instruct-v0.2';

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
  } else {
    config.huggingfaceModel = document.getElementById('huggingfaceModel').value;
  }

  // Validate OpenAI API key
  if (provider === 'openai' && !apiKey) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = '✗ OpenAI API key is required';
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

function reportIssue(e) {
  e.preventDefault();
  
  const subject = encodeURIComponent('Gracula Issue Report');
  const body = encodeURIComponent('Please describe the issue you encountered:\n\n');
  
  window.open(`mailto:support@gracula.app?subject=${subject}&body=${body}`, '_blank');
}

