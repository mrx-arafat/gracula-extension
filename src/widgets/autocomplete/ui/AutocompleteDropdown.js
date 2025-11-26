// Autocomplete Dropdown Widget - REVAMPED
// Modern glassmorphic design with 5 suggestions, cursor-following, and visual indicators

window.Gracula = window.Gracula || {};

window.Gracula.AutocompleteDropdown = class {
  constructor(options = {}) {
    this.onSelect = options.onSelect || (() => {});
    this.onDismiss = options.onDismiss || (() => {});
    this.suggestions = [];
    this.selectedIndex = 0;
    this.isVisible = false;
    this.container = null;
    this.inputField = null;
	    // Hybrid layout: 3 quick chips + up to 4 contextual list items
	    this.maxSuggestions = 7;
    this.cursorPosition = null;
  }

  /**
   * Show autocomplete dropdown with suggestions
   */
  show(suggestions, inputField) {
	    this.suggestions = suggestions.slice(0, this.maxSuggestions);
    this.selectedIndex = 0;
    this.isVisible = true;
    this.inputField = inputField;

    // Store cursor position for better positioning
    this.updateCursorPosition();

    // Create or update dropdown
    if (!this.container) {
      this.createDropdown();
    }

    this.updateContent();
    this.positionNearCursor();
    this.container.style.display = 'block';

    // Trigger entrance animation
    this.animateEntrance();
  }

  /**
   * Hide autocomplete dropdown
   */
  hide() {
    this.isVisible = false;
    this.suggestions = [];
    this.selectedIndex = 0;

    if (this.container) {
      // Smooth exit animation
      this.container.style.animation = 'slideOut 0.1s ease-in';
      setTimeout(() => {
        this.container.style.display = 'none';
        this.container.style.animation = '';
      }, 100);
    }
  }

  /**
   * Create dropdown DOM element with glassmorphic design
   */
  createDropdown() {
    this.container = document.createElement('div');
    this.container.className = 'gracula-autocomplete-dropdown-v2';

    // Inject modern glassmorphic styles
    this.injectStyles();

    document.body.appendChild(this.container);
  }

  /**
   * Inject modern styles
   */
  injectStyles() {
    if (document.getElementById('gracula-autocomplete-v2-styles')) return;

    const style = document.createElement('style');
    style.id = 'gracula-autocomplete-v2-styles';
    style.textContent = `
      /* Container - Glassmorphic Design */
      .gracula-autocomplete-dropdown-v2 {
        position: fixed;
        z-index: 2147483647;

        /* Glassmorphism */
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);

        /* Border with gradient */
        border: 2px solid transparent;
        background-clip: padding-box;
        position: relative;

        /* Rounded corners */
        border-radius: 16px;

        /* Shadows for depth */
        box-shadow:
          0 8px 32px rgba(102, 126, 234, 0.2),
          0 4px 16px rgba(0, 0, 0, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.8);

        /* Sizing */
        min-width: 380px;
        max-width: 520px;
        max-height: 400px;
        overflow: hidden;

        /* Typography */
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;

        /* Hide by default */
        display: none;
      }

      /* Gradient border effect */
      .gracula-autocomplete-dropdown-v2::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 16px;
        padding: 2px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
      }

      /* Animations */
      @keyframes slideInFade {
        from {
          opacity: 0;
          transform: translateY(-8px) scale(0.97);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes slideOut {
        from {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        to {
          opacity: 0;
          transform: translateY(-8px) scale(0.97);
        }
      }

      /* Header */
      .gracula-autocomplete-header-v2 {
        padding: 12px 16px;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
        border-bottom: 1px solid rgba(102, 126, 234, 0.15);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .gracula-autocomplete-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 600;
        color: #667eea;
        letter-spacing: -0.2px;
      }

      .gracula-autocomplete-title .icon {
        font-size: 18px;
        filter: drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3));
      }

      .gracula-autocomplete-shortcuts {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .gracula-autocomplete-kbd {
        padding: 3px 6px;
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(102, 126, 234, 0.2);
        border-radius: 4px;
        font-size: 9px;
        font-weight: 600;
        color: #667eea;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        font-family: 'SF Mono', Monaco, 'Courier New', monospace;
      }

	      /* Suggestions Container */
	      .gracula-autocomplete-suggestions {
	        padding: 6px 8px 8px 8px;
	        max-height: 300px;
	        overflow-y: auto;
	      }

	      /* TOP: Quick chips row (first 3 suggestions) */
	      .gracula-autocomplete-chips-row {
	        display: flex;
	        flex-wrap: nowrap;
	        gap: 8px;
	        padding: 6px 10px 4px 10px;
	        border-bottom: 1px solid rgba(102, 126, 234, 0.14);
	        overflow-x: auto;
	        scrollbar-width: none;
	      }

	      .gracula-autocomplete-chips-row::-webkit-scrollbar {
	        display: none;
	      }

	      .gracula-autocomplete-chip {
	        display: inline-flex;
	        align-items: flex-start;
	        gap: 6px;
	        padding: 6px 10px;
	        border-radius: 999px;
	        border: 1px solid rgba(148, 163, 184, 0.55);
	        background: rgba(255, 255, 255, 0.96);
	        box-shadow: 0 2px 6px rgba(15, 23, 42, 0.08);
	        font-size: 11px;
	        cursor: pointer;
	        transition: all 0.14s cubic-bezier(0.4, 0, 0.2, 1);
	        /* Allow full sentences to wrap across multiple lines */
	        white-space: normal;
	        max-width: 100%;
	        overflow: visible;
	        text-overflow: unset;
	        line-height: 1.4;
	      }

	      .gracula-autocomplete-chip:hover {
	        transform: translateY(-1px);
	        box-shadow: 0 4px 10px rgba(15, 23, 42, 0.16);
	      }

	      .gracula-autocomplete-chip.selected {
	        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	        border-color: transparent;
	        color: #fff;
	        box-shadow: 0 6px 16px rgba(102, 126, 234, 0.45);
	      }

	      .gracula-autocomplete-chip-badge {
	        font-size: 10px;
	        font-weight: 600;
	        color: rgba(15, 23, 42, 0.78);
	        background: rgba(148, 163, 184, 0.35);
	        padding: 1px 6px;
	        border-radius: 999px;
	        font-family: 'SF Mono', Monaco, monospace;
	      }

	      .gracula-autocomplete-chip.selected .gracula-autocomplete-chip-badge {
	        background: rgba(255, 255, 255, 0.26);
	        color: #fff;
	      }

	      .gracula-autocomplete-chip-label {
	        /* Never truncate chip text; allow full sentence visibility */
	        overflow: visible;
	        text-overflow: unset;
	        white-space: normal;
	      }

      /* Custom Scrollbar */
      .gracula-autocomplete-suggestions::-webkit-scrollbar {
        width: 6px;
      }

      .gracula-autocomplete-suggestions::-webkit-scrollbar-track {
        background: rgba(102, 126, 234, 0.05);
        border-radius: 3px;
        margin: 4px;
      }

      .gracula-autocomplete-suggestions::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 3px;
      }

      .gracula-autocomplete-suggestions::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, #5568d3 0%, #5f3a85 100%);
      }

      /* Suggestion Item */
      .gracula-autocomplete-item-v2 {
        padding: 12px 14px;
        margin: 4px 0;
        border-radius: 10px;
        cursor: pointer;
        font-size: 14px;
        line-height: 1.5;
        transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        background: rgba(255, 255, 255, 0.5);
        border: 1px solid transparent;
        display: flex;
        align-items: center;
        gap: 10px;
        position: relative;
	        /* Allow text to grow naturally; container scroll handles overflow */
	        overflow: visible;
      }

      .gracula-autocomplete-item-v2:hover {
        background: rgba(102, 126, 234, 0.08);
        border-color: rgba(102, 126, 234, 0.2);
        transform: translateX(2px);
      }

      .gracula-autocomplete-item-v2.selected {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-color: transparent;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35);
        transform: translateX(4px) scale(1.01);
      }

      /* Source indicator */
      .gracula-autocomplete-source {
        font-size: 16px;
        flex-shrink: 0;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        transition: transform 0.15s ease;
      }

      .gracula-autocomplete-item-v2:hover .gracula-autocomplete-source {
        transform: scale(1.15);
      }

      .gracula-autocomplete-item-v2.selected .gracula-autocomplete-source {
        filter: drop-shadow(0 2px 6px rgba(255, 255, 255, 0.5));
      }

      /* Suggestion text */
      .gracula-autocomplete-text {
        flex: 1;
        color: #333;
        font-weight: 500;
        letter-spacing: -0.2px;
	        /* Slightly smaller text so long sentences fit more comfortably */
	        font-size: 13px;
	        line-height: 1.4;
	        white-space: normal;
	        word-break: break-word;
      }

      .gracula-autocomplete-item-v2.selected .gracula-autocomplete-text {
        color: white;
        font-weight: 600;
      }

      /* Number indicator */
      .gracula-autocomplete-number {
        font-size: 10px;
        font-weight: 700;
        color: rgba(102, 126, 234, 0.6);
        background: rgba(102, 126, 234, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'SF Mono', Monaco, monospace;
      }

      .gracula-autocomplete-item-v2.selected .gracula-autocomplete-number {
        background: rgba(255, 255, 255, 0.25);
        color: white;
      }

	      /* Detail preview for the currently selected suggestion (always full text) */
	      .gracula-autocomplete-preview {
	        padding: 8px 12px 10px 12px;
	        border-top: 1px dashed rgba(102, 126, 234, 0.3);
	        background: rgba(255, 255, 255, 0.9);
	      }

	      .gracula-autocomplete-preview-label {
	        font-size: 10px;
	        font-weight: 600;
	        text-transform: uppercase;
	        letter-spacing: 0.08em;
	        color: rgba(107, 114, 128, 0.9);
	        margin-bottom: 4px;
	      }

	      .gracula-autocomplete-preview-body {
	        font-size: 11px;
	        line-height: 1.5;
	        color: #111827;
	        max-height: 96px;
	        overflow-y: auto;
	        white-space: pre-wrap;
	        word-break: break-word;
	      }

      /* Loading State */
      .gracula-autocomplete-loading {
        padding: 32px 16px;
        text-align: center;
        color: #667eea;
      }

      .gracula-autocomplete-loading-dots {
        display: inline-flex;
        gap: 6px;
        margin-bottom: 12px;
      }

      .gracula-autocomplete-loading-dot {
        width: 10px;
        height: 10px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        animation: bounceDot 1.4s infinite ease-in-out both;
      }

      .gracula-autocomplete-loading-dot:nth-child(1) { animation-delay: -0.32s; }
      .gracula-autocomplete-loading-dot:nth-child(2) { animation-delay: -0.16s; }
      .gracula-autocomplete-loading-dot:nth-child(3) { animation-delay: 0s; }

      @keyframes bounceDot {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
        40% { transform: scale(1.0); opacity: 1; }
      }

      .gracula-autocomplete-loading-text {
        font-size: 13px;
        font-weight: 500;
        color: #667eea;
      }

      /* Footer */
      .gracula-autocomplete-footer-v2 {
        padding: 10px 16px;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
        border-top: 1px solid rgba(102, 126, 234, 0.15);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .gracula-autocomplete-count {
        font-size: 11px;
        font-weight: 600;
        color: #667eea;
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .gracula-autocomplete-hints {
        display: flex;
        gap: 8px;
        font-size: 10px;
        color: #999;
      }

      .gracula-autocomplete-hint {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      /* Entrance animation */
      .gracula-autocomplete-dropdown-v2.animating {
        animation: slideInFade 0.15s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Shimmer effect on loading */
      @keyframes shimmer {
        0% { background-position: -200px 0; }
        100% { background-position: 200px 0; }
      }

      .gracula-autocomplete-shimmer {
        background: linear-gradient(90deg,
          transparent 0%,
          rgba(102, 126, 234, 0.1) 50%,
          transparent 100%
        );
        background-size: 200px 100%;
        animation: shimmer 1.5s infinite;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Update dropdown content with modern UI
   */
  updateContent() {
    if (!this.container) return;

    this.container.innerHTML = '';

    // Loading state
    if (this.suggestions.length === 0) {
      const loadingState = document.createElement('div');
      loadingState.className = 'gracula-autocomplete-loading';
      loadingState.innerHTML = `
        <div class="gracula-autocomplete-loading-dots">
          <div class="gracula-autocomplete-loading-dot"></div>
          <div class="gracula-autocomplete-loading-dot"></div>
          <div class="gracula-autocomplete-loading-dot"></div>
        </div>
        <div class="gracula-autocomplete-loading-text">Generating suggestions...</div>
      `;
      this.container.appendChild(loadingState);
      return;
    }

    // Header
    const header = document.createElement('div');
    header.className = 'gracula-autocomplete-header-v2';
    header.innerHTML = `
      <div class="gracula-autocomplete-title">
        <span class="icon">⚡</span>
        <span>Smart Suggestions</span>
      </div>
      <div class="gracula-autocomplete-shortcuts">
	        <kbd class="gracula-autocomplete-kbd">Ctrl + 1-${Math.min(this.suggestions.length, this.maxSuggestions)}</kbd>
        <kbd class="gracula-autocomplete-kbd">↓↑</kbd>
        <kbd class="gracula-autocomplete-kbd">Enter</kbd>
        <kbd class="gracula-autocomplete-kbd">Esc</kbd>
      </div>
    `;
    this.container.appendChild(header);

	    const chipsCount = Math.min(3, this.suggestions.length);
	    const listStartIndex = chipsCount;

	    // QUICK CHIPS ROW (top 1-3 suggestions)
	    if (chipsCount > 0) {
	      const chipsRow = document.createElement('div');
	      chipsRow.className = 'gracula-autocomplete-chips-row';

	      for (let index = 0; index < chipsCount; index += 1) {
	        const suggestion = this.suggestions[index];
	        const chip = document.createElement('button');
	        chip.type = 'button';
	        chip.className = 'gracula-autocomplete-chip';
	        chip.dataset.index = String(index);
	        // Native tooltip so hovering always reveals the full sentence
	        chip.title = typeof suggestion === 'string' ? suggestion : String(suggestion ?? '');

	        const isSelected = index === this.selectedIndex;
	        if (isSelected) {
	          chip.classList.add('selected');
	        }

	        chip.innerHTML = `
	          <span class="gracula-autocomplete-chip-badge">[${index + 1}]</span>
	          <span class="gracula-autocomplete-chip-label">${this.escapeHtml(suggestion)}</span>
	        `;

	        chip.addEventListener('mouseenter', () => {
	          this.selectedIndex = index;
	          this.updateContent();
	        });

	        chip.addEventListener('mousedown', (e) => {
	          e.preventDefault();
	          e.stopPropagation();
	          this.selectedIndex = index;
	          this.selectCurrent();
	        });

	        chipsRow.appendChild(chip);
	      }

	      this.container.appendChild(chipsRow);
	    }

	    // Suggestions container (contextual list under chips)
	    const suggestionsContainer = document.createElement('div');
	    suggestionsContainer.className = 'gracula-autocomplete-suggestions';

	    for (let index = listStartIndex; index < this.suggestions.length; index += 1) {
	      const suggestion = this.suggestions[index];
	      const item = document.createElement('div');
	      item.className = 'gracula-autocomplete-item-v2';
	      item.dataset.index = String(index);
	      // Native tooltip on list items as a backup to the preview pane
	      item.title = typeof suggestion === 'string' ? suggestion : String(suggestion ?? '');

	      const sourceIcon = this.getSourceIcon(suggestion);
	      const isSelected = index === this.selectedIndex;
	      if (isSelected) {
	        item.classList.add('selected');
	      }

	      const hotkeyNumber = index + 1;
	      item.innerHTML = `
	        <span class="gracula-autocomplete-source">${sourceIcon}</span>
	        <span class="gracula-autocomplete-text">${this.escapeHtml(suggestion)}</span>
	        <kbd class="gracula-autocomplete-number">${hotkeyNumber}</kbd>
	      `;

	      item.addEventListener('mouseenter', () => {
	        this.selectedIndex = index;
	        this.updateContent();
	      });

	      item.addEventListener('click', (e) => {
	        e.preventDefault();
	        e.stopPropagation();
	        this.selectedIndex = index;
	        this.selectCurrent();
	      });

	      suggestionsContainer.appendChild(item);
	    }

	    this.container.appendChild(suggestionsContainer);

	    // Detail preview panel: always shows the full currently selected sentence
	    const previewWrapper = document.createElement('div');
	    previewWrapper.className = 'gracula-autocomplete-preview';

	    const previewLabel = document.createElement('div');
	    previewLabel.className = 'gracula-autocomplete-preview-label';
	    previewLabel.textContent = 'Preview';

	    const previewBody = document.createElement('div');
	    previewBody.className = 'gracula-autocomplete-preview-body';
	    const currentSuggestion =
	      typeof this.suggestions[this.selectedIndex] === 'string'
	        ? this.suggestions[this.selectedIndex]
	        : (this.suggestions[this.selectedIndex] ?? '').toString();
	    previewBody.textContent = currentSuggestion || '';

	    previewWrapper.appendChild(previewLabel);
	    previewWrapper.appendChild(previewBody);
	    this.container.appendChild(previewWrapper);

	    // Footer
    const footer = document.createElement('div');
    footer.className = 'gracula-autocomplete-footer-v2';
    footer.innerHTML = `
      <div class="gracula-autocomplete-count">
        <span>⚡</span>
        <span>${this.suggestions.length} suggestion${this.suggestions.length !== 1 ? 's' : ''}</span>
      </div>
      <div class="gracula-autocomplete-hints">
        <span class="gracula-autocomplete-hint">
          <kbd class="gracula-autocomplete-kbd">Enter</kbd> select
        </span>
        <span class="gracula-autocomplete-hint">
          <kbd class="gracula-autocomplete-kbd">Esc</kbd> dismiss
        </span>
      </div>
    `;
    this.container.appendChild(footer);
  }

  /**
   * Get source icon based on suggestion origin
   */
  getSourceIcon(suggestion) {
    // Heuristic to determine source
    const lowerSugg = suggestion.toLowerCase();

    // AI suggestions tend to be longer and more contextual
    if (suggestion.length > 50 || /\b(because|however|although|therefore)\b/i.test(suggestion)) {
      return '🤖'; // AI
    }

    // Short common phrases are likely from patterns
    if (suggestion.length < 15) {
      return '⚡'; // Offline/Fast
    }

    // N-gram predictions are medium length
    return '💡'; // Smart prediction
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

	  /**
	   * Position dropdown as a floating command palette near the active input.
	   * Prefer sitting immediately ABOVE the input; if there is not enough space,
	   * gracefully fall back to BELOW while staying within the viewport.
	   */
	  positionNearCursor() {
	    if (!this.container || !this.inputField) return;

	    const inputRect = this.inputField.getBoundingClientRect();
	    const viewportWidth = window.innerWidth;
	    const viewportHeight = window.innerHeight;

	    const dropdownHeight = Math.min(400, this.suggestions.length * 50 + 100);
	    const dropdownWidth = Math.max(380, Math.min(520, inputRect.width));
	    const spacing = 12;
	    const margin = 20;

	    // Center horizontally relative to the input field
	    let left = inputRect.left + (inputRect.width - dropdownWidth) / 2;
	    let top = inputRect.top - dropdownHeight - spacing; // prefer above input

	    // If not enough space above, place below the input
	    if (top < margin) {
	      top = inputRect.bottom + spacing;
	    }

	    // Clamp within viewport bounds
	    if (left + dropdownWidth > viewportWidth - margin) {
	      left = viewportWidth - dropdownWidth - margin;
	    }
	    if (left < margin) {
	      left = margin;
	    }
	    if (top + dropdownHeight > viewportHeight - margin) {
	      top = viewportHeight - dropdownHeight - margin;
	    }
	    if (top < margin) {
	      top = margin;
	    }

	    this.container.style.top = `${top}px`;
	    this.container.style.left = `${left}px`;
	    this.container.style.width = `${dropdownWidth}px`;
	    this.container.style.maxHeight = `${dropdownHeight}px`;
	  }

  /**
   * Update cursor position for better positioning
   */
  updateCursorPosition() {
    try {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.height > 0) {
          this.cursorPosition = {
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left,
            right: rect.right
          };
        }
      }
    } catch (error) {
      // Fallback to null
      this.cursorPosition = null;
    }
  }

  /**
   * Animate entrance
   */
  animateEntrance() {
    this.container.classList.add('animating');
    setTimeout(() => {
      this.container.classList.remove('animating');
    }, 150);
  }

  /**
	   * Navigate selection up (hybrid: list + chips)
	   */
	  navigateUp() {
	    if (this.suggestions.length === 0) return;

	    const chipsCount = Math.min(3, this.suggestions.length);
	    const hasChips = chipsCount > 0;
	    const listStartIndex = chipsCount;
	    const inListArea = this.selectedIndex >= listStartIndex;

	    if (!hasChips) {
	      // Simple vertical list behaviour
	      this.selectedIndex = this.selectedIndex > 0
	        ? this.selectedIndex - 1
	        : this.suggestions.length - 1;
	    } else if (inListArea) {
	      // Move within list, or jump back into chips from first list row
	      if (this.selectedIndex === listStartIndex) {
	        this.selectedIndex = chipsCount - 1; // jump to last chip
	      } else {
	        this.selectedIndex -= 1;
	      }
	    } else {
	      // Already in chips row: keep position on ArrowUp
	      return;
	    }

	    this.updateContent();
	    this.scrollToSelected();
	  }

	  /**
	   * Navigate selection down (chips row → list → list)
	   */
	  navigateDown() {
	    if (this.suggestions.length === 0) return;

	    const chipsCount = Math.min(3, this.suggestions.length);
	    const hasChips = chipsCount > 0;
	    const listStartIndex = chipsCount;
	    const listLength = this.suggestions.length - chipsCount;
	    const inListArea = this.selectedIndex >= listStartIndex;

	    if (!hasChips) {
	      // Simple vertical list behaviour
	      this.selectedIndex = this.selectedIndex < this.suggestions.length - 1
	        ? this.selectedIndex + 1
	        : 0;
	    } else if (!inListArea) {
	      // From chips row → jump into first list item (if any)
	      if (listLength > 0) {
	        this.selectedIndex = listStartIndex;
	      } else {
	        // Only chips, no list
	        this.selectedIndex = Math.min(this.selectedIndex + 1, chipsCount - 1);
	      }
	    } else {
	      // Within list area, move down but do not wrap back to chips
	      const lastListIndex = listStartIndex + listLength - 1;
	      if (this.selectedIndex < lastListIndex) {
	        this.selectedIndex += 1;
	      }
	    }

	    this.updateContent();
	    this.scrollToSelected();
	  }

  /**
   * Scroll to selected item
   */
  scrollToSelected() {
    const suggestionsContainer = this.container?.querySelector('.gracula-autocomplete-suggestions');
    if (!suggestionsContainer) return;

    const selectedItem = suggestionsContainer.querySelector('.gracula-autocomplete-item-v2.selected');
    if (selectedItem) {
      selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  /**
   * Select current suggestion
   */
  selectCurrent() {
    if (this.suggestions.length === 0) return;

    const selectedSuggestion = this.suggestions[this.selectedIndex];
    console.log('🎯 AutocompleteDropdown: selectCurrent called with:', selectedSuggestion);

    // Call the onSelect callback (this should trigger insertSuggestion)
    this.onSelect(selectedSuggestion);
  }

  /**
   * Handle keyboard events - ENHANCED with number key selection
   */
  handleKeydown(event) {
    console.log('🔍 [DROPDOWN] handleKeydown called:', {
      key: event.key,
      ctrlKey: event.ctrlKey,
      isVisible: this.isVisible,
      selectedIndex: this.selectedIndex
    });

	    if (!this.isVisible) {
	      return false;
	    }

	    const chipsCount = Math.min(3, this.suggestions.length);
	    const inChipsArea = this.selectedIndex < chipsCount;

	    // Ctrl + Number (1-7) for instant selection, aligned with badges
	    if (event.ctrlKey && event.key >= '1' && event.key <= '9') {
	      const index = parseInt(event.key, 10) - 1;
	      if (index >= 0 && index < this.suggestions.length && index < this.maxSuggestions) {
	        event.preventDefault();
	        event.stopPropagation();
	        event.stopImmediatePropagation();
	        this.selectedIndex = index;
	        this.selectCurrent();
	        return true;
	      }
	    }

	    // Ctrl+Tab to insert suggestion
    if (event.key === 'Tab' && event.ctrlKey) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      console.log('✅ [DROPDOWN] Ctrl+Tab pressed - inserting suggestion');
      this.selectCurrent();
      return true;
    }

    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        console.log('✅ [DROPDOWN] Enter pressed - inserting suggestion');
        this.selectCurrent();
        return true;

      case 'ArrowDown':
        event.preventDefault();
        event.stopPropagation();
        console.log('✅ [DROPDOWN] ArrowDown pressed - navigating down');
        this.navigateDown();
        return true;

      case 'ArrowUp':
        event.preventDefault();
        event.stopPropagation();
        console.log('✅ [DROPDOWN] ArrowUp pressed - navigating up');
        this.navigateUp();
        return true;

	      case 'ArrowRight': {
	        if (inChipsArea) {
	          event.preventDefault();
	          event.stopPropagation();
	          console.log('✅ [DROPDOWN] ArrowRight pressed - moving within chips');
	          const chipsMaxIndex = Math.min(3, this.suggestions.length) - 1;
	          if (this.selectedIndex < chipsMaxIndex) {
	            this.selectedIndex += 1;
	            this.updateContent();
	          }
	          return true;
	        }
	        return false;
	      }

	      case 'ArrowLeft': {
	        if (inChipsArea) {
	          event.preventDefault();
	          event.stopPropagation();
	          console.log('✅ [DROPDOWN] ArrowLeft pressed - moving within chips');
	          if (this.selectedIndex > 0) {
	            this.selectedIndex -= 1;
	            this.updateContent();
	          }
	          return true;
	        }
	        return false;
	      }

      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        console.log('✅ [DROPDOWN] Escape pressed - dismissing dropdown');
        this.hide();
        this.onDismiss();
        return true;

      case 'Tab':
        // Tab alone should NOT be handled
        console.log('⚠️ [DROPDOWN] Tab pressed without Ctrl - letting app handle it');
        return false;

      default:
        console.log('⚠️ [DROPDOWN] Unhandled key:', event.key);
        return false;
    }
  }

  /**
   * Destroy dropdown
   */
  destroy() {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    this.isVisible = false;
    this.suggestions = [];
  }
};
