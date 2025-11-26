// Ghost Text / Inline Autocomplete Controller
// Responsible for managing inline ghost suggestions for the active input field

window.Gracula = window.Gracula || {};

window.Gracula.GhostTextController = class {
  constructor({ inputField, contextExtractor, autocompleteManager, debounceDelay = 260 }) {
    this.inputField = inputField;
    this.contextExtractor = contextExtractor;
    this.autocompleteManager = autocompleteManager;

    this.debounceDelay = debounceDelay;
    this.debounceTimer = null;

    this.requestId = 0;
    this.latestResolvedRequestId = 0;

    this.contextCache = null;
    this.lastContextUpdate = 0;
    this.contextCacheDuration = 10000; // 10s cache for context

    this.currentText = '';
    this.currentGhostText = '';
    this.currentFullSuggestion = '';

    this.subscribers = new Set();

    this.handleInput = this.handleInput.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
  }

  /** Start listening to input + key events */
  start() {
    if (!this.inputField) return;

    this.inputField.addEventListener('input', this.handleInput);
    // Use bubble phase so AutocompleteManager (which uses capture) runs first
    this.inputField.addEventListener('keydown', this.handleKeydown);
  }

  /** Clean up listeners and state */
  destroy() {
    if (this.inputField) {
      this.inputField.removeEventListener('input', this.handleInput);
      this.inputField.removeEventListener('keydown', this.handleKeydown);
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    this.currentGhostText = '';
    this.currentFullSuggestion = '';
    this.notifySubscribers();
  }

  /** Subscribe to state changes */
  subscribe(listener) {
    if (typeof listener !== 'function') return () => {};

    this.subscribers.add(listener);
    // Immediately push current state
    try {
      listener(this.getState());
    } catch (e) {
      // Ignore subscriber errors
    }

    return () => {
      this.subscribers.delete(listener);
    };
  }

  getState() {
    return {
      text: this.currentText,
      ghostText: this.currentGhostText,
      fullSuggestion: this.currentFullSuggestion
    };
  }

  notifySubscribers() {
    const state = this.getState();
    this.subscribers.forEach((listener) => {
      try {
        listener(state);
      } catch (e) {
        // Never break on subscriber errors
      }
    });
  }

  /** Handle user typing */
  handleInput() {
    if (!this.isFeatureEnabled()) {
      this.clearSuggestion();
      return;
    }

    const text = this.getCurrentText();
    this.currentText = text;

	    // Clear any existing ghost when text changes so we never show
	    // a stale suggestion that no longer matches the current input.
	    // Notify subscribers so the overlay can hide immediately when
	    // the user deletes everything or when WhatsApp clears the box
	    // after sending a message.
	    this.clearSuggestion(true);

	    if (!text || text.trim().length < 3) {
	      // Too short for ghost text; avoid spamming API
	      return;
	    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.fetchSuggestion(text);
    }, this.debounceDelay);
  }

  /** Handle keydown for accepting/dismissing ghost text */
  handleKeydown(event) {
    // Esc: dismiss current ghost suggestion but let other handlers run
    if (event.key === 'Escape') {
      if (this.currentGhostText) {
        this.clearSuggestion(true);
      }
      return;
    }

	    // Enter (without modifiers): message is being sent in WhatsApp.
	    // Let WhatsApp handle the send, but immediately clear any ghost
	    // suggestion so it doesn't remain visible over an empty composer.
	    if (event.key === 'Enter' && !event.shiftKey && !event.altKey && !event.ctrlKey) {
	      this.currentText = '';
	      this.clearSuggestion(true);
	      return;
	    }

    // Right Arrow: accept ghost text when available
    if (event.key === 'ArrowRight') {
      if (!this.currentGhostText) return;

      // If dropdown is visible, let it handle arrow keys (don't interfere)
      if (this.autocompleteManager?.autocompleteDropdown?.isVisible) return;

      event.preventDefault();
      event.stopPropagation();

      this.acceptCurrentSuggestion();
    }
  }

  /** Accept the current ghost suggestion and insert into the editor */
  acceptCurrentSuggestion() {
    if (!this.currentFullSuggestion) return;

    // Prefer using AutocompleteManager's insertion logic for Lexical compatibility
    if (this.autocompleteManager && typeof this.autocompleteManager.insertSuggestion === 'function') {
      this.autocompleteManager.insertSuggestion(this.currentFullSuggestion);
    } else {
      this.insertTextFallback(this.currentFullSuggestion);
    }

    this.clearSuggestion(true);
  }

  insertTextFallback(value) {
    if (!this.inputField) return;

    if (this.inputField.contentEditable === 'true') {
      this.inputField.focus();

      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(this.inputField);
      selection.removeAllRanges();
      selection.addRange(range);

      try {
        document.execCommand('insertText', false, value);
      } catch (error) {
        // Fallback: direct textContent assignment (less ideal for Lexical)
        this.inputField.textContent = value;
      }
    } else {
      const prototype = Object.getPrototypeOf(this.inputField);
      const valueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

      if (valueSetter) {
        valueSetter.call(this.inputField, value);
      } else {
        this.inputField.value = value;
      }

      const inputEvent = new Event('input', { bubbles: true, cancelable: true });
      this.inputField.dispatchEvent(inputEvent);
    }
  }

  /** Clear current ghost suggestion */
  clearSuggestion(notify = true) {
    this.currentGhostText = '';
    this.currentFullSuggestion = '';
    if (notify) this.notifySubscribers();
  }

  /** Read current text from the input field */
  getCurrentText() {
    if (!this.inputField) return '';

    if (this.inputField.contentEditable === 'true') {
      return this.inputField.textContent || '';
    }

    return this.inputField.value || '';
  }

  /** Check whether ghost text should be active based on config */
  isFeatureEnabled() {
    // Respect AutocompleteManager master switch + AI toggle when available
    if (this.autocompleteManager) {
      if (this.autocompleteManager.enabled === false) return false;
      if (this.autocompleteManager.useAI === false) return false;
	      // Respect Ghost Text specific toggle when present
	      if (this.autocompleteManager.ghostTextEnabled === false) return false;
    }

    return true;
  }

  async getCachedContext() {
    const now = Date.now();
    if (this.contextCache && (now - this.lastContextUpdate) < this.contextCacheDuration) {
      return this.contextCache;
    }

    if (!this.contextExtractor) {
      this.contextCache = [];
      this.lastContextUpdate = now;
      return this.contextCache;
    }

    const context = await this.contextExtractor.extract();
    this.contextCache = context || [];
    this.lastContextUpdate = now;
    return this.contextCache;
  }

  /** Lightweight analysis of the partial text for better prompts */
  analyzePartialText(text) {
    const trimmedText = (text || '').trim();
    const words = trimmedText ? trimmedText.split(/\s+/) : [];
    const lastWord = words.length ? words[words.length - 1] : '';

    const isQuestion = /\b(what|when|where|who|why|how|ki|keno|kobe)\b/i.test(trimmedText);
    const isGreeting = /^(hi|hey|hello|hola|namaste|salam|assalam)/i.test(trimmedText);
    const isAgreement = /^(yes|yeah|yup|ok|okay|sure|hoo|thik)/i.test(trimmedText);
    const isDisagreement = /^(no|nah|nope|na)/i.test(trimmedText);

    return {
      text: trimmedText,
      wordCount: words.length,
      lastWord,
      isQuestion,
      isGreeting,
      isAgreement,
      isDisagreement,
      endsWithPunctuation: /[.!?,]$/.test(trimmedText),
      isComplete: trimmedText.length > 10 && /[.!?]$/.test(trimmedText),
      lastMessageContext: this.autocompleteManager?.analyzeLastMessage
        ? this.autocompleteManager.analyzeLastMessage()
        : null
    };
  }

  /** Fetch ghost suggestion from background AI */
  async fetchSuggestion(text) {
    this.debounceTimer = null;

    if (!this.isFeatureEnabled()) {
      this.clearSuggestion();
      return;
    }

    const currentRequestId = ++this.requestId;

    try {
      await this.getCachedContext();

      const simpleContext = this.contextExtractor?.getSimpleContext() || [];
      const enhancedContext = this.contextExtractor?.getEnhancedContext() || {};
      const analysis = this.analyzePartialText(text);

      const suggestions = await this.requestAutocompletions({
        partialText: text,
        analysis,
        context: simpleContext,
        enhancedContext
      });

      if (currentRequestId < this.latestResolvedRequestId) {
        return;
      }

      this.latestResolvedRequestId = currentRequestId;

      if (!suggestions || !suggestions.length) {
        this.clearSuggestion();
        return;
      }

      const full = suggestions[0];
      if (!full || typeof full !== 'string') {
        this.clearSuggestion();
        return;
      }

      const ghost = this.computeGhostSuffix(text, full);
      if (!ghost) {
        this.clearSuggestion();
        return;
      }

      this.currentGhostText = ghost;
      this.currentFullSuggestion = full;
      this.notifySubscribers();
    } catch (error) {
      console.warn('🧛 GhostText: Failed to fetch suggestion:', error?.message || error);
      if (currentRequestId >= this.latestResolvedRequestId) {
        this.clearSuggestion();
      }
    }
  }

  /** Call background to generate autocomplete suggestions */
  async requestAutocompletions(data) {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage({
          action: 'generateAutocompletions',
          partialText: data.partialText,
          analysis: data.analysis,
          context: data.context,
          enhancedContext: data.enhancedContext
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.warn('🧛 GhostText: runtime error:', chrome.runtime.lastError.message);
            resolve([]);
            return;
          }

          if (response && response.success && Array.isArray(response.suggestions)) {
            resolve(response.suggestions);
          } else {
            resolve([]);
          }
        });
      } catch (error) {
        console.warn('🧛 GhostText: sendMessage failed:', error?.message || error);
        resolve([]);
      }
    });
  }

  /** Compute ghost suffix that extends currentText with suggestion */
  computeGhostSuffix(currentText, suggestion) {
    const base = currentText || '';
    const suggestionText = suggestion || '';

    if (!suggestionText) return '';

    // If suggestion already starts with the exact typed text (case-insensitive),
    // return the remaining tail so we don't duplicate characters.
    const lowerBase = base.toLowerCase();
    const lowerSuggestion = suggestionText.toLowerCase();

    if (lowerSuggestion.startsWith(lowerBase) && base.length < suggestionText.length) {
      return suggestionText.slice(base.length);
    }

    // Fallback: try matching on trimmed forms (handles minor spacing differences)
    const trimmedBase = base.trim();
    if (!trimmedBase) return '';

    const trimmedSuggestion = suggestionText.trim();
    const lowerTrimmedBase = trimmedBase.toLowerCase();
    const lowerTrimmedSuggestion = trimmedSuggestion.toLowerCase();

    if (lowerTrimmedSuggestion.startsWith(lowerTrimmedBase) && trimmedBase.length < trimmedSuggestion.length) {
      const idx = lowerSuggestion.indexOf(lowerTrimmedBase);
      if (idx !== -1) {
        return suggestionText.slice(idx + trimmedBase.length);
      }
    }

    return '';
  }
};
