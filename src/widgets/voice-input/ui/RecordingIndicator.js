// Recording Indicator Component
// Visual feedback during voice recording

window.Gracula = window.Gracula || {};

window.Gracula.RecordingIndicator = class {
  constructor(options = {}) {
    this.onCancel = options.onCancel || (() => {});
    
    // State
    this.indicator = null;
    this.startTime = null;
    this.timerInterval = null;
    this.audioLevel = 0;
    
    console.log('🎤 RecordingIndicator: Created');
  }

  /**
   * Show indicator
   */
  show(message = 'Listening...') {
    if (this.indicator) {
      this.hide();
    }

    this.startTime = Date.now();
    
    // Create indicator element
    this.indicator = document.createElement('div');
    this.indicator.className = 'gracula-recording-indicator';
    
    this.indicator.innerHTML = `
      <div class="gracula-recording-content">
        <div class="gracula-recording-icon">
          <div class="gracula-recording-pulse"></div>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="8"></circle>
          </svg>
        </div>
        <div class="gracula-recording-info">
          <div class="gracula-recording-message">${message}</div>
          <div class="gracula-recording-timer">0:00</div>
        </div>
        <button class="gracula-recording-cancel" title="Cancel (Esc)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="gracula-recording-waveform">
        <div class="gracula-recording-bar"></div>
        <div class="gracula-recording-bar"></div>
        <div class="gracula-recording-bar"></div>
        <div class="gracula-recording-bar"></div>
        <div class="gracula-recording-bar"></div>
      </div>
    `;
    
    // Apply styles
    this.applyStyles();
    
    // Add cancel handler
    const cancelBtn = this.indicator.querySelector('.gracula-recording-cancel');
    cancelBtn.addEventListener('click', () => {
      this.onCancel();
      this.hide();
    });
    
    // Add to page
    document.body.appendChild(this.indicator);
    
    // Start timer
    this.startTimer();
    
    // Animate in with bounce effect
    setTimeout(() => {
      this.indicator.style.opacity = '1';
      this.indicator.style.transform = 'translateX(0) scale(1)';
    }, 10);
    
    console.log('✅ RecordingIndicator: Shown');
  }

  /**
   * Apply indicator styles
   */
  applyStyles() {
    this.indicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 2147483647;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      padding: 20px;
      box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
      min-width: 300px;
      opacity: 0;
      transform: translateX(20px) scale(0.95);
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      backdrop-filter: blur(10px);
    `;
    
    // Add internal styles
    const style = document.createElement('style');
    style.textContent = `
      .gracula-recording-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .gracula-recording-icon {
        position: relative;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2));
      }

      .gracula-recording-pulse {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.4);
        opacity: 0.6;
        animation: gracula-recording-pulse 1.5s ease-out infinite;
      }

      @keyframes gracula-recording-pulse {
        0% {
          transform: scale(0.8);
          opacity: 0.6;
        }
        100% {
          transform: scale(1.8);
          opacity: 0;
        }
      }

      .gracula-recording-info {
        flex: 1;
      }

      .gracula-recording-message {
        font-size: 15px;
        font-weight: 600;
        color: #ffffff;
        margin-bottom: 4px;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }

      .gracula-recording-timer {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.9);
        font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
        font-weight: 500;
      }
      
      .gracula-recording-cancel {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(10px);
      }

      .gracula-recording-cancel:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.5);
        transform: scale(1.1);
      }

      .gracula-recording-cancel:active {
        transform: scale(0.95);
      }
      
      .gracula-recording-waveform {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        height: 32px;
        margin-top: 12px;
      }
      
      .gracula-recording-bar {
        width: 4px;
        height: 8px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 3px;
        animation: gracula-recording-wave 1s ease-in-out infinite;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: height 0.1s ease-out;
      }
      
      .gracula-recording-bar:nth-child(1) { animation-delay: 0s; }
      .gracula-recording-bar:nth-child(2) { animation-delay: 0.1s; }
      .gracula-recording-bar:nth-child(3) { animation-delay: 0.2s; }
      .gracula-recording-bar:nth-child(4) { animation-delay: 0.3s; }
      .gracula-recording-bar:nth-child(5) { animation-delay: 0.4s; }
      
      @keyframes gracula-recording-wave {
        0%, 100% {
          height: 8px;
        }
        50% {
          height: 24px;
        }
      }
    `;
    this.indicator.appendChild(style);
  }

  /**
   * Start timer
   */
  startTimer() {
    this.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      const timerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      const timerEl = this.indicator?.querySelector('.gracula-recording-timer');
      if (timerEl) {
        timerEl.textContent = timerText;
      }
    }, 1000);
  }

  /**
   * Update message
   */
  updateMessage(message) {
    if (!this.indicator) return;
    
    const messageEl = this.indicator.querySelector('.gracula-recording-message');
    if (messageEl) {
      messageEl.textContent = message;
    }
  }

  /**
   * Update audio level for waveform
   */
  updateAudioLevel(level) {
    if (!this.indicator) return;
    
    this.audioLevel = level;
    
    // Update waveform bars based on audio level
    const bars = this.indicator.querySelectorAll('.gracula-recording-bar');
    bars.forEach((bar, index) => {
      const height = 8 + (level * 20 * (1 - index * 0.1));
      bar.style.height = `${Math.max(8, Math.min(32, height))}px`;
    });
  }

  /**
   * Hide indicator
   */
  hide() {
    if (!this.indicator) return;
    
    // Stop timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    
    // Animate out
    this.indicator.style.opacity = '0';
    this.indicator.style.transform = 'translateX(20px)';
    
    setTimeout(() => {
      if (this.indicator) {
        this.indicator.remove();
        this.indicator = null;
      }
    }, 300);
    
    console.log('✅ RecordingIndicator: Hidden');
  }

  /**
   * Destroy indicator
   */
  destroy() {
    this.hide();
    console.log('🎤 RecordingIndicator: Destroyed');
  }
};

console.log('✅ RecordingIndicator class loaded');

