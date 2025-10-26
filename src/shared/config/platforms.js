// Platform Configuration
// Defines all supported messaging platforms with their selectors

console.log('🧛 [PLATFORMS CONFIG] Platforms config script loading...');

// Initialize global namespace
window.Gracula = window.Gracula || {};
window.Gracula.Config = window.Gracula.Config || {};

console.log('🧛 [PLATFORMS CONFIG] Creating PLATFORMS config...');

window.Gracula.Config.PLATFORMS = {
  whatsapp: {
    name: 'WhatsApp',
    domain: 'web.whatsapp.com',
    inputSelectors: [
      // Primary (Nov 2024+): dedicated compose input
      'div[contenteditable="true"][data-testid="conversation-compose-box-input"]',
      // Aria-labelled textbox (covers refreshed layout)
      'div[contenteditable="true"][role="textbox"][aria-label]',
      // Placeholder-based selector (legacy + A/B tests)
      'div[contenteditable="true"][aria-placeholder]',
      // Generic role-based textbox fallback
      'div[contenteditable="true"][role="textbox"]',
      // Lexical editor wrapper (no footer restriction)
      'div[data-lexical-editor="true"][contenteditable="true"]',
      // Broad contenteditable fallbacks (tab variations)
      'div[contenteditable="true"][data-tab]',
      'div[contenteditable="true"][data-tab="10"]',
      'div[contenteditable="true"][data-tab="9"]',
      'div[contenteditable="true"][data-tab="8"]',
      'div[contenteditable="true"][data-tab="7"]',
      'div[contenteditable="true"][data-tab="6"]',
      // Legacy footer-based selectors
      'footer div[contenteditable="true"][role="textbox"]',
      'footer div[contenteditable="true"]'
    ],
    messageSelectors: [
      // Primary: message bubbles with copyable text
      'div[data-id] span.selectable-text.copyable-text',
      // Message text within specific message classes
      'div.message-in span.selectable-text.copyable-text',
      'div.message-out span.selectable-text.copyable-text',
      // Generic selectable copyable text
      'span.selectable-text.copyable-text',
      // Fallback: any selectable text
      'span.selectable-text'
    ],
    // Speaker detection selectors
    speakerSelectors: {
      // Message container - WhatsApp uses role="row" for messages
      messageContainer: '[role="row"], div[data-id^="true_"]',
      // Incoming messages (from others) - no "You:" label, no check marks
      incomingMessage: '[role="row"]:not(:has(generic:contains("You:"))), div.message-in, div[data-id]:not(:has(> div > span[data-icon="msg-dblcheck"])):not(:has(> div > span[data-icon="msg-check"]))',
      // Outgoing messages (from me) - has "You:" label or check marks
      outgoingMessage: '[role="row"]:has(generic:contains("You:")), div.message-out, div[data-id]:has(> div > span[data-icon="msg-dblcheck"]), div[data-id]:has(> div > span[data-icon="msg-check"])',
      // Sender name in group chats or individual chats
      senderName: 'generic:first-child, span[aria-label$=":"], span[aria-label^="You"], span[aria-label^="Me"]',
      // Timestamp element
      timestamp: 'span[data-testid="msg-time"], generic:last-child',
      // Message text content
      messageText: 'span.selectable-text.copyable-text',
      // Metadata attribute containing sender and timestamp
      metadataAttribute: 'data-pre-plain-text',
      // Check mark icons (indicates outgoing message)
      checkMarkIcons: ['msg-check', 'msg-dblcheck', 'msg-time'],
      // "You:" label selector
      youLabelSelector: 'generic:contains("You:")'
    }
  },
  instagram: {
    name: 'Instagram',
    domain: 'instagram.com',
    inputSelectors: [
      'div[contenteditable="true"][role="textbox"]',
      'textarea[placeholder*="Message"]'
    ],
    messageSelectors: [
      'div[role="row"] div[dir="auto"]',
      'div.x1n2onr6 > div'
    ],
    speakerSelectors: {
      messageContainer: 'div[role="row"]',
      incomingMessage: 'div[class*="incoming"]',
      outgoingMessage: 'div[class*="outgoing"]',
      messageText: 'div[dir="auto"]'
    }
  },
  messenger: {
    name: 'Messenger',
    domain: 'messenger.com',
    inputSelectors: [
      'div[contenteditable="true"][role="textbox"]',
      'div[aria-label*="Message"]'
    ],
    messageSelectors: [
      'div[role="row"] div[dir="auto"]',
      'div[data-scope="messages_table"] span'
    ],
    speakerSelectors: {
      messageContainer: 'div[role="row"]',
      incomingMessage: 'div[class*="incoming"]',
      outgoingMessage: 'div[class*="outgoing"]',
      messageText: 'div[dir="auto"]'
    }
  },
  linkedin: {
    name: 'LinkedIn',
    domain: 'linkedin.com',
    inputSelectors: [
      'div[contenteditable="true"][role="textbox"]',
      'div.msg-form__contenteditable'
    ],
    messageSelectors: [
      'div.msg-s-message-list__event p',
      'p.msg-s-event-listitem__body'
    ],
    speakerSelectors: {
      messageContainer: 'li.msg-s-message-list__event',
      incomingMessage: 'li[class*="msg-s-message-list__event--other"]',
      outgoingMessage: 'li[class*="msg-s-message-list__event--self"]',
      messageText: 'p.msg-s-event-listitem__body'
    }
  },
  twitter: {
    name: 'Twitter/X',
    domain: ['twitter.com', 'x.com'],
    inputSelectors: [
      'div[contenteditable="true"][role="textbox"]',
      'div[data-testid="dmComposerTextInput"]'
    ],
    messageSelectors: [
      'div[data-testid="messageEntry"] span',
      'div[data-testid="conversation"] span'
    ],
    speakerSelectors: {
      messageContainer: 'div[data-testid="messageEntry"]',
      incomingMessage: 'div[data-testid="messageEntry"][class*="incoming"]',
      outgoingMessage: 'div[data-testid="messageEntry"][class*="outgoing"]',
      messageText: 'span[data-text="true"]'
    }
  },
  discord: {
    name: 'Discord',
    domain: 'discord.com',
    inputSelectors: [
      'div[role="textbox"][contenteditable="true"]',
      'div[class*="slateTextArea"]'
    ],
    messageSelectors: [
      'div[id^="chat-messages"] div[class*="messageContent"]',
      'div[class*="message"] span'
    ],
    speakerSelectors: {
      messageContainer: 'li[id^="chat-messages"]',
      senderName: 'span[class*="username"]',
      timestamp: 'time',
      messageText: 'div[class*="messageContent"]'
    }
  },
  slack: {
    name: 'Slack',
    domain: 'slack.com',
    inputSelectors: [
      'div[contenteditable="true"][role="textbox"]',
      'div[data-qa="message_input"]'
    ],
    messageSelectors: [
      'div[class*="c-message__body"] span',
      'div[data-qa="message_content"]'
    ],
    speakerSelectors: {
      messageContainer: 'div[class*="c-virtual_list__item"]',
      senderName: 'span[class*="c-message__sender"]',
      timestamp: 'a[class*="c-timestamp"]',
      messageText: 'div[class*="c-message__body"]'
    }
  },
  telegram: {
    name: 'Telegram',
    domain: 'web.telegram.org',
    inputSelectors: [
      'div[contenteditable="true"].input-message-input',
      'div.input-message-container div[contenteditable="true"]'
    ],
    messageSelectors: [
      'div.message div.text',
      'div.text-content'
    ],
    speakerSelectors: {
      messageContainer: 'div.message',
      incomingMessage: 'div.message.incoming',
      outgoingMessage: 'div.message.outgoing',
      senderName: 'div.peer-title',
      timestamp: 'span.time',
      messageText: 'div.text'
    }
  },
  gmail: {
    name: 'Gmail',
    domain: 'mail.google.com',
    inputSelectors: [
      'div[contenteditable="true"][role="textbox"]',
      'div[aria-label*="Message Body"]'
    ],
    messageSelectors: [
      'div.a3s.aiL',
      'div[data-message-id] div.a3s'
    ],
    speakerSelectors: {
      messageContainer: 'div[data-message-id]',
      senderName: 'span[email]',
      timestamp: 'span[data-tooltip*="time"]',
      messageText: 'div.a3s.aiL'
    }
  }
};

console.log('✅ [PLATFORMS CONFIG] PLATFORMS config created successfully');
console.log('🧛 [PLATFORMS CONFIG] Available platforms:', Object.keys(window.Gracula.Config.PLATFORMS));

