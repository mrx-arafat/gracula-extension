// Gracula Background Script - API Handler

// Default API configuration
let apiConfig = {
  provider: 'openai', // 'openai' or 'huggingface'
  apiKey: '', // Users can add their own key in settings
  model: 'gpt-3.5-turbo', // OpenAI model
  openaiEndpoint: 'https://api.openai.com/v1/chat/completions',
  huggingfaceEndpoint: 'https://api-inference.huggingface.co/models/',
  huggingfaceModel: 'mistralai/Mistral-7B-Instruct-v0.2'
};

// Load saved API config
chrome.storage.sync.get(['apiConfig'], (result) => {
  if (result.apiConfig) {
    apiConfig = { ...apiConfig, ...result.apiConfig };
  }
  console.log('🧛 Gracula: API Config loaded:', { provider: apiConfig.provider, model: apiConfig.model });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateReplies') {
    handleGenerateReplies(request.tone, request.context, request.enhancedContext)
      .then(replies => sendResponse({ success: true, replies }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }

  if (request.action === 'updateApiConfig') {
    apiConfig = { ...apiConfig, ...request.config };
    chrome.storage.sync.set({ apiConfig }, () => {
      console.log('🧛 Gracula: API Config saved:', { provider: apiConfig.provider, hasKey: !!apiConfig.apiKey });
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'getApiConfig') {
    sendResponse({ success: true, config: apiConfig });
    return true;
  }
});

async function handleGenerateReplies(tone, context, enhancedContext) {
  console.log('🧛 Gracula Background: Generating replies with tone:', tone.name);

  // Build the prompt with enhanced context
  const prompt = buildPrompt(tone, context, enhancedContext);

  // Call AI API
  const replies = await callAIAPI(prompt, { enhancedContext, metrics: enhancedContext?.metrics });

  return replies;
}

function buildPrompt(tone, context, enhancedContext) {
  let prompt = '';

  const analysis = enhancedContext?.analysis;
  const summary = enhancedContext?.summary || {};
  const metrics = enhancedContext?.metrics;
  const styleMarkers = analysis?.styleMarkers;
  const emojiUsage = analysis?.emojiUsage;
  const lengthStats = analysis?.messageLength;

  const formatPace = (seconds) => {
    if (typeof seconds !== 'number' || Number.isNaN(seconds)) {
      return 'unknown tempo';
    }

    const rounded = Math.round(seconds);

    if (rounded <= 90) {
      return `rapid (~${rounded}s gaps)`;
    }

    if (rounded <= 600) {
      return `steady (~${rounded}s gaps)`;
    }

    return `slow (~${rounded}s gaps)`;
  };

  if (analysis && Object.keys(summary).length > 0) {
    prompt += '=== CONVERSATION ANALYSIS ===\n';
    prompt += `Participants: ${summary.participants || 'Unknown'}\n`;
    prompt += `Last Speaker: ${summary.lastSpeaker || 'Unknown'}\n`;
    prompt += `Conversation Type: ${summary.conversationType || 'Unknown'}\n`;
    prompt += `Sentiment: ${summary.sentiment || 'Neutral'}\n`;

    if (analysis.hasUnansweredQuestion?.hasQuestion) {
      prompt += `⚠️ UNANSWERED QUESTION: "${analysis.hasUnansweredQuestion.question}" (asked by ${analysis.hasUnansweredQuestion.askedBy})\n`;
    }

    if (analysis.urgency?.level && analysis.urgency.level !== 'low') {
      prompt += `⚠️ URGENCY LEVEL: ${analysis.urgency.level}\n`;
    }

    if (summary.topics) {
      prompt += `Topics: ${summary.topics}\n`;
    }

    prompt += '\n';
  }

  if (metrics || styleMarkers || emojiUsage) {
    prompt += '=== STYLE METRICS ===\n';

    if (metrics?.recommendedReplyLength) {
      const rec = metrics.recommendedReplyLength;
      prompt += `Recommended reply: ~${rec.words} words (~${rec.chars} chars, ${rec.sentences} sentence${rec.sentences === 1 ? '' : 's'}) based on ${rec.basis}.\n`;
    } else if (lengthStats?.averageWords) {
      prompt += `Typical message length: ~${lengthStats.averageWords} words (${lengthStats.style || 'short'}).\n`;
    }

    if (metrics?.recentIncomingAverageChars || metrics?.recentOutgoingAverageChars) {
      const incoming = metrics.recentIncomingAverageChars ? `${metrics.recentIncomingAverageChars} chars` : 'n/a';
      const outgoing = metrics.recentOutgoingAverageChars ? `${metrics.recentOutgoingAverageChars} chars` : 'n/a';
      prompt += `Recent incoming avg: ${incoming}; your replies avg: ${outgoing}.\n`;
    }

    if (metrics?.languageHints?.length) {
      prompt += `Language mix: ${metrics.languageHints.join(', ')}.\n`;
    }

    if (metrics?.messagePaceSeconds) {
      prompt += `Message pace: ${formatPace(metrics.messagePaceSeconds)}.\n`;
    }

    if (emojiUsage?.usageLevel) {
      const topEmojis = emojiUsage.topEmojis?.length ? ` (top: ${emojiUsage.topEmojis.join(', ')})` : '';
      prompt += `Emoji usage: ${emojiUsage.usageLevel}${topEmojis}.\n`;
    }

    if (styleMarkers?.notes?.length) {
      prompt += `Style notes: ${styleMarkers.notes.join('; ')}.\n`;
    }

    if (metrics?.shortMessageExamples?.length) {
      prompt += 'Recent message samples:\n';
      metrics.shortMessageExamples.forEach(example => {
        prompt += `- ${example}\n`;
      });
    }

    prompt += '\n';
  }

  if (Array.isArray(context) && context.length > 0) {
    prompt += '=== CONVERSATION HISTORY ===\n';
    context.forEach((msg) => {
      prompt += `${msg}\n`;
    });
    prompt += '\n';
  }

  prompt += '=== YOUR TASK ===\n';
  prompt += `${tone.prompt}\n\n`;

  const recommended = metrics?.recommendedReplyLength;

  if (recommended) {
    prompt += `Match the conversation length guidance: aim for about ${recommended.words} words (~${recommended.chars} characters) across ${recommended.sentences} sentence${recommended.sentences === 1 ? '' : 's'}.`;
    if (recommended.basis) {
      prompt += ` (Based on ${recommended.basis}.)`;
    }
    prompt += '\n';
  } else if (lengthStats?.style) {
    prompt += `Keep replies ${lengthStats.style} and no longer than two sentences.\n`;
  } else {
    prompt += 'Keep each reply concise (1-2 sentences max).\n';
  }

  if (metrics?.languageHints?.length) {
    prompt += `Stay within this language mix: ${metrics.languageHints.join(', ')}.\n`;
  }

  if (styleMarkers?.register && styleMarkers.register !== 'neutral') {
    prompt += `Tone register: ${styleMarkers.register}. Mirror this vibe.\n`;
  }

  if (styleMarkers?.notes?.length) {
    prompt += `Follow these style cues: ${styleMarkers.notes.join('; ')}.\n`;
  }

  if (emojiUsage?.usageLevel === 'none') {
    prompt += 'Avoid new emojis unless already used in the thread.\n';
  } else if (emojiUsage?.usageLevel) {
    const emojiExamples = emojiUsage.topEmojis?.map(sample => sample.split(' ')[0]).join(' ');
    const suffix = emojiExamples ? ` (examples: ${emojiExamples})` : '';
    prompt += `Match the ${emojiUsage.usageLevel} emoji frequency${suffix}.\n`;
  }

  if (analysis?.hasUnansweredQuestion?.hasQuestion) {
    prompt += '⚠️ IMPORTANT: There is an unanswered question. Make sure to address it in your reply.\n';
  }

  if (analysis?.urgency?.level === 'high') {
    prompt += '⚠️ IMPORTANT: This conversation seems urgent. Respond accordingly.\n';
  }

  prompt += '\nGenerate 3 different reply options. Each reply should be on a new line, numbered 1., 2., and 3.\n';
  prompt += 'Make replies contextually relevant based on the conversation analysis above.\n\n';
  prompt += 'Replies:\n';

  return prompt;
}

async function callAIAPI(prompt, options = {}) {
  // Check which provider to use
  try {
    if (apiConfig.provider === 'openai') {
      console.log('🧛 Gracula: Using OpenAI API');
      return await callOpenAIAPI(prompt, options);
    } else {
      console.log('🧛 Gracula: Using Hugging Face API');
      return await callHuggingFaceAPI(prompt, options);
    }
  } catch (error) {
    console.error(`🧛 Gracula: ${apiConfig.provider} API error:`, error);

    // Fallback to mock responses for demo
    console.log('🧛 Gracula: Using fallback mock responses');
    return generateMockReplies(prompt, options);
  }
}

async function callOpenAIAPI(prompt, options = {}) {
  if (!apiConfig.apiKey) {
    throw new Error('OpenAI API key is required. Please add it in the extension settings.');
  }

  const url = apiConfig.openaiEndpoint;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiConfig.apiKey}`
  };

  const metrics = options.metrics || options.enhancedContext?.metrics || null;
  const analysis = options.enhancedContext?.analysis || {};
  const recommended = metrics?.recommendedReplyLength;

  const deriveTokens = (wordsEstimate) => {
    const safeWords = Math.max(6, Math.round(wordsEstimate || 0));
    const perReplyTokens = Math.max(18, Math.round(safeWords * 1.5));
    return Math.min(180, Math.max(90, perReplyTokens * 3 + 20));
  };

  let maxTokens = 200;

  if (recommended) {
    const estimatedWords = recommended.words || Math.round((recommended.chars || 80) / 5);
    maxTokens = deriveTokens(estimatedWords);
  } else if (metrics?.averageWords) {
    maxTokens = deriveTokens(metrics.averageWords);
  } else if (analysis?.messageLength?.averageWords) {
    maxTokens = deriveTokens(analysis.messageLength.averageWords);
  }

  console.log('\ud83e\udddb Gracula: OpenAI max_tokens set to', maxTokens);


  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: apiConfig.model || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates natural, conversational message replies. Always provide exactly 3 different reply options, numbered 1., 2., and 3. Match the conversation length, pacing, and style guidance provided.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
      n: 1
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // Extract the generated text
  let generatedText = '';
  if (data.choices && data.choices[0]?.message?.content) {
    generatedText = data.choices[0].message.content;
  } else {
    throw new Error('Unexpected OpenAI API response format');
  }

  console.log('🧛 Gracula: OpenAI response:', generatedText);

  // Extract individual replies
  const replies = parseReplies(generatedText);

  return replies;
}

async function callHuggingFaceAPI(prompt, options = {}) {
  const url = `${apiConfig.huggingfaceEndpoint}${apiConfig.huggingfaceModel}`;

  const headers = {
    'Content-Type': 'application/json'
  };

  // Add API key if available
  if (apiConfig.apiKey) {
    headers['Authorization'] = `Bearer ${apiConfig.apiKey}`;
  }

  const metrics = options.metrics || options.enhancedContext?.metrics || null;
  const analysis = options.enhancedContext?.analysis || {};
  const recommended = metrics?.recommendedReplyLength;

  const deriveTokens = (wordsEstimate) => {
    const safeWords = Math.max(6, Math.round(wordsEstimate || 0));
    const perReplyTokens = Math.max(18, Math.round(safeWords * 1.5));
    return Math.min(150, Math.max(75, perReplyTokens * 3 + 15));
  };

  let maxNewTokens = 150;

  if (recommended) {
    const estimatedWords = recommended.words || Math.round((recommended.chars || 80) / 5);
    maxNewTokens = deriveTokens(estimatedWords);
  } else if (metrics?.averageWords) {
    maxNewTokens = deriveTokens(metrics.averageWords);
  } else if (analysis?.messageLength?.averageWords) {
    maxNewTokens = deriveTokens(analysis.messageLength.averageWords);
  }

  console.log('\ud83e\udddb Gracula: HuggingFace max_new_tokens set to', maxNewTokens);

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: maxNewTokens,
        temperature: 0.7,
        top_p: 0.9,
        return_full_text: false
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // Parse the response
  let generatedText = '';
  if (Array.isArray(data) && data[0]?.generated_text) {
    generatedText = data[0].generated_text;
  } else if (data.generated_text) {
    generatedText = data.generated_text;
  } else {
    throw new Error('Unexpected API response format');
  }

  // Extract individual replies
  const replies = parseReplies(generatedText);

  return replies;
}

function parseReplies(text) {
  // Try to extract numbered replies
  const lines = text.split('\n').filter(line => line.trim());
  const replies = [];

  for (const line of lines) {
    // Match patterns like "1.", "1)", "Reply 1:", etc.
    const match = line.match(/^(?:\d+[\.\):]?\s*|Reply\s*\d+:\s*)(.*)/i);
    if (match && match[1].trim()) {
      replies.push(match[1].trim());
    } else if (line.trim() && !line.match(/^(Replies?|Options?|Suggestions?):/i)) {
      // Add non-empty lines that aren't headers
      replies.push(line.trim());
    }

    if (replies.length >= 3) break;
  }

  // If we didn't get 3 replies, split by sentences
  if (replies.length < 3) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences.slice(0, 3).map(s => s.trim() + '.');
  }

  return replies.slice(0, 3);
}

function generateMockReplies(prompt) {
  // Fallback mock replies for demo purposes
  // In production, this would only be used if API fails

  const mockReplies = {
    angry: [
      "I can't believe this is happening! This is completely unacceptable.",
      "Are you serious right now? This is so frustrating!",
      "This is ridiculous. I'm really not happy about this situation."
    ],
    chill: [
      "Hey, no worries! Let's just take it easy and see what happens.",
      "Yeah, sounds good to me. Whatever works!",
      "Cool, cool. I'm down for whatever."
    ],
    confused: [
      "Wait, I'm not sure I understand. Can you explain that again?",
      "Hmm, I'm a bit confused. What exactly do you mean?",
      "Sorry, could you clarify? I'm not following."
    ],
    excited: [
      "OMG YES! This is amazing! I'm so excited!",
      "WOW! That's incredible! I can't wait!",
      "This is SO COOL! I'm totally pumped about this!"
    ],
    flirty: [
      "Well aren't you interesting... I'd love to know more 😉",
      "You always know how to make me smile. What's your secret?",
      "Is it just me, or is this conversation getting more fun?"
    ],
    formal: [
      "Thank you for your message. I appreciate you reaching out.",
      "I understand your point. Let me consider this carefully.",
      "That is certainly worth discussing. I look forward to your thoughts."
    ],
    funny: [
      "Haha! That's hilarious! You should do stand-up comedy!",
      "LOL! You're killing me here! 😂",
      "That's the funniest thing I've heard all day! More please!"
    ],
    genz: [
      "No cap, that's actually fire! Let's gooo! 🔥",
      "Fr fr, this hits different. I'm here for it!",
      "Bestie, you're literally slaying rn! Period!"
    ],
    lyrical: [
      "Like a gentle breeze on a summer's day, your words dance through my thoughts.",
      "In the symphony of our conversation, each word is a note of beauty.",
      "Your message flows like poetry, painting colors in my mind."
    ],
    creative: [
      "You're absolutely brilliant! That's such a creative idea!",
      "Wow, I'm genuinely impressed! You have such a unique perspective!",
      "That's amazing! You're so talented and thoughtful!"
    ],
    default: [
      "Thanks for your message! I appreciate you reaching out.",
      "That's interesting! Tell me more about that.",
      "I hear you! Let's talk about this."
    ]
  };

  // Try to detect tone from prompt
  const promptLower = prompt.toLowerCase();
  let selectedReplies = mockReplies.default;

  for (const [tone, replies] of Object.entries(mockReplies)) {
    if (promptLower.includes(tone)) {
      selectedReplies = replies;
      break;
    }
  }

  return selectedReplies;
}

console.log('🧛 Gracula Background Script: Loaded');

