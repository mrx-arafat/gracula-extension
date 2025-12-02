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

  // Save buttons
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', saveSettings);
  }

  const saveVoiceBtn = document.getElementById('saveVoiceBtn');
  if (saveVoiceBtn) {
    saveVoiceBtn.addEventListener('click', saveVoiceSettings);
  }

  // Navigation buttons
  const openSettingsBtn = document.getElementById('openSettingsBtn');
  if (openSettingsBtn) {
    openSettingsBtn.addEventListener('click', () => {
      switchTab('settingsTab');
    });
  }

  const testDemoBtn = document.getElementById('testDemoBtn');
  if (testDemoBtn) {
    testDemoBtn.addEventListener('click', () => {
      // Just a visual feedback for now
      testDemoBtn.textContent = '✨ Check your clipboard!';
      setTimeout(() => {
        testDemoBtn.innerHTML = '<span>⌨️</span> Try Demo Input';
      }, 2000);
    });
  }

  const reportIssueBtn = document.getElementById('reportIssue');
  if (reportIssueBtn) {
    reportIssueBtn.addEventListener('click', reportIssue);
  }

  const providerEl = document.getElementById('provider');
  if (providerEl) {
    providerEl.addEventListener('change', toggleProviderFields);
  }

  // Voice provider might not exist if tab is hidden, but it is in the HTML
  const voiceProviderEl = document.getElementById('voiceProvider');
  if (voiceProviderEl) {
    voiceProviderEl.addEventListener('change', toggleVoiceProviderFields);
  }

  const aiToggleEl = document.getElementById('aiToggle');
  if (aiToggleEl) {
    aiToggleEl.addEventListener('change', saveAIToggle);
  }

  const ghostToggleEl = document.getElementById('ghostTextToggle');
  if (ghostToggleEl) {
    ghostToggleEl.addEventListener('change', saveGhostTextToggle);
  }

  const voiceToggleEl = document.getElementById('voiceToggle');
  if (voiceToggleEl) {
    voiceToggleEl.addEventListener('change', saveVoiceToggle);
  }

  // Auth buttons
  const signInBtn = document.getElementById('signInBtn');
  if (signInBtn) signInBtn.addEventListener('click', () => handleAuth('signIn'));

  const signUpBtn = document.getElementById('signUpBtn');
  if (signUpBtn) signUpBtn.addEventListener('click', () => handleAuth('signUp'));

  const signOutBtn = document.getElementById('signOutBtn');
  if (signOutBtn) signOutBtn.addEventListener('click', handleSignOut);

  setupTabs();
  setupPasswordToggles();
  setupShortcutCapture();
  checkAuthStatus();
});

function switchTab(tabId) {
  const buttons = document.querySelectorAll('.tab-button');
  const contents = document.querySelectorAll('.tab-content');

  buttons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  contents.forEach(content => {
    content.classList.toggle('active', content.id === tabId);
  });
}

function toggleProviderFields() {
  const provider = document.getElementById('provider').value;
  const openaiGroup = document.getElementById('openaiModelGroup');
  const googleGroup = document.getElementById('googleModelGroup');
  const openrouterGroup = document.getElementById('openrouterModelGroup');
  const huggingfaceGroup = document.getElementById('huggingfaceModelGroup');

  // Hide all groups first
  if (openaiGroup) openaiGroup.style.display = 'none';
  if (googleGroup) googleGroup.style.display = 'none';
  if (openrouterGroup) openrouterGroup.style.display = 'none';
  if (huggingfaceGroup) huggingfaceGroup.style.display = 'none';

  // Show the selected provider's group
  if (provider === 'openai' && openaiGroup) {
    openaiGroup.style.display = 'block';
  } else if (provider === 'google' && googleGroup) {
    googleGroup.style.display = 'block';
  } else if (provider === 'openrouter' && openrouterGroup) {
    openrouterGroup.style.display = 'block';
  } else if (huggingfaceGroup) {
    huggingfaceGroup.style.display = 'block';
  }
}

function toggleVoiceProviderFields() {
  const provider = document.getElementById('voiceProvider').value;
  const elevenlabsGroup = document.getElementById('elevenlabsKeyGroup');
  const googleGroup = document.getElementById('googleVoiceKeyGroup');
  const deepgramGroup = document.getElementById('deepgramKeyGroup');

  // Hide all groups first
  if (elevenlabsGroup) elevenlabsGroup.style.display = 'none';
  if (googleGroup) googleGroup.style.display = 'none';
  if (deepgramGroup) deepgramGroup.style.display = 'none';

  // Show the selected provider's group
  if (provider === 'elevenlabs' && elevenlabsGroup) {
    elevenlabsGroup.style.display = 'block';
  } else if (provider === 'google' && googleGroup) {
    googleGroup.style.display = 'block';
  } else if (provider === 'deepgram' && deepgramGroup) {
    deepgramGroup.style.display = 'block';
  }
}

function loadSettings() {
  chrome.runtime.sendMessage({ action: 'getApiConfig' }, (response) => {
    if (response && response.success && response.config) {
      const config = response.config;

      // Store the full config in currentState for later use
      currentState.fullConfig = config;

      const provider = config.provider || 'openai';
      const providerEl = document.getElementById('provider');
      if (providerEl) providerEl.value = provider;

      const apiKeyEl = document.getElementById('apiKey');
      if (apiKeyEl) apiKeyEl.value = config.apiKey || '';

      const openaiModelEl = document.getElementById('openaiModel');
      if (openaiModelEl) openaiModelEl.value = config.model || 'gpt-4o';

      // Load AI toggle state
      const aiEnabled = config.useAIForAutosuggestions === true;
      const aiToggleEl = document.getElementById('aiToggle');
      if (aiToggleEl) aiToggleEl.checked = aiEnabled;
      currentState.aiEnabled = aiEnabled;

      // Load Ghost Text toggle state (defaults to enabled when not explicitly false)
      const ghostEnabled = config.ghostTextEnabled !== false;
      const ghostToggleEl = document.getElementById('ghostTextToggle');
      if (ghostToggleEl) ghostToggleEl.checked = ghostEnabled;
      currentState.ghostTextEnabled = ghostEnabled;

      // Load voice settings
      const voiceProviderEl = document.getElementById('voiceProvider');
      if (voiceProviderEl) voiceProviderEl.value = config.voiceProvider || 'webspeech';

      const voiceLangEl = document.getElementById('voiceLanguage');
      if (voiceLangEl) voiceLangEl.value = config.voiceLanguage || 'en';

      const voiceEnabled = config.voiceInputEnabled === true;
      const voiceToggleEl = document.getElementById('voiceToggle');
      if (voiceToggleEl) voiceToggleEl.checked = voiceEnabled;
      currentState.voiceEnabled = voiceEnabled;
      currentState.provider = provider;

      // Load keyboard shortcut
      const shortcut = config.voiceShortcut || 'Ctrl+Shift+V';
      const shortcutEl = document.getElementById('voiceShortcut');
      if (shortcutEl) shortcutEl.value = shortcut;

      toggleProviderFields();
      toggleVoiceProviderFields();
      updateStatusIndicator();

      console.log('✅ Settings loaded successfully');
    } else {
      console.warn('⚠️ Failed to load settings');
    }
  });
}

/**
 * Update status indicator based on current state
 */
function updateStatusIndicator() {
  const statusText = document.getElementById('statusText');
  const statusPill = document.getElementById('statusPill');

  if (!statusText || !statusPill) return;

  if (currentState.aiEnabled) {
    statusText.textContent = 'System Ready';
    statusPill.className = 'status-pill'; // Default green
  } else {
    statusText.textContent = 'Offline Mode';
    statusPill.className = 'status-pill offline'; // Yellow/Orange
  }
}

function saveSettings(e) {
  if (e) e.preventDefault();

  const provider = document.getElementById('provider').value;
  const apiKey = document.getElementById('apiKey').value.trim();

  // Start with the existing full config to preserve all settings
  let config = currentState.fullConfig ? { ...currentState.fullConfig } : {};

  // Update with new values
  config.provider = provider;
  config.apiKey = apiKey;

  if (provider === 'openai') {
    config.model = document.getElementById('openaiModel').value;
  }
  // Add other providers if needed, simplified for now

  // Validate API key
  if ((provider === 'openai' || provider === 'google' || provider === 'openrouter') && !apiKey) {
    showStatus('✗ API key is required', 'error');
    return;
  }

  console.log('💾 Saving settings:', { provider: config.provider });

  chrome.runtime.sendMessage({
    action: 'updateApiConfig',
    config: config
  }, (response) => {
    if (chrome.runtime.lastError) {
      showStatus(`✗ Error: ${chrome.runtime.lastError.message}`, 'error');
      return;
    }

    if (response && response.success) {
      currentState.fullConfig = config;
      showStatus('✓ Settings saved!', 'success');
      console.log('✅ Settings saved successfully');
    } else {
      showStatus('✗ Error saving settings', 'error');
    }
  });
}

/**
 * Save Ghost Text toggle in real-time (no Save button required)
 */
function saveGhostTextToggle(e) {
  const ghostEnabled = e.target.checked;
  currentState.ghostTextEnabled = ghostEnabled;

  // Start with the existing full config to preserve all settings
  let config = currentState.fullConfig ? { ...currentState.fullConfig } : {};
  config.ghostTextEnabled = ghostEnabled;

  chrome.runtime.sendMessage({
    action: 'updateApiConfig',
    config: config
  }, (response) => {
    if (response && response.success) {
      currentState.fullConfig = config;
    }
  });
}

function saveAIToggle(e) {
  const useAI = e.target.checked;
  currentState.aiEnabled = useAI;

  let config = currentState.fullConfig ? { ...currentState.fullConfig } : {};
  config.useAIForAutosuggestions = useAI;

  chrome.runtime.sendMessage({
    action: 'updateApiConfig',
    config: config
  }, (response) => {
    if (response && response.success) {
      currentState.fullConfig = config;
      updateStatusIndicator();
      // Optional: show small toast or feedback
    }
  });
}

function saveVoiceSettings(e) {
  if (e) e.preventDefault();

  const voiceProvider = document.getElementById('voiceProvider').value;
  const voiceLanguage = document.getElementById('voiceLanguage').value;
  const voiceEnabled = document.getElementById('voiceToggle').checked;
  const voiceShortcut = document.getElementById('voiceShortcut').value || 'Ctrl+Shift+V';

  let config = currentState.fullConfig ? { ...currentState.fullConfig } : {};

  config.voiceProvider = voiceProvider;
  config.voiceLanguage = voiceLanguage;
  config.voiceInputEnabled = voiceEnabled;
  config.voiceShortcut = voiceShortcut;

  chrome.runtime.sendMessage({
    action: 'updateApiConfig',
    config: config
  }, (response) => {
    if (response && response.success) {
      currentState.fullConfig = config;
      currentState.voiceEnabled = voiceEnabled;

      const statusEl = document.getElementById('voiceStatus');
      if (statusEl) {
        statusEl.textContent = '✓ Voice settings saved!';
        statusEl.className = 'status success';
        statusEl.style.display = 'block';
        setTimeout(() => { statusEl.style.display = 'none'; }, 3000);
      }
    }
  });
}

function saveVoiceToggle(e) {
  const voiceEnabled = e.target.checked;
  currentState.voiceEnabled = voiceEnabled;

  let config = currentState.fullConfig ? { ...currentState.fullConfig } : {};
  config.voiceInputEnabled = voiceEnabled;

  chrome.runtime.sendMessage({
    action: 'updateApiConfig',
    config: config
  }, (response) => {
    if (response && response.success) {
      currentState.fullConfig = config;
    }
  });
}

function showStatus(message, type) {
  const statusEl = document.getElementById('status');
  if (!statusEl) return;

  statusEl.textContent = message;
  statusEl.className = type === 'success' ? 'status-pill' : 'status-pill offline'; // Reuse pill styles or add specific status classes
  // Override specific colors for error if needed, or just rely on text
  if (type === 'error') {
    statusEl.style.backgroundColor = '#fee2e2';
    statusEl.style.color = '#b91c1c';
  } else {
    statusEl.style.backgroundColor = '#ecfdf5';
    statusEl.style.color = '#059669';
  }

  statusEl.style.display = 'flex';

  setTimeout(() => {
    statusEl.style.display = 'none';
  }, 3000);
}

function reportIssue(e) {
  e.preventDefault();
  const subject = encodeURIComponent('Gracula Issue Report');
  const body = encodeURIComponent('Please describe the issue you encountered:\n\n');
  window.open(`mailto:support@gracula.app?subject=${subject}&body=${body}`, '_blank');
}

function setupPasswordToggles() {
  const buttons = document.querySelectorAll('.password-toggle');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      if (!targetId) return;
      const input = document.getElementById(targetId);
      if (!input) return;
      const isShowing = button.getAttribute('data-showing') === 'true';
      if (isShowing) {
        input.type = 'password';
        button.setAttribute('data-showing', 'false');
        button.textContent = 'Show';
      } else {
        input.type = 'text';
        button.setAttribute('data-showing', 'true');
        button.textContent = 'Hide';
      }
    });
  });
}

function setupShortcutCapture() {
  const shortcutInput = document.getElementById('voiceShortcut');
  if (!shortcutInput) return;

  shortcutInput.addEventListener('click', () => {
    shortcutInput.value = 'Press keys...';
    shortcutInput.style.background = '#fff3cd';
  });

  shortcutInput.addEventListener('keydown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const keys = [];
    if (e.ctrlKey || e.metaKey) keys.push('Ctrl');
    if (e.altKey) keys.push('Alt');
    if (e.shiftKey) keys.push('Shift');
    const mainKey = e.key;
    if (!['Control', 'Alt', 'Shift', 'Meta'].includes(mainKey)) {
      keys.push(mainKey.toUpperCase());
    }
    if (keys.length >= 2) {
      const shortcut = keys.join('+');
      shortcutInput.value = shortcut;
      shortcutInput.style.background = '#d4edda';
      setTimeout(() => { shortcutInput.style.background = '#f9fafb'; }, 1000);
    } else if (keys.length === 1) {
      shortcutInput.value = 'Need modifier + key';
      setTimeout(() => {
        shortcutInput.value = 'Ctrl+Shift+V';
        shortcutInput.style.background = '#f9fafb';
      }, 1500);
    }
  });

  shortcutInput.addEventListener('blur', () => {
    if (shortcutInput.value === 'Press keys...') {
      shortcutInput.value = 'Ctrl+Shift+V';
    }
    shortcutInput.style.background = '#f9fafb';
  });
}

function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  if (!tabButtons.length || !tabContents.length) return;

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-tab');
      if (!targetId) return;

      tabButtons.forEach((btn) => {
        btn.classList.toggle('active', btn === button);
      });

      tabContents.forEach((content) => {
        content.classList.toggle('active', content.id === targetId);
      });
    });
  });
}

// Auth Functions
function handleAuth(type) {
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;

  if (!email || !password) {
    showStatus('Please enter email and password', 'error');
    return;
  }

  chrome.runtime.sendMessage({
    action: 'auth',
    type: type,
    payload: { email, password }
  }, (response) => {
    if (response && response.success) {
      showStatus(`Successfully ${type === 'signIn' ? 'signed in' : 'signed up'}!`, 'success');
      checkAuthStatus();
    } else {
      showStatus(response?.error || 'Auth failed', 'error');
    }
  });
}

function handleSignOut() {
  chrome.runtime.sendMessage({ action: 'signOut' }, (response) => {
    if (response && response.success) {
      showStatus('Signed out', 'success');
      checkAuthStatus();
    }
  });
}

function checkAuthStatus() {
  chrome.runtime.sendMessage({ action: 'getSession' }, (response) => {
    const authForms = document.getElementById('authForms');
    const authStatus = document.getElementById('authStatus');
    const currentUserEmail = document.getElementById('currentUserEmail');

    if (response && response.success && response.session) {
      if (authForms) authForms.style.display = 'none';
      if (authStatus) authStatus.style.display = 'block';
      if (currentUserEmail) currentUserEmail.textContent = response.session.user?.email || 'User';
    } else {
      if (authForms) authForms.style.display = 'block';
      if (authStatus) authStatus.style.display = 'none';
    }
  });
}
