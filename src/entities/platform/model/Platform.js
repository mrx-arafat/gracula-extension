// Platform Entity
// Represents a messaging platform with its configuration

export class Platform {
  constructor(config) {
    this.name = config.name;
    this.domain = config.domain;
    this.inputSelectors = config.inputSelectors || [];
    this.messageSelectors = config.messageSelectors || [];
    this.speakerSelectors = config.speakerSelectors || {};
  }

  /**
   * Check if this platform matches the current hostname
   */
  matches(hostname) {
    const domains = Array.isArray(this.domain) ? this.domain : [this.domain];
    return domains.some(domain => hostname.includes(domain));
  }

  /**
   * Find input field on the page
   */
  findInputField() {
    for (const selector of this.inputSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element;
      }
    }
    return null;
  }

  /**
   * Find all message elements on the page
   */
  findMessages() {
    const messages = [];
    for (const selector of this.messageSelectors) {
      const elements = document.querySelectorAll(selector);
      messages.push(...Array.from(elements));
    }
    return messages;
  }

  /**
   * Check if platform supports speaker detection
   */
  supportsSpeakerDetection() {
    return Object.keys(this.speakerSelectors).length > 0;
  }
}

export default Platform;

