// Tone Selector Widget
// Grid of tone buttons for user selection

window.Gracula = window.Gracula || {};

window.Gracula.ToneSelector = class {
  constructor(options = {}) {
    this.onToneSelect = options.onToneSelect || (() => {});
    this.tones = window.Gracula.Config.TONES.map(config => new window.Gracula.Tone(config));
    this.useAI = false; // Default: use local/cached suggestions
  }

  /**
   * Render tone selector HTML
   */
  render() {
    const html = `
      <div class="gracula-tone-selector">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="margin: 0;">Select Tone:</h3>
          <div class="gracula-ai-toggle">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; color: #666;">
              <input type="checkbox" id="gracula-use-ai-toggle" style="cursor: pointer;">
              <span>🤖 Use AI (costs API)</span>
            </label>
          </div>
        </div>
        <div class="gracula-tone-grid">
          ${this.renderToneButtons()}
        </div>
      </div>
    `;

    return html;
  }

  /**
   * Render individual tone buttons
   */
  renderToneButtons() {
    return this.tones.map(tone => `
      <button class="gracula-tone-btn" data-tone-id="${tone.id}">
        <span class="gracula-tone-emoji">${tone.emoji}</span>
        <span class="gracula-tone-name">${tone.name}</span>
      </button>
    `).join('');
  }

  /**
   * Attach event listeners to tone buttons and AI toggle
   */
  attachListeners(container) {
    // Handle AI toggle
    const aiToggle = container.querySelector('#gracula-use-ai-toggle');
    if (aiToggle) {
      aiToggle.addEventListener('change', (e) => {
        this.useAI = e.target.checked;
        console.log('🤖 Use AI:', this.useAI ? 'ENABLED (will call API)' : 'DISABLED (local/cached only)');
      });
    }

    // Handle tone buttons
    const buttons = container.querySelectorAll('.gracula-tone-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const toneId = btn.dataset.toneId;
        const tone = this.tones.find(t => t.id === toneId);
        if (tone) {
          // Pass useAI flag with tone
          tone.useAI = this.useAI;
          window.Gracula.logger.info(`Tone selected: ${tone.name} (AI: ${this.useAI})`);
          this.onToneSelect(tone);
        }
      });
    });
  }

  /**
   * Get tone by ID
   */
  getToneById(toneId) {
    return this.tones.find(t => t.id === toneId);
  }
}



