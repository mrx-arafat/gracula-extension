// Autocomplete Dropdown Widget
// Shows inline suggestions while user is typing

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
  }

  /**
   * Show autocomplete dropdown with suggestions
   */
  show(suggestions, inputField) {
    this.suggestions = suggestions;
    this.selectedIndex = 0;
    this.isVisible = true;
    this.inputField = inputField;

    // Create or update dropdown
    if (!this.container) {
      this.createDropdown();
    }

    this.updateContent();
    this.position();
    this.container.style.display = 'block';
  }

  /**
   * Hide autocomplete dropdown
   */
  hide() {
    this.isVisible = false;
    this.suggestions = [];
    this.selectedIndex = 0;

    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  /**
   * Create dropdown DOM element
   */
  createDropdown() {
    this.container = document.createElement('div');
    this.container.className = 'gracula-autocomplete-dropdown';
    this.container.style.cssText = `
      position: fixed;
      z-index: 2147483647;
      background: white;
      border: 2px solid #667eea;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25), 0 2px 8px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      min-width: 350px;
      max-height: 280px;
      overflow-y: auto;
      display: none;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      animation: slideIn 0.2s ease-out;
    `;

    // Add slide-in animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .gracula-autocomplete-dropdown::-webkit-scrollbar {
        width: 8px;
      }
      .gracula-autocomplete-dropdown::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 8px;
      }
      .gracula-autocomplete-dropdown::-webkit-scrollbar-thumb {
        background: #667eea;
        border-radius: 8px;
      }
      .gracula-autocomplete-dropdown::-webkit-scrollbar-thumb:hover {
        background: #5568d3;
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(this.container);
  }

  /**
   * Update dropdown content with suggestions
   */
  updateContent() {
    if (!this.container) return;

    this.container.innerHTML = '';

    if (this.suggestions.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'gracula-autocomplete-empty';
      emptyState.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
          <div style="display: flex; gap: 4px;">
            <div style="width: 8px; height: 8px; background: #667eea; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; animation-delay: -0.32s;"></div>
            <div style="width: 8px; height: 8px; background: #667eea; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; animation-delay: -0.16s;"></div>
            <div style="width: 8px; height: 8px; background: #667eea; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both;"></div>
          </div>
          <span style="color: #667eea; font-weight: 500; font-size: 13px;">Generating suggestions...</span>
        </div>
      `;
      emptyState.style.cssText = `
        padding: 24px 16px;
        color: #666;
        font-size: 14px;
        text-align: center;
      `;

      // Add bounce animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `;
      if (!document.getElementById('gracula-bounce-animation')) {
        style.id = 'gracula-bounce-animation';
        document.head.appendChild(style);
      }

      this.container.appendChild(emptyState);
      return;
    }

    // Header
    const header = document.createElement('div');
    header.className = 'gracula-autocomplete-header';
    header.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 16px;">⚡</span>
          <strong style="font-size: 13px; font-weight: 600;">Gracula <span style="color: #764ba2;">SUPERFAST</span></strong>
        </div>
        <div style="font-size: 10px; color: #667eea; opacity: 0.9; display: flex; gap: 4px; flex-wrap: wrap;">
          <kbd style="padding: 2px 5px; background: white; border: 1px solid #ddd; border-radius: 3px; font-size: 9px;">Click</kbd>
          <kbd style="padding: 2px 5px; background: white; border: 1px solid #ddd; border-radius: 3px; font-size: 9px;">Enter</kbd>
          <kbd style="padding: 2px 5px; background: white; border: 1px solid #ddd; border-radius: 3px; font-size: 9px;">Tab</kbd>
          <kbd style="padding: 2px 5px; background: white; border: 1px solid #ddd; border-radius: 3px; font-size: 9px;">↓↑</kbd>
        </div>
      </div>
    `;
    header.style.cssText = `
      padding: 10px 14px;
      font-size: 12px;
      color: #667eea;
      border-bottom: 2px solid #e8ebfa;
      background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
      border-radius: 10px 10px 0 0;
      position: sticky;
      top: 0;
      z-index: 10;
    `;
    this.container.appendChild(header);

    // Suggestions
    this.suggestions.forEach((suggestion, index) => {
      const item = document.createElement('div');
      item.className = 'gracula-autocomplete-item';
      item.dataset.index = index;
      item.textContent = suggestion;

      const isSelected = index === this.selectedIndex;
      item.style.cssText = `
        padding: 12px 16px;
        cursor: pointer;
        font-size: 14px;
        line-height: 1.6;
        transition: all 0.15s ease;
        background: ${isSelected ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white'};
        color: ${isSelected ? 'white' : '#333'};
        border-left: 4px solid ${isSelected ? '#764ba2' : 'transparent'};
        margin: 4px 6px;
        border-radius: 6px;
        box-shadow: ${isSelected ? '0 2px 8px rgba(102, 126, 234, 0.3)' : 'none'};
        transform: ${isSelected ? 'translateX(2px)' : 'translateX(0)'};
      `;

      // Hover effect
      item.addEventListener('mouseenter', () => {
        this.selectedIndex = index;
        this.updateContent();
      });

      // Single click to select
      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.selectedIndex = index;
        this.selectCurrent();
      });

      // Double click to select (faster response)
      item.addEventListener('dblclick', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.selectedIndex = index;
        this.selectCurrent();
      });

      this.container.appendChild(item);
    });

    // Footer
    const footer = document.createElement('div');
    footer.className = 'gracula-autocomplete-footer';
    footer.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span style="color: #667eea; font-weight: 500; font-size: 11px;">⚡ ${this.suggestions.length} instant suggestion${this.suggestions.length !== 1 ? 's' : ''}</span>
        <span style="color: #999; font-size: 10px; display: flex; align-items: center; gap: 6px;">
          <span><kbd style="padding: 2px 5px; background: white; border: 1px solid #ddd; border-radius: 3px; font-size: 9px;">Enter</kbd> select</span>
          <span><kbd style="padding: 2px 5px; background: white; border: 1px solid #ddd; border-radius: 3px; font-size: 9px;">Esc</kbd> dismiss</span>
        </span>
      </div>
    `;
    footer.style.cssText = `
      padding: 8px 14px;
      font-size: 11px;
      color: #999;
      border-top: 2px solid #e8ebfa;
      background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%);
      border-radius: 0 0 10px 10px;
      position: sticky;
      bottom: 0;
      z-index: 10;
    `;
    this.container.appendChild(footer);
  }

  /**
   * Position dropdown near input field
   */
  position() {
    if (!this.container || !this.inputField) return;

    const inputRect = this.inputField.getBoundingClientRect();
    const dropdownHeight = 280; // max-height
    const spacing = 12; // space between input and dropdown

    // Calculate position
    let top = inputRect.bottom + spacing;
    let left = inputRect.left;

    // Check if dropdown would go off-screen at bottom
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - inputRect.bottom;
    const spaceAbove = inputRect.top;

    // Position above input if not enough space below
    if (spaceBelow < dropdownHeight + spacing && spaceAbove > spaceBelow) {
      top = inputRect.top - dropdownHeight - spacing;
    }

    // Check if dropdown would go off-screen on the right
    const viewportWidth = window.innerWidth;
    const dropdownWidth = Math.max(350, Math.min(500, inputRect.width));

    if (left + dropdownWidth > viewportWidth) {
      // Align to right edge of viewport with padding
      left = viewportWidth - dropdownWidth - 10;
    }

    // Ensure dropdown doesn't go off-screen on the left
    if (left < 10) {
      left = 10;
    }

    // Apply position using fixed positioning
    this.container.style.top = `${top}px`;
    this.container.style.left = `${left}px`;
    this.container.style.width = `${dropdownWidth}px`;
  }

  /**
   * Navigate selection up
   */
  navigateUp() {
    if (this.suggestions.length === 0) return;

    this.selectedIndex = this.selectedIndex > 0
      ? this.selectedIndex - 1
      : this.suggestions.length - 1;

    this.updateContent();
  }

  /**
   * Navigate selection down
   */
  navigateDown() {
    if (this.suggestions.length === 0) return;

    this.selectedIndex = this.selectedIndex < this.suggestions.length - 1
      ? this.selectedIndex + 1
      : 0;

    this.updateContent();
  }

  /**
   * Select current suggestion
   */
  selectCurrent() {
    if (this.suggestions.length === 0) return;

    const selectedSuggestion = this.suggestions[this.selectedIndex];
    console.log('🎯 AutocompleteDropdown: selectCurrent called with:', selectedSuggestion);
    console.log('🎯 AutocompleteDropdown: onSelect callback exists?', typeof this.onSelect);

    // Call the onSelect callback (this should trigger insertSuggestion)
    this.onSelect(selectedSuggestion);

    // Note: Don't hide here - let insertSuggestion handle hiding to avoid race conditions
    // this.hide();
  }

  /**
   * Handle keyboard events
   */
  handleKeydown(event) {
    if (!this.isVisible) return false;

    switch (event.key) {
      case 'ArrowDown':
      case 'Tab':
        event.preventDefault();
        this.navigateDown();
        return true;

      case 'ArrowUp':
        event.preventDefault();
        this.navigateUp();
        return true;

      case 'Enter':
        event.preventDefault();
        this.selectCurrent();
        return true;

      case 'Escape':
        event.preventDefault();
        this.hide();
        this.onDismiss();
        return true;

      default:
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
