// API Configuration
// Defines API settings for AI providers

window.Gracula = window.Gracula || {};
window.Gracula.Config = window.Gracula.Config || {};

window.Gracula.Config.API_CONFIG = {
  provider: 'openai', // 'openai', 'openrouter', 'huggingface', or 'google'
  openai: {
    model: 'gpt-3.5-turbo', // or 'gpt-4', 'gpt-4-turbo-preview'
    endpoint: 'https://api.openai.com/v1/chat/completions',
    maxTokens: 200,
    temperature: 0.7
  },
  openrouter: {
    model: 'google/gemini-2.0-flash-exp:free',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    maxTokens: 300,
    temperature: 0.7
  },
  huggingface: {
    model: 'mistralai/Mistral-7B-Instruct-v0.2',
    endpoint: 'https://api-inference.huggingface.co/models/',
    maxTokens: 150,
    temperature: 0.7
  },
  google: {
    model: 'gemini-2.0-flash-exp', // or 'gemini-1.5-pro', 'gemini-1.5-flash'
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/',
    maxTokens: 512,
    temperature: 0.7
  }
};



