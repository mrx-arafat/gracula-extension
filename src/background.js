// Gracula Background Script - API Handler

// ========================================
// SERVICE WORKER KEEP-ALIVE MECHANISM
// ========================================
// Chrome terminates service workers after 5 minutes of inactivity
// This mechanism keeps the service worker alive by sending periodic messages

let keepAliveInterval = null;

function startKeepAlive() {
  if (keepAliveInterval) return; // Already running

  console.log('🔄 [KEEP-ALIVE] Starting service worker keep-alive mechanism...');

  // Send a keep-alive message every 4 minutes (240 seconds)
  // This is less than Chrome's 5-minute timeout
  keepAliveInterval = setInterval(() => {
    console.log('💓 [KEEP-ALIVE] Sending keep-alive ping to all tabs...');

    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'keepAlive'
        }).catch(() => {
          // Ignore errors for tabs without content script
        });
      });
    });
  }, 240000); // 4 minutes
}

function stopKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    console.log('⏹️ [KEEP-ALIVE] Stopped service worker keep-alive mechanism');
  }
}

// Start keep-alive when extension loads
startKeepAlive();

// Hot Reload Support - Notify content scripts when extension updates
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'update' || details.reason === 'install') {
    console.log('🔥 Hot Reload: Extension updated, notifying all tabs...');

    // Broadcast to all tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'hotReload'
        }).catch(() => {
          // Ignore errors for tabs without content script
        });
      });
    });
  }
});

// Default API configuration
let apiConfig = {
  provider: 'openai', // 'openai', 'huggingface', 'openrouter', or 'google'
  apiKey: '', // Users can add their own key in settings
  model: 'gpt-3.5-turbo', // OpenAI model
  openaiEndpoint: 'https://api.openai.com/v1/chat/completions',
  huggingfaceEndpoint: 'https://api-inference.huggingface.co/models/',
  huggingfaceModel: 'mistralai/Mistral-7B-Instruct-v0.2',
  openrouterEndpoint: 'https://openrouter.ai/api/v1/chat/completions',
  openrouterModel: 'google/gemini-2.0-flash-exp:free',
  googleEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/',
  googleModel: 'gemini-2.0-flash-exp',
  // Voice transcription configuration
  voiceProvider: 'webspeech', // 'webspeech', 'elevenlabs', 'openai', 'google', 'deepgram'
  voiceLanguage: 'en', // Language code for voice recognition
  elevenlabsApiKey: 'sk_17f927bfb2297bf127c442949b9b16ab964c7b916c6cd56a',
  elevenlabsEndpoint: 'https://api.elevenlabs.io/v1/speech-to-text',
  googleApiKey: '', // Google Cloud Speech-to-Text API key
  deepgramApiKey: '', // Deepgram API key
  // AI toggle for autosuggestions (disabled by default)
  useAIForAutosuggestions: false,
  // Voice input toggle (enabled by default for quick access)
  voiceInputEnabled: true,
  // Voice input keyboard shortcut
  voiceShortcut: 'Ctrl+Shift+V'
};

// Load saved API config
chrome.storage.sync.get(['apiConfig'], (result) => {
  if (result && result.apiConfig) {
    apiConfig = { ...apiConfig, ...result.apiConfig };
  }
  console.log('🧛 Gracula: API Config loaded:', { provider: apiConfig.provider, model: apiConfig.model });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle keep-alive pings from content script
  if (request.action === 'keepAlive') {
    console.log('💓 [KEEP-ALIVE] Received keep-alive ping from tab:', sender.tab?.id);
    sendResponse({ success: true, timestamp: Date.now() });
    return true;
  }

  if (request.action === 'generateReplies') {
    console.log('🎯 [MESSAGE] Received generateReplies request from tab:', sender.tab?.id);
    handleGenerateReplies(request.tone, request.context, request.enhancedContext, request.responseMode)
      .then(replies => {
        console.log('✅ [MESSAGE] Sending generateReplies response');
        sendResponse({ success: true, replies });
      })
      .catch(error => {
        console.error('❌ [MESSAGE] generateReplies error:', error.message);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep channel open for async response
  }

  // NEW: Handle autocomplete suggestions
  if (request.action === 'generateAutocompletions') {
    console.log('🎯 [MESSAGE] Received generateAutocompletions request from tab:', sender.tab?.id);
    handleGenerateAutocompletions(request.partialText, request.analysis, request.context, request.enhancedContext)
      .then(suggestions => {
        console.log('✅ [MESSAGE] Sending generateAutocompletions response');
        sendResponse({ success: true, suggestions });
      })
      .catch(error => {
        console.error('❌ [MESSAGE] generateAutocompletions error:', error.message);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep channel open for async response
  }

  // NEW: Handle audio transcription
  if (request.action === 'transcribeAudio') {
    console.log('🎯 [MESSAGE] Received transcribeAudio request from tab:', sender.tab?.id);
    handleTranscribeAudio(request.provider, request.audioData, request.mimeType, request.language)
      .then(transcript => {
        console.log('✅ [MESSAGE] Sending transcribeAudio response');
        sendResponse({ success: true, transcript });
      })
      .catch(error => {
        console.error('❌ [MESSAGE] transcribeAudio error:', error.message);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep channel open for async response
  }

  if (request.action === 'updateApiConfig') {
    apiConfig = { ...apiConfig, ...request.config };
    chrome.storage.sync.set({ apiConfig }, () => {
      if (chrome.runtime.lastError) {
        console.error('🧛 Gracula: Error saving API Config:', chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
        return;
      }

      console.log('🧛 Gracula: API Config saved successfully:', {
        provider: apiConfig.provider,
        hasKey: !!apiConfig.apiKey,
        voiceEnabled: apiConfig.voiceInputEnabled,
        aiEnabled: apiConfig.useAIForAutosuggestions
      });

      // Broadcast config update to all tabs
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, {
            action: 'configUpdated',
            config: apiConfig
          }).catch(() => {
            // Ignore errors for tabs that don't have content script
          });
        });
      });

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
  console.log('   Tone object:', tone);
  console.log('   Context length:', context?.length);
  console.log('   Enhanced context:', enhancedContext ? 'present' : 'missing');

  // Build the prompt with enhanced context and response mode
  const prompt = buildPrompt(tone, context, enhancedContext, responseMode);
  console.log('   Prompt length:', prompt.length);

  // Call AI API
  const replies = await callAIAPI(prompt, { enhancedContext, metrics: enhancedContext?.metrics, responseMode });

  console.log('   Generated replies:', replies);
  console.log('   Replies count:', replies?.length);

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

  // CRITICAL: Get the FRIEND's last message (not the user's message)
  const lastFriendMessage = summary.lastFriendMessage || '';
  const lastFriendSpeaker = summary.lastFriendSpeaker || '';

  // Get absolute last message (any sender) for reply_last mode
  const absoluteLastMessage = Array.isArray(context) && context.length > 0 ? context[context.length - 1] : '';

  // ========================================
  // MODE HANDLING: 3 RESPONSE MODES
  // ========================================
  console.log('🎯 Response Mode:', responseMode);

  // Handle NEW CONVERSATION mode (Mode 3: Start fresh)
  if (responseMode === 'new_conversation' || (responseMode === 'new' && dualAnalysis?.newConversation)) {
    const newConv = dualAnalysis.newConversation;

    prompt += '=== 💬 START NEW CONVERSATION ===\n\n';
    prompt += `Last interaction: ${newConv.lastInteraction}\n`;
    prompt += `Conversation state: ${newConv.conversationState}\n`;

    if (newConv.suggestedTopics) {
      const topicsArray = Array.isArray(newConv.suggestedTopics) ? newConv.suggestedTopics : [newConv.suggestedTopics];
      if (topicsArray.length > 0) {
        prompt += `💡 Suggested topics: ${topicsArray.join(', ')}\n`;
      }
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
    prompt += `=== 👤 CRITICAL: WHO IS WHO ===\n`;
    prompt += `⚠️⚠️⚠️ YOU ARE: ${userName}\n`;
    prompt += `⚠️⚠️⚠️ You are REPLYING TO: ${friendName}\n`;
    prompt += `\n`;
    prompt += `🚫 NEVER use "${userName}" in your reply - that's YOUR name!\n`;
    prompt += `🚫 NEVER address yourself as "${userName}"\n`;
    prompt += `🚫 NEVER say things like "Hey ${userName}" or mention "${userName}"\n`;
    prompt += `✅ Address the OTHER person (${friendName}) instead\n`;
    prompt += `✅ You are ${userName} writing TO ${friendName}\n\n`;
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
  // CRITICAL: SHOW CORRECT MESSAGES BASED ON MODE
  // ========================================

  // Mode 1: reply_last - Show absolute last message
  if (responseMode === 'reply_last') {
    prompt += '=== 🎯🎯🎯 CRITICAL: REPLY TO THIS LAST MESSAGE ===\n';
    prompt += `>>> ${absoluteLastMessage} <<<\n\n`;
    prompt += `⚠️⚠️⚠️ YOUR REPLY MUST RESPOND TO THIS LAST MESSAGE!\n`;
    prompt += `⚠️  This is the most recent message in the conversation.\n`;
    prompt += `⚠️  Reply directly to what was said above.\n\n`;
  }
  // Mode 2: reply_friend (default) - Show friend's messages only
  else if (responseMode === 'reply_friend' || !responseMode) {
    // Friend-focused, date-aware selection (Today → recent)
    const rawMessages = Array.isArray(enhancedContext?.messages) ? enhancedContext.messages : null;
    const friendFocus = [];

    if (rawMessages && rawMessages.length > 0) {
      const now = new Date();
      const todayStr = now.toDateString();
      const todayFriends = [];
      const otherFriends = [];

      // Walk from newest → oldest to find friend's messages
      for (let i = rawMessages.length - 1; i >= 0; i--) {
        const msg = rawMessages[i];
        if (!msg) continue;

        const isFromUser = msg.isOutgoing === true ||
          (typeof msg.speaker === 'string' && msg.speaker.toLowerCase() === 'you') ||
          (userName && typeof msg.speaker === 'string' && msg.speaker === userName);
        if (isFromUser) continue;

        let ts = null;
        if (msg.timestamp) {
          const parsed = new Date(msg.timestamp);
          if (!isNaN(parsed)) {
            ts = parsed;
          }
        }

        const isToday = ts ? ts.toDateString() === todayStr : false;
        const normalized = {
          speaker: msg.speaker || friendName || 'Friend',
          text: msg.text || '',
          timestamp: ts,
          dateLabel: ts ? (isToday ? 'Today' : ts.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })) : 'Earlier',
          timeLabel: ts ? ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
        };

        if (isToday) {
          todayFriends.push(normalized);
        } else {
          otherFriends.push(normalized);
        }

        // We don't need to scan the whole history - 6 today + 3 older is enough
        if (todayFriends.length >= 6 && otherFriends.length >= 3) {
          break;
        }
      }

      // Decide how many to show
      let selectedNewestFirst = [];
      if (todayFriends.length >= 4) {
        // Busy day → keep it tight (last 2–3 messages only)
        selectedNewestFirst = todayFriends.slice(0, 3);
      } else {
        // Not too busy → take up to 6 total (today first, then recent)
        selectedNewestFirst = todayFriends.concat(otherFriends).slice(0, 6);
      }

      // Output in chronological order (oldest → newest)
      const selectedChrono = selectedNewestFirst.slice().reverse();
      selectedChrono.forEach((m) => friendFocus.push(m));
    } else {
      // Fallback to old string-based extraction if enhanced messages are missing
      if (Array.isArray(context) && context.length > 0) {
        for (let i = context.length - 1; i >= 0 && friendFocus.length < 3; i--) {
          const msg = context[i];
          if (!msg.includes(`${userName}:`) && !msg.startsWith('You:')) {
            friendFocus.unshift({
              speaker: friendName || 'Friend',
              text: msg,
              dateLabel: 'Earlier',
              timeLabel: ''
            });
          }
        }
      }
    }

    // Show friend's messages prominently (today-first)
    if (friendFocus.length > 0) {
      prompt += '=== 🎯🎯🎯 CRITICAL: REPLY TO YOUR FRIEND (TODAY-FIRST) ===\n';
      friendFocus.forEach((m, idx) => {
        const datePart = m.dateLabel ? m.dateLabel : 'Earlier';
        const timePart = m.timeLabel ? ` ${m.timeLabel}` : '';
        const speaker = m.speaker || friendName || 'Friend';
        const text = m.text || '';
        prompt += `${idx + 1}. [${datePart}${timePart}] >>> ${speaker}: "${text}" <<<\n`;
      });
      prompt += '\n';
      prompt += '🧠 Reply to the LAST friend message above, but keep the previous friend messages from today in mind.\n';
      prompt += `⚠️  IGNORE any messages from "${userName}" or "You".\n`;
      prompt += '⚠️  If the friend sent multiple short messages in a row, treat them as ONE turn.\n\n';
    } else if (lastFriendMessage && lastFriendSpeaker) {
      // Fallback to single friend message if extraction failed
      prompt += '=== 🎯🎯🎯 CRITICAL: REPLY TO THIS MESSAGE ===\n';
      prompt += `>>> ${lastFriendSpeaker}: "${lastFriendMessage}" <<<\n\n`;
      prompt += `⚠️⚠️⚠️ YOUR REPLY MUST RESPOND TO THIS MESSAGE!\n`;
      prompt += `⚠️  This is what your FRIEND just said - reply to THEM, not to yourself!\n`;
      prompt += `⚠️  Focus ONLY on what ${lastFriendSpeaker} said in this message.\n`;
      prompt += `⚠️  DO NOT refer to your own previous messages.\n\n`;
    }
  }
  // Mode 3: new_conversation - Don't show specific messages to reply to
  // (already handled above in the new_conversation block)

  // ========================================
  // ADAPTIVE CONTEXT DISPLAY (For Reference)
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
  prompt += '📋 CRITICAL INSTRUCTIONS:\n';

  // Add identity reminder if we have a real user name
  if (userName && userName !== 'You') {
    prompt += `0. 🚫 NEVER use "${userName}" in your reply - that's YOUR name, not who you're talking to!\n`;
  }

  if (lastFriendMessage && lastFriendSpeaker) {
    prompt += `1. ⚠️⚠️⚠️ Reply to ${lastFriendSpeaker}'s MOST RECENT message (the last one shown in the friend block above)\n`;
    prompt += '2. Use the earlier friend messages from TODAY (shown above) to keep continuity and to understand what she is talking about\n';
    prompt += '3. 🚫 Do NOT add extra small-talk, jokes, or reunion lines like "where were you hiding?" or "long time no see" UNLESS the friend actually said that\n';
    prompt += '4. 🚫 Do NOT invent background or reasons for the 1-month mention; treat it as part of the request\n';
    prompt += '5. If the friend is asking for help ("I need some help", "for 1 month"), your reply MUST stay on that request and ask clarifying/follow-up if needed\n';
    prompt += `6. Stay on topic: ${currentTopic}\n`;
    prompt += `7. Use ${tone.name} tone\n`;
  } else {
    prompt += `1. Reply directly to the message marked with ">>>" above\n`;
    prompt += `2. Stay on topic: ${currentTopic}\n`;
    prompt += `3. Use ${tone.name} tone\n`;
  }

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
    console.log('🧛 Gracula: callAIAPI called with provider:', apiConfig.provider);

    if (apiConfig.provider === 'openai') {
      console.log('🧛 Gracula: Using OpenAI API');
      const replies = await callOpenAIAPI(prompt, options);
      console.log('🧛 Gracula: OpenAI returned:', replies);
      return replies;
    } else if (apiConfig.provider === 'openrouter') {
      console.log('🧛 Gracula: Using OpenRouter API');
      const replies = await callOpenRouterAPI(prompt, options);
      console.log('🧛 Gracula: OpenRouter returned:', replies);
      return replies;
    } else if (apiConfig.provider === 'google') {
      console.log('🧛 Gracula: Using Google AI Studio API');
      const replies = await callGoogleAIAPI(prompt, options);
      console.log('🧛 Gracula: Google returned:', replies);
      return replies;
    } else {
      console.log('🧛 Gracula: Using Hugging Face API');
      const replies = await callHuggingFaceAPI(prompt, options);
      console.log('🧛 Gracula: Hugging Face returned:', replies);
      return replies;
    }
  } catch (error) {
    console.error(`🧛 Gracula: ${apiConfig.provider} API error:`, error);

    // Fallback to mock responses for demo
    console.log('🧛 Gracula: Using fallback mock responses');
    const mockReplies = generateMockReplies(prompt, options);
    console.log('🧛 Gracula: Mock replies generated:', mockReplies);
    return mockReplies;
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
          content: `You are a message reply generator. Your ONLY job is to generate actual message replies that a person would send.

CRITICAL RULES:
- Generate ONLY the actual message text that would be sent
- DO NOT explain what you're doing
- DO NOT say "Here are 3 different ways..." or similar meta-commentary
- DO NOT include instructions or explanations
- Just write the actual replies as if YOU are the person sending them

Format: Provide exactly 3 reply options, numbered 1., 2., and 3.`
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
  const replies = parseReplies(generatedText, options);

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
  const replies = parseReplies(generatedText, options);

  return replies;
}

async function callOpenRouterAPI(prompt, options = {}) {
  if (!apiConfig.apiKey) {
    throw new Error('OpenRouter API key is required. Please add it in the extension settings.');
  }

  const url = apiConfig.openrouterEndpoint;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiConfig.apiKey}`,
    'HTTP-Referer': 'https://github.com/mrx-arafat/gracula-extension',
    'X-Title': 'Gracula Extension'
  };

  const metrics = options.metrics || options.enhancedContext?.metrics || null;
  const analysis = options.enhancedContext?.analysis || {};
  const recommended = metrics?.recommendedReplyLength;

  const deriveTokens = (wordsEstimate) => {
    const safeWords = Math.max(6, Math.round(wordsEstimate || 0));
    const perReplyTokens = Math.max(18, Math.round(safeWords * 1.5));
    return Math.min(180, Math.max(90, perReplyTokens * 3 + 20));
  };

  let maxTokens = 180;

  if (recommended) {
    const estimatedWords = recommended.words || Math.round((recommended.chars || 80) / 5);
    maxTokens = deriveTokens(estimatedWords);
  } else if (metrics?.averageWords) {
    maxTokens = deriveTokens(metrics.averageWords);
  } else if (analysis?.messageLength?.averageWords) {
    maxTokens = deriveTokens(analysis.messageLength.averageWords);
  }

  console.log('🧛 Gracula: OpenRouter max_tokens set to', maxTokens);

  const isFriendReply = !options.responseMode || options.responseMode === 'reply_friend' || options.responseMode === 'reply';
  const temperature = isFriendReply ? 0.35 : 0.7;
  const topP = isFriendReply ? 0.85 : 0.9;

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: apiConfig.openrouterModel,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
      presence_penalty: isFriendReply ? 0.0 : 0.3,
      frequency_penalty: isFriendReply ? 0.0 : 0.3
    })
  });

  if (!response.ok) {
    const errorText = await response.text();

    // Parse error for better user feedback
    try {
      const errorData = JSON.parse(errorText);
      const errorMessage = errorData.error?.message || errorText;

      // Handle rate limit errors specifically
      if (response.status === 429) {
        if (errorMessage.includes('free-models-per-day')) {
          throw new Error('OpenRouter daily free limit reached (50 requests/day). Add credits at openrouter.ai or try again tomorrow.');
        } else if (errorMessage.includes('free-models-per-min')) {
          throw new Error('OpenRouter rate limit: Too many requests per minute (max 16/min). Please wait a moment and try again.');
        } else {
          throw new Error(`OpenRouter rate limit exceeded. ${errorMessage}`);
        }
      }

      throw new Error(`OpenRouter API Error (${response.status}): ${errorMessage}`);
    } catch (parseError) {
      // If JSON parsing fails, throw original error
      if (parseError.message.includes('OpenRouter')) {
        throw parseError;
      }
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
  }

  const data = await response.json();

  // Parse OpenRouter response (same format as OpenAI)
  const generatedText = data.choices?.[0]?.message?.content || '';

  if (!generatedText) {
    throw new Error('No response from OpenRouter API');
  }

  // Extract individual replies
  const replies = parseReplies(generatedText, options);

  return replies;
}

async function callGoogleAIAPI(prompt, options = {}) {
  if (!apiConfig.apiKey) {
    throw new Error('Google AI Studio API key is required. Please add it in the extension settings.');
  }

  const model = apiConfig.googleModel || 'gemini-2.0-flash-exp';
  const url = `${apiConfig.googleEndpoint}${model}:generateContent?key=${apiConfig.apiKey}`;

  const headers = {
    'Content-Type': 'application/json'
  };

  const metrics = options.metrics || options.enhancedContext?.metrics || null;
  const analysis = options.enhancedContext?.analysis || {};
  const recommended = metrics?.recommendedReplyLength;

  const deriveTokens = (wordsEstimate) => {
    const safeWords = Math.max(6, Math.round(wordsEstimate || 0));
    const perReplyTokens = Math.max(18, Math.round(safeWords * 1.5));
    return Math.min(2048, Math.max(256, perReplyTokens * 3 + 50));
  };

  let maxOutputTokens = 512;

  if (recommended) {
    const estimatedWords = recommended.words || Math.round((recommended.chars || 80) / 5);
    maxOutputTokens = deriveTokens(estimatedWords);
  } else if (metrics?.averageWords) {
    maxOutputTokens = deriveTokens(metrics.averageWords);
  } else if (analysis?.messageLength?.averageWords) {
    maxOutputTokens = deriveTokens(analysis.messageLength.averageWords);
  }

  console.log('🧛 Gracula: Google AI maxOutputTokens set to', maxOutputTokens);

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are a message reply generator. Your ONLY job is to generate actual message replies that a person would send.

CRITICAL RULES:
- Generate ONLY the actual message text that would be sent
- DO NOT explain what you're doing
- DO NOT say "Here are 3 different ways..." or similar meta-commentary
- DO NOT include instructions or explanations
- Just write the actual replies as if YOU are the person sending them

Format: Provide exactly 3 reply options, numbered 1., 2., and 3.

${prompt}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: maxOutputTokens
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();

    try {
      const errorData = JSON.parse(errorText);
      const errorMessage = errorData.error?.message || errorText;

      if (response.status === 429) {
        throw new Error('Google AI API rate limit exceeded. Please wait a moment and try again.');
      } else if (response.status === 400) {
        throw new Error(`Google AI API Error: ${errorMessage}`);
      }

      throw new Error(`Google AI API Error (${response.status}): ${errorMessage}`);
    } catch (parseError) {
      if (parseError.message.includes('Google AI')) {
        throw parseError;
      }
      throw new Error(`Google AI API Error: ${response.status} - ${errorText}`);
    }
  }

  const data = await response.json();

  // Parse Google AI response
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  if (!generatedText) {
    throw new Error('No response from Google AI API');
  }

  console.log('🧛 Gracula: Google AI response:', generatedText);

  // Extract individual replies
  const replies = parseReplies(generatedText, options);

  return replies;
}

function parseReplies(text, options = {}) {
  // Determine how many replies to extract (default 3 for normal, 6 for autocomplete)
  const maxReplies = options.isAutocomplete ? 6 : 3;

  // Try to extract numbered replies
  const lines = text.split('\n').filter(line => line.trim());
  const replies = [];

  for (const line of lines) {
    // Match patterns like "1.", "1)", "Reply 1:", etc. at START
    const match = line.match(/^(?:\d+[\.\):]?\s*|Reply\s*\d+:\s*)(.*)/i);
    let cleanedText = match && match[1] ? match[1].trim() : line.trim();

    // Remove list numbering at END (like "text 3", "text 5.") but keep meaningful numbers (like "10 years")
    // Only remove single digit 1-9 at very end with optional punctuation
    cleanedText = cleanedText.replace(/\s+[1-9][\.\)]?$/, '');

    // Skip headers and empty lines
    if (!cleanedText || cleanedText.match(/^(Replies?|Options?|Suggestions?|Completions?):/i)) {
      continue;
    }

    replies.push(cleanedText);

    if (replies.length >= maxReplies) break;
  }

  // If we didn't get enough replies, split by sentences
  if (replies.length < maxReplies) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences.slice(0, maxReplies).map(s => {
      let cleaned = s.trim();
      // Remove list numbering (single digit 1-9) but keep meaningful numbers
      cleaned = cleaned.replace(/\s+[1-9][\.\)]?$/, '');
      return cleaned + '.';
    });
  }

  return replies.slice(0, maxReplies);
}

function generateMockReplies(prompt, options = {}) {
  // Fallback mock replies for demo purposes
  // In production, this would only be used if API fails

  console.log('🧛 Gracula: Generating context-aware mock replies');
  console.log('   Prompt:', prompt.substring(0, 100) + '...');
  console.log('   Options:', options);

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

  // Ensure topics is always an array
  let topics = summary.topics || [];
  if (typeof topics === 'string') {
    topics = [topics];
  }

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
  console.log('🧛 Gracula: Topics:', Array.isArray(topics) ? topics.join(', ') : topics);

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

  console.log('🧛 Gracula: Generated mock replies:', replies);
  console.log('   Replies count:', replies?.length);
  console.log('   Replies type:', Array.isArray(replies) ? 'array' : typeof replies);

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
    if (!msg) return {
      isQuestion: false,
      isNegative: false,
      isRequest: false,
      isMoney: false,
      isConfirmation: false,
      topic: null
    };
    const msgLower = msg.toLowerCase();
    return {
      isQuestion: /\?|ki|keno|kobe|kothay|how|what|when|where/.test(msgLower),
      isNegative: /nai|na|not|no|can't|couldn't|won't/.test(msgLower),
      isPositive: /yes|hoo|thik|okay|good|great|nice|received|got it/.test(msgLower),
      hasUrgency: /asap|jaldi|taratari|now|urgent/.test(msgLower),
      isRequest: /check|kor|dekh|pathao|send|bhej|please/.test(msgLower),
      isMoney: /taka|money|pathaise|sent|paisa|tk|bdt|dollar|payment/.test(msgLower),
      isConfirmation: /received|got it|done|okay|ok|thik|ache/.test(msgLower),
      isGreeting: /hi|hello|hey|salam|assalam|kemon|how are you/.test(msgLower)
    };
  };

  // CRITICAL: Always analyze the FRIEND's message, not the user's message
  // The user wants to reply to what their FRIEND said
  const contextMessage = lastFriendMessage || lastAnyMessage;
  const lastMessageAnalysis = analyzeMessage(contextMessage);

  // Extract topic keywords for reference
  const topicKeywords = topics.slice(0, 2); // Use first 2 topics
  const hasTopic = topicKeywords.length > 0;
  const primaryTopic = topicKeywords[0] || '';

  // Log context for debugging
  console.log('🧛 Gracula: Mock response generation');
  console.log('🧛 Gracula: Friend said:', lastFriendMessage);
  console.log('🧛 Gracula: Friend speaker:', lastFriendSpeaker);
  console.log('🧛 Gracula: Analyzing friend\'s message:', contextMessage);
  console.log('🧛 Gracula: Message analysis:', lastMessageAnalysis);

  // Generate replies based on tone
  let replies = [];

  console.log('🧛 Gracula: Generating replies for tone:', tone);

  switch (tone) {
    case 'default':
      // Handle money-related messages
      if (lastMessageAnalysis.isMoney && lastMessageAnalysis.isRequest) {
        replies = [
          applyStyle("Checking now, give me a sec"),
          applyStyle("Let me check the payment"),
          applyStyle("Okay, lemme verify")
        ];
      } else if (lastMessageAnalysis.isMoney) {
        replies = [
          applyStyle("Thanks! Checking now"),
          applyStyle("Got it, let me confirm"),
          applyStyle("Received, thanks bro")
        ];
      } else if (lastMessageAnalysis.isRequest) {
        replies = [
          applyStyle("Sure, checking now"),
          applyStyle("Okay, let me see"),
          applyStyle("On it, give me a moment")
        ];
      } else if (lastMessageAnalysis.isQuestion && hasTopic) {
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
      } else if (lastMessageAnalysis.isGreeting) {
        replies = [
          applyStyle("Hey! What's up?"),
          applyStyle("Hi! Kemon acho?"),
          applyStyle("Hello! How's it going?")
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

  console.log('🧛 Gracula: Final replies for tone', tone, ':', replies);
  return replies;
}

// ========================================
// AUTOCOMPLETE HANDLER
// ========================================

async function handleGenerateAutocompletions(partialText, analysis, context, enhancedContext) {
  console.log('🧛 Gracula Background: Generating autocompletions for:', partialText);

  // Build autocomplete prompt
  const prompt = buildAutocompletePrompt(partialText, analysis, context, enhancedContext);

  // Call AI API
  const suggestions = await callAIAPI(prompt, {
    enhancedContext,
    isAutocomplete: true,
    partialText
  });

  return suggestions;
}

function buildAutocompletePrompt(partialText, analysis, context, enhancedContext) {
  let prompt = '';

  const summary = enhancedContext?.summary || {};
  const userName = summary.userName || 'You';
  const friendName = summary.lastFriendSpeaker || summary.lastSpeaker || 'Friend';

  // NEW: Extract and emphasize LAST MESSAGE
  const lastMessage = Array.isArray(context) && context.length > 0
    ? context[context.length - 1]
    : null;

  // Context header
  prompt += '=== ⚡ SUPERFAST AUTOCOMPLETE ===\n\n';
  prompt += `The user is typing: "${partialText}"\n`;
  prompt += `You MUST complete this to REPLY TO THE LAST MESSAGE ONLY.\n\n`;

  // ========================================
  // CRITICAL: FOCUS ON LAST MESSAGE OR REPLY-TO MESSAGE
  // ========================================
  const lastMsgAnalysis = analysis?.lastMessageContext;

  if (lastMsgAnalysis) {
    // Check if this is a reply-to message (user selected a specific message to reply to)
    if (lastMsgAnalysis.isReplyTo) {
      prompt += '=== 🎯🎯🎯 SUPER CRITICAL: USER IS REPLYING TO THIS SPECIFIC MESSAGE ===\n';
      prompt += `>>> ${lastMsgAnalysis.fullMessage} <<<\n`;
      prompt += `⚠️⚠️⚠️ USER EXPLICITLY SELECTED THIS MESSAGE TO REPLY TO!\n`;
      prompt += `⚠️  YOUR COMPLETION MUST DIRECTLY REPLY TO THIS EXACT MESSAGE!\n`;
      prompt += `⚠️  IGNORE all other messages in the conversation.\n`;
      prompt += `⚠️  ONLY address what was said in this specific replied-to message.\n\n`;
    } else if (lastMessage) {
      prompt += '=== 🎯 CRITICAL: LAST MESSAGE (REPLY TO THIS!) ===\n';
      prompt += `>>> ${lastMessage} <<<\n`;
      prompt += `⚠️  YOUR COMPLETION MUST DIRECTLY REPLY TO THIS EXACT MESSAGE!\n`;
      prompt += `⚠️  DO NOT reply to earlier messages in the conversation.\n`;
      prompt += `⚠️  ONLY address what was said in the last message above.\n\n`;
    }

    // Analyze message for better guidance
    prompt += '=== 📊 MESSAGE ANALYSIS ===\n';
    prompt += `Speaker: ${lastMsgAnalysis.speaker}\n`;
    prompt += `Content: "${lastMsgAnalysis.content}"\n`;

    if (lastMsgAnalysis.isQuestion) {
      prompt += `⚠️  TYPE: QUESTION (${lastMsgAnalysis.questionType})\n`;
      prompt += `→ You MUST answer this question!\n`;
    }

    if (lastMsgAnalysis.isRequest) {
      prompt += `⚠️  TYPE: REQUEST (${lastMsgAnalysis.requestType})\n`;
      prompt += `→ You MUST respond to this request!\n`;
    }

    if (lastMsgAnalysis.emotion !== 'neutral') {
      prompt += `💭 EMOTION: ${lastMsgAnalysis.emotion}\n`;
      prompt += `→ Match this emotional tone in your reply\n`;
    }

    if (lastMsgAnalysis.isUrgent) {
      prompt += `⚡ URGENCY: This is urgent!\n`;
    }

    if (lastMsgAnalysis.topics) {
      const topicsArray = Array.isArray(lastMsgAnalysis.topics) ? lastMsgAnalysis.topics : [lastMsgAnalysis.topics];
      if (topicsArray.length > 0) {
        prompt += `📌 TOPICS: ${topicsArray.join(', ')}\n`;
        prompt += `→ Address these topics in your reply\n`;
      }
    }

    prompt += '\n';
  } else if (lastMessage) {
    // Fallback if no analysis available
    prompt += '=== 🎯 CRITICAL: LAST MESSAGE (REPLY TO THIS!) ===\n';
    prompt += `>>> ${lastMessage} <<<\n`;
    prompt += `⚠️  YOUR COMPLETION MUST DIRECTLY REPLY TO THIS EXACT MESSAGE!\n\n`;
  }

  // Add minimal earlier context (for reference only)
  if (Array.isArray(context) && context.length > 1) {
    prompt += '=== 📚 EARLIER CONTEXT (Reference Only) ===\n';
    const earlierContext = context.slice(-4, -1); // 3 messages before last
    earlierContext.forEach((msg) => {
      prompt += `${msg}\n`;
    });
    prompt += '\n⚠️  Do NOT reply to these messages. They are only for context.\n\n';
  }

  // User's typing analysis
  if (analysis) {
    prompt += '=== 💭 USER\'S TYPING INTENT ===\n';
    if (analysis.isGreeting) prompt += '→ User is starting with a greeting\n';
    if (analysis.isQuestion) prompt += '→ User is asking a question\n';
    if (analysis.isAgreement) prompt += '→ User is agreeing/accepting\n';
    if (analysis.isDisagreement) prompt += '→ User is disagreeing/declining\n';
    prompt += '\n';
  }

  // Instructions
  prompt += '=== 🎯 YOUR TASK ===\n';
  prompt += `Complete: "${partialText}..."\n\n`;
  prompt += '📋 RULES:\n';
  prompt += `1. REPLY TO THE LAST MESSAGE (marked with >>>)\n`;
  prompt += `2. Continue from: "${partialText}"\n`;
  prompt += `3. Keep it SHORT: 3-10 words TOTAL\n`;
  prompt += `4. BE DIRECT: Answer what was asked, don't add extra info\n`;
  prompt += `5. 🚫 NO FOLLOW-UP QUESTIONS unless absolutely necessary to clarify\n`;
  prompt += `6. 🚫 NO "let me know", "tell me", "what do you think" - just ANSWER\n`;
  prompt += `7. Match conversation style naturally\n\n`;

  prompt += 'GOOD examples (direct, practical):\n';
  prompt += `  Question: "Can you help with the project?"\n`;
  prompt += `  ✅ "Yes, I can help"\n`;
  prompt += `  ✅ "Sure, when do you need it?"\n`;
  prompt += `  ✅ "Sorry, I'm busy today"\n`;
  prompt += `  ❌ "Yes! What kind of help do you need exactly?" (unnecessary question)\n`;
  prompt += `  ❌ "Sure, let me know what you're thinking" (vague)\n\n`;

  prompt += `  Statement: "The results are outstanding!"\n`;
  prompt += `  ✅ "That's awesome!"\n`;
  prompt += `  ✅ "Great work!"\n`;
  prompt += `  ✅ "Congrats!"\n`;
  prompt += `  ❌ "That's great! What were the results?" (unnecessary question)\n\n`;

  // Language hints
  if (enhancedContext?.metrics?.languageHints?.length > 0) {
    prompt += `Languages: ${enhancedContext.metrics.languageHints.join(', ')}\n\n`;
  }

  prompt += '=== OUTPUT ===\n';
  prompt += 'Generate 6 different, diverse completions.\n';
  prompt += 'Format: Numbered 1-6, each on a new line.\n';
  prompt += `- Start each with: "${partialText}"\n`;
  prompt += `- Keep TOTAL under 10 words\n`;
  prompt += `- Make each suggestion DIFFERENT from the others\n`;
  prompt += `- NO numbers in the actual text (only for list formatting)\n`;
  prompt += `- NO unnecessary questions\n`;
  prompt += `- Be helpful and direct\n\n`;
  prompt += 'Completions:\n';

  return prompt;
}

// ========================================
// VOICE TRANSCRIPTION HANDLER
// ========================================

async function handleTranscribeAudio(provider, audioData, mimeType, language) {
  console.log('🎤 Gracula Background: Transcribing audio with provider:', provider);

  try {
    if (provider === 'elevenlabs') {
      return await transcribeWithElevenLabs(audioData, mimeType, language);
    } else if (provider === 'openai') {
      return await transcribeWithOpenAI(audioData, mimeType, language);
    } else if (provider === 'google') {
      return await transcribeWithGoogle(audioData, mimeType, language);
    } else if (provider === 'deepgram') {
      return await transcribeWithDeepgram(audioData, mimeType, language);
    } else {
      throw new Error(`Unsupported transcription provider: ${provider}`);
    }
  } catch (error) {
    console.error('❌ Gracula Background: Transcription error:', error);
    throw error;
  }
}

async function transcribeWithElevenLabs(audioData, mimeType, language) {
  const apiKey = apiConfig.elevenlabsApiKey;
  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured');
  }

  console.log('🎤 Calling ElevenLabs API...');
  console.log('   MIME type:', mimeType);
  console.log('   Language:', language);

  // Convert base64 to blob
  const audioBlob = base64ToBlob(audioData, mimeType);
  console.log('   Audio blob size:', audioBlob.size, 'bytes');

  // Determine file extension based on MIME type
  let filename = 'recording.webm';
  if (mimeType.includes('mp4')) {
    filename = 'recording.mp4';
  } else if (mimeType.includes('mpeg') || mimeType.includes('mp3')) {
    filename = 'recording.mp3';
  } else if (mimeType.includes('wav')) {
    filename = 'recording.wav';
  }

  // Create form data with enhanced parameters
  const formData = new FormData();
  formData.append('file', audioBlob, filename);
  formData.append('model_id', 'scribe_v1');

  // Add language if specified (supports 99 languages)
  if (language) {
    formData.append('language', language);
  }

  // Enable word-level timestamps for better accuracy
  formData.append('timestamps', 'true');

  // Enable speaker diarization (identifies different speakers)
  formData.append('diarization', 'true');

  console.log('🎤 Transcribing with ElevenLabs Scribe v1...');
  console.log('   Language:', language || 'auto-detect');
  console.log('   Features: timestamps ✓, diarization ✓');
  console.log('   Sending to:', apiConfig.elevenlabsEndpoint);

  // Call ElevenLabs API
  const response = await fetch(apiConfig.elevenlabsEndpoint, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey
      // Don't set Content-Type - let browser set it with boundary for multipart/form-data
    },
    body: formData
  });

  console.log('   Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ ElevenLabs API Error:', errorText);
    throw new Error(`ElevenLabs API Error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();

  // Log detailed response for debugging
  console.log('✅ ElevenLabs transcription complete');
  console.log('   Text:', result.text);
  console.log('   Language:', result.language_code, `(${(result.language_probability * 100).toFixed(1)}% confidence)`);
  if (result.words && result.words.length > 0) {
    console.log('   Words:', result.words.length, 'with timestamps');
    console.log('   Speakers detected:', [...new Set(result.words.map(w => w.speaker_id))].length);
  }

  const transcript = result.text || '';
  return transcript;
}

async function transcribeWithOpenAI(audioData, mimeType, language) {
  const apiKey = apiConfig.apiKey; // OpenAI API key
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log('🎤 Calling OpenAI Whisper API...');

  // Convert base64 to blob
  const audioBlob = base64ToBlob(audioData, mimeType);

  // Create form data
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');
  formData.append('model', 'whisper-1');
  if (language) {
    formData.append('language', language);
  }

  // Call OpenAI Whisper API
  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API Error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  const transcript = result.text || '';

  console.log('✅ OpenAI transcription complete:', transcript);
  return transcript;
}

async function transcribeWithGoogle(audioData, mimeType, language) {
  const apiKey = apiConfig.googleApiKey;
  if (!apiKey) {
    throw new Error('Google API key not configured');
  }

  console.log('🎤 Calling Google Speech-to-Text API...');

  // Convert base64 to blob
  const audioBlob = base64ToBlob(audioData, mimeType);

  // Convert to base64 for Google API
  const base64Audio = await blobToBase64(audioBlob);

  // Prepare request
  const requestBody = {
    config: {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: language || 'en-US',
      enableAutomaticPunctuation: true
    },
    audio: {
      content: base64Audio
    }
  };

  // Call Google Speech-to-Text API
  const response = await fetch(
    `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google API Error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  const transcript = result.results?.[0]?.alternatives?.[0]?.transcript || '';

  console.log('✅ Google transcription complete:', transcript);
  return transcript;
}

async function transcribeWithDeepgram(audioData, mimeType, language) {
  const apiKey = apiConfig.deepgramApiKey;
  if (!apiKey) {
    throw new Error('Deepgram API key not configured');
  }

  console.log('🎤 Calling Deepgram API...');

  // Convert base64 to blob
  const audioBlob = base64ToBlob(audioData, mimeType);

  // Prepare query parameters
  const params = new URLSearchParams({
    model: 'nova-2',
    language: language || 'en',
    punctuate: 'true',
    smart_format: 'true'
  });

  // Call Deepgram API
  const response = await fetch(
    `https://api.deepgram.com/v1/listen?${params.toString()}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': mimeType
      },
      body: audioBlob
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Deepgram API Error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';

  console.log('✅ Deepgram transcription complete:', transcript);
  return transcript;
}

// Helper function to convert base64 to Blob
function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

// Helper function to convert blob to base64
async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

console.log('🧛 Gracula Background Script: Loaded');

