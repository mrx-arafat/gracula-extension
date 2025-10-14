// Tone Entity
// Represents a reply tone with its configuration

window.Gracula = window.Gracula || {};

window.Gracula.Tone = class {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.emoji = config.emoji;
    this.prompt = config.prompt;
  }

  /**
   * Get display name with emoji
   */
  getDisplayName() {
    return `${this.emoji} ${this.name}`;
  }

  /**
   * Build AI prompt with context
   */
  buildPrompt(context) {
    let prompt = '';
    
    // Add conversation context if available
    if (context && context.length > 0) {
      prompt += 'Conversation context:\n';
      context.forEach((msg, i) => {
        prompt += `${msg}\n`;
      });
      prompt += '\n';
    }
    
    // Add tone instruction
    prompt += `${this.prompt}\n\n`;
    
    // Add instruction for multiple replies
    prompt += 'Generate 3 different reply options. Each reply should be on a new line, numbered 1., 2., and 3.\n';
    prompt += 'Keep each reply concise (1-2 sentences max).\n\n';
    prompt += 'Replies:\n';
    
    return prompt;
  }

  /**
   * Convert to plain object
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      emoji: this.emoji,
      prompt: this.prompt
    };
  }
}



