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

    // Add semantic intent if available
    if (analysis.intent) {
      const intentDisplay = analysis.intent.primary.replace(/_/g, ' ');
      prompt += `User Intent: ${intentDisplay}`;
      if (analysis.intent.confidence && analysis.intent.confidence !== 'low') {
        prompt += ` (${analysis.intent.confidence} confidence)`;
      }
      if (analysis.intent.secondary && analysis.intent.secondary.length > 0) {
        const secondary = analysis.intent.secondary.map(i => i.replace(/_/g, ' ')).join(', ');
        prompt += ` [also: ${secondary}]`;
      }
      prompt += '\n';
    }

    // Add emotional state if detected
    if (analysis.emotionalState && analysis.emotionalState.state !== 'neutral') {
      const emotion = analysis.emotionalState.state;
      const intensity = analysis.emotionalState.intensity;
      prompt += `Emotional State: ${emotion} (${intensity} intensity)\n`;
    }

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

function generateMockReplies(prompt, options = {}) {
  // Fallback mock replies for demo purposes
  // In production, this would only be used if API fails

  console.log('🧛 Gracula: Generating context-aware mock replies');

  // Extract context information
  const enhancedContext = options.enhancedContext || {};
  const summary = enhancedContext.summary || {};
  const analysis = enhancedContext.analysis || {};
  const metrics = enhancedContext.metrics || {};

  // Use YOUR last message (what you're continuing from)
  const yourLastMessage = summary.lastUserMessage || '';
  // Get the last message from a friend
  const lastFriendMessage = summary.lastFriendMessage || '';
  const lastFriendSpeaker = summary.lastFriendSpeaker || '';
  // Also get the last message from anyone (for additional context)
  const lastAnyMessage = summary.lastMessage || '';
  // Determine who sent the last message
  const isYourLastMessage = summary.isYourLastMessage || false;

  const topics = summary.topics || [];
  const languageMix = analysis.languageMix || [];
  const styleMarkers = analysis.styleMarkers || {};
  const emojiUsage = analysis.emojiUsage || 'none';

  // Detect tone from prompt
  const promptLower = prompt.toLowerCase();
  let detectedTone = 'default';

  const tones = ['angry', 'chill', 'confused', 'excited', 'flirty', 'formal', 'funny', 'motivational', 'sarcastic', 'short'];
  for (const tone of tones) {
    if (promptLower.includes(tone)) {
      detectedTone = tone;
      break;
    }
  }

  console.log('🧛 Gracula: Detected tone:', detectedTone);
  console.log('🧛 Gracula: Your last message:', yourLastMessage);
  console.log('🧛 Gracula: Last message from friend:', lastFriendMessage);
  console.log('🧛 Gracula: Is your last message?', isYourLastMessage);
  console.log('🧛 Gracula: Topics:', topics.join(', '));

  // Generate context-aware replies
  const replies = generateContextualReplies(detectedTone, {
    yourLastMessage,
    lastFriendMessage,
    lastFriendSpeaker,
    lastAnyMessage,
    isYourLastMessage,
    topics,
    languageMix,
    styleMarkers,
    emojiUsage
  });

  return replies;
}

function generateContextualReplies(tone, context) {
  const {
    yourLastMessage,
    lastFriendMessage,
    lastFriendSpeaker,
    lastAnyMessage,
    isYourLastMessage,
    topics,
    styleMarkers,
    emojiUsage
  } = context;

  // Helper to add emojis based on usage level
  const addEmoji = (text, emoji) => {
    if (emojiUsage === 'heavy' || emojiUsage === 'moderate') {
      return `${text} ${emoji}`;
    }
    return text;
  };

  // Helper to apply lowercase style if preferred
  const applyStyle = (text) => {
    if (styleMarkers.prefersLowercase) {
      // Keep first letter capitalized, rest lowercase
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
    return text;
  };

  // Analyze last message for better context
  const analyzeMessage = (msg) => {
    if (!msg) return { isQuestion: false, isNegative: false, topic: null };
    const msgLower = msg.toLowerCase();
    return {
      isQuestion: /\?|ki|keno|kobe|kothay|how|what|when|where/.test(msgLower),
      isNegative: /nai|na|not|no|can't|couldn't|won't/.test(msgLower),
      isPositive: /yes|hoo|thik|okay|good|great|nice/.test(msgLower),
      hasUrgency: /asap|jaldi|taratari|now|urgent/.test(msgLower)
    };
  };

  // Determine which message to analyze based on context
  // If YOU sent the last message, analyze what you said
  // If a FRIEND sent the last message, analyze what they said
  const contextMessage = isYourLastMessage ? yourLastMessage : lastFriendMessage;
  const lastMessageAnalysis = analyzeMessage(contextMessage);

  // Extract topic keywords for reference
  const topicKeywords = topics.slice(0, 2); // Use first 2 topics
  const hasTopic = topicKeywords.length > 0;
  const primaryTopic = topicKeywords[0] || '';

  // Log context for debugging
  console.log('🧛 Gracula: Context analysis - isYourLastMessage:', isYourLastMessage);
  console.log('🧛 Gracula: Analyzing message:', contextMessage);
  console.log('🧛 Gracula: Message analysis:', lastMessageAnalysis);

  // Generate replies based on tone
  let replies = [];

  switch (tone) {
    case 'default':
      if (lastMessageAnalysis.isQuestion && hasTopic) {
        replies = [
          applyStyle(`Hmm, ${primaryTopic} er byapare ektu dekhi`),
          applyStyle(`Let me check about ${primaryTopic}`),
          applyStyle(`Good question, I'll find out about ${primaryTopic}`)
        ];
      } else if (lastMessageAnalysis.isNegative && hasTopic) {
        replies = [
          applyStyle(`Oh, ${primaryTopic} nai? Let me see what we can do`),
          applyStyle(`No worries about ${primaryTopic}, we'll figure it out`),
          applyStyle(`Okay, ${primaryTopic} na thakle alternative dekhbo`)
        ];
      } else if (hasTopic) {
        replies = [
          applyStyle(`Okay, let me check about the ${primaryTopic} thing`),
          applyStyle(`Got it, I'll look into ${primaryTopic}`),
          applyStyle(`Alright, sounds good about ${primaryTopic}`)
        ];
      } else {
        replies = [
          applyStyle("Okay, got it"),
          applyStyle("Alright, sounds good"),
          applyStyle("Sure, let me know")
        ];
      }
      break;

    case 'funny':
      if (hasTopic) {
        replies = [
          addEmoji(applyStyle(`Haha ${topicKeywords[0]}? That's hilarious!`), '😂'),
          addEmoji(applyStyle(`LOL bhai, ${topicKeywords[0]} nai mane shob shesh!`), '🤣'),
          addEmoji(applyStyle(`${topicKeywords[0]} er jonno etoh tension? Chill koro!`), '😄')
        ];
      } else {
        replies = [
          addEmoji(applyStyle("Haha that's funny!"), '😂'),
          addEmoji(applyStyle("LOL bhai!"), '🤣'),
          addEmoji(applyStyle("Chill koro!"), '😄')
        ];
      }
      break;

    case 'chill':
      if (hasTopic) {
        replies = [
          applyStyle(`Yeah no worries about ${topicKeywords[0]}, we'll figure it out`),
          applyStyle(`Chill bhai, ${topicKeywords[0]} hoye jabe`),
          applyStyle(`Relax, it's all good`)
        ];
      } else {
        replies = [
          applyStyle("Yeah no worries, we'll figure it out"),
          applyStyle("Chill bhai, hoye jabe"),
          applyStyle("Relax, it's all good")
        ];
      }
      break;

    case 'confused':
      if (hasTopic) {
        replies = [
          addEmoji(applyStyle(`Wait, ${topicKeywords[0]} ki? I'm confused`), '🤔'),
          applyStyle(`Hmm, ${topicKeywords[0]} er byapare ektu explain koro`),
          applyStyle(`Sorry bhai, ${topicKeywords[0]} ta bujhlam na`)
        ];
      } else {
        replies = [
          addEmoji(applyStyle("Wait, what? I'm confused"), '🤔'),
          applyStyle("Hmm, ektu explain koro"),
          applyStyle("Sorry bhai, bujhlam na")
        ];
      }
      break;

    case 'excited':
      if (hasTopic) {
        replies = [
          addEmoji(applyStyle(`OMG YES! ${topicKeywords[0]}! This is amazing!`), '🤩'),
          addEmoji(applyStyle(`WOW! ${topicKeywords[0]} hoye gese? I'm so excited!`), '😍'),
          addEmoji(applyStyle(`This is SO COOL! Let's do this!`), '🔥')
        ];
      } else {
        replies = [
          addEmoji(applyStyle("OMG YES! This is amazing!"), '🤩'),
          addEmoji(applyStyle("WOW! I'm so excited!"), '😍'),
          addEmoji(applyStyle("This is SO COOL!"), '🔥')
        ];
      }
      break;

    case 'angry':
      if (hasTopic) {
        replies = [
          addEmoji(applyStyle(`Seriously? ${topicKeywords[0]} nai? This is frustrating!`), '😠'),
          applyStyle(`Bhai this ${topicKeywords[0]} situation is ridiculous`),
          applyStyle(`I can't believe this is happening with ${topicKeywords[0]}`)
        ];
      } else {
        replies = [
          addEmoji(applyStyle("Seriously? This is frustrating!"), '😠'),
          applyStyle("Bhai this is ridiculous"),
          applyStyle("I can't believe this is happening")
        ];
      }
      break;

    case 'sarcastic':
      if (hasTopic) {
        replies = [
          addEmoji(applyStyle(`Oh great, ${topicKeywords[0]} nai. What a surprise!`), '🙄'),
          applyStyle(`Wow, ${topicKeywords[0]} er jonno etoh effort. Amazing.`),
          applyStyle(`Sure, because ${topicKeywords[0]} always works perfectly, right?`)
        ];
      } else {
        replies = [
          addEmoji(applyStyle("Oh great. What a surprise!"), '🙄'),
          applyStyle("Wow. Amazing."),
          applyStyle("Sure, that always works perfectly, right?")
        ];
      }
      break;

    case 'motivational':
      if (hasTopic) {
        replies = [
          addEmoji(applyStyle(`Don't worry! We'll find ${topicKeywords[0]}! You got this!`), '💪'),
          addEmoji(applyStyle(`Keep trying bhai! ${topicKeywords[0]} hoye jabe!`), '🔥'),
          applyStyle(`Stay positive! We'll solve this ${topicKeywords[0]} issue together!`)
        ];
      } else {
        replies = [
          addEmoji(applyStyle("Don't worry! You got this!"), '💪'),
          addEmoji(applyStyle("Keep trying bhai! Hoye jabe!"), '🔥'),
          applyStyle("Stay positive! We'll solve this together!")
        ];
      }
      break;

    case 'formal':
      if (hasTopic) {
        replies = [
          applyStyle(`Thank you for the update regarding ${topicKeywords[0]}.`),
          applyStyle(`I understand the ${topicKeywords[0]} situation. Let me look into this.`),
          applyStyle(`I appreciate you informing me about ${topicKeywords[0]}.`)
        ];
      } else {
        replies = [
          applyStyle("Thank you for the update."),
          applyStyle("I understand. Let me look into this."),
          applyStyle("I appreciate you informing me.")
        ];
      }
      break;

    case 'flirty':
      replies = [
        addEmoji(applyStyle("Well aren't you interesting... tell me more"), '😉'),
        applyStyle("You always know how to make me smile"),
        applyStyle("Is it just me, or is this getting more fun?")
      ];
      break;

    case 'short':
      if (hasTopic) {
        replies = [
          applyStyle(`Ok ${topicKeywords[0]}`),
          applyStyle("Got it"),
          applyStyle("Sure")
        ];
      } else {
        replies = [
          applyStyle("Ok"),
          applyStyle("Got it"),
          applyStyle("Sure")
        ];
      }
      break;

    default:
      replies = [
        applyStyle("Okay, got it"),
        applyStyle("Alright, sounds good"),
        applyStyle("Sure, let me know")
      ];
  }

  return replies;
}

console.log('🧛 Gracula Background Script: Loaded');

