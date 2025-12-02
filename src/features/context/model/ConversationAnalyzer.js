// Conversation Analysis System
// Analyzes conversation patterns and flow

window.Gracula = window.Gracula || {};

window.Gracula.ConversationAnalyzer = class {
  constructor() {
    this.messages = [];
    this.topicAnalyzer = new window.Gracula.TopicAnalyzer();
    this.detectedUserName = null; // NEW: Store detected user name
  }

  /**
   * Set the detected user name
   * @param {string} userName - The user's actual name
   */
  setUserName(userName) {
    this.detectedUserName = userName;
  }

  /**
   * Analyze conversation and extract insights
   */
  analyze(messages) {
    this.messages = messages;

    const messageLength = this.getMessageLengthStats();
    const emojiUsage = this.getEmojiUsage();
    const languageMix = this.detectLanguageMix();
    const pacing = this.getPacing();
    const styleMarkers = this.detectStyleMarkers();

    // Enhanced topic analysis
    const topicAnalysis = this.topicAnalyzer.analyze(messages, 'auto');

    // New semantic understanding
    const intent = this.detectIntent();
    const emotionalState = this.detectEmotionalState();

    return {
      messageCount: messages.length,
      speakers: this.identifySpeakers(),
      lastSpeaker: this.getLastSpeaker(),
      hasUnansweredQuestion: this.hasUnansweredQuestion(),
      conversationFlow: this.analyzeFlow(),
      sentiment: this.analyzeSentiment(),
      topics: this.extractTopics(), // Keep for backward compatibility
      topicAnalysis, // New enhanced topic analysis
      urgency: this.detectUrgency(),
      intent, // New: semantic intent detection
      emotionalState, // New: emotional state detection
      messageLength,
      emojiUsage,
      languageMix,
      pacing,
      styleMarkers
    };
  }

  /**
   * Identify unique speakers in conversation
   */
  identifySpeakers() {
    const speakers = new Set();

    // Generic user labels that should be merged
    const userLabels = new Set(['You', 'you', 'Me', 'me']);

    // Add actual user name to labels if detected
    if (this.detectedUserName) {
      userLabels.add(this.detectedUserName);
    }

    let hasUser = false; // Track if we've seen the user

    this.messages.forEach(msg => {
      if (msg.speaker) {
        // Check if this is a user label
        if (userLabels.has(msg.speaker)) {
          hasUser = true;
        } else {
          // Add other speakers normally
          speakers.add(msg.speaker);
        }
      }
    });

    // Add user once (use actual name if available, otherwise "You")
    if (hasUser) {
      const userLabel = this.detectedUserName || 'You';
      speakers.add(userLabel);
    }

    return Array.from(speakers);
  }

  /**
   * Get the last person who spoke
   */
  getLastSpeaker() {
    if (this.messages.length === 0) return null;
    return this.messages[this.messages.length - 1].speaker;
  }

  /**
   * Check if there's an unanswered question
   */
  hasUnansweredQuestion() {
    // Look for questions in recent messages
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const msg = this.messages[i];

      if (msg.hasQuestion && msg.hasQuestion()) {
        // Check if there's a response after this question
        const hasResponse = this.messages
          .slice(i + 1)
          .some(m => m.speaker !== msg.speaker);

        if (!hasResponse) {
          return {
            hasQuestion: true,
            question: msg.text,
            askedBy: msg.speaker
          };
        }
      }
    }

    return { hasQuestion: false };
  }

  /**
   * Analyze conversation flow
   */
  analyzeFlow() {
    if (this.messages.length < 2) {
      return { type: 'single', description: 'Single message' };
    }

    const speakers = this.identifySpeakers();

    if (speakers.length === 1) {
      return { type: 'monologue', description: 'One person speaking' };
    }

    // Check for back-and-forth
    let alternations = 0;
    for (let i = 1; i < this.messages.length; i++) {
      if (this.messages[i].speaker !== this.messages[i - 1].speaker) {
        alternations++;
      }
    }

    const alternationRate = alternations / (this.messages.length - 1);

    if (alternationRate > 0.7) {
      return { type: 'dialogue', description: 'Active back-and-forth conversation' };
    } else if (alternationRate > 0.3) {
      return { type: 'mixed', description: 'Mixed conversation with some back-and-forth' };
    } else {
      return { type: 'sequential', description: 'Sequential messages from same speakers' };
    }
  }

  /**
   * Analyze sentiment of conversation
   */
  analyzeSentiment() {
    const positiveWords = ['good', 'great', 'awesome', 'love', 'happy', 'thanks', 'thank', 'nice', 'excellent', 'perfect', '😊', '😄', '❤️', '👍'];
    const negativeWords = ['bad', 'hate', 'angry', 'sad', 'terrible', 'awful', 'wrong', 'problem', 'issue', '😠', '😢', '😞', '👎'];
    const questionWords = ['?', 'what', 'when', 'where', 'who', 'why', 'how'];

    let positiveCount = 0;
    let negativeCount = 0;
    let questionCount = 0;

    this.messages.forEach(msg => {
      const text = msg.text.toLowerCase();

      positiveWords.forEach(word => {
        if (text.includes(word)) positiveCount++;
      });

      negativeWords.forEach(word => {
        if (text.includes(word)) negativeCount++;
      });

      questionWords.forEach(word => {
        if (text.includes(word)) questionCount++;
      });
    });

    if (positiveCount > negativeCount * 1.5) {
      return { tone: 'positive', confidence: 'high' };
    } else if (negativeCount > positiveCount * 1.5) {
      return { tone: 'negative', confidence: 'high' };
    } else if (questionCount > this.messages.length * 0.3) {
      return { tone: 'inquisitive', confidence: 'medium' };
    } else {
      return { tone: 'neutral', confidence: 'medium' };
    }
  }

  getMessageLengthStats() {
    if (!Array.isArray(this.messages) || this.messages.length === 0) {
      return {
        averageChars: 0,
        averageWords: 0,
        medianChars: 0,
        medianWords: 0,
        style: 'empty'
      };
    }

    const charLengths = [];
    const wordCounts = [];

    this.messages.forEach(message => {
      const text = (message?.text || '').trim();
      if (!text) {
        return;
      }

      charLengths.push(text.length);
      wordCounts.push(this.countWords(text));
    });

    if (charLengths.length === 0) {
      return {
        averageChars: 0,
        averageWords: 0,
        medianChars: 0,
        medianWords: 0,
        style: 'empty'
      };
    }

    const averageChars = Math.round(charLengths.reduce((sum, value) => sum + value, 0) / charLengths.length);
    const averageWords = Math.round(wordCounts.reduce((sum, value) => sum + value, 0) / wordCounts.length);
    const medianChars = this.getMedian(charLengths);
    const medianWords = this.getMedian(wordCounts);

    return {
      averageChars,
      averageWords,
      medianChars,
      medianWords,
      style: this.getLengthStyle(averageChars)
    };
  }

  getEmojiUsage() {
    if (!Array.isArray(this.messages) || this.messages.length === 0) {
      return { total: 0, usageLevel: 'none', topEmojis: [] };
    }

    const emojiRegex = /[\u203C-\u3299\u1F000-\u1FAFF\u1F300-\u1F9FF\u1F600-\u1F64F\u1F680-\u1F6FF\u2600-\u27BF]/g;
    const frequencies = new Map();
    let total = 0;

    this.messages.forEach(message => {
      const text = message?.text;
      if (typeof text !== 'string') {
        return;
      }

      const matches = text.match(emojiRegex);
      if (!matches) {
        return;
      }

      matches.forEach(symbol => {
        total += 1;
        frequencies.set(symbol, (frequencies.get(symbol) || 0) + 1);
      });
    });

    const topEmojis = Array.from(frequencies.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([symbol, count]) => `${symbol} x${count}`);

    const density = this.messages.length ? total / this.messages.length : 0;
    let usageLevel = 'none';

    if (density >= 1) {
      usageLevel = 'heavy';
    } else if (density >= 0.3) {
      usageLevel = 'moderate';
    } else if (total > 0) {
      usageLevel = 'light';
    }

    return { total, usageLevel, topEmojis };
  }

  detectLanguageMix() {
    if (!Array.isArray(this.messages) || this.messages.length === 0) {
      return { languages: [], style: 'unknown' };
    }

    const languages = new Set();
    const romanisedBanglaPatterns = /(ami|tumi|valo|bhalo|kintu|kemon|korbo|korchi|ache|achhi|parbo|hobey|hobena|na|hoye|kor|korle|korish)/i;

    this.messages.forEach(message => {
      const text = (message?.text || '').trim();
      if (!text) {
        return;
      }

      if (/[\u0985-\u09B9]/.test(text)) {
        languages.add('Bangla (Bengali script)');
      }

      if (romanisedBanglaPatterns.test(text)) {
        languages.add('Romanized Bangla');
      }

      if (/[a-z]/i.test(text)) {
        languages.add('English');
      }
    });

    const list = Array.from(languages);
    let style = 'unknown';

    if (list.length === 1) {
      style = list[0];
    } else if (list.length > 1) {
      style = 'mixed';
    }

    return { languages: list, style };
  }

  getPacing() {
    const timestamps = Array.isArray(this.messages)
      ? this.messages
        .map(message => this.toDate(message?.timestamp))
        .filter(Boolean)
      : [];

    if (timestamps.length < 2) {
      return { averageGapSeconds: null, tempo: 'unknown' };
    }

    let totalGapSeconds = 0;
    let intervalCount = 0;

    for (let i = 1; i < timestamps.length; i += 1) {
      const current = timestamps[i];
      const previous = timestamps[i - 1];
      const gapSeconds = (current.getTime() - previous.getTime()) / 1000;

      if (gapSeconds > 0) {
        totalGapSeconds += gapSeconds;
        intervalCount += 1;
      }
    }

    if (intervalCount === 0) {
      return { averageGapSeconds: null, tempo: 'unknown' };
    }

    const averageGapSeconds = Math.round(totalGapSeconds / intervalCount);
    let tempo = 'steady';

    if (averageGapSeconds <= 90) {
      tempo = 'rapid';
    } else if (averageGapSeconds >= 600) {
      tempo = 'slow';
    }

    return { averageGapSeconds, tempo };
  }

  detectStyleMarkers() {
    if (!Array.isArray(this.messages) || this.messages.length === 0) {
      return { register: 'unknown', notes: [] };
    }

    let lowercaseOnly = 0;
    let uppercaseShouts = 0;
    let repeatedPunctuation = 0;
    const slangSamples = new Set();
    // Enhanced regex to include common Banglish slang
    const slangRegex = /\b(lol|lmao|rofl|haha|xd|idk|ikr|tbh|omg|wtf|brb|gonna|wanna|nah|yea|pls|plz|bro|dude|sis|bestie|hala|mama|dost|bokachoda|bal|baal|sala|khanki|magir)\b/i;

    this.messages.forEach(message => {
      const text = (message?.text || '').trim();
      if (!text) {
        return;
      }

      if (text === text.toLowerCase() && /[a-z]/.test(text)) {
        lowercaseOnly += 1;
      }

      if (/[A-Z]{3,}/.test(text) && text === text.toUpperCase()) {
        uppercaseShouts += 1;
      }

      if (/[!?]{2,}/.test(text)) {
        repeatedPunctuation += 1;
      }

      const slangMatch = text.match(slangRegex);
      if (slangMatch) {
        slangSamples.add(slangMatch[0].toLowerCase());
      }
    });

    const total = this.messages.length || 1;
    const notes = [];

    if (lowercaseOnly / total > 0.4) {
      notes.push('prefers lowercase replies');
    }

    if (uppercaseShouts > 0) {
      notes.push('occasional ALL CAPS emphasis');
    }

    if (repeatedPunctuation / total > 0.3) {
      notes.push('frequent !!! or ???');
    }

    if (slangSamples.size > 0) {
      notes.push(`uses slang such as ${Array.from(slangSamples).slice(0, 3).join(', ')}`);
    }

    let register = 'neutral';
    // Check for high-intimacy Bangla slang
    const intimateSlang = ['hala', 'bokachoda', 'khanki', 'magir', 'sala', 'baal', 'bal'];
    const hasIntimateSlang = Array.from(slangSamples).some(s => intimateSlang.includes(s));

    if (hasIntimateSlang) {
      register = 'intimate/very casual';
    } else if (slangSamples.size > 0 || lowercaseOnly / total > 0.4) {
      register = 'casual';
    } else if (uppercaseShouts > 0) {
      register = 'intense';
    }

    return { register, notes };
  }

  countWords(value) {
    if (typeof value !== 'string') {
      return 0;
    }

    const trimmed = value.trim();
    if (!trimmed) {
      return 0;
    }

    return trimmed.split(/\s+/).filter(Boolean).length;
  }

  getMedian(values = []) {
    const numeric = values
      .filter(value => typeof value === 'number' && !Number.isNaN(value))
      .sort((a, b) => a - b);

    if (numeric.length === 0) {
      return 0;
    }

    const middle = Math.floor(numeric.length / 2);

    if (numeric.length % 2 === 0) {
      return Math.round((numeric[middle - 1] + numeric[middle]) / 2);
    }

    return numeric[middle];
  }

  getLengthStyle(averageChars) {
    if (!Number.isFinite(averageChars) || averageChars <= 0) {
      return 'empty';
    }

    if (averageChars <= 35) {
      return 'very short';
    }

    if (averageChars <= 65) {
      return 'short';
    }

    if (averageChars <= 120) {
      return 'medium';
    }

    return 'long';
  }

  toDate(value) {
    if (!value) {
      return null;
    }

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value;
    }

    if (typeof value === 'number') {
      const fromNumber = new Date(value);
      return Number.isNaN(fromNumber.getTime()) ? null : fromNumber;
    }

    if (typeof value === 'string') {
      const fromString = new Date(value);
      return Number.isNaN(fromString.getTime()) ? null : fromString;
    }

    return null;
  }

  /**
   * Extract main topics from conversation
   */
  extractTopics() {
	    // Focus topic extraction on the most recent exchange so we don't
	    // over-emphasize old messages like "next thursday" or "ajke".
	    const wordFrequency = new Map();
	    const stopWords = new Set([
	      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
	      'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
	      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
	      'should', 'may', 'might', 'can', 'i', 'you', 'he', 'she', 'it', 'we',
	      'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her',
	      'its', 'our', 'their'
	    ]);

	    if (!Array.isArray(this.messages) || this.messages.length === 0) {
	      return [];
	    }

	    // Build a small window ending at the last *friend* message so
	    // topics stay focused on the current exchange instead of old plans.
	    const RECENT_TOPIC_WINDOW = 10; // ~5–10 messages around last reply
	    let messagesForTopics = [];
	    const userLabel = this.detectedUserName || 'You';
	    const lastFriendMessageObj = this.getLastMessageNotFrom(userLabel);
	    const lastFriendText = lastFriendMessageObj && lastFriendMessageObj.text
	      ? lastFriendMessageObj.text.toLowerCase()
	      : null;

	    if (lastFriendMessageObj) {
	      const lastIndex = this.messages.lastIndexOf(lastFriendMessageObj);
	      if (lastIndex >= 0) {
	        const startIndex = Math.max(0, lastIndex - (RECENT_TOPIC_WINDOW - 1));
	        messagesForTopics = this.messages.slice(startIndex, lastIndex + 1);
	      }
	    }

	    // Fallback: if we couldn't locate the last friend message for some
	    // reason, just take the tail of the conversation.
	    if (!messagesForTopics.length) {
	      messagesForTopics = this.messages.length > RECENT_TOPIC_WINDOW
	        ? this.messages.slice(-RECENT_TOPIC_WINDOW)
	        : this.messages.slice();
	    }

	    const boostWord = (rawWord) => {
	      const clean = (rawWord || '').toLowerCase().replace(/[^a-z0-9]/g, '');
	      if (clean.length > 3 && !stopWords.has(clean)) {
	        wordFrequency.set(clean, (wordFrequency.get(clean) || 0) + 3);
	      }
	    };

	    if (lastFriendText) {
	      lastFriendText.split(/\s+/).forEach(boostWord);
	    }

	    messagesForTopics.forEach(msg => {
	      if (!msg || !msg.text) return;
	      const words = msg.text.toLowerCase().split(/\s+/);
	      words.forEach(rawWord => {
	        const cleanWord = rawWord.replace(/[^a-z0-9]/g, '');
	        if (cleanWord.length > 3 && !stopWords.has(cleanWord)) {
	          wordFrequency.set(cleanWord, (wordFrequency.get(cleanWord) || 0) + 1);
	        }
	      });
	    });

	    if (wordFrequency.size === 0) {
	      return [];
	    }

	    // Get top 3 topics
	    const topics = Array.from(wordFrequency.entries())
	      .sort((a, b) => b[1] - a[1])
	      .slice(0, 3)
	      .map(([word]) => word);

	    return topics;
  }

  /**
   * Detect semantic intent in the conversation
   */
  detectIntent() {
    if (!Array.isArray(this.messages) || this.messages.length === 0) {
      return { primary: 'unknown', secondary: [], confidence: 'low' };
    }

    const intents = {
      asking_question: 0,
      requesting_help: 0,
      making_plans: 0,
      sharing_info: 0,
      expressing_emotion: 0,
      giving_opinion: 0,
      small_talk: 0,
      seeking_confirmation: 0
    };

    // Keywords and patterns for each intent
    const patterns = {
      asking_question: /\?|what|why|how|when|where|who|ki|keno|kobe|kothai|ke/i,
      requesting_help: /help|please|can you|could you|ektu|please help|assist|support/i,
      making_plans: /let's|we should|planning|meet|tomorrow|schedule|plan|kori|korbo/i,
      sharing_info: /look|check|see|fyi|here|this is|dekho|dekh|eta/i,
      expressing_emotion: /love|hate|happy|sad|angry|excited|worried|frustrated|bhalo|kharap/i,
      giving_opinion: /think|believe|feel|opinion|i would|ami mone kori|amar mote/i,
      small_talk: /hi|hello|hey|good morning|how are you|kemon acho|ki khobor/i,
      seeking_confirmation: /right|correct|isn't it|na|naki|taina|okay|ok|thik/i
    };

    // Analyze last 5 messages for intent
    const recentMessages = this.messages.slice(-5);

    recentMessages.forEach(msg => {
      const text = (msg?.text || '').toLowerCase();
      if (!text) return;

      // Check each pattern
      Object.keys(patterns).forEach(intent => {
        if (patterns[intent].test(text)) {
          intents[intent]++;
        }
      });
    });

    // Find primary intent
    const sortedIntents = Object.entries(intents)
      .sort((a, b) => b[1] - a[1])
      .filter(([_, count]) => count > 0);

    if (sortedIntents.length === 0) {
      return { primary: 'small_talk', secondary: [], confidence: 'low' };
    }

    const primary = sortedIntents[0][0];
    const secondary = sortedIntents.slice(1, 3).map(([intent]) => intent);

    // Determine confidence
    const totalMatches = sortedIntents.reduce((sum, [_, count]) => sum + count, 0);
    const primaryScore = sortedIntents[0][1];
    const confidence = primaryScore / totalMatches > 0.5 ? 'high' : 'medium';

    return { primary, secondary, confidence };
  }

  /**
   * Detect emotional state from conversation
   */
  detectEmotionalState() {
    if (!Array.isArray(this.messages) || this.messages.length === 0) {
      return { state: 'neutral', intensity: 'low', indicators: [] };
    }

    const emotions = {
      excited: /excited|amazing|awesome|wow|omg|love it|great|fantastic|🤩|😍|🔥/i,
      happy: /happy|good|nice|cool|glad|haha|lol|😊|😄|😁/i,
      worried: /worried|concern|anxious|nervous|chinta|tension/i,
      frustrated: /frustrated|annoying|ridiculous|can't believe|ugh|😠|😤/i,
      confused: /confused|don't understand|what do you mean|bujhlam na|🤔/i,
      grateful: /thanks|thank you|appreciate|dhonnobad|🙏/i,
      sad: /sad|disappointed|upset|sorry|😢|😞/i
    };

    const indicators = [];
    const recentMessages = this.messages.slice(-5);

    // Check for emotional indicators
    Object.entries(emotions).forEach(([emotion, pattern]) => {
      recentMessages.forEach(msg => {
        const text = msg?.text || '';
        if (pattern.test(text)) {
          indicators.push(emotion);
        }
      });
    });

    if (indicators.length === 0) {
      return { state: 'neutral', intensity: 'low', indicators: [] };
    }

    // Count occurrences
    const counts = {};
    indicators.forEach(emotion => {
      counts[emotion] = (counts[emotion] || 0) + 1;
    });

    // Find dominant emotion
    const dominant = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])[0];

    const state = dominant[0];
    const intensity = dominant[1] > 2 ? 'high' : (dominant[1] > 1 ? 'medium' : 'low');

    return { state, intensity, indicators: [...new Set(indicators)] };
  }

  /**
   * Detect urgency in conversation
   */
  detectUrgency() {
    const urgentWords = ['urgent', 'asap', 'immediately', 'now', 'quick', 'hurry', 'emergency', 'important', '!!!', '!!'];

    let urgencyScore = 0;

    this.messages.forEach(msg => {
      const text = msg.text.toLowerCase();
      urgentWords.forEach(word => {
        if (text.includes(word)) urgencyScore++;
      });

      // Check for multiple exclamation marks
      const exclamationCount = (text.match(/!/g) || []).length;
      if (exclamationCount > 2) urgencyScore += 2;
    });

    if (urgencyScore > 3) {
      return { level: 'high', score: urgencyScore };
    } else if (urgencyScore > 0) {
      return { level: 'medium', score: urgencyScore };
    } else {
      return { level: 'low', score: 0 };
    }
  }

  /**
   * Get the last message from a specific speaker
   */
  getLastMessageFrom(speaker) {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].speaker === speaker) {
        return this.messages[i];
      }
    }
    return null;
  }

  /**
   * Get the last message NOT from a specific speaker
   */
  getLastMessageNotFrom(speaker) {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].speaker !== speaker) {
        return this.messages[i];
      }
    }
    return null;
  }

  /**
   * Determine who sent the last message
   */
  getLastMessageSender() {
    if (this.messages.length === 0) return null;
    return this.messages[this.messages.length - 1].speaker;
  }

  /**
   * Get conversation summary
   */
  getSummary() {
    const analysis = this.analyze(this.messages);

    const participants = Array.isArray(analysis.speakers) && analysis.speakers.length
      ? analysis.speakers.join(', ')
      : 'Unknown';

    const topics = Array.isArray(analysis.topics) && analysis.topics.length
      ? analysis.topics.join(', ')
      : 'None';

    const languageMix = analysis.languageMix?.languages?.length
      ? analysis.languageMix.languages.join(', ')
      : 'Unknown';

    const averageLength = analysis.messageLength
      ? `${analysis.messageLength.averageWords || 0} words (~${analysis.messageLength.averageChars || 0} chars, ${analysis.messageLength.style})`
      : '0 words';

    const styleNotes = analysis.styleMarkers?.notes?.length
      ? analysis.styleMarkers.notes.join('; ')
      : '';

    // Determine the user label (actual name if detected, otherwise "You")
    const userLabel = this.detectedUserName || 'You';

    // Get the last message from the user (using actual name or "You")
    let yourLastMessageObj = this.getLastMessageFrom(userLabel);

    // Fallback: If we have a detected name but no messages found, try "You"
    if (!yourLastMessageObj && this.detectedUserName) {
      yourLastMessageObj = this.getLastMessageFrom('You');
    }

    const lastUserMessage = yourLastMessageObj ? yourLastMessageObj.text : '';

    // Get the last message from a friend (not from the user)
    let lastFriendMessageObj = this.getLastMessageNotFrom(userLabel);

    // Fallback: If we have a detected name but no messages found, try "You"
    if (!lastFriendMessageObj && this.detectedUserName) {
      lastFriendMessageObj = this.getLastMessageNotFrom('You');
    }

    const lastFriendMessage = lastFriendMessageObj ? lastFriendMessageObj.text : '';
    const lastFriendSpeaker = lastFriendMessageObj ? lastFriendMessageObj.speaker : '';

    // Get the last message from anyone (for context)
    const lastAnyMessage = this.messages.length > 0
      ? this.messages[this.messages.length - 1].text
      : '';

    // Determine who sent the last message
    const lastMessageSender = this.getLastMessageSender();
    const isYourLastMessage = lastMessageSender === userLabel || lastMessageSender === 'You';

    return {
      totalMessages: analysis.messageCount,
      participants,
      lastSpeaker: analysis.lastSpeaker,
      conversationType: analysis.conversationFlow.type,
      sentiment: analysis.sentiment.tone,
      hasQuestion: analysis.hasUnansweredQuestion.hasQuestion,
      urgency: analysis.urgency.level,
      topics,
      averageLength,
      languageMix,
      messageTempo: analysis.pacing?.tempo || 'unknown',
      emojiUsage: analysis.emojiUsage?.usageLevel || 'none',
      styleNotes,
      lastMessage: lastAnyMessage,  // Last message from anyone
      lastUserMessage: lastUserMessage,  // Last message from the user
      lastFriendMessage: lastFriendMessage,  // Last message from a friend
      lastFriendSpeaker: lastFriendSpeaker,  // Who sent the friend's last message
      isYourLastMessage: isYourLastMessage,  // Whether the user sent the last message
      userName: userLabel  // NEW: Include the user's actual name
    };
  }

  /**
   * Detect if last message is a conversation ender
   * (e.g., "thanks", "ok", "bye", "accha")
   */
  isConversationEnder(text) {
    if (!text || typeof text !== 'string') return false;

    const lowerText = text.toLowerCase().trim();
    const enderPatterns = [
      /^(thank you|thanks|thank|thx|ty)(\s+vai|\s+bhai|\s+bro)?[.!]*$/i,
      /^(ok|okay|k|kk)(\s+vai|\s+bhai|\s+bro)?[.!]*$/i,
      /^(bye|goodbye|see you|cya|ttyl)(\s+vai|\s+bhai|\s+bro)?[.!]*$/i,
      /^(accha|achha|acha|thik ache|thik|hmm|hm)(\s+vai|\s+bhai|\s+bro)?[.!]*$/i,
      /^(alright|got it|understood|cool)(\s+vai|\s+bhai|\s+bro)?[.!]*$/i
    ];

    return enderPatterns.some(pattern => pattern.test(lowerText));
  }

  /**
   * Calculate time gap since last message in hours
   */
  getTimeSinceLastMessage() {
    if (this.messages.length === 0) return null;

    const lastMessage = this.messages[this.messages.length - 1];
    if (!lastMessage.timestamp) return null;

    const now = new Date();
    const lastTime = lastMessage.timestamp instanceof Date
      ? lastMessage.timestamp
      : new Date(lastMessage.timestamp);

    const diffMs = now - lastTime;
    const diffHours = diffMs / (1000 * 60 * 60);

    return diffHours;
  }

  /**
   * Generate analysis for "Reply to Last Message" mode
   */
  getReplyModeAnalysis() {
    const summary = this.getSummary();
    const lastMessage = this.messages.length > 0 ? this.messages[this.messages.length - 1] : null;

    if (!lastMessage) {
      return {
        mode: 'reply',
        context: 'No messages to reply to',
        suggestion: 'Start a new conversation'
      };
    }

    const isFromUser = lastMessage.speaker === 'You' || lastMessage.isOutgoing;
    const speaker = isFromUser ? 'You' : lastMessage.speaker;
    const messageText = lastMessage.text || '';
    const timeGap = this.getTimeSinceLastMessage();
    const timeGapText = timeGap !== null ? `${Math.round(timeGap)} hours ago` : 'recently';

    // Determine response approach based on message type
    let approach = '';
    let exampleTone = '';

    if (summary.hasQuestion) {
      approach = 'Answer the question directly';
      exampleTone = 'Informative and helpful';
    } else if (this.isConversationEnder(messageText)) {
      approach = 'Acknowledge and optionally continue';
      exampleTone = 'Brief and friendly';
    } else if (messageText.includes('?')) {
      approach = 'Respond to the inquiry';
      exampleTone = 'Clear and direct';
    } else {
      approach = 'Acknowledge and engage';
      exampleTone = 'Conversational and friendly';
    }

    return {
      mode: 'reply',
      respondingTo: messageText,
      speaker: speaker,
      timeGap: timeGapText,
      context: isFromUser
        ? (summary.hasQuestion
            ? `You sent the last message, but ${summary.lastFriendSpeaker} asked a question ("${summary.lastFriendMessage}") that needs answering.`
            : 'You sent the last message - continue your thought or follow up')
        : `${speaker} sent the last message - you should respond`,
      approach: isFromUser && summary.hasQuestion ? 'Answer the friend\'s previous question' : approach,
      exampleTone: exampleTone,
      sentiment: summary.sentiment,
      hasQuestion: summary.hasQuestion
    };
  }

  /**
   * Generate analysis for "Start New Conversation" mode
   */
  getNewConversationAnalysis() {
    const summary = this.getSummary();
    const lastMessage = this.messages.length > 0 ? this.messages[this.messages.length - 1] : null;
    const timeGap = this.getTimeSinceLastMessage();
    const timeGapText = timeGap !== null ? `${Math.round(timeGap)} hours ago` : 'recently';

    // Determine conversation state
    let conversationState = 'active';
    let suggestedTopics = [];

    if (lastMessage && this.isConversationEnder(lastMessage.text)) {
      conversationState = 'ended naturally';
    } else if (timeGap !== null && timeGap > 12) {
      conversationState = 'paused (long gap)';
    } else if (timeGap !== null && timeGap > 2) {
      conversationState = 'paused (moderate gap)';
    }

    // Suggest topics based on recent conversation
    if (summary.topics && summary.topics !== 'None') {
      suggestedTopics.push(`Follow up on: ${summary.topics}`);
    }
    suggestedTopics.push('Casual check-in');
    suggestedTopics.push('Ask what they\'re up to');
    suggestedTopics.push('Share something new');

    return {
      mode: 'new_conversation',
      lastInteraction: timeGapText,
      conversationState: conversationState,
      context: `Last chat ${timeGapText} - conversation ${conversationState}`,
      approach: 'Start fresh with a casual greeting or new topic',
      suggestedTopics: suggestedTopics,
      exampleTone: 'Friendly and casual',
      recentTopics: summary.topics !== 'None' ? summary.topics : null
    };
  }

  /**
   * Get dual context analysis (both reply and new conversation modes)
   */
  getDualAnalysis() {
    return {
      replyMode: this.getReplyModeAnalysis(),
      newConversation: this.getNewConversationAnalysis(),
      summary: this.getSummary()
    };
  }
}



