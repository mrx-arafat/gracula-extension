// Conversation Pattern Recognition
// Detect activities, intents, and conversation types

window.Gracula = window.Gracula || {};
window.Gracula.Knowledge = window.Gracula.Knowledge || {};
window.Gracula.Knowledge.Patterns = window.Gracula.Knowledge.Patterns || {};

window.Gracula.Knowledge.Patterns.Conversation = {
  // Activity Patterns
  activities: {
    'setup_installation': {
      keywords: ['install', 'setup', 'configure', 'create', 'initialize', 'download', 'nisi', 'kore rakhsi', 'rakhtese'],
      indicators: ['local', 'vscode', 'vs code', 'git', 'npm', 'composer'],
      description: 'Setting up development environment or installing software',
      depth: 'medium',
      context: 'technical'
    },
    'problem_solving': {
      keywords: ['error', 'bug', 'issue', 'problem', 'fix', 'solve', 'help', 'kharap', 'problem'],
      indicators: ['not working', 'doesn\'t work', 'failed', 'broken', 'crash'],
      description: 'Troubleshooting or debugging issues',
      depth: 'deep',
      context: 'technical'
    },
    'status_check': {
      keywords: ['ki kortechen', 'ki korcho', 'kemon ache', 'how are you', 'what\'s up', 'kemon'],
      indicators: ['?', 'apnara', 'tumi', 'you'],
      description: 'Checking status or asking what someone is doing',
      depth: 'surface',
      context: 'social'
    },
    'completion_update': {
      keywords: ['done', 'finished', 'completed', 'kore felsi', 'kore rakhsi', 'hoyeche', 'sob'],
      indicators: ['already', 'just', 'finally', 'all set'],
      description: 'Reporting completion of a task',
      depth: 'surface',
      context: 'update'
    },
    'learning_discussion': {
      keywords: ['learn', 'learning', 'tutorial', 'course', 'study', 'practice', 'shikhchi', 'shikhbo'],
      indicators: ['how to', 'trying to', 'want to learn'],
      description: 'Learning or educational discussion',
      depth: 'medium',
      context: 'educational'
    },
    'planning': {
      keywords: ['will', 'going to', 'plan', 'planning', 'korbo', 'jabo', 'hobe'],
      indicators: ['tomorrow', 'next', 'later', 'kal', 'pore'],
      description: 'Making plans or discussing future actions',
      depth: 'surface',
      context: 'planning'
    },
    'collaboration': {
      keywords: ['together', 'we', 'us', 'team', 'amra', 'amader', 'shobai'],
      indicators: ['let\'s', 'should we', 'can we', 'korbo'],
      description: 'Collaborative work or group activity',
      depth: 'medium',
      context: 'teamwork'
    },
    'recommendation': {
      keywords: ['should', 'recommend', 'suggest', 'better', 'try', 'use', 'valo hobe'],
      indicators: ['i think', 'maybe', 'how about', 'what about'],
      description: 'Giving or asking for recommendations',
      depth: 'medium',
      context: 'advisory'
    },
    'casual_chat': {
      keywords: ['lol', 'haha', 'nice', 'cool', 'awesome', 'kop', 'bah', 'sundor'],
      indicators: ['😂', '😄', '😊', '👍', '❤️'],
      description: 'Casual friendly conversation',
      depth: 'surface',
      context: 'social'
    },
    'complaint_venting': {
      keywords: ['hate', 'annoying', 'frustrated', 'tired', 'uff', 'boring', 'kharap'],
      indicators: ['can\'t believe', 'so annoying', 'again', 'always'],
      description: 'Complaining or venting frustration',
      depth: 'medium',
      context: 'emotional'
    }
  },

  // Intent Patterns
  intents: {
    'asking_question': {
      indicators: ['?', 'ki', 'keno', 'kemon', 'kobe', 'kothay', 'what', 'why', 'how', 'when', 'where'],
      description: 'Asking a question',
      expectedResponse: 'answer'
    },
    'giving_answer': {
      indicators: ['because', 'karon', 'that\'s why', 'tahole', 'so'],
      description: 'Providing an answer or explanation',
      expectedResponse: 'acknowledgment'
    },
    'requesting_help': {
      indicators: ['help', 'can you', 'could you', 'please', 'parbe', 'ektu'],
      description: 'Asking for assistance',
      expectedResponse: 'offer_help'
    },
    'offering_help': {
      indicators: ['i can', 'let me', 'i\'ll help', 'ami parbo', 'korbo'],
      description: 'Offering assistance',
      expectedResponse: 'acceptance'
    },
    'agreeing': {
      indicators: ['yes', 'yeah', 'okay', 'sure', 'right', 'hae', 'thik', 'accha', 'kop'],
      description: 'Expressing agreement',
      expectedResponse: 'continuation'
    },
    'disagreeing': {
      indicators: ['no', 'nope', 'don\'t think', 'disagree', 'na', 'nai', 'hobena'],
      description: 'Expressing disagreement',
      expectedResponse: 'discussion'
    },
    'expressing_emotion': {
      indicators: ['love', 'hate', 'happy', 'sad', 'excited', 'angry', '😊', '😢', '😠', '❤️'],
      description: 'Sharing emotional state',
      expectedResponse: 'empathy'
    },
    'making_statement': {
      indicators: ['i think', 'in my opinion', 'amar mone hoy', 'ami mone kori'],
      description: 'Stating an opinion',
      expectedResponse: 'reaction'
    }
  },

  // Conversation Flow Patterns
  flows: {
    'quick_exchange': {
      characteristics: ['short messages', 'rapid responses', 'minimal words'],
      description: 'Fast-paced back-and-forth',
      tone: 'casual',
      depth: 'surface'
    },
    'detailed_discussion': {
      characteristics: ['long messages', 'explanations', 'multiple points'],
      description: 'In-depth conversation',
      tone: 'serious',
      depth: 'deep'
    },
    'question_answer': {
      characteristics: ['questions', 'answers', 'clarifications'],
      description: 'Q&A style conversation',
      tone: 'informative',
      depth: 'medium'
    },
    'storytelling': {
      characteristics: ['narrative', 'sequence of events', 'details'],
      description: 'Sharing a story or experience',
      tone: 'narrative',
      depth: 'medium'
    },
    'brainstorming': {
      characteristics: ['ideas', 'suggestions', 'possibilities'],
      description: 'Generating ideas together',
      tone: 'creative',
      depth: 'medium'
    }
  },

  // Topic Transition Indicators
  transitions: {
    'topic_change': ['anyway', 'btw', 'by the way', 'oh', 'arre', 'ar', 'tahole'],
    'topic_continuation': ['also', 'and', 'plus', 'ar', 'o', 'aro'],
    'topic_conclusion': ['so', 'therefore', 'that\'s why', 'tahole', 'tai'],
    'topic_return': ['back to', 'as i was saying', 'anyway', 'abar']
  },

  // Relationship Dynamics
  relationships: {
    'formal': {
      indicators: ['apni', 'apnara', 'sir', 'ma\'am', 'please', 'thank you'],
      tone: 'professional',
      style: 'polite'
    },
    'informal': {
      indicators: ['tumi', 'tomra', 'bro', 'dude', 'man', 'lol', 'haha'],
      tone: 'casual',
      style: 'friendly'
    },
    'close_friends': {
      indicators: ['inside jokes', 'nicknames', 'slang', 'emojis', 'kop', 'uff'],
      tone: 'intimate',
      style: 'relaxed'
    },
    'professional': {
      indicators: ['meeting', 'project', 'deadline', 'client', 'work'],
      tone: 'business',
      style: 'formal'
    }
  },

  // Urgency Levels
  urgency: {
    'high': {
      keywords: ['urgent', 'asap', 'immediately', 'now', 'quick', 'hurry', 'emergency', 'important'],
      indicators: ['!!!', '!!', 'please', 'need'],
      description: 'Requires immediate attention'
    },
    'medium': {
      keywords: ['soon', 'today', 'this week', 'when you can', 'aaj', 'ekhon'],
      indicators: ['?', 'can you', 'could you'],
      description: 'Needs attention but not urgent'
    },
    'low': {
      keywords: ['whenever', 'no rush', 'later', 'sometime', 'pore', 'jokhn'],
      indicators: ['if you want', 'maybe'],
      description: 'No time pressure'
    }
  },

  // Sentiment Patterns
  sentiment: {
    'very_positive': {
      keywords: ['amazing', 'awesome', 'excellent', 'perfect', 'love', 'best', 'kop', 'bah', 'darun'],
      emojis: ['😍', '🤩', '❤️', '🔥', '👏', '🎉'],
      score: 5
    },
    'positive': {
      keywords: ['good', 'nice', 'great', 'thanks', 'happy', 'valo', 'bhalo', 'sundor'],
      emojis: ['😊', '😄', '👍', '✨'],
      score: 3
    },
    'neutral': {
      keywords: ['okay', 'fine', 'alright', 'sure', 'thik', 'accha', 'hmm'],
      emojis: ['😐', '🤔'],
      score: 0
    },
    'negative': {
      keywords: ['bad', 'not good', 'problem', 'issue', 'sad', 'kharap', 'uff'],
      emojis: ['😞', '😢', '👎'],
      score: -3
    },
    'very_negative': {
      keywords: ['terrible', 'awful', 'hate', 'worst', 'angry', 'frustrated'],
      emojis: ['😠', '😡', '💔', '😤'],
      score: -5
    }
  }
};

