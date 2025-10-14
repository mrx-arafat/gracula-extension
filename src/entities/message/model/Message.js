// Message Entity
// Represents a single message in a conversation

export class Message {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.text = data.text || '';
    this.speaker = data.speaker || 'unknown'; // 'user', 'other', or name
    this.timestamp = data.timestamp || new Date();
    this.type = data.type || 'text'; // 'text', 'image', 'file', etc.
    this.isOutgoing = data.isOutgoing || false;
    this.element = data.element || null; // Reference to DOM element
    this.metadata = data.metadata || {};
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
    return this.text && 
           this.text.length > 2 && 
           this.text.length < 500 &&
           !this.isTimestamp() &&
           !this.isSystemMessage();
  }

  /**
   * Check if text looks like a timestamp
   */
  isTimestamp() {
    return /^\d{1,2}:\d{2}/.test(this.text) || 
           this.text === 'Today' || 
           this.text === 'Yesterday';
  }

  /**
   * Check if message is a system message
   */
  isSystemMessage() {
    const systemPatterns = [
      /joined the group/i,
      /left the group/i,
      /changed the group/i,
      /added you/i,
      /removed/i
    ];
    return systemPatterns.some(pattern => pattern.test(this.text));
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
   * Get formatted representation for AI context
   */
  toContextString() {
    const speaker = this.isFromUser() ? 'Me' : (this.speaker || 'Other');
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

export default Message;

