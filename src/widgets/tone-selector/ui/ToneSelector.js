// Tone Selector Widget
// Grid of tone buttons for user selection (with categories)

window.Gracula = window.Gracula || {};

window.Gracula.ToneSelector = class {
  constructor(options = {}) {
    this.onToneSelect = options.onToneSelect || (() => {});
    this.tones = window.Gracula.Config.TONES.map(config => new window.Gracula.Tone(config));
    this.useAI = true; // Default: AI enabled (user can turn off for offline mode)

    // Categorize tones
    this.categories = this.categorizeTones();

    // Track the currently selected tone for highlighting
    this.activeToneId = null;
  }

  /**
   * Categorize tones into groups
   */
  categorizeTones() {
    const categoryMap = {
      'casual': ['casual', 'chill', 'default', 'short'],
      'professional': ['formal', 'diplomatic', 'persuasive'],
      'romantic': ['flirty', 'superFlirty', 'romantic'],
      'playful': ['funny', 'sarcastic', 'playful', 'savage', 'roast', 'darkHumor'],
      'emotional': ['excited', 'anxious', 'tired', 'jealous', 'proud', 'grateful', 'angry', 'confused'],
      'supportive': ['caring', 'empathetic', 'supportive', 'motivational', 'wholesome', 'hype'],
      'strategic': ['psychological', 'darkPsychology', 'manipulative'],
      'social': ['bro', 'bestie', 'bubbly', 'sassy', 'venting', 'calm', 'teaTime', 'relatable'],
      'special': ['gen-z', 'millennial', 'boomer', 'drunk', 'conspiracy', 'chaotic', 'philosophical', 'nostalgic', 'ignore', 'curious']
    };

    const categories = {};

    Object.keys(categoryMap).forEach(category => {
      categories[category] = this.tones.filter(tone =>
        categoryMap[category].includes(tone.id)
      );
    });

    return categories;
  }

  /**
   * Render tone selector HTML (categorized version for new layout)
   */
  render() {
    const html = `
      <div class="gracula-tone-selector-categorized">
        <div class="gracula-tone-selector-header">
          <h3>🎭 Choose Your Tone</h3>
        </div>

        <!-- AI Toggle -->
        <div class="gracula-ai-toggle-container">
          <label class="gracula-ai-toggle-label">
            <span class="gracula-ai-toggle-text">
              <span class="gracula-ai-toggle-title">🤖 AI Mode</span>
              <span class="gracula-ai-toggle-subtitle">Turn off for cached responses</span>
            </span>
            <label class="gracula-toggle-switch">
              <input type="checkbox" id="gracula-use-ai-toggle" checked>
              <span class="gracula-toggle-slider"></span>
            </label>
          </label>
        </div>

        <!-- Tone Search -->
        <div class="gracula-tone-search-container">
          <input
            type="text"
            class="gracula-tone-search"
            id="gracula-tone-search"
            placeholder="🔍 Search tones..."
          />
        </div>

        <!-- Categorized Tones -->
        <div class="gracula-tone-categories">
          ${this.renderQuickAccess()}
          ${this.renderCategory('casual', '💬 Casual', this.categories.casual)}
          ${this.renderCategory('professional', '💼 Professional', this.categories.professional)}
          ${this.renderCategory('romantic', '❤️ Romantic', this.categories.romantic)}
          ${this.renderCategory('playful', '😂 Playful', this.categories.playful)}
          ${this.renderCategory('emotional', '😊 Emotional', this.categories.emotional)}
          ${this.renderCategory('supportive', '🙌 Supportive', this.categories.supportive)}
          ${this.renderCategory('strategic', '🧠 Strategic', this.categories.strategic)}
          ${this.renderCategory('social', '👥 Social', this.categories.social)}
          ${this.renderCategory('special', '✨ Special', this.categories.special)}
        </div>
      </div>
    `;

    return html;
  }

  /**
   * Render Quick Access section (favorites + recent)
   */
  renderQuickAccess() {
    // TODO: Get from localStorage
    const favorites = []; // Empty for now
    const recent = []; // Empty for now

    if (favorites.length === 0 && recent.length === 0) {
      return ''; // Don't show empty quick access
    }

    return '';
  }

  /**
   * Render a single category (simplified - no accordion)
   */
  renderCategory(id, title, tones) {
    return `
      <div class="gracula-tone-category-simple" data-category="${id}">
        <div class="gracula-tone-category-header-simple">
          <span class="gracula-tone-category-title">${title}</span>
          <span class="gracula-tone-category-count">${tones.length}</span>
        </div>
        <div class="gracula-tone-category-grid">
          ${tones.map(tone => `
            <button class="gracula-tone-btn-compact" data-tone-id="${tone.id}">
              <span class="gracula-tone-emoji">${tone.emoji}</span>
              <span class="gracula-tone-name">${tone.name}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render individual tone buttons (legacy - kept for compatibility)
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
   * Attach event listeners to tone buttons, AI toggle, search, and categories
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
          console.log('📊 Offline Mode: ENABLED - Will use cached responses (faster, no API costs)');
        }
      });
    }

    // Handle search
    const searchInput = container.querySelector('#gracula-tone-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        this.filterTones(container, query);
      });
    }

    // Handle tone buttons (both legacy and compact)
    const buttons = container.querySelectorAll('.gracula-tone-btn, .gracula-tone-btn-compact');
    console.log(`🎨 Found ${buttons.length} tone buttons`);

    if (buttons.length === 0) {
      console.error('❌ No tone buttons found! Check if tone grid is rendered properly.');
      return;
    }

    const applySelectionState = (selectedId) => {
      buttons.forEach(btn => {
        const isActive = btn.dataset.toneId === selectedId;
        btn.classList.toggle('selected', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    };

    buttons.forEach(btn => {
      btn.setAttribute('aria-pressed', 'false');
    });

    if (this.activeToneId) {
      applySelectionState(this.activeToneId);
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

        this.activeToneId = toneId;
        applySelectionState(this.activeToneId);

        // Pass useAI flag with tone
        tone.useAI = this.useAI;
        console.log(`✅ Tone selected: ${tone.name} (AI: ${this.useAI})`);
        console.log(`   Calling onToneSelect callback...`);

        this.onToneSelect(tone);
      });
    });
  }

  /**
   * Filter tones based on search query
   */
  filterTones(container, query) {
    const categories = container.querySelectorAll('.gracula-tone-category-simple');

    if (!query) {
      // Show all categories and tones
      categories.forEach(cat => {
        cat.style.display = 'block';
        const buttons = cat.querySelectorAll('.gracula-tone-btn-compact');
        buttons.forEach(btn => btn.style.display = 'flex');
      });
      return;
    }

    categories.forEach(cat => {
      const buttons = cat.querySelectorAll('.gracula-tone-btn-compact');
      let hasVisibleButtons = false;

      buttons.forEach(btn => {
        const toneId = btn.dataset.toneId;
        const tone = this.tones.find(t => t.id === toneId);
        const toneName = tone?.name.toLowerCase() || '';

        if (toneName.includes(query)) {
          btn.style.display = 'flex';
          hasVisibleButtons = true;
        } else {
          btn.style.display = 'none';
        }
      });

      // Show/hide category based on whether it has visible tones
      cat.style.display = hasVisibleButtons ? 'block' : 'none';
    });
  }

  /**
   * Get tone by ID
   */
  getToneById(toneId) {
    return this.tones.find(t => t.id === toneId);
  }
}



