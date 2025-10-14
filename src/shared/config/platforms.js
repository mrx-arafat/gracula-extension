// Platform Configuration
// Defines all supported messaging platforms with their selectors

export const PLATFORMS = {
  whatsapp: {
    name: 'WhatsApp',
    domain: 'web.whatsapp.com',
    inputSelectors: [
      'div[contenteditable="true"][data-tab="10"]',
      'div[contenteditable="true"][role="textbox"]',
      'div.copyable-text[contenteditable="true"]',
      'div[contenteditable="true"][data-lexical-editor="true"]',
      'div[contenteditable="true"]._ak1l',
      'div[contenteditable="true"].selectable-text',
      'footer div[contenteditable="true"]',
      'div[data-tab="10"]'
    ],
    messageSelectors: [
      // Primary selectors for message text
      'div[data-id] span.selectable-text.copyable-text',
      'div.message-in span.selectable-text',
      'div.message-out span.selectable-text',
      'span[dir="ltr"].selectable-text.copyable-text',
      'div._akbu span.selectable-text',
      'span.selectable-text.copyable-text',
      // Fallback selectors
      'div[role="row"] span[dir="auto"]',
      'span.selectable-text'
    ],
    // Speaker detection selectors
    speakerSelectors: {
      messageContainer: 'div[data-id^="true_"]',
      incomingMessage: 'div.message-in',
      outgoingMessage: 'div.message-out',
      senderName: 'span[dir="auto"][role="button"]',
      timestamp: 'span[data-testid="msg-time"]',
      messageText: 'span.selectable-text.copyable-text'
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

export default PLATFORMS;

