// Floating Button Widget
// The purple vampire button that appears near input fields

import { createElement, getElementPosition } from '../../../shared/lib/index.js';
import { logger } from '../../../shared/lib/index.js';

export class FloatingButton {
  constructor(options = {}) {
    this.onClick = options.onClick || (() => {});
    this.inputField = options.inputField || null;
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

    this.element = createElement('div', {
      id: 'gracula-floating-btn',
      className: 'gracula-btn-visible'
    });

    this.element.innerHTML = `
      <div class="gracula-btn-icon">🧛</div>
      <div class="gracula-btn-tooltip">Gracula AI - Click me!</div>
    `;

    // Add click listener
    this.element.addEventListener('click', (e) => {
      e.stopPropagation();
      logger.info('Floating button clicked');
      this.onClick();
    });

    document.body.appendChild(this.element);
    this.isVisible = true;

    logger.success('Floating button rendered');

    return this.element;
  }

  /**
   * Position button near input field
   */
  position(inputField) {
    if (!this.element || !inputField) return;

    this.inputField = inputField;

    const inputPos = getElementPosition(inputField);
    if (!inputPos) return;

    // Position button to the right of input field
    const buttonTop = inputPos.top + (inputPos.height / 2) - 25; // Center vertically
    const buttonLeft = inputPos.right + 10; // 10px to the right

    this.element.style.position = 'fixed';
    this.element.style.top = `${buttonTop}px`;
    this.element.style.left = `${buttonLeft}px`;
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

export default FloatingButton;

