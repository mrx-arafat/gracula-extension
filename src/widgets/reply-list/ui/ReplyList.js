// Reply List Widget
// Displays generated replies with insert/copy actions

window.Gracula = window.Gracula || {};

window.Gracula.ReplyList = class {
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
    console.log(`📝 displayReplies called with ${replies?.length} replies`);
    console.log('   Container:', container?.className);

    if (!replies || replies.length === 0) {
      console.error('❌ No replies to display!');
      this.showError('No replies generated. Please try again.', container);
      return;
    }

    this.replies = replies;

    // Make sure replies container is visible FIRST
    const repliesContainer = container.querySelector('.gracula-replies-container');
    if (!repliesContainer) {
      console.error('❌ Replies container not found in DOM!');
      console.error('   Container HTML:', container?.innerHTML?.substring(0, 200));
      return;
    }

    repliesContainer.style.display = 'block';
    console.log('✅ Replies container made visible');

    // Now hide the loading
    this.hideLoading(container);

    const list = container.querySelector('.gracula-replies-list');
    if (!list) {
      console.error('❌ Reply list element not found!');
      return;
    }

    // Clear any existing listeners before rebuilding DOM
    list.innerHTML = '';

    // Build fresh DOM with unique IDs
    const frag = document.createDocumentFragment();
    replies.forEach((reply, index) => {
      const card = document.createElement('div');
      card.className = 'gracula-reply-card';
      card.dataset.replyIndex = index;

      const text = document.createElement('div');
      text.className = 'gracula-reply-text';
      text.textContent = reply; // textContent avoids double-escaping

      const actions = document.createElement('div');
      actions.className = 'gracula-reply-actions';

      const insertBtn = document.createElement('button');
      insertBtn.className = 'gracula-reply-btn gracula-insert-btn';
      insertBtn.textContent = 'Insert';
      insertBtn.dataset.reply = reply;

      const copyBtn = document.createElement('button');
      copyBtn.className = 'gracula-reply-btn gracula-copy-btn';
      copyBtn.textContent = 'Copy';
      copyBtn.dataset.reply = reply;

      actions.appendChild(insertBtn);
      actions.appendChild(copyBtn);
      card.appendChild(text);
      card.appendChild(actions);
      frag.appendChild(card);
    });

    list.appendChild(frag);
    console.log(`✅ ${replies.length} reply cards added to DOM`);
    console.log('   Sample replies:', replies.slice(0, 2));

    this.attachListeners(container);
  }

  /**
   * Show error message
   */
  showError(message, container) {
    // Make sure replies container is visible
    const repliesContainer = container.querySelector('.gracula-replies-container');
    if (repliesContainer) {
      repliesContainer.style.display = 'block';
    }

    const loading = container.querySelector('.gracula-loading');
    if (loading) {
      loading.style.display = 'block';
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
      // Use onclick to ensure only one handler
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const reply = btn.dataset.reply;
        window.Gracula.logger.info('Insert reply clicked');
        this.onInsert(reply);
        // Disable button immediately to prevent double clicks
        btn.disabled = true;
        btn.style.opacity = '0.5';
      };
    });

    copyButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
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



