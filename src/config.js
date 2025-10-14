// Gracula Configuration - Tones and Prompts

const GRACULA_CONFIG = {
  tones: [
    {
      id: 'default',
      name: 'Default',
      emoji: '💬',
      prompt: 'Generate a natural, friendly reply to this conversation. Keep it conversational and appropriate.'
    },
    {
      id: 'angry',
      name: 'Angry',
      emoji: '😠',
      prompt: 'Generate an angry, frustrated response to this conversation. Show irritation and displeasure, but keep it appropriate.'
    },
    {
      id: 'chill',
      name: 'Chill',
      emoji: '😎',
      prompt: 'Generate a relaxed, laid-back, chill response. Use casual language and a cool, easygoing tone.'
    },
    {
      id: 'confused',
      name: 'Confused',
      emoji: '🤔',
      prompt: 'Generate a confused, questioning response. Express uncertainty and ask for clarification in a natural way.'
    },
    {
      id: 'excited',
      name: 'Excited',
      emoji: '🤩',
      prompt: 'Generate an enthusiastic, energetic, and excited response! Show lots of positive energy and excitement!'
    },
    {
      id: 'flirty',
      name: 'Flirty',
      emoji: '😘',
      prompt: 'Generate a playful, flirtatious, and charming response. Be subtly romantic and engaging.'
    },
    {
      id: 'formal',
      name: 'Formal',
      emoji: '📝',
      prompt: 'Generate a professional, formal, and polite response. Use proper grammar and business-appropriate language.'
    },
    {
      id: 'funny',
      name: 'Funny',
      emoji: '😂',
      prompt: 'Generate a humorous, witty, and funny response. Make it entertaining and light-hearted with jokes or clever remarks.'
    },
    {
      id: 'genz',
      name: 'GenZ',
      emoji: '🤙',
      prompt: 'Generate a trendy Gen-Z style response with modern slang, internet culture references, and casual vibes. Use terms like "fr", "no cap", "slay", etc.'
    },
    {
      id: 'lyrical',
      name: 'Lyrical',
      emoji: '🎵',
      prompt: 'Generate a poetic, lyrical, and artistic response. Use beautiful language, metaphors, and flowing expressions.'
    },
    {
      id: 'creative',
      name: 'Creative Praise',
      emoji: '✨',
      prompt: 'Generate a creative, complimentary response that praises and appreciates. Be genuinely positive and uplifting.'
    }
  ],

  // Platform-specific selectors for message input fields
  platforms: {
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
      ]
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
      ]
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
        'div.x1n2onr6'
      ]
    },
    facebook: {
      name: 'Facebook',
      domain: 'facebook.com',
      inputSelectors: [
        'div[contenteditable="true"][role="textbox"]',
        'div[aria-label*="Write a comment"]',
        'div[aria-label*="Write a message"]'
      ],
      messageSelectors: [
        'div[role="article"] div[dir="auto"]'
      ]
    },
    linkedin: {
      name: 'LinkedIn',
      domain: 'linkedin.com',
      inputSelectors: [
        'div[contenteditable="true"][role="textbox"]',
        'div.msg-form__contenteditable'
      ],
      messageSelectors: [
        'div.msg-s-message-list__event p'
      ]
    },
    twitter: {
      name: 'Twitter/X',
      domain: ['twitter.com', 'x.com'],
      inputSelectors: [
        'div[contenteditable="true"][role="textbox"]',
        'div[data-testid="tweetTextarea_0"]',
        'div[data-testid="dmComposerTextInput"]'
      ],
      messageSelectors: [
        'div[data-testid="tweetText"]',
        'div[data-testid="messageEntry"]'
      ]
    },
    discord: {
      name: 'Discord',
      domain: 'discord.com',
      inputSelectors: [
        'div[role="textbox"][contenteditable="true"]',
        'div[class*="slateTextArea"]'
      ],
      messageSelectors: [
        'div[class*="messageContent"]',
        'div[id^="message-content"]'
      ]
    },
    slack: {
      name: 'Slack',
      domain: 'slack.com',
      inputSelectors: [
        'div[contenteditable="true"][role="textbox"]',
        'div.ql-editor[contenteditable="true"]'
      ],
      messageSelectors: [
        'div.c-message__body',
        'span.c-message__body'
      ]
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
      ]
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
      ]
    }
  },

  // API Configuration
  api: {
    provider: 'openai', // 'openai' or 'huggingface'
    openai: {
      model: 'gpt-3.5-turbo', // or 'gpt-4', 'gpt-4-turbo-preview'
      endpoint: 'https://api.openai.com/v1/chat/completions',
      maxTokens: 200,
      temperature: 0.7
    },
    huggingface: {
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      endpoint: 'https://api-inference.huggingface.co/models/',
      maxTokens: 150,
      temperature: 0.7
    },
    numReplies: 3 // Generate 3 reply options
  }
};

// Make config available globally
if (typeof window !== 'undefined') {
  window.GRACULA_CONFIG = GRACULA_CONFIG;
}

