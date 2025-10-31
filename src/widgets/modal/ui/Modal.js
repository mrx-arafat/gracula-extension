// Modal Widget
// Main modal dialog for tone selection and reply generation

window.Gracula = window.Gracula || {};

window.Gracula.Modal = class {
  constructor(options = {}) {
    this.onClose = options.onClose || (() => {});
    this.element = null;
    this.isOpen = false;
  }

  /**
   * Create and render the modal
   */
  render(content, options = {}) {
    if (this.element) {
      this.element.remove();
    }

    this.element = window.Gracula.DOMUtils.createElement('div', {
      id: 'gracula-modal'
    });

    // Support new three-column layout or legacy single-column
    const useNewLayout = options.newLayout !== false; // Default to new layout

    if (useNewLayout && typeof content === 'object' && content !== null &&
        'modeTabs' in content && 'toneSelector' in content && 'replyList' in content) {
      // New three-column layout
      this.element.innerHTML = `
        <div class="gracula-modal-content gracula-modal-new-layout">
          <div class="gracula-modal-header">
            <h2>🧛 Gracula AI Reply</h2>
            <button class="gracula-close-btn">&times;</button>
          </div>
          <div class="gracula-modal-body-wrapper">
            <!-- Mode Selection (Top) -->
            <div class="gracula-mode-section">
              ${content.modeTabs || ''}
            </div>

            <!-- Three-column layout -->
            <div class="gracula-three-column-layout">
              <!-- Left Sidebar: Tone Selector -->
              <aside class="gracula-left-sidebar">
                ${content.toneSelector || ''}
              </aside>

              <!-- Center: Replies -->
              <main class="gracula-center-content">
                ${content.replyList || ''}
              </main>

              <!-- Right Sidebar: Context Insights -->
              <aside class="gracula-right-sidebar">
                ${content.contextPanel || ''}
              </aside>
            </div>
          </div>
        </div>
      `;
    } else {
      // Legacy single-column layout (backwards compatible)
      this.element.innerHTML = `
        <div class="gracula-modal-content">
          <div class="gracula-modal-header">
            <h2>🧛 Gracula AI Reply</h2>
            <button class="gracula-close-btn">&times;</button>
          </div>
          <div class="gracula-modal-body">
            ${typeof content === 'string' ? content : content.legacy || ''}
          </div>
        </div>
      `;
    }

    document.body.appendChild(this.element);
    this.isOpen = true;

    // Add event listeners
    this.element.querySelector('.gracula-close-btn').addEventListener('click', () => {
      this.close();
    });

    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) {
        this.close();
      }
    });

    window.Gracula.logger.success('Modal rendered');

    return this.element;
  }

  /**
   * Update modal content
   */
  updateContent(content) {
    if (!this.element) return;

    const body = this.element.querySelector('.gracula-modal-body');
    if (body) {
      body.innerHTML = content;
    }
  }

  /**
   * Get modal body element (supports both old and new layouts)
   */
  getBody() {
    // Try new layout first
    const newBody = this.element?.querySelector('.gracula-modal-body-wrapper');
    if (newBody) return newBody;

    // Fall back to legacy layout
    return this.element?.querySelector('.gracula-modal-body');
  }

  /**
   * Get specific section from new layout
   */
  getSection(sectionClass) {
    return this.element?.querySelector(`.${sectionClass}`);
  }

  /**
   * Close the modal
   */
  close() {
    if (this.element) {
      this.element.remove();
      this.element = null;
      this.isOpen = false;
      window.Gracula.logger.info('Modal closed');
      this.onClose();
    }
  }

  /**
   * Check if modal is open
   */
  isModalOpen() {
    return this.isOpen;
  }
}



