// Tone Configuration
// Defines all available reply tones with their prompts

window.Gracula = window.Gracula || {};
window.Gracula.Config = window.Gracula.Config || {};

window.Gracula.Config.TONES = [
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
    emoji: '😕',
    prompt: 'Generate a confused, questioning response. Express uncertainty and ask for clarification in a natural way.'
  },
  {
    id: 'curious',
    name: 'Curious',
    emoji: '🤔',
    prompt: 'Generate a curious, inquisitive response that shows genuine interest in what was just said. Ask thoughtful follow-up questions to learn more about the topic or the person\'s experience. Use question words like "What", "How", "Why", "When", "Where", or phrases like "Tell me more about", "That\'s interesting, could you explain", "I\'m curious about", "What was it like when", "How did you feel about". Show enthusiasm for learning and understanding more details. Keep the questions natural and conversational, not like an interrogation. Focus on the most interesting or intriguing aspect of their last message and dig deeper into that specific point.'
  },
  {
    id: 'diplomatic',
    name: 'Diplomatic',
    emoji: '🤝',
    prompt: 'Generate a diplomatic, tactful response that carefully navigates sensitive topics or potential traps. Avoid taking strong positions or making commitments. Use neutral language that acknowledges different perspectives without fully endorsing any. Employ phrases like "I can see both sides", "That\'s an interesting perspective", "It depends on the situation", "There are various factors to consider", "I understand where you\'re coming from". If asked a trap question or put in an awkward position, deflect gracefully or give a non-committal answer that doesn\'t offend anyone. Stay polite, balanced, and avoid controversy while still sounding engaged and thoughtful. Never directly say yes or no to loaded questions.'
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
    id: 'ignore',
    name: 'Ignore',
    emoji: '🙈',
    prompt: 'Generate a response that politely but clearly ignores or deflects from what was just said. Change the subject completely to something unrelated. Act as if you didn\'t really read or process their message. You can talk about the weather, what you had for lunch, a random thought, a completely different topic, or ask about something totally unrelated. The key is to make it obvious you\'re not engaging with their message without being explicitly rude. Examples: "Anyway, did you see that new movie?", "Oh btw, I was thinking about getting pizza later", "Random thought - do you think aliens exist?", "So... how about this weather lately?"'
  },
  {
    id: 'motivational',
    name: 'Motivational',
    emoji: '💪',
    prompt: 'Generate an inspiring, motivational response. Be encouraging, positive, and uplifting in your message.'
  },
  {
    id: 'psychological',
    name: 'Psychological',
    emoji: '🧠',
    prompt: 'Generate a psychologically sophisticated response using persuasion techniques and influence tactics. Apply principles like: reciprocity ("I did X for you, so..."), social proof ("Everyone agrees that..."), authority ("Studies show..." or "Experts say..."), scarcity ("This opportunity won\'t last..."), commitment/consistency ("You mentioned before that..."), liking (find common ground and mirror their language), loss aversion ("You might miss out on..."), anchoring (set expectations), and emotional appeals. Use subtle reframing, validate their feelings first before redirecting, ask questions that lead to your desired answer, use "because" to make requests seem more reasonable, employ the "yes ladder" technique, and create a sense of urgency when appropriate. Mirror their communication style and pace. The goal is to be persuasive and influential while maintaining plausible deniability about the manipulation. Be strategic, calculated, but conversational.'
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



