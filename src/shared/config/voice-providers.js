// Voice Transcription Provider Configurations
// Supports multiple transcription services

window.Gracula = window.Gracula || {};
window.Gracula.VoiceProviders = {
  // ElevenLabs Speech-to-Text (Primary)
  elevenlabs: {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    description: 'High-quality multilingual transcription',
    endpoint: 'https://api.elevenlabs.io/v1/speech-to-text',
    requiresApiKey: true,
    features: {
      streaming: false,
      languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'pl', 'tr', 'ru', 'nl', 'cs', 'ar', 'zh', 'ja', 'ko', 'hi'],
      maxDuration: 300, // 5 minutes
      formats: ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg']
    },
    pricing: {
      type: 'per-character',
      free: false
    }
  },

  // Web Speech API (Fallback - Free)
  webspeech: {
    id: 'webspeech',
    name: 'Web Speech API',
    description: 'Chrome built-in speech recognition (free)',
    endpoint: null, // Browser native
    requiresApiKey: false,
    features: {
      streaming: true,
      languages: ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-BR', 'ru-RU', 'ja-JP', 'ko-KR', 'zh-CN'],
      maxDuration: 60, // 1 minute continuous
      formats: ['native']
    },
    pricing: {
      type: 'free',
      free: true
    }
  },

  // OpenAI Whisper API (Optional)
  openai: {
    id: 'openai',
    name: 'OpenAI Whisper',
    description: 'State-of-the-art transcription (99+ languages)',
    endpoint: 'https://api.openai.com/v1/audio/transcriptions',
    requiresApiKey: true,
    features: {
      streaming: false,
      languages: ['*'], // Supports 99+ languages
      maxDuration: 600, // 10 minutes
      formats: ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/mp4']
    },
    pricing: {
      type: 'per-minute',
      free: false
    }
  },

  // Google Cloud Speech-to-Text (Optional)
  google: {
    id: 'google',
    name: 'Google Speech-to-Text',
    description: 'Real-time streaming transcription',
    endpoint: 'https://speech.googleapis.com/v1/speech:recognize',
    requiresApiKey: true,
    features: {
      streaming: true,
      languages: ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'pt-BR', 'ru-RU', 'ja-JP', 'ko-KR', 'zh-CN', 'ar-SA', 'hi-IN'],
      maxDuration: 480, // 8 minutes
      formats: ['audio/webm', 'audio/wav', 'audio/mp3']
    },
    pricing: {
      type: 'per-minute',
      free: false
    }
  },

  // Deepgram (Optional)
  deepgram: {
    id: 'deepgram',
    name: 'Deepgram',
    description: 'Fast, accurate real-time transcription',
    endpoint: 'https://api.deepgram.com/v1/listen',
    requiresApiKey: true,
    features: {
      streaming: true,
      languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi', 'tr'],
      maxDuration: 600, // 10 minutes
      formats: ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg']
    },
    pricing: {
      type: 'per-minute',
      free: false
    }
  }
};

// Default provider priority
window.Gracula.VoiceProviders.defaultPriority = [
  'elevenlabs',  // Primary (if API key available)
  'webspeech',   // Fallback (always available)
  'openai',      // Optional
  'google',      // Optional
  'deepgram'     // Optional
];

// Language code mappings
window.Gracula.VoiceProviders.languageMappings = {
  'en': { webspeech: 'en-US', elevenlabs: 'en', openai: 'en', google: 'en-US', deepgram: 'en' },
  'es': { webspeech: 'es-ES', elevenlabs: 'es', openai: 'es', google: 'es-ES', deepgram: 'es' },
  'fr': { webspeech: 'fr-FR', elevenlabs: 'fr', openai: 'fr', google: 'fr-FR', deepgram: 'fr' },
  'de': { webspeech: 'de-DE', elevenlabs: 'de', openai: 'de', google: 'de-DE', deepgram: 'de' },
  'it': { webspeech: 'it-IT', elevenlabs: 'it', openai: 'it', google: 'it-IT', deepgram: 'it' },
  'pt': { webspeech: 'pt-BR', elevenlabs: 'pt', openai: 'pt', google: 'pt-BR', deepgram: 'pt' },
  'ru': { webspeech: 'ru-RU', elevenlabs: 'ru', openai: 'ru', google: 'ru-RU', deepgram: 'ru' },
  'ja': { webspeech: 'ja-JP', elevenlabs: 'ja', openai: 'ja', google: 'ja-JP', deepgram: 'ja' },
  'ko': { webspeech: 'ko-KR', elevenlabs: 'ko', openai: 'ko', google: 'ko-KR', deepgram: 'ko' },
  'zh': { webspeech: 'zh-CN', elevenlabs: 'zh', openai: 'zh', google: 'zh-CN', deepgram: 'zh' },
  'ar': { webspeech: 'ar-SA', elevenlabs: 'ar', openai: 'ar', google: 'ar-SA', deepgram: 'ar' },
  'hi': { webspeech: 'hi-IN', elevenlabs: 'hi', openai: 'hi', google: 'hi-IN', deepgram: 'hi' }
};

// Get language code for specific provider
window.Gracula.VoiceProviders.getLanguageCode = function(language, providerId) {
  const mapping = this.languageMappings[language];
  if (!mapping) return language;
  return mapping[providerId] || language;
};

// Get available providers based on configuration
window.Gracula.VoiceProviders.getAvailableProviders = function(config = {}) {
  const available = [];
  
  // Web Speech API is always available in Chrome
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    available.push(this.webspeech);
  }
  
  // ElevenLabs if API key is configured
  if (config.elevenlabsApiKey) {
    available.push(this.elevenlabs);
  }
  
  // OpenAI if API key is configured
  if (config.openaiApiKey) {
    available.push(this.openai);
  }
  
  // Google if API key is configured
  if (config.googleApiKey) {
    available.push(this.google);
  }
  
  // Deepgram if API key is configured
  if (config.deepgramApiKey) {
    available.push(this.deepgram);
  }
  
  return available;
};

// Get best provider based on priority and availability
window.Gracula.VoiceProviders.getBestProvider = function(config = {}) {
  const available = this.getAvailableProviders(config);
  
  for (const providerId of this.defaultPriority) {
    const provider = available.find(p => p.id === providerId);
    if (provider) return provider;
  }
  
  // Fallback to first available
  return available[0] || null;
};

console.log('✅ Voice Providers configuration loaded');

