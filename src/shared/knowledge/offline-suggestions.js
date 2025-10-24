// Offline Suggestion System
// Context-aware pattern-based suggestions without API calls

window.Gracula = window.Gracula || {};
window.Gracula.OfflineSuggestions = window.Gracula.OfflineSuggestions || {};

/**
 * Offline Suggestion Database
 * Organized by patterns, context, and common phrases
 */
window.Gracula.OfflineSuggestions.DATABASE = {
  // Greeting patterns
  greetings: {
    'hello': [
      'Hello! How are you?',
      'Hello there! What\'s up?',
      'Hello! Good to hear from you'
    ],
    'hi': [
      'Hi! How are you doing?',
      'Hi there! What\'s going on?',
      'Hi! Hope you\'re doing well'
    ],
    'hey': [
      'Hey! How\'s it going?',
      'Hey there! What\'s up?',
      'Hey! Long time no see'
    ],
    'good morning': [
      'Good morning! Hope you have a great day',
      'Good morning! How did you sleep?',
      'Good morning! Ready for the day?'
    ],
    'good afternoon': [
      'Good afternoon! How\'s your day going?',
      'Good afternoon! Hope you\'re having a good one',
      'Good afternoon! What have you been up to?'
    ],
    'good evening': [
      'Good evening! How was your day?',
      'Good evening! Hope you had a good day',
      'Good evening! What are you up to tonight?'
    ]
  },

  // Question patterns
  questions: {
    'how are': [
      'How are you doing?',
      'How are things going?',
      'How are you feeling today?'
    ],
    'what are': [
      'What are you up to?',
      'What are you doing?',
      'What are your plans?'
    ],
    'where are': [
      'Where are you right now?',
      'Where are you heading?',
      'Where are you going?'
    ],
    'when are': [
      'When are you free?',
      'When are you available?',
      'When are you coming?'
    ],
    'why': [
      'Why do you ask?',
      'Why not?',
      'Why is that?'
    ],
    'can you': [
      'Can you help me with something?',
      'Can you do me a favor?',
      'Can you let me know?'
    ],
    'do you': [
      'Do you have time?',
      'Do you want to hang out?',
      'Do you know what I mean?'
    ]
  },

  // Response patterns
  responses: {
    'yes': [
      'Yes, definitely!',
      'Yes, sounds good!',
      'Yes, I\'m in!'
    ],
    'no': [
      'No, sorry',
      'No, I can\'t',
      'No, not really'
    ],
    'maybe': [
      'Maybe, let me check',
      'Maybe, I\'ll let you know',
      'Maybe, not sure yet'
    ],
    'sure': [
      'Sure, no problem!',
      'Sure, I\'d love to',
      'Sure thing!'
    ],
    'okay': [
      'Okay, sounds good',
      'Okay, got it',
      'Okay, thanks!'
    ],
    'thanks': [
      'Thanks so much!',
      'Thanks, I appreciate it',
      'Thanks a lot!'
    ],
    'thank you': [
      'Thank you so much!',
      'Thank you, I really appreciate it',
      'Thank you very much!'
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
   * Find suggestions based on input text
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

    // 3. Check partial matches (starts with)
    if (suggestions.length < 3) {
      for (const category in this.database) {
        const patterns = this.database[category];
        for (const pattern in patterns) {
          if (pattern.startsWith(lowerInput) || lowerInput.startsWith(pattern)) {
            suggestions.push(...patterns[pattern]);
          }
        }
      }
    }

    // 4. Context-aware suggestions
    if (context && context.length > 0 && suggestions.length < 3) {
      const contextSuggestions = this.getContextAwareSuggestions(input, context);
      suggestions.push(...contextSuggestions);
    }

    // Remove duplicates and return top 3
    return [...new Set(suggestions)].slice(0, 3);
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

