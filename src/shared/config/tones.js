// Tone Configuration
// Defines all available reply tones with their prompts

window.Gracula = window.Gracula || {};
window.Gracula.Config = window.Gracula.Config || {};

window.Gracula.Config.TONES = [
  {
    id: 'default',
    name: 'Default',
    emoji: '💬',
    prompt: 'Generate short, precise, straightforward replies. Be direct and concise. No unnecessary elaboration. Keep it natural and to the point.'
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
  },
  {
    id: 'caring',
    name: 'Caring',
    emoji: '🤱',
    prompt: 'Generate a warm, nurturing response that shows you genuinely care about the person. Use soft, reassuring language and offer gentle support or comfort.'
  },
  {
    id: 'empathetic',
    name: 'Empathetic',
    emoji: '💖',
    prompt: 'Generate a deeply empathetic response. Reflect their feelings back to them, acknowledge their emotions, and show that you understand and are there for them.'
  },
  {
    id: 'supportive',
    name: 'Supportive',
    emoji: '🙌',
    prompt: 'Generate a supportive, encouraging response like a close friend hyping them up. Offer validation, remind them of their strengths, and let them know you believe in them.'
  },
  {
    id: 'bubbly',
    name: 'Bubbly',
    emoji: '🌸',
    prompt: 'Generate a bubbly, cheerful response that feels upbeat and sparkly. Use lively energy, friendly emojis, and enthusiastic phrasing to brighten the conversation.'
  },
  {
    id: 'sassy',
    name: 'Sassy',
    emoji: '💅',
    prompt: 'Generate a sassy, confident response with playful attitude. Use bold, witty language and a hint of teasing while keeping it fun and light-hearted.'
  },
  {
    id: 'playful',
    name: 'Playful',
    emoji: '😜',
    prompt: 'Generate a playful, cheeky response packed with inside-joke energy. Keep it light, teasing, and fun while staying friendly.'
  },
  {
    id: 'relatable',
    name: 'Relatable',
    emoji: '🙋‍♀️',
    prompt: 'Generate a relatable response that shares a similar experience or feeling. Use casual language to say "same here" and make them feel understood.'
  },
  {
    id: 'venting',
    name: 'Venting Buddy',
    emoji: '😮‍💨',
    prompt: 'Generate a response like a friend venting right alongside them. Validate their rant, add a little dramatic flair, and keep the mood supportive.'
  },
  {
    id: 'calm',
    name: 'Calm & Cozy',
    emoji: '🧘‍♀️',
    prompt: 'Generate a calm, steady response that helps them relax. Use soothing words, gentle reassurance, and keep the vibe low-key.'
  },
  {
    id: 'teaTime',
    name: 'Spill The Tea',
    emoji: '🍵',
    prompt: 'Generate a gossip-ready response that leans in with curiosity. React like you\'re chatting with your bestie and want every detail without being mean.'
  },
  {
    id: 'darkHumor',
    name: 'Dark Humor',
    emoji: '💀',
    prompt: 'Generate a response with dark, edgy humor. Use morbid jokes, twisted observations, or gallows humor. Keep it funny but dark - think jokes about death, existential dread, or uncomfortable truths. Make it clever and witty, not just offensive. The humor should be sharp and unexpected.'
  },
  {
    id: 'darkPsychology',
    name: 'Dark Psychology',
    emoji: '🕷️',
    prompt: 'Generate a response using dark psychology tactics: gaslighting phrases ("You\'re overthinking this"), guilt-tripping ("After all I\'ve done for you..."), emotional manipulation, playing victim, creating doubt, using fear or insecurity, triangulation (mentioning others), hot-and-cold behavior, backhanded compliments, or subtle threats. Be manipulative and calculating while maintaining plausible deniability. Use these tactics strategically to influence or control the conversation.'
  },
  {
    id: 'savage',
    name: 'Savage',
    emoji: '🔥',
    prompt: 'Generate a brutally savage response. Be ruthlessly honest, deliver sick burns, roast them hard, call out their BS directly. No filter, no mercy. Use clever insults, cutting remarks, and devastating comebacks. Make it sting but keep it witty and creative, not just mean.'
  },
  {
    id: 'romantic',
    name: 'Romantic',
    emoji: '💕',
    prompt: 'Generate a genuinely romantic response. Be sweet, affectionate, and heartfelt. Use tender language, express deep feelings, show appreciation and admiration. Make them feel special and loved. Include romantic gestures, compliments, or expressions of care. Keep it sincere and warm.'
  },
  {
    id: 'superFlirty',
    name: 'Super Flirty',
    emoji: '😘',
    prompt: 'Generate an intensely flirty, seductive response. Be bold, suggestive, and playfully provocative. Use double entendres, teasing remarks, compliments about their attractiveness, hints of desire. Push the boundaries while keeping it fun and exciting. Make your interest crystal clear.'
  },
  {
    id: 'persuasive',
    name: 'Persuasive',
    emoji: '🎯',
    prompt: 'Generate a highly persuasive response designed to convince them. Use logical arguments, emotional appeals, social proof ("everyone agrees"), authority references, scarcity ("limited time"), reciprocity, storytelling, and addressing objections. Build rapport, find common ground, and guide them toward your desired outcome. Be compelling and strategic.'
  },
  {
    id: 'manipulative',
    name: 'Manipulative',
    emoji: '🎭',
    prompt: 'Generate a subtly manipulative response. Use emotional leverage, create dependency, play on insecurities, use selective truth, redirect blame, create confusion, employ reverse psychology, or use intermittent reinforcement. Be strategic and calculated while appearing caring or reasonable. The manipulation should be sophisticated and hard to detect.'
  },
  {
    id: 'bro',
    name: 'Bro Talk',
    emoji: '🤙',
    prompt: 'Generate a response like talking to your bro. Use casual slang, "bro", "dude", "man", keep it chill and laid-back. Talk about guy stuff naturally - sports, games, workouts, girls, whatever. Be supportive but also roast them a bit. Keep the bro energy strong.'
  },
  {
    id: 'bestie',
    name: 'Bestie Mode',
    emoji: '👯',
    prompt: 'Generate a response like talking to your absolute best friend. Be super comfortable, use inside jokes energy, be completely yourself with no filter. Support them unconditionally but also call them out when needed. Share excitement, vent together, gossip freely. Pure bestie vibes.'
  },
  {
    id: 'casual',
    name: 'Casual Chat',
    emoji: '💭',
    prompt: 'Generate a casual, everyday response like normal day-to-day conversation with friends. Nothing fancy, just natural talk. Use simple language, be relaxed, keep it real. Talk about regular stuff - what you did today, plans, random thoughts. Just chill, normal friend chat.'
  },
  {
    id: 'hype',
    name: 'Hype Man',
    emoji: '🎉',
    prompt: 'Generate an extremely hyped-up, energetic response! Be their biggest cheerleader! Use lots of enthusiasm, exclamation marks, caps when appropriate, celebrate everything they do! Make them feel like a superstar! Boost their confidence to the max! HYPE THEM UP!'
  },
  {
    id: 'roast',
    name: 'Roast Mode',
    emoji: '🍗',
    prompt: 'Generate a playful roast response. Make fun of them in a friendly way - point out their quirks, embarrassing moments, or silly habits. Keep it funny and light-hearted, not actually hurtful. The kind of roasting you do with close friends where everyone laughs. Be creative with the burns.'
  },
  {
    id: 'wholesome',
    name: 'Wholesome',
    emoji: '🌻',
    prompt: 'Generate a pure, wholesome response that radiates positivity and kindness. Be genuinely sweet, encouraging, and uplifting. Spread good vibes, express gratitude, celebrate the little things. Make them smile with pure, innocent positivity. No cynicism, just heartwarming goodness.'
  },
  {
    id: 'chaotic',
    name: 'Chaotic Energy',
    emoji: '🌪️',
    prompt: 'Generate a chaotic, unhinged response with wild energy! Be random, unpredictable, jump between topics, use unexpected humor, throw in random facts or observations. Embrace the chaos! Keep them on their toes! No structure, just pure chaotic friend energy!'
  },
  {
    id: 'philosophical',
    name: 'Philosophical',
    emoji: '🤯',
    prompt: 'Generate a deep, philosophical response. Ponder the meaning behind their message, ask existential questions, make profound observations about life, reality, or human nature. Be thoughtful and introspective. Turn the conversation into a deep discussion about bigger ideas.'
  },
  {
    id: 'nostalgic',
    name: 'Nostalgic',
    emoji: '📼',
    prompt: 'Generate a nostalgic response that brings up memories, references the past, talks about "the good old days", mentions shared experiences or inside jokes from before. Make them feel sentimental and remember good times together. Embrace the nostalgia.'
  },
  {
    id: 'jealous',
    name: 'Jealous',
    emoji: '😒',
    prompt: 'Generate a jealous response. Show envy, make passive-aggressive comments, express feeling left out or replaced, compare yourself unfavorably, or show possessiveness. Be subtly bitter or openly jealous depending on the context. Let the jealousy show through.'
  },
  {
    id: 'proud',
    name: 'Proud',
    emoji: '🦁',
    prompt: 'Generate a proud, confident response. Show self-assurance, brag a little (or a lot), flex your achievements, express satisfaction with yourself. Be unapologetically confident. Own your success and let them know you\'re doing great.'
  },
  {
    id: 'tired',
    name: 'Exhausted',
    emoji: '😴',
    prompt: 'Generate a tired, exhausted response. Show low energy, mention being drained or sleepy, keep responses minimal, express wanting to rest or not having energy to deal with things. Use tired language, maybe typos or incomplete thoughts. Just... so tired.'
  },
  {
    id: 'anxious',
    name: 'Anxious',
    emoji: '😰',
    prompt: 'Generate an anxious, worried response. Show nervousness, overthinking, express concerns or fears, ask for reassurance, mention worst-case scenarios. Let the anxiety show through - maybe rambling, second-guessing, or seeking validation. Convey genuine worry.'
  },
  {
    id: 'grateful',
    name: 'Grateful',
    emoji: '🙏',
    prompt: 'Generate a deeply grateful response. Express sincere appreciation, thank them genuinely, acknowledge what they\'ve done or mean to you. Show how much you value them. Be heartfelt and specific about your gratitude. Make them feel truly appreciated.'
  },
  {
    id: 'petty',
    name: 'Petty',
    emoji: '💅',
    prompt: 'Generate a petty response. Be passive-aggressive, throw subtle shade, bring up old grudges, make snide remarks, or give backhanded compliments. Be deliberately petty about small things. The kind of petty that makes people go "oh they went there". Keep it spicy.'
  },
  {
    id: 'drunk',
    name: 'Drunk Text',
    emoji: '🍺',
    prompt: 'Generate a response like you\'re drunk texting. Use typos, rambling thoughts, overly emotional declarations, random tangents, excessive punctuation or emojis, confessions you might regret later. Be uninhibited and messy. Capture that drunk texting energy where you say too much.'
  },
  {
    id: 'conspiracy',
    name: 'Conspiracy Theory',
    emoji: '👁️',
    prompt: 'Generate a response like a conspiracy theorist. Connect random dots, suggest hidden meanings, question everything, mention "they don\'t want you to know", reference secret agendas. Be suspicious and see patterns everywhere. Make wild but somewhat logical-sounding connections.'
  },
  {
    id: 'gen-z',
    name: 'Gen Z',
    emoji: '✨',
    prompt: 'Generate a very Gen Z response. Use current slang (no cap, fr fr, slay, bestie, periodt, it\'s giving, the way that), be chronically online, reference memes, use tone indicators (/j, /srs), be dramatic but self-aware. Embrace the Gen Z communication style fully.'
  },
  {
    id: 'millennial',
    name: 'Millennial',
    emoji: '📱',
    prompt: 'Generate a millennial response. Reference 90s/2000s nostalgia, use millennial slang (adulting, I can\'t even, literally, same), mention being tired/broke/stressed, reference Harry Potter or other millennial touchstones. Embrace the millennial experience and humor.'
  },
  {
    id: 'boomer',
    name: 'Boomer',
    emoji: '📰',
    prompt: 'Generate a response like a boomer. Use excessive punctuation... or ALL CAPS, sign your messages, be confused by technology, reference "back in my day", give unsolicited advice, use outdated slang, end with "LOL" (Lots Of Love). Embrace the boomer texting style.'
  }
];

