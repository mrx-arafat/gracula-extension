// Ghost Text Overlay
// Renders inline ghost suggestion on top of the WhatsApp input field

window.Gracula = window.Gracula || {};

window.Gracula.GhostTextOverlay = class {
  constructor({ inputField, controller }) {
    this.inputField = inputField;
    this.controller = controller;

    this.overlay = null;
    this.inner = null;
    this.typedSpan = null;
    this.ghostSpan = null;

    this.unsubscribe = null;

    this.handleUpdate = this.handleUpdate.bind(this);
    this.handleWindowResize = this.handleWindowResize.bind(this);

    this.init();
  }

  init() {
    if (!this.inputField || !this.controller) return;

    this.createOverlay();
    this.unsubscribe = this.controller.subscribe(this.handleUpdate);

    window.addEventListener('resize', this.handleWindowResize);
    window.addEventListener('scroll', this.handleWindowResize, true);

    this.syncPosition();
  }

  createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'gracula-ghost-overlay';

    const inner = document.createElement('div');
    inner.className = 'gracula-ghost-overlay-inner';

    const typedSpan = document.createElement('span');
    typedSpan.className = 'gracula-ghost-typed';

    const ghostSpan = document.createElement('span');
    ghostSpan.className = 'gracula-ghost-suggestion';

    inner.appendChild(typedSpan);
    inner.appendChild(ghostSpan);
    overlay.appendChild(inner);

    document.body.appendChild(overlay);

    this.overlay = overlay;
    this.inner = inner;
    this.typedSpan = typedSpan;
    this.ghostSpan = ghostSpan;

    this.copyTextStyles();
  }

  copyTextStyles() {
    if (!this.inputField || !this.overlay) return;

    const style = window.getComputedStyle(this.inputField);

    this.overlay.style.fontFamily = style.fontFamily;
    this.overlay.style.fontSize = style.fontSize;
    this.overlay.style.lineHeight = style.lineHeight;
    this.overlay.style.letterSpacing = style.letterSpacing;
    this.overlay.style.textAlign = style.textAlign;
	    this.overlay.style.direction = style.direction;
	    // Match weight/style so character widths stay aligned with host text
	    this.overlay.style.fontWeight = style.fontWeight;
	    this.overlay.style.fontStyle = style.fontStyle;

	    // Align padding so ghost text starts exactly where the real text starts.
	    // This avoids the grey suggestion drifting left or right and overlapping
	    // with typed characters when the host input has internal padding.
	    if (this.inner) {
	      this.inner.style.paddingTop = style.paddingTop;
	      this.inner.style.paddingRight = style.paddingRight;
	      this.inner.style.paddingBottom = style.paddingBottom;
	      this.inner.style.paddingLeft = style.paddingLeft;
	    }
  }

  handleWindowResize() {
    this.syncPosition();
  }

  syncPosition() {
    if (!this.inputField || !this.overlay) return;

    const rect = this.inputField.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft || 0;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

    this.overlay.style.top = `${rect.top + scrollY}px`;
    this.overlay.style.left = `${rect.left + scrollX}px`;
    this.overlay.style.width = `${rect.width}px`;
    this.overlay.style.height = `${rect.height}px`;
  }

  handleUpdate(state) {
    if (!this.overlay || !this.typedSpan || !this.ghostSpan) return;

    const text = state?.text || '';
    const ghost = state?.ghostText || '';

    if (!ghost || !text) {
      this.overlay.style.opacity = '0';
      this.typedSpan.textContent = '';
      this.ghostSpan.textContent = '';
      return;
    }

    this.typedSpan.textContent = text;
    this.ghostSpan.textContent = ghost;

    this.syncPosition();
    this.overlay.style.opacity = '1';
  }

  destroy() {
    if (this.unsubscribe) {
      try {
        this.unsubscribe();
      } catch (e) {
        // ignore
      }
      this.unsubscribe = null;
    }

    window.removeEventListener('resize', this.handleWindowResize);
    window.removeEventListener('scroll', this.handleWindowResize, true);

    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }

    this.overlay = null;
    this.inner = null;
    this.typedSpan = null;
    this.ghostSpan = null;
  }
};
