// Voice Button Component
// Microphone button for voice input

window.Gracula = window.Gracula || {};

window.Gracula.VoiceButton = class {
  constructor(options = {}) {
    this.onClick = options.onClick || (() => {});
    this.inputField = options.inputField;
    this.isDisabled = Boolean(options.disabled);
    this.tooltip = options.tooltip || 'Voice Input (Ctrl+Shift+V)';

    // State
    this.isRecording = false;
    this.button = null;
    this.defaultBoxShadow = '0 4px 16px rgba(102, 126, 234, 0.4)';
    this.disabledBoxShadow = '0 2px 10px rgba(0, 0, 0, 0.12)';

    // Create button
    this.create();

    console.log('🎤 VoiceButton: Created');
  }

  /**
   * Create button element
   */
  create() {
    this.button = document.createElement('button');
    this.button.className = 'gracula-voice-button';
    this.button.setAttribute('aria-label', 'Voice Input');
    this.button.setAttribute('title', this.tooltip);
    this.button.setAttribute('aria-disabled', this.isDisabled ? 'true' : 'false');

    // Add microphone icon
    this.button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>
    `;

    // Style the button
    this.applyStyles();

    // Apply initial state
    this.setTooltip(this.tooltip);
    this.setDisabled(this.isDisabled);


    // Add click handler
    this.button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onClick();
    });

    // Add to page
    document.body.appendChild(this.button);

    // Position button
    this.position();

    // Reposition on window resize
    window.addEventListener('resize', () => this.position());

    // Reposition on scroll
    window.addEventListener('scroll', () => this.position(), true);
  }

  /**
   * Apply button styles
   */
  applyStyles() {
    this.button.style.cssText = `
      position: fixed;
      z-index: 2147483646;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: 3px solid white;
      color: white;
      cursor: pointer;
      box-shadow: ${this.defaultBoxShadow};
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      outline: none;
      opacity: 0.9;
    `;

    // Hover effect
    this.button.addEventListener('mouseenter', () => {
      if (!this.isRecording && !this.isDisabled) {
        this.button.style.transform = 'scale(1.1)';
        this.button.style.opacity = '1';
        this.button.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
      }
    });

    this.button.addEventListener('mouseleave', () => {
      if (!this.isRecording && !this.isDisabled) {
        this.button.style.transform = 'scale(1)';
        this.button.style.opacity = '0.9';
        this.button.style.boxShadow = this.defaultBoxShadow;
      }
    });
  }

  /**
   * Position button inside the input field (right side)
   */
  position() {
    if (!this.button || !this.inputField) return;

    try {
      const rect = this.inputField.getBoundingClientRect();

      // Position INSIDE the input field on the right side
      const top = rect.top + window.scrollY + (rect.height / 2) - 24;
      const left = rect.right + window.scrollX - 58; // 48px button width + 10px margin from right edge

      this.button.style.top = `${top}px`;
      this.button.style.left = `${left}px`;
    } catch (error) {
      console.warn('🎤 VoiceButton: Failed to position button:', error);
    }
  }

  /**
   * Set recording state
   */
  setRecording(isRecording) {
    if (!this.button) return;
    if (this.isDisabled) return;

    this.isRecording = isRecording;

    if (isRecording) {
      // Recording state
      this.button.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)';
      this.button.style.animation = 'gracula-pulse 1.5s ease-in-out infinite';
      this.button.setAttribute('title', 'Stop Recording');

      // Change icon to stop
      this.button.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="2"></rect>
        </svg>
      `;
    } else {
      // Idle state
      this.button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      this.button.style.animation = 'none';
      this.button.setAttribute('title', this.tooltip || 'Voice Input (Ctrl+Shift+V)');

      // Change icon back to microphone
      this.button.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      `;
    }
  }


  /**
   * Enable/disable button interaction
   */
  setDisabled(isDisabled) {
    this.isDisabled = Boolean(isDisabled);

    if (!this.button) return;

    this.button.setAttribute('aria-disabled', this.isDisabled ? 'true' : 'false');

    if (this.isDisabled) {
      this.isRecording = false;
      this.button.style.opacity = '0.45';
      this.button.style.cursor = 'not-allowed';
      this.button.style.boxShadow = this.disabledBoxShadow;
      this.button.style.transform = 'scale(1)';
      this.button.style.animation = 'none';
      this.button.style.background = 'linear-gradient(135deg, #c3cfe2 0%, #a0aec0 100%)';
      this.button.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      `;
    } else {
      this.button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      this.button.style.cursor = 'pointer';
      this.button.style.boxShadow = this.defaultBoxShadow;
      this.button.style.opacity = this.isRecording ? '1' : '0.9';
      this.setRecording(this.isRecording);
    }
  }

  /**
   * Enable button (convenience method)
   */
  setEnabled(isEnabled) {
    this.setDisabled(!isEnabled);
  }

  /**
   * Update tooltip text
   */
  setTooltip(text) {
    if (!text) return;
    this.tooltip = text;
    if (this.button) {
      this.button.setAttribute('title', text);
    }
  }

  /**
   * Update click handler
   */
  setOnClick(handler) {
    this.onClick = typeof handler === 'function' ? handler : () => {};
  }

  /**
   * Show button
   */
  show() {
    if (this.button) {
      this.button.style.display = 'flex';
      this.position();
    }
  }

  /**
   * Hide button
   */
  hide() {
    if (this.button) {
      this.button.style.display = 'none';
    }
  }

  /**
   * Remove button
   */
  remove() {
    if (this.button) {
      this.button.remove();
      this.button = null;
    }
  }

  /**
   * Destroy button
   */
  destroy() {
    this.remove();
    console.log('🎤 VoiceButton: Destroyed');
  }
};

// Add pulse animation to page
if (!document.getElementById('gracula-voice-animations')) {
  const style = document.createElement('style');
  style.id = 'gracula-voice-animations';
  style.textContent = `
    @keyframes gracula-pulse {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 4px 16px rgba(255, 107, 107, 0.4);
      }
      50% {
        transform: scale(1.05);
        box-shadow: 0 6px 24px rgba(255, 107, 107, 0.6);
      }
    }
  `;
  document.head.appendChild(style);
}

console.log('✅ VoiceButton class loaded');

