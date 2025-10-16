// Context Viewer Widget
// Displays and allows editing of conversation context

window.Gracula = window.Gracula || {};

window.Gracula.ContextViewer = class {
  constructor(options = {}) {
    this.context = options.context || [];
    this.enhancedContext = options.enhancedContext || null;
    this.onContextUpdate = options.onContextUpdate || (() => {});
    this.showEnhanced = options.showEnhanced || false;
  }

  /**
   * Render context viewer HTML
   */
  render() {
    const html = `
      <div class="gracula-context-section">
        <div class="gracula-context-header">
          <strong>📝 Conversation Context:</strong>
          <button class="gracula-edit-context-btn" title="Edit context">✏️ Edit</button>
          ${this.showEnhanced ? '<button class="gracula-toggle-analysis-btn" title="Show analysis">🔍 Analysis</button>' : ''}
        </div>
        <div class="gracula-context-display">
          <div class="gracula-context-preview">${this.getPreview()}</div>
          <textarea class="gracula-context-editor" style="display: none;" placeholder="Add conversation context here...
Example:
Friend: Hey, what are you doing tonight?
Me: Nothing much, just chilling
Friend: Want to grab dinner?">${this.getFullContext()}</textarea>
        </div>
        ${this.showEnhanced ? this.renderAnalysis() : ''}
        <div class="gracula-context-actions" style="display: none;">
          <button class="gracula-save-context-btn">💾 Save Context</button>
          <button class="gracula-cancel-context-btn">❌ Cancel</button>
        </div>
      </div>
    `;

    return html;
  }

  /**
   * Render conversation analysis
   */
  renderAnalysis() {
    if (!this.enhancedContext || !this.enhancedContext.analysis) {
      return '';
    }

    const analysis = this.enhancedContext.analysis;
    const summary = this.enhancedContext.summary || {};
    const metrics = this.enhancedContext.metrics || {};
    const escapeHtml = window.Gracula.DOMUtils.escapeHtml;

    const hasQuestionLabel = summary.hasQuestion ? 'Yes' : 'No';
    const languageMix = metrics.languageHints && metrics.languageHints.length
      ? metrics.languageHints.join(', ')
      : summary.languageMix || 'Unknown';

    const recommendedLength = metrics.recommendedReplyLength
      ? `${metrics.recommendedReplyLength.words} words (~${metrics.recommendedReplyLength.chars} chars, ${metrics.recommendedReplyLength.sentences} sentence${metrics.recommendedReplyLength.sentences === 1 ? '' : 's'})`
      : summary.averageLength || 'Not detected';

    const incomingAverage = metrics.recentIncomingAverageChars
      ? `${metrics.recentIncomingAverageChars} chars`
      : 'No incoming messages yet';

    const outgoingAverage = metrics.recentOutgoingAverageChars
      ? `${metrics.recentOutgoingAverageChars} chars`
      : 'No recent replies';

    const messagePace = metrics.messagePaceSeconds
      ? this.describePace(metrics.messagePaceSeconds)
      : summary.messageTempo || 'Unknown';

    const emojiUsage = summary.emojiUsage
      ? summary.emojiUsage
      : (analysis.emojiUsage?.usageLevel ? `${analysis.emojiUsage.usageLevel} (${analysis.emojiUsage.total || 0})` : 'None');

    const styleNotes = (summary.styleNotes && summary.styleNotes.length)
      ? summary.styleNotes
      : (analysis.styleMarkers?.notes?.length ? analysis.styleMarkers.notes.join('; ') : '');

    const shortMessageExamples = (metrics.shortMessageExamples || [])
      .map(example => `<li>${escapeHtml(example)}</li>`)
      .join('');

    const shortMessagesSection = shortMessageExamples
      ? `
          <div class="gracula-analysis-item gracula-analysis-full">
            <span class="gracula-analysis-label">Recent Short Messages:</span>
            <ul class="gracula-analysis-list">${shortMessageExamples}</ul>
          </div>
        `
      : '';

    return `
      <div class="gracula-context-analysis" style="display: none;">
        <h4>📊 Conversation Analysis</h4>
        <div class="gracula-analysis-grid">
          <div class="gracula-analysis-item">
            <span class="gracula-analysis-label">Participants:</span>
            <span class="gracula-analysis-value">${summary.participants || 'Unknown'}</span>
          </div>
          <div class="gracula-analysis-item">
            <span class="gracula-analysis-label">Last Speaker:</span>
            <span class="gracula-analysis-value">${summary.lastSpeaker || 'Unknown'}</span>
          </div>
          <div class="gracula-analysis-item">
            <span class="gracula-analysis-label">Conversation Type:</span>
            <span class="gracula-analysis-value">${summary.conversationType || 'Unknown'}</span>
          </div>
          <div class="gracula-analysis-item">
            <span class="gracula-analysis-label">Sentiment:</span>
            <span class="gracula-analysis-value">${summary.sentiment || 'Neutral'}</span>
          </div>
          <div class="gracula-analysis-item">
            <span class="gracula-analysis-label">Has Question:</span>
            <span class="gracula-analysis-value">${hasQuestionLabel}</span>
          </div>
          <div class="gracula-analysis-item">
            <span class="gracula-analysis-label">Urgency:</span>
            <span class="gracula-analysis-value">${summary.urgency || 'Low'}</span>
          </div>
          <div class="gracula-analysis-item">
            <span class="gracula-analysis-label">Typical Length:</span>
            <span class="gracula-analysis-value">${recommendedLength}</span>
          </div>
          <div class="gracula-analysis-item">
            <span class="gracula-analysis-label">Incoming Average:</span>
            <span class="gracula-analysis-value">${incomingAverage}</span>
          </div>
          <div class="gracula-analysis-item">
            <span class="gracula-analysis-label">Outgoing Average:</span>
            <span class="gracula-analysis-value">${outgoingAverage}</span>
          </div>
          <div class="gracula-analysis-item">
            <span class="gracula-analysis-label">Language Mix:</span>
            <span class="gracula-analysis-value">${languageMix}</span>
          </div>
          <div class="gracula-analysis-item">
            <span class="gracula-analysis-label">Message Pace:</span>
            <span class="gracula-analysis-value">${messagePace}</span>
          </div>
          <div class="gracula-analysis-item">
            <span class="gracula-analysis-label">Emoji Usage:</span>
            <span class="gracula-analysis-value">${emojiUsage}</span>
          </div>

          ${styleNotes ? `
          <div class="gracula-analysis-item gracula-analysis-full">
            <span class="gracula-analysis-label">Style Notes:</span>
            <span class="gracula-analysis-value">${escapeHtml(styleNotes)}</span>
          </div>
          ` : ''}
          ${summary.topics ? `
          <div class="gracula-analysis-item gracula-analysis-full">
            <span class="gracula-analysis-label">Topics:</span>
            <span class="gracula-analysis-value">${escapeHtml(summary.topics)}</span>
          </div>
          ` : ''}
          ${shortMessagesSection}
        </div>
      </div>
    `;
  }

  describePace(seconds) {
    if (typeof seconds !== 'number' || Number.isNaN(seconds)) {
      return 'Unknown';
    }

    const rounded = Math.round(seconds);

    if (rounded <= 90) {
      return `Rapid (~${rounded}s apart)`;
    }

    if (rounded <= 600) {
      return `Steady (~${rounded}s apart)`;
    }

    return `Slow (~${rounded}s apart)`;
  }


  /**
   * Get context preview (all messages)
   */
  getPreview() {
    if (this.context.length === 0) {
      return '<em>No recent messages found. Click Edit to add context manually.</em>';
    }

    // Show all messages, not just last 3
    const preview = this.context.join('\n');
    // Limit display to 500 chars to prevent modal overflow, but show all messages
    return window.Gracula.DOMUtils.escapeHtml(preview.length > 500 ? preview.substring(0, 500) + '...' : preview);
  }

  /**
   * Get full context as text
   */
  getFullContext() {
    return this.context.join('\n');
  }

  /**
   * Attach event listeners
   */
  attachListeners(container) {
    const editBtn = container.querySelector('.gracula-edit-context-btn');
    const saveBtn = container.querySelector('.gracula-save-context-btn');
    const cancelBtn = container.querySelector('.gracula-cancel-context-btn');
    const editor = container.querySelector('.gracula-context-editor');
    const preview = container.querySelector('.gracula-context-preview');
    const actions = container.querySelector('.gracula-context-actions');
    const toggleAnalysisBtn = container.querySelector('.gracula-toggle-analysis-btn');
    const analysisSection = container.querySelector('.gracula-context-analysis');

    // Edit button
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        preview.style.display = 'none';
        editor.style.display = 'block';
        actions.style.display = 'flex';
        editBtn.style.display = 'none';
        window.Gracula.logger.info('Context editing enabled');
      });
    }

    // Save button
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const newContext = editor.value.trim();
        if (newContext) {
          this.context = newContext.split('\n').filter(line => line.trim().length > 0);
          preview.innerHTML = window.Gracula.DOMUtils.escapeHtml(this.getPreview());
        } else {
          this.context = [];
          preview.innerHTML = '<em>No context provided.</em>';
        }

        preview.style.display = 'block';
        editor.style.display = 'none';
        actions.style.display = 'none';
        editBtn.style.display = 'inline-block';

        this.onContextUpdate(this.context);
        window.Gracula.logger.success('Context updated');
      });
    }

    // Cancel button
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        editor.value = this.getFullContext();
        preview.style.display = 'block';
        editor.style.display = 'none';
        actions.style.display = 'none';
        editBtn.style.display = 'inline-block';
        window.Gracula.logger.info('Context editing cancelled');
      });
    }

    // Toggle analysis button
    if (toggleAnalysisBtn && analysisSection) {
      toggleAnalysisBtn.addEventListener('click', () => {
        const isHidden = analysisSection.style.display === 'none';
        analysisSection.style.display = isHidden ? 'block' : 'none';
        toggleAnalysisBtn.textContent = isHidden ? '🔍 Hide Analysis' : '🔍 Analysis';
      });
    }
  }

  /**
   * Update context
   */
  updateContext(context, enhancedContext = null) {
    this.context = context;
    this.enhancedContext = enhancedContext;
  }
}



