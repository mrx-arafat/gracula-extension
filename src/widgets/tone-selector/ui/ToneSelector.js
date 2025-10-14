// Tone Selector Widget
// Grid of tone buttons for user selection

import { TONES } from '../../../shared/config/index.js';
import { Tone } from '../../../entities/tone/index.js';
import { logger } from '../../../shared/lib/index.js';

export class ToneSelector {
  constructor(options = {}) {
    this.onToneSelect = options.onToneSelect || (() => {});
    this.tones = TONES.map(config => new Tone(config));
  }

  /**
   * Render tone selector HTML
   */
  render() {
    const html = `
      <div class="gracula-tone-selector">
        <h3>Select Tone:</h3>
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
   * Attach event listeners to tone buttons
   */
  attachListeners(container) {
    const buttons = container.querySelectorAll('.gracula-tone-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const toneId = btn.dataset.toneId;
        const tone = this.tones.find(t => t.id === toneId);
        if (tone) {
          logger.info(`Tone selected: ${tone.name}`);
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

export default ToneSelector;

