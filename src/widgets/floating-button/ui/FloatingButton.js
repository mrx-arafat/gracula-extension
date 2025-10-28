// Floating Button Widget
// The purple vampire button that appears near input fields

window.Gracula = window.Gracula || {};

window.Gracula.FloatingButton = class {
  constructor(options = {}) {
    this.onClick = options.onClick || (() => {});
    this.inputField = options.inputField || null;
    this.container = options.container || null;
    this.compact = Boolean(options.compact);
    this.element = null;
    this.isVisible = false;
  }

  /**
   * Create and render the button
   */
  render() {
    if (this.element) {
      this.element.remove();
    }

    this.element = window.Gracula.DOMUtils.createElement('div', {
      id: 'gracula-floating-btn',
      className: 'gracula-btn-visible'
    });

    // Optional compact style
    if (this.compact) {
      this.element.classList.add('gracula-compact');
    }

    this.element.innerHTML = `
      <div class="gracula-btn-icon">🧛</div>
      <div class="gracula-btn-tooltip">Gracula AI - Click me!</div>
    `;

    // Add click listener
    this.element.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onClick();
    });

    if (this.container) {
      this.container.appendChild(this.element);
    } else {
      document.body.appendChild(this.element);
    }
    this.isVisible = true;

    return this.element;
  }

  /**
   * Position button near input field
   */
  position(inputField) {
    if (!this.element || !inputField) return;

    this.inputField = inputField;

    // Position button at bottom right corner of viewport
    this.element.style.position = 'fixed';
    this.element.style.bottom = '20px';
    this.element.style.right = '20px';
    this.element.style.top = 'auto';
    this.element.style.left = 'auto';
    this.element.style.zIndex = '999999';
  }

  /**
   * Show the button
   */
  show() {
    if (this.element) {
      this.element.classList.add('gracula-btn-visible');
      this.isVisible = true;
    }
  }

  /**
   * Hide the button
   */
  hide() {
    if (this.element) {
      this.element.classList.remove('gracula-btn-visible');
      this.isVisible = false;
    }
  }

  /**
   * Remove the button from DOM
   */
  destroy() {
    if (this.element) {
      this.element.remove();
      this.element = null;
      this.isVisible = false;
    }
  }

  /**
   * Update position on scroll/resize
   */
  updatePosition() {
    if (this.inputField) {
      this.position(this.inputField);
    }
  }
}



