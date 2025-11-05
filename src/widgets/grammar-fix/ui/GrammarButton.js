// Grammar Fix Button Component
// Button for fixing grammar in text

window.Gracula = window.Gracula || {};

window.Gracula.GrammarButton = class {
  constructor(options = {}) {
    this.onClick = options.onClick || (() => {});
    this.inputField = options.inputField;
    this.isDisabled = Boolean(options.disabled);
    this.tooltip = options.tooltip || 'Fix Grammar (Ctrl+Shift+G)';
    this.container = options.container || null;
    this.compact = Boolean(options.compact);

    // State
    this.isProcessing = false;
    this.button = null;

    // Create button
    this.create();

    console.log('📝 GrammarButton: Created');
  }

  /**
   * Create the button element
   */
  create() {
    this.button = document.createElement('button');
    this.button.className = 'gracula-grammar-button';
    
    if (this.compact) {
      this.button.classList.add('gracula-compact');
    }

    // Grammar icon (pencil with checkmark)
    this.button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        <path d="M16 5l3 3"></path>
      </svg>
    `;

    this.button.setAttribute('title', this.tooltip);
    this.button.setAttribute('aria-label', 'Fix Grammar');

    // Apply styles
    this.applyStyles();

    // Add click handler
    this.button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      console.log('📝 [GRAMMAR BUTTON] Button clicked!');
      console.log('📝 [GRAMMAR BUTTON] isDisabled:', this.isDisabled);
      console.log('📝 [GRAMMAR BUTTON] isProcessing:', this.isProcessing);

      if (!this.isDisabled && !this.isProcessing) {
        console.log('📝 [GRAMMAR BUTTON] Calling onClick handler...');
        this.onClick();
      } else {
        console.log('⚠️ [GRAMMAR BUTTON] Button click ignored (disabled or processing)');
      }
    });

    // Render into container or body
    if (this.container) {
      this.container.appendChild(this.button);
    } else {
      document.body.appendChild(this.button);
    }
  }

  /**
   * Apply button styles
   */
  applyStyles() {
    const baseStyles = {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      border: 'none',
      borderRadius: '50%',
      width: this.compact ? '44px' : '56px',
      height: this.compact ? '44px' : '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: this.isDisabled ? 'not-allowed' : 'pointer',
      boxShadow: this.isDisabled ? '0 2px 10px rgba(0, 0, 0, 0.12)' : '0 4px 16px rgba(16, 185, 129, 0.4)',
      transition: 'all 0.3s ease',
      color: 'white',
      fontSize: '24px',
      zIndex: '2147483645',
      opacity: this.isDisabled ? '0.5' : '1'
    };

    Object.assign(this.button.style, baseStyles);

    // Hover effect
    if (!this.isDisabled) {
      this.button.addEventListener('mouseenter', () => {
        this.button.style.transform = 'scale(1.1)';
        this.button.style.boxShadow = '0 6px 24px rgba(16, 185, 129, 0.5)';
      });

      this.button.addEventListener('mouseleave', () => {
        if (!this.isProcessing) {
          this.button.style.transform = 'scale(1)';
          this.button.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.4)';
        }
      });
    }
  }

  /**
   * Set processing state
   */
  setProcessing(isProcessing) {
    this.isProcessing = isProcessing;

    if (isProcessing) {
      // Processing state
      this.button.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      this.button.style.animation = 'gracula-pulse 1.5s ease-in-out infinite';
      this.button.setAttribute('title', 'Fixing grammar...');

      // Change icon to loading spinner
      this.button.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
          </path>
        </svg>
      `;
    } else {
      // Idle state
      this.button.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      this.button.style.animation = 'none';
      this.button.setAttribute('title', this.tooltip);

      // Restore grammar icon
      this.button.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          <path d="M16 5l3 3"></path>
        </svg>
      `;
    }
  }

  /**
   * Enable the button
   */
  enable() {
    this.isDisabled = false;
    this.button.style.cursor = 'pointer';
    this.button.style.opacity = '1';
    this.button.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.4)';
    this.applyStyles();
  }

  /**
   * Disable the button
   */
  disable() {
    this.isDisabled = true;
    this.button.style.cursor = 'not-allowed';
    this.button.style.opacity = '0.5';
    this.button.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.12)';
  }

  /**
   * Remove the button
   */
  destroy() {
    if (this.button && this.button.parentNode) {
      this.button.remove();
    }
    console.log('📝 GrammarButton: Destroyed');
  }
}

