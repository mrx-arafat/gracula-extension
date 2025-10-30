// Tone Selector Widget
// Grid of tone buttons for user selection

window.Gracula = window.Gracula || {};

window.Gracula.ToneSelector = class {
  constructor(options = {}) {
    this.onToneSelect = options.onToneSelect || (() => {});
    this.tones = window.Gracula.Config.TONES.map(config => new window.Gracula.Tone(config));
    this.useAI = true; // Default: AI enabled (user can turn off for offline mode)
  }

  /**
   * Render tone selector HTML
   */
  render() {
    const html = `
      <div class="gracula-tone-selector">
        <h3 style="margin: 0 0 12px 0;">Select Tone:</h3>

        <!-- AI Toggle -->
        <div class="gracula-ai-toggle-container">
          <label class="gracula-ai-toggle-label">
            <span class="gracula-ai-toggle-text">
              <span class="gracula-ai-toggle-title">🤖 AI Mode</span>
              <span class="gracula-ai-toggle-subtitle">Turn off for faster offline responses</span>
            </span>
            <label class="gracula-toggle-switch">
              <input type="checkbox" id="gracula-use-ai-toggle" checked>
              <span class="gracula-toggle-slider"></span>
            </label>
          </label>
        </div>

        <div class="gracula-tone-grid" style="margin-top: 16px;">
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
        if (this.useAI) {
          console.log('🤖 AI Mode: ENABLED - Will call API for intelligent responses');
        } else {
          console.log('📊 Offline Mode: ENABLED - Will use local pattern-based responses (faster, no API costs)');
        }
      });
    }

    // Handle tone buttons
    const buttons = container.querySelectorAll('.gracula-tone-btn');
    console.log(`🎨 Found ${buttons.length} tone buttons`);

    if (buttons.length === 0) {
      console.error('❌ No tone buttons found! Check if tone grid is rendered properly.');
      return;
    }

    buttons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        console.log(`🎨 Tone button ${index + 1} clicked!`);
        const toneId = btn.dataset.toneId;
        console.log(`   Tone ID: ${toneId}`);

        const tone = this.tones.find(t => t.id === toneId);

        if (!tone) {
          console.error(`❌ Tone not found for ID: ${toneId}`);
          return;
        }

        // Pass useAI flag with tone
        tone.useAI = this.useAI;
        console.log(`✅ Tone selected: ${tone.name} (AI: ${this.useAI})`);
        console.log(`   Calling onToneSelect callback...`);

        this.onToneSelect(tone);
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



