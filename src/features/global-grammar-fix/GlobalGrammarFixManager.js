// Global Grammar Fix Manager
// Works on ANY input field across all websites

window.Gracula = window.Gracula || {};

window.Gracula.GlobalGrammarFixManager = class {
  constructor() {
    this.isActive = false;
    this.currentField = null;
    
    // LanguageTool API configuration (free public API)
    this.apiEndpoint = 'https://api.languagetool.org/v2/check';
    
    // Keyboard shortcut
    this.shortcut = 'Ctrl+Shift+G';
    this.keydownHandler = null;

    console.log('📝 [GLOBAL GRAMMAR] GlobalGrammarFixManager: Initialized');
  }

  /**
   * Initialize global grammar fix
   */
  async init() {
    console.log('📝 [GLOBAL GRAMMAR] Starting initialization...');

    // Setup keyboard shortcut
    this.setupKeyboardShortcut();

    console.log('✅ [GLOBAL GRAMMAR] Started successfully! Press Ctrl+Shift+G in any input field');
  }

  /**
   * Setup keyboard shortcut (Ctrl+Shift+G)
   */
  setupKeyboardShortcut() {
    this.keydownHandler = (event) => {
      // Check for Ctrl+Shift+G
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'g') {
        event.preventDefault();
        event.stopPropagation();
        
        console.log('📝 [GLOBAL GRAMMAR] Ctrl+Shift+G pressed');
        
        // Get currently focused input field
        const activeElement = document.activeElement;
        
        if (this.isInputField(activeElement)) {
          this.currentField = activeElement;
          this.fixGrammar();
        } else {
          console.log('⚠️ [GLOBAL GRAMMAR] No input field focused');
          this.showNotification('Please focus on an input field first', 'warning');
        }
      }
    };

    document.addEventListener('keydown', this.keydownHandler, true);
    console.log('⌨️ [GLOBAL GRAMMAR] Keyboard shortcut registered (Ctrl+Shift+G)');
  }

  /**
   * Check if element is an input field
   */
  isInputField(element) {
    if (!element) return false;

    // Check for contentEditable divs
    if (element.contentEditable === 'true') {
      return true;
    }

    // Check for input/textarea
    const tagName = element.tagName.toLowerCase();
    if (tagName === 'input' || tagName === 'textarea') {
      return true;
    }

    return false;
  }

  /**
   * Fix grammar in current field
   */
  async fixGrammar() {
    if (!this.currentField) {
      console.error('❌ [GLOBAL GRAMMAR] No input field');
      return;
    }

    // Get current text
    const text = this.getInputText(this.currentField);

    if (!text || text.trim().length === 0) {
      console.log('⚠️ [GLOBAL GRAMMAR] No text to fix');
      this.showNotification('No text to fix', 'warning');
      return;
    }

    console.log('📝 [GLOBAL GRAMMAR] Fixing grammar for text:', text);

    // Show processing notification
    this.showNotification('Fixing grammar...', 'info');
    this.isActive = true;

    try {
      // Call LanguageTool API
      const corrections = await this.checkGrammar(text);

      if (corrections.length === 0) {
        console.log('✅ [GLOBAL GRAMMAR] No grammar issues found');
        this.showNotification('No grammar issues found! ✓', 'success');
        return;
      }

      // Apply corrections
      const fixedText = this.applyCorrections(text, corrections);

      // Update input field
      this.setInputText(this.currentField, fixedText);

      console.log('✅ [GLOBAL GRAMMAR] Grammar fixed');
      this.showNotification(`Fixed ${corrections.length} grammar issue${corrections.length > 1 ? 's' : ''}! ✓`, 'success');

    } catch (error) {
      console.error('❌ [GLOBAL GRAMMAR] Error fixing grammar:', error);
      this.showNotification(error.message || 'Failed to fix grammar', 'error');
    } finally {
      this.isActive = false;
    }
  }

  /**
   * Check grammar using LanguageTool API
   */
  async checkGrammar(text) {
    const formData = new URLSearchParams();
    formData.append('text', text);
    formData.append('language', 'auto'); // Auto-detect language
    formData.append('enabledOnly', 'false');

    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: formData.toString()
    });

    if (!response.ok) {
      throw new Error(`LanguageTool API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract matches (grammar issues)
    const matches = data.matches || [];

    console.log(`📝 [GLOBAL GRAMMAR] Found ${matches.length} grammar issues`);

    return matches;
  }

  /**
   * Apply corrections to text
   */
  applyCorrections(text, corrections) {
    // Sort corrections by offset (descending) to apply from end to start
    const sortedCorrections = corrections
      .filter(match => match.replacements && match.replacements.length > 0)
      .sort((a, b) => b.offset - a.offset);

    let fixedText = text;

    for (const match of sortedCorrections) {
      const { offset, length, replacements } = match;
      
      // Use the first suggested replacement
      const replacement = replacements[0].value;

      // Apply correction
      fixedText = 
        fixedText.substring(0, offset) + 
        replacement + 
        fixedText.substring(offset + length);

      console.log(`📝 Corrected: "${text.substring(offset, offset + length)}" → "${replacement}"`);
    }

    return fixedText;
  }

  /**
   * Get text from input field
   */
  getInputText(field) {
    if (!field) return '';

    // Handle contentEditable divs
    if (field.contentEditable === 'true') {
      return field.textContent || field.innerText || '';
    }

    // Handle regular input/textarea
    return field.value || '';
  }

  /**
   * Set text in input field
   */
  setInputText(field, text) {
    if (!field) return;

    // Handle contentEditable divs
    if (field.contentEditable === 'true') {
      // Clear existing content
      field.innerHTML = '';
      
      // Insert new text
      const textNode = document.createTextNode(text);
      field.appendChild(textNode);

      // Trigger input event
      field.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Focus and move cursor to end
      field.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(field);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      // Handle regular input/textarea
      field.value = text;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.focus();
    }
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'gracula-grammar-notification';
    
    let background = '';
    switch (type) {
      case 'success':
        background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        break;
      case 'error':
        background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        break;
      case 'warning':
        background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
        break;
      default:
        background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${background};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      animation: slideIn 0.3s ease;
    `;

    notification.textContent = `📝 ${message}`;
    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Destroy global grammar fix
   */
  destroy() {
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler, true);
    }

    console.log('📝 [GLOBAL GRAMMAR] Destroyed');
  }
}

