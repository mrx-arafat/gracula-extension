// Grammar Fix Manager
// Manages grammar checking and fixing using LanguageTool API

window.Gracula = window.Gracula || {};

window.Gracula.GrammarFixManager = class {
  constructor(options = {}) {
    this.inputField = options.inputField;
    this.button = null;
    this.container = options.container || null;
    this.onFix = options.onFix || (() => {});
    this.onError = options.onError || (() => {});

    // LanguageTool API configuration (free public API)
    this.apiEndpoint = 'https://api.languagetool.org/v2/check';
    
    // Keyboard shortcut
    this.shortcut = 'Ctrl+Shift+G';
    this.keydownHandler = null;

    console.log('📝 GrammarFixManager: Initialized');
  }

  /**
   * Start grammar fix manager
   */
  start() {
    // Create grammar button
    if (window.Gracula.GrammarButton) {
      this.button = new window.Gracula.GrammarButton({
        inputField: this.inputField,
        container: this.container,
        compact: true,
        onClick: () => this.fixGrammar()
      });
    }

    // Setup keyboard shortcut
    this.setupKeyboardShortcut();

    console.log('✅ GrammarFixManager: Started');
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
        this.fixGrammar();
      }
    };

    document.addEventListener('keydown', this.keydownHandler, true);
    console.log('⌨️ GrammarFixManager: Keyboard shortcut registered (Ctrl+Shift+G)');
  }

  /**
   * Fix grammar in input field (with iterative checking)
   */
  async fixGrammar() {
    console.log('📝 [GRAMMAR FIX] fixGrammar() called');

    if (!this.inputField) {
      console.error('❌ GrammarFixManager: No input field');
      return;
    }

    console.log('📝 [GRAMMAR FIX] Input field found:', this.inputField);

    // Get current text
    const originalText = this.getInputText();
    console.log('📝 [GRAMMAR FIX] Original text:', originalText);

    if (!originalText || originalText.trim().length === 0) {
      console.log('⚠️ GrammarFixManager: No text to fix');
      this.onError('No text to fix');
      return;
    }

    console.log('📝 GrammarFixManager: Fixing grammar for text:', originalText);

    // Set button to processing state
    if (this.button) {
      this.button.setProcessing(true);
    }

    try {
      let currentText = originalText;
      let totalCorrections = 0;
      let iterationCount = 0;
      const maxIterations = 5; // Prevent infinite loops

      // Iteratively check and fix grammar until no more corrections are found
      while (iterationCount < maxIterations) {
        iterationCount++;
        console.log(`📝 [GRAMMAR FIX] Iteration ${iterationCount}: Checking grammar for: "${currentText}"`);

        // Call LanguageTool API
        const corrections = await this.checkGrammar(currentText);
        console.log(`📝 [GRAMMAR FIX] Iteration ${iterationCount}: Found ${corrections.length} corrections`);

        if (corrections.length === 0) {
          console.log(`✅ [GRAMMAR FIX] No more corrections found after ${iterationCount} iteration(s)`);
          break;
        }

        // Apply corrections to get the next iteration's text
        const fixedText = this.applyCorrections(currentText, corrections);
        console.log(`📝 [GRAMMAR FIX] Iteration ${iterationCount}: Fixed text: "${fixedText}"`);

        // Check if text actually changed
        if (fixedText === currentText) {
          console.log('⚠️ [GRAMMAR FIX] Text did not change, stopping iterations');
          break;
        }

        currentText = fixedText;
        totalCorrections += corrections.length;
      }

      if (totalCorrections === 0) {
        console.log('✅ GrammarFixManager: No grammar issues found');
        this.onFix('No grammar issues found! ✓');
        return;
      }

      // Update input field with final corrected text (only once at the end)
      console.log(`📝 [GRAMMAR FIX] Setting final corrected text: "${currentText}"`);
      this.setInputText(currentText);
      console.log('📝 [GRAMMAR FIX] Input text set successfully');

      console.log(`✅ GrammarFixManager: Grammar fixed (${totalCorrections} total corrections in ${iterationCount} iteration(s))`);
      this.onFix(`Fixed ${totalCorrections} grammar issue${totalCorrections > 1 ? 's' : ''}! ✓`);

    } catch (error) {
      console.error('❌ GrammarFixManager: Error fixing grammar:', error);
      console.error('❌ [GRAMMAR FIX] Error stack:', error.stack);
      this.onError(error.message || 'Failed to fix grammar');
    } finally {
      // Reset button state
      if (this.button) {
        this.button.setProcessing(false);
      }
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

    console.log(`📝 GrammarFixManager: Found ${matches.length} grammar issues`);

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
      const { offset, length, replacements, rule } = match;

      // Get the original text being replaced
      const originalText = text.substring(offset, offset + length);

      // Use the first suggested replacement
      let replacement = replacements[0].value;

      // SPECIAL CASE: Fix for subject-verb agreement with "don't" → "doesn't"
      // The API sometimes suggests "does" instead of "doesn't", which removes negation
      if (rule && rule.id === 'HE_VERB_AGR' && originalText.toLowerCase().includes("don't")) {
        // Check if any replacement contains "doesn't"
        const doesntReplacement = replacements.find(r => r.value.toLowerCase().includes("doesn't"));
        if (doesntReplacement) {
          replacement = doesntReplacement.value;
          console.log(`📝 [SPECIAL CASE] Using "doesn't" instead of "${replacements[0].value}"`);
        } else {
          // If "doesn't" is not in suggestions, construct it manually
          replacement = "doesn't";
          console.log(`📝 [SPECIAL CASE] Manually using "doesn't" for "${originalText}"`);
        }
      }

      // Apply correction
      fixedText =
        fixedText.substring(0, offset) +
        replacement +
        fixedText.substring(offset + length);

      console.log(`📝 Corrected: "${originalText}" → "${replacement}"`);
    }

    return fixedText;
  }

  /**
   * Get text from input field
   */
  getInputText() {
    if (!this.inputField) return '';

    // Handle contentEditable divs (WhatsApp Web)
    if (this.inputField.contentEditable === 'true') {
      return this.inputField.textContent || this.inputField.innerText || '';
    }

    // Handle regular input/textarea
    return this.inputField.value || '';
  }

  /**
   * Set text in input field
   */
  setInputText(text) {
    if (!this.inputField) return;

    console.log('📝 [GRAMMAR FIX] setInputText called with:', text);

    // Handle contentEditable divs (WhatsApp Web)
    if (this.inputField.contentEditable === 'true') {
      console.log('📝 [GRAMMAR FIX] Detected contentEditable div');

      // WhatsApp-specific method: Select all, delete, then type new text
      try {
        // Focus the field first
        this.inputField.focus();

        console.log('📝 [GRAMMAR FIX] Focused input field');

        // Select all content
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(this.inputField);
        selection.removeAllRanges();
        selection.addRange(range);

        console.log('📝 [GRAMMAR FIX] Selected all content');

        // Simulate Backspace key press to delete selected content
        // This is the most reliable way to update WhatsApp's internal state
        const backspaceEvent = new KeyboardEvent('keydown', {
          key: 'Backspace',
          code: 'Backspace',
          keyCode: 8,
          which: 8,
          bubbles: true,
          cancelable: true
        });
        this.inputField.dispatchEvent(backspaceEvent);

        // Also dispatch keyup event
        const backspaceUpEvent = new KeyboardEvent('keyup', {
          key: 'Backspace',
          code: 'Backspace',
          keyCode: 8,
          which: 8,
          bubbles: true,
          cancelable: true
        });
        this.inputField.dispatchEvent(backspaceUpEvent);

        // Trigger input event after deletion
        this.inputField.dispatchEvent(new Event('input', { bubbles: true }));

        console.log('📝 [GRAMMAR FIX] Simulated Backspace to clear selected content');

        // Small delay before starting to type
        setTimeout(() => {
          console.log('📝 [GRAMMAR FIX] Starting to type new text');

          // Type each character one by one to simulate real typing
          let charIndex = 0;
          const typeNextChar = () => {
            if (charIndex >= text.length) {
              console.log('📝 [GRAMMAR FIX] Finished typing all characters');

              // Final input event
              this.inputField.dispatchEvent(new Event('input', { bubbles: true }));
              this.inputField.dispatchEvent(new Event('change', { bubbles: true }));

              return;
            }

            const char = text[charIndex];

            // Insert the character using document.execCommand
            document.execCommand('insertText', false, char);

            // Trigger input event
            this.inputField.dispatchEvent(new Event('input', { bubbles: true }));

            charIndex++;

            // Type next character (small delay to simulate real typing)
            setTimeout(typeNextChar, 1);
          };

          // Start typing
          typeNextChar();
        }, 50); // 50ms delay before typing

        console.log('📝 [GRAMMAR FIX] Scheduled typing');

        return;
      } catch (error) {
        console.error('❌ [GRAMMAR FIX] WhatsApp typing simulation failed:', error);
      }
    } else {
      // Handle regular input/textarea
      console.log('📝 [GRAMMAR FIX] Detected regular input/textarea');
      this.inputField.value = text;
      this.inputField.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
      this.inputField.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
      this.inputField.focus();
    }
  }

  /**
   * Destroy grammar fix manager
   */
  destroy() {
    // Remove keyboard shortcut
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler, true);
    }

    // Destroy button
    if (this.button) {
      this.button.destroy();
      this.button = null;
    }

    console.log('📝 GrammarFixManager: Destroyed');
  }
}

