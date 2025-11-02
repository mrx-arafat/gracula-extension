// Offline Suggestion System
// Context-aware pattern-based suggestions without API calls

window.Gracula = window.Gracula || {};
window.Gracula.OfflineSuggestions = window.Gracula.OfflineSuggestions || {};

/**
 * Offline Suggestion Database - ENHANCED
 * Organized by patterns, context, and common phrases
 * Includes: greetings, questions, responses, common phrases, time-based, emotions, continuations, work, casual, formal
 */
window.Gracula.OfflineSuggestions.DATABASE = {
  // Greeting patterns - EXPANDED
  greetings: {
    'hello': [
      'Hello! How are you?',
      'Hello there! What\'s up?',
      'Hello! Good to hear from you',
      'Hello! It\'s been a while',
      'Hello! How\'s everything?'
    ],
    'hi': [
      'Hi! How are you doing?',
      'Hi there! What\'s going on?',
      'Hi! Hope you\'re doing well',
      'Hi! What\'s new?',
      'Hi! Long time no talk'
    ],
    'hey': [
      'Hey! How\'s it going?',
      'Hey there! What\'s up?',
      'Hey! Long time no see',
      'Hey! What have you been up to?',
      'Hey! Good to hear from you'
    ],
    'good morning': [
      'Good morning! Hope you have a great day',
      'Good morning! How did you sleep?',
      'Good morning! Ready for the day?',
      'Good morning! Let\'s make it a good one',
      'Good morning! How are you feeling today?'
    ],
    'good afternoon': [
      'Good afternoon! How\'s your day going?',
      'Good afternoon! Hope you\'re having a good one',
      'Good afternoon! What have you been up to?',
      'Good afternoon! Taking a break?',
      'Good afternoon! How\'s work treating you?'
    ],
    'good evening': [
      'Good evening! How was your day?',
      'Good evening! Hope you had a good day',
      'Good evening! What are you up to tonight?',
      'Good evening! Ready to relax?',
      'Good evening! How\'s everything?'
    ],
    'sup': [
      'Sup! What\'s going on?',
      'Sup! How\'s it going?',
      'Sup! What\'s new?',
      'Sup! You good?',
      'Sup! What\'s up with you?'
    ],
    'yo': [
      'Yo! What\'s up?',
      'Yo! How\'s it going?',
      'Yo! What\'s good?',
      'Yo! Long time!',
      'Yo! What\'s happening?'
    ]
  },

  // Question patterns - EXPANDED
  questions: {
    'how are': [
      'How are you doing?',
      'How are things going?',
      'How are you feeling today?',
      'How\'s life treating you?',
      'How have you been?'
    ],
    'what are': [
      'What are you up to?',
      'What are you doing?',
      'What are your plans?',
      'What\'s on your mind?',
      'What\'s new with you?'
    ],
    'where are': [
      'Where are you right now?',
      'Where are you heading?',
      'Where are you going?',
      'Where have you been?',
      'Where are you these days?'
    ],
    'when are': [
      'When are you free?',
      'When are you available?',
      'When are you coming?',
      'When can we meet?',
      'When are you back?'
    ],
    'why': [
      'Why do you ask?',
      'Why not?',
      'Why is that?',
      'Why didn\'t you tell me?',
      'Why so serious?'
    ],
    'can you': [
      'Can you help me with something?',
      'Can you do me a favor?',
      'Can you let me know?',
      'Can you make it?',
      'Can you believe that?'
    ],
    'do you': [
      'Do you have time?',
      'Do you want to hang out?',
      'Do you know what I mean?',
      'Do you remember?',
      'Do you think so?'
    ],
    'did you': [
      'Did you see that?',
      'Did you hear about it?',
      'Did you get my message?',
      'Did you finish?',
      'Did you have fun?'
    ],
    'will you': [
      'Will you be there?',
      'Will you help me?',
      'Will you let me know?',
      'Will you come?',
      'Will you remember?'
    ]
  },

  // Response patterns - EXPANDED
  responses: {
    'yes': [
      'Yes, definitely!',
      'Yes, sounds good!',
      'Yes, I\'m in!',
      'Yes, absolutely!',
      'Yes, for sure!',
      'Yes, let\'s do it!',
      'Yes, I agree!'
    ],
    'no': [
      'No, sorry',
      'No, I can\'t',
      'No, not really',
      'No, not today',
      'No, I\'m busy',
      'No, I don\'t think so',
      'No, maybe later'
    ],
    'maybe': [
      'Maybe, let me check',
      'Maybe, I\'ll let you know',
      'Maybe, not sure yet',
      'Maybe later',
      'Maybe tomorrow',
      'Maybe, I\'ll think about it',
      'Maybe, depends on my schedule'
    ],
    'sure': [
      'Sure, no problem!',
      'Sure, I\'d love to',
      'Sure thing!',
      'Sure, why not?',
      'Sure, let\'s do it!'
    ],
    'okay': [
      'Okay, sounds good',
      'Okay, got it',
      'Okay, thanks!',
      'Okay, I\'ll do it',
      'Okay, see you then'
    ],
    'thanks': [
      'Thanks so much!',
      'Thanks, I appreciate it',
      'Thanks a lot!',
      'Thanks for letting me know',
      'Thanks, you\'re the best!'
    ],
    'thank you': [
      'Thank you so much!',
      'Thank you, I really appreciate it',
      'Thank you very much!',
      'Thank you for everything',
      'Thank you, you\'re amazing!'
    ],
    'sorry': [
      'Sorry about that',
      'Sorry, my bad',
      'Sorry, I didn\'t mean to',
      'Sorry for the delay',
      'Sorry, I was busy'
    ],
    'excuse me': [
      'Excuse me, can you help?',
      'Excuse me, one moment',
      'Excuse me, sorry to bother',
      'Excuse me, do you have a minute?',
      'Excuse me, can I ask you something?'
    ]
  },

  // Common phrases
  common: {
    'i\'m': [
      'I\'m doing well, thanks!',
      'I\'m good, how about you?',
      'I\'m fine, what\'s up?'
    ],
    'i am': [
      'I am doing great!',
      'I am good, thanks for asking',
      'I am fine, how are you?'
    ],
    'let me': [
      'Let me know if you need anything',
      'Let me check and get back to you',
      'Let me think about it'
    ],
    'i think': [
      'I think that sounds good',
      'I think we should do it',
      'I think you\'re right'
    ],
    'i don\'t': [
      'I don\'t think so',
      'I don\'t know yet',
      'I don\'t have time right now'
    ],
    'i can': [
      'I can do that',
      'I can help you with that',
      'I can meet you there'
    ],
    'i will': [
      'I will let you know',
      'I will be there',
      'I will do that'
    ],
    'i would': [
      'I would love to',
      'I would be happy to help',
      'I would appreciate that'
    ]
  },

  // Time-related patterns
  time: {
    'see you': [
      'See you later!',
      'See you soon!',
      'See you tomorrow!'
    ],
    'talk to': [
      'Talk to you later',
      'Talk to you soon',
      'Talk to you tomorrow'
    ],
    'catch up': [
      'Catch up soon!',
      'Catch up later',
      'Catch up this week'
    ],
    'later': [
      'Later today?',
      'Later this week?',
      'Later, take care!'
    ],
    'tomorrow': [
      'Tomorrow works for me',
      'Tomorrow sounds good',
      'Tomorrow at what time?'
    ],
    'tonight': [
      'Tonight works!',
      'Tonight sounds good',
      'Tonight at what time?'
    ]
  },

  // Emotional responses
  emotions: {
    'sorry': [
      'Sorry about that',
      'Sorry, I didn\'t mean to',
      'Sorry for the delay'
    ],
    'congrats': [
      'Congrats! That\'s awesome!',
      'Congratulations! So happy for you!',
      'Congrats! Well deserved!'
    ],
    'happy': [
      'Happy to hear that!',
      'Happy for you!',
      'Happy to help!'
    ],
    'sad': [
      'Sorry to hear that',
      'That\'s sad to hear',
      'Hope things get better'
    ],
    'excited': [
      'Excited to see you!',
      'Excited about this!',
      'So excited!'
    ]
  },

  // Continuation patterns (for learning from context)
  continuations: {
    'that\'s': [
      'That\'s great!',
      'That\'s awesome!',
      'That\'s interesting'
    ],
    'it\'s': [
      'It\'s all good',
      'It\'s fine',
      'It\'s okay'
    ],
    'sounds': [
      'Sounds good!',
      'Sounds great!',
      'Sounds like a plan'
    ],
    'looks': [
      'Looks good!',
      'Looks great!',
      'Looks interesting'
    ]
  },

  // Work/Professional patterns
  work: {
    'meeting': [
      'Let\'s schedule a meeting',
      'When can we meet?',
      'I\'ll send you a calendar invite',
      'Let\'s discuss this in a meeting',
      'Can we set up a call?'
    ],
    'project': [
      'How\'s the project going?',
      'Let\'s sync on the project',
      'I\'ll update you on the project',
      'The project is on track',
      'We need to discuss the project'
    ],
    'deadline': [
      'What\'s the deadline?',
      'We\'re on track for the deadline',
      'The deadline is coming up',
      'Can we extend the deadline?',
      'Let\'s meet the deadline'
    ],
    'update': [
      'I\'ll send you an update',
      'Here\'s the latest update',
      'Can you give me an update?',
      'Let me update you on this',
      'I need an update from you'
    ],
    'busy': [
      'I\'m pretty busy right now',
      'I\'m swamped with work',
      'I\'ll get back to you when I\'m free',
      'Can we reschedule?',
      'I\'m in the middle of something'
    ]
  },

  // Casual/Friendly patterns
  casual: {
    'lol': [
      'Haha, that\'s funny!',
      'That made me laugh!',
      'You\'re hilarious!',
      'Lol, I know right?',
      'That\'s so funny!'
    ],
    'awesome': [
      'That\'s awesome!',
      'Awesome, let\'s do it!',
      'You\'re awesome!',
      'That sounds awesome!',
      'Awesome work!'
    ],
    'cool': [
      'That\'s cool!',
      'Cool, I like it!',
      'You\'re cool!',
      'That sounds cool!',
      'Cool, let\'s go!'
    ],
    'nice': [
      'That\'s nice!',
      'Nice to hear!',
      'You\'re nice!',
      'That sounds nice!',
      'Nice work!'
    ],
    'love': [
      'I love that!',
      'I love it!',
      'You\'re the best!',
      'I love your idea!',
      'That\'s amazing!'
    ]
  },

  // Formal/Professional patterns
  formal: {
    'regards': [
      'Best regards',
      'Kind regards',
      'Warm regards',
      'With regards to your message',
      'In regards to your inquiry'
    ],
    'sincerely': [
      'Sincerely',
      'Yours sincerely',
      'Sincerely yours',
      'I remain sincerely yours',
      'Sincerely grateful'
    ],
    'respectfully': [
      'Respectfully',
      'Respectfully yours',
      'I respectfully disagree',
      'Respectfully submitted',
      'With all due respect'
    ],
    'appreciate': [
      'I appreciate your time',
      'I appreciate your help',
      'I appreciate your understanding',
      'I truly appreciate this',
      'I appreciate the opportunity'
    ],
    'request': [
      'I would like to request',
      'May I request your assistance?',
      'I request your feedback',
      'I kindly request',
      'I humbly request'
    ]
  },

  // Emotional/Expressive patterns
  emotions: {
    'happy': [
      'I\'m so happy!',
      'That makes me happy!',
      'I\'m really happy about this',
      'Happy to help!',
      'Happy to hear that!'
    ],
    'sad': [
      'I\'m feeling sad',
      'That\'s sad to hear',
      'I\'m sorry to hear that',
      'That makes me sad',
      'I\'m not feeling great'
    ],
    'excited': [
      'I\'m so excited!',
      'That\'s exciting!',
      'I can\'t wait!',
      'This is amazing!',
      'I\'m pumped!'
    ],
    'worried': [
      'I\'m a bit worried',
      'I\'m concerned about this',
      'That worries me',
      'I\'m stressed about it',
      'I\'m anxious about this'
    ],
    'grateful': [
      'I\'m so grateful!',
      'I\'m grateful for you',
      'Thank you, I\'m grateful',
      'I\'m truly grateful',
      'I appreciate you so much'
    ]
  },

  // Situational patterns
  situations: {
    'help': [
      'Can you help me?',
      'I need your help',
      'Can I ask for your help?',
      'Would you mind helping?',
      'I could use some help'
    ],
    'advice': [
      'Can I get your advice?',
      'What do you think I should do?',
      'I need some advice',
      'Can you advise me?',
      'What would you do?'
    ],
    'problem': [
      'I have a problem',
      'There\'s an issue',
      'Something\'s wrong',
      'I\'m having trouble',
      'Can we talk about this?'
    ],
    'celebrate': [
      'Let\'s celebrate!',
      'Congratulations!',
      'That\'s amazing news!',
      'We should celebrate!',
      'You deserve to celebrate!'
    ],
    'apologize': [
      'I\'m really sorry',
      'I apologize for that',
      'I didn\'t mean to',
      'Can you forgive me?',
      'I feel terrible about this'
    ]
  },

  // Quick responses
  quick: {
    'ok': [
      'Okay!',
      'Got it!',
      'Sure!',
      'Alright!',
      'Will do!'
    ],
    'yep': [
      'Yep!',
      'Yep, for sure!',
      'Yep, absolutely!',
      'Yep, let\'s do it!',
      'Yep, I\'m in!'
    ],
    'nope': [
      'Nope!',
      'Nope, not today',
      'Nope, sorry',
      'Nope, can\'t do it',
      'Nope, I\'m good'
    ],
    'maybe': [
      'Maybe!',
      'Maybe later',
      'Maybe tomorrow',
      'Maybe, I\'ll think about it',
      'Maybe, depends'
    ],
    'idk': [
      'I don\'t know',
      'Not sure',
      'I have no idea',
      'Beats me',
      'Your guess is as good as mine'
    ]
  },

  // NEW: Extended conversation patterns
  extended: {
    'just': [
      'Just checking in',
      'Just wanted to say hi',
      'Just finished',
      'Just got home',
      'Just a moment'
    ],
    'by the way': [
      'By the way, how are you?',
      'By the way, did you hear?',
      'By the way, I meant to tell you',
      'By the way, thanks for earlier',
      'By the way, are you free?'
    ],
    'actually': [
      'Actually, I was thinking',
      'Actually, that reminds me',
      'Actually, I need to tell you',
      'Actually, never mind',
      'Actually, you\'re right'
    ],
    'honestly': [
      'Honestly, I\'m not sure',
      'Honestly, that sounds great',
      'Honestly, I don\'t know',
      'Honestly, I\'m tired',
      'Honestly, you\'re amazing'
    ],
    'anyway': [
      'Anyway, how are you?',
      'Anyway, talk to you later',
      'Anyway, I should go',
      'Anyway, that\'s all',
      'Anyway, moving on'
    ],
    'speaking of': [
      'Speaking of which',
      'Speaking of that',
      'Speaking of you',
      'Speaking of work',
      'Speaking of plans'
    ],
    'by chance': [
      'By chance, are you free?',
      'By chance, do you know?',
      'By chance, have you seen?',
      'By chance, did you hear?',
      'By chance, are you around?'
    ],
    'on second thought': [
      'On second thought, let\'s do it',
      'On second thought, maybe not',
      'On second thought, I\'ll pass',
      'On second thought, sounds good',
      'On second thought, I\'ll join'
    ]
  },

  // NEW: Modern chat expressions
  modern: {
    'tbh': [
      'To be honest, I\'m not sure',
      'To be honest, that\'s great',
      'To be honest, I agree',
      'To be honest, I\'m tired',
      'To be honest, sounds good'
    ],
    'btw': [
      'By the way, how are you?',
      'By the way, thanks!',
      'By the way, are you free?',
      'By the way, I forgot to mention',
      'By the way, did you see?'
    ],
    'omg': [
      'Oh my god, really?',
      'Oh my god, that\'s amazing!',
      'Oh my god, I can\'t believe it',
      'Oh my god, are you serious?',
      'Oh my god, that\'s crazy!'
    ],
    'nvm': [
      'Never mind',
      'Never mind, got it',
      'Never mind, I figured it out',
      'Never mind, all good',
      'Never mind, forget it'
    ],
    'brb': [
      'Be right back',
      'Be right back, one sec',
      'Be right back in a bit',
      'Be right back, gotta go',
      'Be right back soon'
    ],
    'gtg': [
      'Got to go',
      'Got to go, talk later',
      'Got to go, see you',
      'Got to go now',
      'Got to go, bye!'
    ],
    'rn': [
      'Right now',
      'Not right now',
      'Right now I\'m busy',
      'Right now works',
      'Right now is good'
    ]
  },

  // NEW: Planning and scheduling
  planning: {
    'when do': [
      'When do you want to meet?',
      'When do you need it?',
      'When do you leave?',
      'When do you think?',
      'When do you arrive?'
    ],
    'how about': [
      'How about tomorrow?',
      'How about this weekend?',
      'How about 3pm?',
      'How about we meet at',
      'How about another time?'
    ],
    'would you like': [
      'Would you like to join?',
      'Would you like to meet up?',
      'Would you like some help?',
      'Would you like to come?',
      'Would you like me to'
    ],
    'are you available': [
      'Are you available tomorrow?',
      'Are you available this week?',
      'Are you available tonight?',
      'Are you available for a call?',
      'Are you available to meet?'
    ],
    'let\'s meet': [
      'Let\'s meet up soon',
      'Let\'s meet at the usual place',
      'Let\'s meet tomorrow',
      'Let\'s meet this weekend',
      'Let\'s meet for lunch'
    ],
    'i\'m free': [
      'I\'m free tomorrow',
      'I\'m free tonight',
      'I\'m free this weekend',
      'I\'m free after 5',
      'I\'m free whenever'
    ]
  },

  // NEW: Reactions and responses
  reactions: {
    'wow': [
      'Wow, that\'s amazing!',
      'Wow, really?',
      'Wow, I didn\'t know',
      'Wow, that\'s crazy!',
      'Wow, impressive!'
    ],
    'haha': [
      'Haha, that\'s funny!',
      'Haha, good one!',
      'Haha, I know right?',
      'Haha, classic!',
      'Haha, love it!'
    ],
    'oh no': [
      'Oh no, I\'m sorry',
      'Oh no, that\'s terrible',
      'Oh no, what happened?',
      'Oh no, hope it gets better',
      'Oh no, let me know if I can help'
    ],
    'oh yeah': [
      'Oh yeah, I remember',
      'Oh yeah, totally',
      'Oh yeah, for sure',
      'Oh yeah, that reminds me',
      'Oh yeah, I forgot about that'
    ],
    'exactly': [
      'Exactly what I was thinking',
      'Exactly!',
      'Exactly my point',
      'Exactly right',
      'Exactly, I agree'
    ],
    'true': [
      'True that',
      'True, you\'re right',
      'True, I didn\'t think of that',
      'True, good point',
      'True, can\'t argue with that'
    ],
    'fair enough': [
      'Fair enough',
      'Fair enough, I understand',
      'Fair enough, makes sense',
      'Fair enough, I agree',
      'Fair enough, can\'t complain'
    ]
  }
};

/**
 * Pattern Matcher - Finds matching patterns in user input
 */
window.Gracula.OfflineSuggestions.PatternMatcher = class {
  constructor() {
    this.database = window.Gracula.OfflineSuggestions.DATABASE;
    this.userPatterns = this.loadUserPatterns();
    console.log('✅ [OFFLINE] PatternMatcher initialized with database:', Object.keys(this.database));
  }

  /**
   * Load user-learned patterns from storage
   */
  loadUserPatterns() {
    const stored = localStorage.getItem('gracula_user_patterns');
    return stored ? JSON.parse(stored) : {};
  }

  /**
   * Save user-learned patterns to storage
   */
  saveUserPatterns() {
    localStorage.setItem('gracula_user_patterns', JSON.stringify(this.userPatterns));
  }

  /**
   * Learn from user's typing patterns
   */
  learnPattern(input, completion) {
    const key = input.toLowerCase().trim();
    if (!this.userPatterns[key]) {
      this.userPatterns[key] = [];
    }
    
    // Add completion if not already present
    if (!this.userPatterns[key].includes(completion)) {
      this.userPatterns[key].push(completion);
      
      // Keep only last 5 completions per pattern
      if (this.userPatterns[key].length > 5) {
        this.userPatterns[key].shift();
      }
      
      this.saveUserPatterns();
    }
  }

  /**
   * Find suggestions based on input text - ENHANCED
   */
  findSuggestions(input, context = []) {
    if (!input || input.length < 2) {
      return this.getCommonStarters();
    }

    const lowerInput = input.toLowerCase().trim();
    const suggestions = [];

    // 1. Check user-learned patterns first (highest priority)
    if (this.userPatterns[lowerInput]) {
      suggestions.push(...this.userPatterns[lowerInput]);
    }

    // 2. Check exact matches in database
    for (const category in this.database) {
      const patterns = this.database[category];
      if (patterns[lowerInput]) {
        suggestions.push(...patterns[lowerInput]);
      }
    }

    // 3. Check partial matches (starts with) - IMPROVED
    if (suggestions.length < 3) {
      const partialMatches = this.findPartialMatches(lowerInput);
      suggestions.push(...partialMatches);
    }

    // 4. Fuzzy matching for typos - NEW
    if (suggestions.length < 3) {
      const fuzzyMatches = this.findFuzzyMatches(lowerInput);
      suggestions.push(...fuzzyMatches);
    }

    // 5. Context-aware suggestions - ENHANCED
    if (context && context.length > 0 && suggestions.length < 3) {
      const contextSuggestions = this.getContextAwareSuggestions(input, context);
      suggestions.push(...contextSuggestions);
    }

    // 6. Semantic suggestions - NEW
    if (suggestions.length < 3) {
      const semanticSuggestions = this.getSemanticSuggestions(lowerInput);
      suggestions.push(...semanticSuggestions);
    }

    // Remove duplicates and return top 3
    return [...new Set(suggestions)].slice(0, 3);
  }

  /**
   * Find partial matches (improved)
   */
  findPartialMatches(input) {
    const matches = [];
    for (const category in this.database) {
      const patterns = this.database[category];
      for (const pattern in patterns) {
        if (pattern.startsWith(input) || input.startsWith(pattern)) {
          matches.push(...patterns[pattern]);
        }
      }
    }
    return matches;
  }

  /**
   * Find fuzzy matches for typos and variations
   */
  findFuzzyMatches(input) {
    const matches = [];
    const maxDistance = 2; // Allow up to 2 character differences

    for (const category in this.database) {
      const patterns = this.database[category];
      for (const pattern in patterns) {
        const distance = this.levenshteinDistance(input, pattern);
        if (distance <= maxDistance && distance > 0) {
          matches.push(...patterns[pattern]);
        }
      }
    }
    return matches;
  }

  /**
   * Calculate Levenshtein distance for fuzzy matching
   */
  levenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  /**
   * Get semantic suggestions based on word meaning
   */
  getSemanticSuggestions(input) {
    const suggestions = [];

    // Semantic groups
    const semanticGroups = {
      'greetings': ['hello', 'hi', 'hey', 'sup', 'yo', 'good morning', 'good afternoon', 'good evening'],
      'affirmative': ['yes', 'yeah', 'yep', 'sure', 'okay', 'ok', 'alright'],
      'negative': ['no', 'nope', 'nah', 'sorry', 'can\'t'],
      'gratitude': ['thanks', 'thank you', 'appreciate', 'grateful'],
      'questions': ['how', 'what', 'where', 'when', 'why', 'who', 'which'],
      'emotions': ['happy', 'sad', 'excited', 'worried', 'grateful', 'love', 'awesome']
    };

    // Check if input belongs to any semantic group
    for (const group in semanticGroups) {
      if (semanticGroups[group].some(word => input.includes(word))) {
        // Return suggestions from the same semantic group
        for (const category in this.database) {
          const patterns = this.database[category];
          for (const pattern in patterns) {
            if (semanticGroups[group].some(word => pattern.includes(word))) {
              suggestions.push(...patterns[pattern]);
            }
          }
        }
        break;
      }
    }

    return suggestions;
  }

  /**
   * Get context-aware suggestions based on conversation history
   */
  getContextAwareSuggestions(input, context) {
    const suggestions = [];
    
    // Analyze last few messages for context
    const recentMessages = context.slice(-5);
    const lastMessage = recentMessages[recentMessages.length - 1];
    
    if (!lastMessage) return suggestions;

    const lastText = lastMessage.text?.toLowerCase() || '';

    // If last message was a question, suggest answers
    if (lastText.includes('?')) {
      if (lastText.includes('how are') || lastText.includes('how\'s')) {
        suggestions.push('I\'m doing great, thanks!', 'Pretty good, how about you?', 'All good here!');
      } else if (lastText.includes('what') && lastText.includes('doing')) {
        suggestions.push('Just relaxing', 'Not much, you?', 'Working on some stuff');
      } else if (lastText.includes('want to') || lastText.includes('wanna')) {
        suggestions.push('Sure, sounds good!', 'Yeah, I\'d love to', 'Maybe, let me check');
      }
    }

    // If last message was a statement, suggest acknowledgments
    if (!lastText.includes('?')) {
      suggestions.push('That\'s great!', 'Nice!', 'Awesome!');
    }

    return suggestions;
  }

  /**
   * Get common conversation starters
   */
  getCommonStarters() {
    return [
      'Hey! How are you?',
      'Hi there! What\'s up?',
      'Hello! Good to hear from you'
    ];
  }
};

