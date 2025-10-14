// Reply List Widget
// Displays generated replies with insert/copy actions

import { escapeHtml } from '../../../shared/lib/index.js';
import { logger } from '../../../shared/lib/index.js';

export class ReplyList {
  constructor(options = {}) {
    this.onInsert = options.onInsert || (() => {});
    this.onCopy = options.onCopy || (() => {});
    this.replies = [];
  }

  /**
   * Render reply list HTML
   */
  render() {
    const html = `
      <div class="gracula-replies-container" style="display: none;">
        <h3>Generated Replies:</h3>
        <div class="gracula-loading">
          <div class="gracula-spinner"></div>
          <p>Generating replies...</p>
        </div>
        <div class="gracula-replies-list"></div>
      </div>
    `;

    return html;
  }

  /**
   * Show loading state
   */
  showLoading(container) {
    const repliesContainer = container.querySelector('.gracula-replies-container');
    const loading = container.querySelector('.gracula-loading');
    const list = container.querySelector('.gracula-replies-list');

    if (repliesContainer) repliesContainer.style.display = 'block';
    if (loading) loading.style.display = 'block';
    if (list) list.innerHTML = '';
  }

  /**
   * Hide loading state
   */
  hideLoading(container) {
    const loading = container.querySelector('.gracula-loading');
    if (loading) loading.style.display = 'none';
  }

  /**
   * Display replies
   */
  displayReplies(replies, container) {
    this.replies = replies;
    this.hideLoading(container);

    const list = container.querySelector('.gracula-replies-list');
    if (!list) return;

    list.innerHTML = replies.map((reply, index) => `
      <div class="gracula-reply-card" data-reply-index="${index}">
        <div class="gracula-reply-text">${escapeHtml(reply)}</div>
        <div class="gracula-reply-actions">
          <button class="gracula-reply-btn gracula-insert-btn" data-reply="${escapeHtml(reply)}">
            Insert
          </button>
          <button class="gracula-reply-btn gracula-copy-btn" data-reply="${escapeHtml(reply)}">
            Copy
          </button>
        </div>
      </div>
    `).join('');

    this.attachListeners(container);
  }

  /**
   * Show error message
   */
  showError(message, container) {
    this.hideLoading(container);

    const loading = container.querySelector('.gracula-loading');
    if (loading) {
      loading.innerHTML = `
        <p style="color: #ff4444; font-size: 16px; margin: 10px 0;">❌ Error Generating Replies</p>
        <p style="color: #666; font-size: 14px;">${message}</p>
      `;
    }
  }

  /**
   * Attach event listeners to reply buttons
   */
  attachListeners(container) {
    const insertButtons = container.querySelectorAll('.gracula-insert-btn');
    const copyButtons = container.querySelectorAll('.gracula-copy-btn');

    insertButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const reply = btn.dataset.reply;
        logger.info('Insert reply clicked');
        this.onInsert(reply);
      });
    });

    copyButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const reply = btn.dataset.reply;
        this.copyToClipboard(reply, btn);
      });
    });
  }

  /**
   * Copy reply to clipboard
   */
  async copyToClipboard(text, button) {
    try {
      await navigator.clipboard.writeText(text);
      logger.success('Reply copied to clipboard');
      
      // Show feedback
      const originalText = button.textContent;
      button.textContent = '✓ Copied!';
      button.style.backgroundColor = '#10b981';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
      }, 2000);

      this.onCopy(text);
    } catch (error) {
      logger.error('Failed to copy to clipboard:', error);
    }
  }
}

export default ReplyList;

