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
  render(content) {
    if (this.element) {
      this.element.remove();
    }

    this.element = window.Gracula.DOMUtils.createElement('div', {
      id: 'gracula-modal'
    });

    this.element.innerHTML = `
      <div class="gracula-modal-content">
        <div class="gracula-modal-header">
          <h2>🧛 Gracula AI Reply</h2>
          <button class="gracula-close-btn">&times;</button>
        </div>
        <div class="gracula-modal-body">
          ${content}
        </div>
      </div>
    `;

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
   * Get modal body element
   */
  getBody() {
    return this.element?.querySelector('.gracula-modal-body');
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



