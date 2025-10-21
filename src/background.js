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
    handleGenerateReplies(request.tone, request.context, request.enhancedContext, request.responseMode)
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

async function handleGenerateReplies(tone, context, enhancedContext, responseMode = 'reply') {
  console.log('🧛 Gracula Background: Generating replies with tone:', tone.name, 'mode:', responseMode);

  // Build the prompt with enhanced context and response mode
  const prompt = buildPrompt(tone, context, enhancedContext, responseMode);

  // Call AI API
  const replies = await callAIAPI(prompt, { enhancedContext, metrics: enhancedContext?.metrics, responseMode });

  return replies;
}

function buildPrompt(tone, context, enhancedContext, responseMode = 'reply') {
  let prompt = '';

  const analysis = enhancedContext?.analysis;
  const summary = enhancedContext?.summary || {};
  const metrics = enhancedContext?.metrics;
  const dualAnalysis = enhancedContext?.dualAnalysis;

  // ========================================
  // PHASE 2: SMART MESSAGE SELECTION
  // ========================================

  const smartSelection = enhancedContext?.smartSelection;
  const topicChanges = enhancedContext?.topicChanges || [];
  const contextQuality = enhancedContext?.contextQuality;

  // Use selected messages if smart selection was used
  const selectedMessages = enhancedContext?.selectedMessages;
  const useSmartSelection = smartSelection?.used && Array.isArray(selectedMessages);

  if (useSmartSelection) {
    console.log(`🧠 [PHASE 2] Using ${selectedMessages.length} smart-selected messages from ${smartSelection.originalCount} total`);
  }

  // ========================================
  // PHASE 1 IMPROVEMENT: ADAPTIVE HIERARCHICAL CONTEXT
  // ========================================

  // Extract current topic (most important context)
  const currentTopic = summary.topics || 'general conversation';

  // Get last message details for reply marker
  const lastMessage = dualAnalysis?.replyMode?.respondingTo ||
                     (Array.isArray(context) && context.length > 0 ? context[context.length - 1] : null);
  const lastSpeaker = dualAnalysis?.replyMode?.speaker || summary.lastSpeaker || 'Friend';

  // Handle NEW CONVERSATION mode
  if (responseMode === 'new' && dualAnalysis?.newConversation) {
    const newConv = dualAnalysis.newConversation;

    prompt += '=== 💬 START NEW CONVERSATION ===\n\n';
    prompt += `Last interaction: ${newConv.lastInteraction}\n`;
    prompt += `Conversation state: ${newConv.conversationState}\n`;

    if (newConv.suggestedTopics && newConv.suggestedTopics.length > 0) {
      prompt += `💡 Suggested topics: ${newConv.suggestedTopics.join(', ')}\n`;
    }

    prompt += '\n🎯 YOUR TASK:\n';
    prompt += '- Generate a NEW conversation starter\n';
    prompt += '- DO NOT reply to the last message\n';
    prompt += '- Start fresh with a casual greeting or new topic\n';
    prompt += `- Use ${tone.name} tone\n\n`;

    // Add minimal context for new conversation
    if (Array.isArray(context) && context.length > 0) {
      prompt += '=== RECENT CONTEXT (for reference only) ===\n';
      const recentContext = context.slice(-5); // Last 5 messages only
      recentContext.forEach((msg) => {
        prompt += `${msg}\n`;
      });
      prompt += '\n';
    }

    prompt += 'Generate 3 different conversation starters. Each on a new line, numbered 1., 2., and 3.\n\n';
    prompt += 'Starters:\n';

    return prompt;
  }

  // ========================================
  // REPLY MODE: ADAPTIVE CONTEXT STRATEGY
  // ========================================

  // Determine conversation length and use adaptive strategy
  const totalMessages = Array.isArray(context) ? context.length : 0;
  const isShortConversation = totalMessages <= 10;
  const isMediumConversation = totalMessages > 10 && totalMessages <= 25;
  const isLongConversation = totalMessages > 25;

  // ========================================
  // CRITICAL: USER IDENTITY (WHO IS WHO)
  // ========================================

  // Extract user name from summary (ConversationAnalyzer now includes userName)
  const userName = summary.userName || 'You';

  // Determine who the user is replying to (the OTHER person)
  const friendName = summary.lastFriendSpeaker ||
                     summary.lastSpeaker ||
                     'Friend';

  // Only show identity section if we have a real user name (not "You")
  if (userName && userName !== 'You') {
    prompt += `=== 👤 IMPORTANT: WHO IS WHO ===\n`;
    prompt += `YOU are: ${userName}\n`;
    prompt += `You are replying to: ${friendName}\n`;
    prompt += `DO NOT address yourself (${userName}) in the reply!\n`;
    prompt += `DO NOT use "${userName}" in the reply - that's YOU!\n`;
    prompt += `Address the OTHER person (${friendName}) instead.\n\n`;
  }

  // Add CURRENT TOPIC at the very top (critical for context)
  prompt += `=== 📌 CURRENT TOPIC: ${currentTopic} ===\n\n`;

  // PHASE 2: Show topic changes if detected
  if (topicChanges && topicChanges.length > 0) {
    const recentChange = topicChanges[topicChanges.length - 1];
    prompt += `💡 Topic shift detected: "${recentChange.beforeTopic}" → "${recentChange.afterTopic}"\n`;
    prompt += `   (Current focus is on: ${currentTopic})\n\n`;
  }

  // Add critical alerts FIRST (unanswered questions, urgency)
  if (analysis?.hasUnansweredQuestion?.hasQuestion) {
    prompt += `⚠️ UNANSWERED QUESTION: "${analysis.hasUnansweredQuestion.question}" (asked by ${analysis.hasUnansweredQuestion.askedBy})\n`;
    prompt += '→ Make sure to address this in your reply!\n\n';
  }

  if (analysis?.urgency?.level === 'high') {
    prompt += `⚠️ URGENCY: This conversation seems urgent. Respond accordingly.\n\n`;
  }

  // Add emotional context if significant
  if (analysis?.emotionalState && analysis.emotionalState.state !== 'neutral') {
    const emotion = analysis.emotionalState.state;
    const intensity = analysis.emotionalState.intensity;
    prompt += `💭 Emotional tone: ${emotion} (${intensity} intensity)\n\n`;
  }

  // PHASE 2: Show context quality warning if poor
  if (contextQuality && contextQuality.quality === 'poor') {
    prompt += `⚠️ Context quality: ${contextQuality.quality}\n`;
    prompt += `   Issues: ${contextQuality.issues.join(', ')}\n\n`;
  }

  // ========================================
  // ADAPTIVE CONTEXT DISPLAY
  // ========================================

  if (Array.isArray(context) && context.length > 0) {
    if (isShortConversation) {
      // SHORT: Show all messages with clear reply marker
      prompt += '=== 💬 CONVERSATION ===\n';
      context.forEach((msg, index) => {
        const isLast = index === context.length - 1;
        if (isLast) {
          prompt += `>>> ${msg} ← REPLY TO THIS\n`;
        } else {
          prompt += `    ${msg}\n`;
        }
      });
      prompt += '\n';

    } else if (isMediumConversation) {
      // MEDIUM: Show recent messages + immediate context
      const recentStart = Math.max(0, totalMessages - 15);
      const immediateStart = Math.max(0, totalMessages - 5);

      const recentMessages = context.slice(recentStart, immediateStart);
      const immediateMessages = context.slice(immediateStart);

      if (recentMessages.length > 0) {
        prompt += '=== 💬 RECENT CONVERSATION ===\n';
        recentMessages.forEach((msg) => {
          prompt += `${msg}\n`;
        });
        prompt += '\n';
      }

      prompt += '=== 🎯 IMMEDIATE CONTEXT ===\n';
      immediateMessages.forEach((msg, index) => {
        const isLast = index === immediateMessages.length - 1;
        if (isLast) {
          prompt += `>>> ${msg} ← REPLY TO THIS\n`;
        } else {
          prompt += `    ${msg}\n`;
        }
      });
      prompt += '\n';

    } else {
      // LONG: Show summary + recent + immediate
      const backgroundEnd = totalMessages - 20;
      const recentStart = totalMessages - 20;
      const immediateStart = totalMessages - 5;

      // Background summary
      if (backgroundEnd > 0) {
        const backgroundMessages = context.slice(0, backgroundEnd);
        prompt += '=== 📚 CONVERSATION BACKGROUND ===\n';
        prompt += `Earlier conversation (${backgroundMessages.length} messages): `;
        prompt += `Started discussing ${currentTopic}. `;
        if (summary.conversationType) {
          prompt += `Conversation style: ${summary.conversationType}. `;
        }
        prompt += '\n\n';
      }

      // Recent messages
      const recentMessages = context.slice(recentStart, immediateStart);
      if (recentMessages.length > 0) {
        prompt += '=== 💬 RECENT CONVERSATION ===\n';
        recentMessages.forEach((msg) => {
          prompt += `${msg}\n`;
        });
        prompt += '\n';
      }

      // Immediate context
      const immediateMessages = context.slice(immediateStart);
      prompt += '=== 🎯 IMMEDIATE CONTEXT ===\n';
      immediateMessages.forEach((msg, index) => {
        const isLast = index === immediateMessages.length - 1;
        if (isLast) {
          prompt += `>>> ${msg} ← REPLY TO THIS\n`;
        } else {
          prompt += `    ${msg}\n`;
        }
      });
      prompt += '\n';
    }
  }

  // ========================================
  // YOUR TASK SECTION (Clear Instructions)
  // ========================================

  prompt += '=== 🎯 YOUR TASK ===\n';
  prompt += `${tone.prompt}\n\n`;

  // Add specific instructions
  prompt += '📋 Instructions:\n';
  prompt += `- Reply directly to the message marked with ">>>" above\n`;
  prompt += `- Stay on topic: ${currentTopic}\n`;
  prompt += `- Use ${tone.name} tone\n`;

  // Length guidance (keep it simple)
  const recommended = metrics?.recommendedReplyLength;
  if (recommended) {
    prompt += `- Keep it brief: ~${recommended.words} words (${recommended.sentences} sentence${recommended.sentences === 1 ? '' : 's'})\n`;
  } else {
    prompt += `- Keep it concise: 1-2 sentences max\n`;
  }

  // Language hints (only if multiple languages detected)
  if (metrics?.languageHints?.length > 1) {
    prompt += `- Language mix: ${metrics.languageHints.join(', ')}\n`;
  }

  // Emoji guidance (only if relevant)
  const emojiUsage = analysis?.emojiUsage;
  if (emojiUsage?.usageLevel === 'none') {
    prompt += '- No emojis (conversation style is text-only)\n';
  } else if (emojiUsage?.usageLevel === 'heavy') {
    const examples = emojiUsage.topEmojis?.slice(0, 3).join(' ') || '';
    prompt += `- Use emojis naturally${examples ? ` (like: ${examples})` : ''}\n`;
  }

  prompt += '\n';
  prompt += 'Generate 3 different reply options. Each reply should be on a new line, numbered 1., 2., and 3.\n\n';
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

