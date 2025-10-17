// Message Entity
// Represents a single message in a conversation

window.Gracula = window.Gracula || {};

window.Gracula.Message = class {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.text = data.text || '';
    this.speaker = data.speaker || 'unknown'; // 'user', 'other', or name
    this.timestamp = data.timestamp || new Date();
    this.type = data.type || 'text'; // 'text', 'image', 'file', etc.
    this.isOutgoing = data.isOutgoing || false;
    this.element = data.element || null; // Reference to DOM element
    this.metadata = data.metadata || {};
    this.dateLabel = data.dateLabel || null; // Date label from WhatsApp (e.g., "Today", "Monday")
  }

  generateId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if message is from the current user
   */
  isFromUser() {
    return this.isOutgoing || this.speaker === 'user';
  }

  /**
   * Check if message is valid (has text and meets criteria)
   */
  isValid() {
    if (typeof this.text !== 'string') {
      return false;
    }

    const trimmed = this.text.trim();
    if (trimmed.length === 0 || trimmed.length > 2000) {
      return false;
    }

    if (this.isTimestamp() || this.isSystemMessage()) {
      return false;
    }

    return true;
  }

  /**
   * Check if text looks like a timestamp
   */
  isTimestamp() {
    const value = (this.text || '').trim();
    return /^\d{1,2}:\d{2}/.test(value) ||
           value === 'Today' ||
           value === 'Yesterday';
  }

  /**
   * Check if message is a system message
   */
  isSystemMessage() {
    const value = (this.text || '').trim();
    const systemPatterns = [
      /joined the group/i,
      /left the group/i,
      /changed the group/i,
      /added you/i,
      /removed/i
    ];
    return systemPatterns.some(pattern => pattern.test(value));
  }

  /**
   * Check if message is emoji-only
   */
  isEmojiOnly() {
    return /^[\u{1F300}-\u{1F9FF}]+$/u.test(this.text);
  }

  /**
   * Check if message contains a question
   */
  hasQuestion() {
    return this.text.includes('?') || 
           /^(what|when|where|who|why|how|can|could|would|should|is|are|do|does)/i.test(this.text);
  }

  /**
   * Get date string for grouping messages by day
   * Uses the dateLabel from WhatsApp if available, otherwise calculates from timestamp
   */
  getDateString() {
    // If we have a dateLabel from WhatsApp, use it directly
    if (this.dateLabel) {
      return this.dateLabel;
    }

    // Fallback to timestamp-based calculation
    if (!this.timestamp) return null;
    const date = this.timestamp instanceof Date ? this.timestamp : new Date(this.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateStr = date.toDateString();
    const todayStr = today.toDateString();
    const yesterdayStr = yesterday.toDateString();

    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  /**
   * Get formatted representation for AI context
   */
  toContextString() {
    const speaker = this.isFromUser() ? 'You' : (this.speaker || 'Other');
    return `${speaker}: ${this.text}`;
  }

  /**
   * Convert to plain object
   */
  toJSON() {
    return {
      id: this.id,
      text: this.text,
      speaker: this.speaker,
      timestamp: this.timestamp,
      type: this.type,
      isOutgoing: this.isOutgoing,
      metadata: this.metadata
    };
  }
}



