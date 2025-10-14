// Platform Entity
// Represents a messaging platform with its configuration

console.log('🧛 [PLATFORM CLASS] Platform class script loading...');

window.Gracula = window.Gracula || {};

window.Gracula.Platform = class {
  constructor(config) {
    console.log('🧛 [PLATFORM CLASS] Creating Platform instance with config:', config);
    this.name = config.name;
    this.domain = config.domain;
    this.inputSelectors = config.inputSelectors || [];
    this.messageSelectors = config.messageSelectors || [];
    this.speakerSelectors = config.speakerSelectors || {};
    console.log('✅ [PLATFORM CLASS] Platform instance created:', this.name);
  }

  /**
   * Check if this platform matches the current hostname
   */
  matches(hostname) {
    const domains = Array.isArray(this.domain) ? this.domain : [this.domain];
    const result = domains.some(domain => hostname.includes(domain));
    console.log(`🧛 [PLATFORM CLASS] Matching ${this.name} against ${hostname}: ${result}`);
    console.log(`🧛 [PLATFORM CLASS] Domains to check:`, domains);
    return result;
  }

  /**
   * Find input field on the page
   */
  findInputField() {
    console.log(`🧛 [PLATFORM CLASS] Finding input field for ${this.name}...`);
    console.log(`🧛 [PLATFORM CLASS] Trying ${this.inputSelectors.length} selectors`);

    for (const selector of this.inputSelectors) {
      const element = document.querySelector(selector);
      if (!element) {
        console.log(`⚠️ [PLATFORM CLASS] No match for selector: ${selector}`);
        continue;
      }

      const candidate = this.normaliseInputElement(element);
      if (candidate) {
        console.log(`✅ [PLATFORM CLASS] Found input field with selector: ${selector}`);
        return candidate;
      }
    }

    console.log(`❌ [PLATFORM CLASS] No input field found for ${this.name}`);
    return null;
  }

  normaliseInputElement(element) {
    if (!element) return null;

    if (this.isEditableElement(element)) {
      return element;
    }

    if (element.shadowRoot) {
      const shadowMatch = element.shadowRoot.querySelector('div[contenteditable="true"], [contenteditable="plaintext-only"], textarea, input');
      if (shadowMatch) {
        return this.normaliseInputElement(shadowMatch);
      }
    }

    const nested = element.querySelector && element.querySelector('div[contenteditable="true"], [contenteditable="plaintext-only"], textarea, input');
    if (nested) {
      return this.normaliseInputElement(nested);
    }

    return null;
  }

  isEditableElement(element) {
    if (!element) return false;
    const tagName = element.tagName ? element.tagName.toLowerCase() : '';
    if (tagName === 'textarea' || tagName === 'input') {
      return true;
    }

    const contentEditable = element.getAttribute && element.getAttribute('contenteditable');
    return contentEditable === 'true' || contentEditable === 'plaintext-only';
  }


  /**
   * Find all message elements on the page
   */
  findMessages() {
    console.log(`🧛 [PLATFORM CLASS] Collecting messages for ${this.name} using advanced selectors...`);

    const uniqueElements = new Set();
    const containerSelector = this.speakerSelectors?.messageContainer;
    const fallbackContainers = [
      '[data-id]',
      'div[class*="message"]',
      'li[class*="message"]',
      '[role="row"]',
      '[role="listitem"]',
      '[data-testid="messageEntry"]'
    ];

    const addElement = (node) => {
      if (!node) return;

      let target = node;

      if (typeof node.closest === 'function') {
        if (containerSelector) {
          const specificContainer = node.closest(containerSelector);
          if (specificContainer) {
            target = specificContainer;
          }
        }

        if (target === node) {
          for (const fallbackSelector of fallbackContainers) {
            const fallbackContainer = node.closest(fallbackSelector);
            if (fallbackContainer) {
              target = fallbackContainer;
              break;
            }
          }
        }
      }

      uniqueElements.add(target);
    };

    const collect = (selector) => {
      try {
        document.querySelectorAll(selector).forEach(addElement);
      } catch (error) {
        console.log(`⚠️ [PLATFORM CLASS] Invalid message selector for ${this.name}: ${selector}`);
      }
    };

    this.messageSelectors.forEach(collect);

    if (uniqueElements.size === 0) {
      console.log(`⚠️ [PLATFORM CLASS] No messages found with platform selectors, using generic fallbacks...`);
      ['div[data-id]', 'div[role="row"]', 'li[data-id]'].forEach(collect);
    }

    console.log(`✅ [PLATFORM CLASS] Collected ${uniqueElements.size} message containers for ${this.name}`);
    return Array.from(uniqueElements);
  }

  /**
   * Check if platform supports speaker detection
   */
  supportsSpeakerDetection() {
    return Object.keys(this.speakerSelectors).length > 0;
  }
}



