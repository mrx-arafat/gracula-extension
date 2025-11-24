// Reply List Widget
// Displays generated replies with insert/copy actions

window.Gracula = window.Gracula || {};

window.Gracula.ReplyList = class {
  constructor(options = {}) {
    this.onInsert = options.onInsert || (() => { });
    this.onCopy = options.onCopy || (() => { });
    this.replies = [];
  }

  /**
   * Render reply list HTML
   */
  render() {
    const html = `
      <div class="gracula-replies-container">
        <div class="gracula-replies-header">
          <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #ffffff;">
            💬 Generated Replies
          </h3>
        </div>
        <div class="gracula-loading" style="display: none;">
          <div class="gracula-spinner"></div>
          <p>Generating replies...</p>
        </div>
        <div class="gracula-replies-list">
          <div class="gracula-empty-state" style="text-align: center; padding: 60px 20px; color: #9ca3af;">
            <div style="font-size: 48px; margin-bottom: 16px;">🎭</div>
            <div style="font-size: 14px; font-weight: 500; color: #6b7280; margin-bottom: 8px;">
              Choose a tone to generate replies
            </div>
            <div style="font-size: 12px; color: #9ca3af;">
              Select a tone from the left sidebar to get started
            </div>
          </div>
        </div>
      </div>
    `;

    return html;
  }

  /**
   * Show loading state
   */
  showLoading(container) {
    console.log('🔄 [ReplyList] showLoading called');
    const loading = container.querySelector('.gracula-loading');
    const list = container.querySelector('.gracula-replies-list');

    if (loading) {
      loading.style.display = 'block';
      console.log('✅ [ReplyList] Loading state visible');
    } else {
      console.error('❌ [ReplyList] Loading element not found!');
    }

    if (list) {
      list.innerHTML = '';
      console.log('✅ [ReplyList] Reply list cleared');
    }
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
    console.log(`📝 [ReplyList] displayReplies called with ${replies?.length} replies`);

    if (!replies || replies.length === 0) {
      console.error('❌ [ReplyList] No replies to display!');
      this.showError('No replies generated. Please try again.', container);
      return;
    }

    this.replies = replies;

    // Hide loading
    this.hideLoading(container);

    const list = container.querySelector('.gracula-replies-list');
    if (!list) {
      console.error('❌ [ReplyList] Reply list element not found!');
      return;
    }

    // Clear any existing content
    list.innerHTML = '';

    // Build fresh DOM with reply cards
    const frag = document.createDocumentFragment();
    replies.forEach((reply, index) => {
      const card = document.createElement('div');
      card.className = 'gracula-reply-card-enhanced';
      card.dataset.replyIndex = index;

      // Add "Best Match" badge to first reply
      if (index === 0) {
        card.classList.add('best-match');
        const badge = document.createElement('div');
        badge.style.cssText = 'display: inline-block; background: #10b981; color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; margin-bottom: 8px;';
        badge.textContent = '✨ Best Match';
        card.appendChild(badge);
      }

      const text = document.createElement('div');
      text.className = 'gracula-reply-text';
      text.textContent = reply;

      const meta = document.createElement('div');
      meta.className = 'gracula-reply-card-meta';

      // Quality stars
      const quality = document.createElement('div');
      quality.className = 'gracula-reply-quality';
      const stars = index === 0 ? '⭐⭐⭐⭐⭐' : index === 1 ? '⭐⭐⭐⭐☆' : '⭐⭐⭐☆☆';
      quality.textContent = stars;

      // Action buttons
      const actions = document.createElement('div');
      actions.className = 'gracula-reply-actions';

      const insertBtn = document.createElement('button');
      insertBtn.className = 'gracula-reply-btn-enhanced gracula-reply-btn-insert';
      insertBtn.textContent = '✓ Insert';
      insertBtn.dataset.reply = reply;

      const copyBtn = document.createElement('button');
      copyBtn.className = 'gracula-reply-btn-enhanced gracula-reply-btn-copy';
      copyBtn.textContent = '📋 Copy';
      copyBtn.dataset.reply = reply;

      actions.appendChild(insertBtn);
      actions.appendChild(copyBtn);
      meta.appendChild(quality);
      meta.appendChild(actions);

      card.appendChild(text);
      card.appendChild(meta);
      frag.appendChild(card);
    });

    list.appendChild(frag);
    console.log(`✅ [ReplyList] ${replies.length} reply cards added to DOM`);

    this.attachListeners(container);
  }

  /**
   * Show error message
   */
  showError(message, container) {
    console.log('❌ [ReplyList] showError called:', message);

    const list = container.querySelector('.gracula-replies-list');
    if (list) {
      list.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
          <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
          <div style="font-size: 16px; font-weight: 600; color: #ef4444; margin-bottom: 8px;">
            Error Generating Replies
          </div>
          <div style="font-size: 14px; color: #6b7280;">
            ${message}
          </div>
        </div>
      `;
    }

    this.hideLoading(container);
  }

  /**
   * Attach event listeners to reply buttons
   */
  attachListeners(container) {
    // Support both old and new button classes
    const insertButtons = container.querySelectorAll('.gracula-insert-btn, .gracula-reply-btn-insert');
    const copyButtons = container.querySelectorAll('.gracula-copy-btn, .gracula-reply-btn-copy');

    console.log(`🔗 [ReplyList] Attaching listeners to ${insertButtons.length} insert buttons and ${copyButtons.length} copy buttons`);

    insertButtons.forEach(btn => {
      // Use onclick to ensure only one handler
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const reply = btn.dataset.reply;
        console.log('✓ [ReplyList] Insert button clicked');
        this.onInsert(reply);
        // Disable button immediately to prevent double clicks
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.textContent = '✓ Inserted';
      };
    });

    copyButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const reply = btn.dataset.reply;
        console.log('📋 [ReplyList] Copy button clicked');
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
      window.Gracula.logger.success('Reply copied to clipboard');

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
      window.Gracula.logger.error('Failed to copy to clipboard:', error);
    }
  }
}



