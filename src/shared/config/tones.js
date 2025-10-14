// Tone Configuration
// Defines all available reply tones with their prompts

export const TONES = [
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
    prompt: 'Generate an excited, enthusiastic response! Show energy and excitement with appropriate punctuation and emojis.'
  },
  {
    id: 'flirty',
    name: 'Flirty',
    emoji: '😏',
    prompt: 'Generate a playful, flirty response. Be charming and subtly romantic, but keep it tasteful and fun.'
  },
  {
    id: 'formal',
    name: 'Formal',
    emoji: '🎩',
    prompt: 'Generate a formal, professional response. Use proper grammar, polite language, and maintain a business-appropriate tone.'
  },
  {
    id: 'funny',
    name: 'Funny',
    emoji: '😂',
    prompt: 'Generate a funny, humorous response. Use wit, jokes, or playful language to make the reply entertaining.'
  },
  {
    id: 'motivational',
    name: 'Motivational',
    emoji: '💪',
    prompt: 'Generate an inspiring, motivational response. Be encouraging, positive, and uplifting in your message.'
  },
  {
    id: 'sarcastic',
    name: 'Sarcastic',
    emoji: '🙄',
    prompt: 'Generate a sarcastic, witty response. Use irony and dry humor, but keep it light and not too harsh.'
  },
  {
    id: 'short',
    name: 'Short',
    emoji: '⚡',
    prompt: 'Generate a very brief, concise response. Keep it to 5 words or less. Be direct and to the point.'
  }
];

export default TONES;

