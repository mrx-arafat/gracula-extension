// Context Viewer Widget
// Displays and allows editing of conversation context

import { escapeHtml } from '../../../shared/lib/index.js';
import { logger } from '../../../shared/lib/index.js';

export class ContextViewer {
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
    const summary = this.enhancedContext.summary;

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
            <span class="gracula-analysis-value">${summary.hasQuestion ? '✅ Yes' : '❌ No'}</span>
          </div>
          <div class="gracula-analysis-item">
            <span class="gracula-analysis-label">Urgency:</span>
            <span class="gracula-analysis-value">${summary.urgency || 'Low'}</span>
          </div>
          ${summary.topics ? `
          <div class="gracula-analysis-item gracula-analysis-full">
            <span class="gracula-analysis-label">Topics:</span>
            <span class="gracula-analysis-value">${summary.topics}</span>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Get context preview (last 3 messages)
   */
  getPreview() {
    if (this.context.length === 0) {
      return '<em>No recent messages found. Click Edit to add context manually.</em>';
    }

    const preview = this.context.slice(-3).join('\n');
    return escapeHtml(preview.length > 200 ? preview.substring(0, 200) + '...' : preview);
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
        logger.info('Context editing enabled');
      });
    }

    // Save button
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const newContext = editor.value.trim();
        if (newContext) {
          this.context = newContext.split('\n').filter(line => line.trim().length > 0);
          preview.innerHTML = escapeHtml(this.getPreview());
        } else {
          this.context = [];
          preview.innerHTML = '<em>No context provided.</em>';
        }

        preview.style.display = 'block';
        editor.style.display = 'none';
        actions.style.display = 'none';
        editBtn.style.display = 'inline-block';

        this.onContextUpdate(this.context);
        logger.success('Context updated');
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
        logger.info('Context editing cancelled');
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

export default ContextViewer;

