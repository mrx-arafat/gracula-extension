// Semantic Grouping
// Related concepts and topic clustering

window.Gracula = window.Gracula || {};
window.Gracula.Knowledge = window.Gracula.Knowledge || {};
window.Gracula.Knowledge.Patterns = window.Gracula.Knowledge.Patterns || {};

window.Gracula.Knowledge.Patterns.Semantic = {
  // Technology Clusters
  technology: {
    'web_development': {
      core: ['html', 'css', 'javascript', 'react', 'vue', 'angular', 'nextjs'],
      tools: ['vscode', 'git', 'npm', 'webpack', 'babel'],
      concepts: ['frontend', 'backend', 'fullstack', 'responsive', 'api'],
      activities: ['coding', 'developing', 'building', 'deploying']
    },
    'wordpress_development': {
      core: ['wordpress', 'php', 'mysql', 'theme', 'plugin'],
      tools: ['local', 'woocommerce', 'elementor', 'acf'],
      concepts: ['cms', 'content', 'posts', 'pages', 'customization'],
      activities: ['setup', 'install', 'configure', 'customize']
    },
    'backend_development': {
      core: ['php', 'python', 'node', 'java', 'ruby'],
      tools: ['laravel', 'django', 'express', 'spring'],
      concepts: ['api', 'database', 'server', 'authentication', 'authorization'],
      activities: ['building', 'deploying', 'testing', 'debugging']
    },
    'devops': {
      core: ['docker', 'kubernetes', 'ci/cd', 'jenkins', 'github actions'],
      tools: ['aws', 'azure', 'gcp', 'terraform', 'ansible'],
      concepts: ['deployment', 'automation', 'monitoring', 'scaling'],
      activities: ['deploying', 'configuring', 'monitoring', 'optimizing']
    },
    'mobile_development': {
      core: ['react native', 'flutter', 'swift', 'kotlin', 'android', 'ios'],
      tools: ['xcode', 'android studio', 'expo'],
      concepts: ['app', 'mobile', 'native', 'cross-platform'],
      activities: ['developing', 'testing', 'publishing']
    }
  },

  // Work & Business Clusters
  business: {
    'project_management': {
      core: ['project', 'task', 'deadline', 'milestone', 'sprint'],
      tools: ['jira', 'trello', 'asana', 'notion', 'slack'],
      concepts: ['planning', 'tracking', 'collaboration', 'agile', 'scrum'],
      activities: ['planning', 'organizing', 'tracking', 'reviewing']
    },
    'client_work': {
      core: ['client', 'customer', 'requirement', 'feedback', 'delivery'],
      tools: ['email', 'zoom', 'meet', 'calendar'],
      concepts: ['communication', 'expectation', 'satisfaction', 'payment'],
      activities: ['discussing', 'presenting', 'delivering', 'revising']
    },
    'freelancing': {
      core: ['freelance', 'gig', 'contract', 'rate', 'invoice'],
      tools: ['upwork', 'fiverr', 'freelancer', 'paypal'],
      concepts: ['bidding', 'proposal', 'portfolio', 'review'],
      activities: ['applying', 'negotiating', 'delivering', 'invoicing']
    }
  },

  // Social & Personal Clusters
  social: {
    'casual_conversation': {
      core: ['chat', 'talk', 'conversation', 'gossip'],
      expressions: ['lol', 'haha', 'omg', 'wow', 'nice', 'cool'],
      topics: ['weather', 'food', 'movies', 'music', 'games'],
      activities: ['chatting', 'sharing', 'joking', 'laughing']
    },
    'making_plans': {
      core: ['plan', 'meet', 'hangout', 'party', 'event'],
      details: ['time', 'place', 'date', 'location', 'when', 'where'],
      activities: ['planning', 'scheduling', 'confirming', 'coordinating']
    },
    'relationships': {
      core: ['friend', 'family', 'relationship', 'love', 'dating'],
      emotions: ['happy', 'sad', 'angry', 'excited', 'worried'],
      activities: ['talking', 'sharing', 'supporting', 'advising']
    },
    'entertainment': {
      core: ['movie', 'show', 'series', 'game', 'music', 'book'],
      platforms: ['netflix', 'youtube', 'spotify', 'steam'],
      activities: ['watching', 'playing', 'listening', 'reading']
    }
  },

  // Education & Learning Clusters
  education: {
    'learning': {
      core: ['learn', 'study', 'course', 'tutorial', 'lesson'],
      resources: ['book', 'video', 'documentation', 'guide', 'example'],
      concepts: ['practice', 'exercise', 'assignment', 'project'],
      activities: ['learning', 'studying', 'practicing', 'understanding']
    },
    'teaching': {
      core: ['teach', 'explain', 'show', 'demonstrate', 'guide'],
      methods: ['example', 'tutorial', 'walkthrough', 'demo'],
      activities: ['teaching', 'explaining', 'helping', 'mentoring']
    }
  },

  // Problem & Solution Clusters
  problemSolving: {
    'technical_issues': {
      problems: ['error', 'bug', 'issue', 'problem', 'crash', 'fail'],
      solutions: ['fix', 'solve', 'debug', 'troubleshoot', 'resolve'],
      activities: ['debugging', 'fixing', 'testing', 'investigating']
    },
    'help_seeking': {
      requests: ['help', 'assist', 'support', 'guide', 'advice'],
      responses: ['sure', 'let me help', 'i can', 'try this'],
      activities: ['asking', 'helping', 'supporting', 'guiding']
    }
  },

  // Emotional Clusters
  emotions: {
    'positive_emotions': {
      feelings: ['happy', 'excited', 'love', 'joy', 'grateful', 'proud'],
      expressions: ['yay', 'awesome', 'great', 'amazing', 'perfect', 'kop', 'bah'],
      emojis: ['😊', '😄', '🤩', '❤️', '🎉', '👏']
    },
    'negative_emotions': {
      feelings: ['sad', 'angry', 'frustrated', 'tired', 'worried', 'stressed'],
      expressions: ['ugh', 'uff', 'damn', 'hate', 'annoying', 'terrible'],
      emojis: ['😢', '😠', '😞', '😤', '😩', '💔']
    },
    'neutral_emotions': {
      feelings: ['okay', 'fine', 'alright', 'meh', 'whatever'],
      expressions: ['hmm', 'okay', 'sure', 'i guess', 'thik'],
      emojis: ['😐', '🤔', '😶']
    }
  },

  // Activity Clusters
  activities: {
    'installation_setup': {
      actions: ['install', 'setup', 'configure', 'initialize', 'create'],
      objects: ['software', 'tool', 'environment', 'system', 'application'],
      outcomes: ['installed', 'configured', 'ready', 'done', 'complete']
    },
    'development_work': {
      actions: ['code', 'develop', 'build', 'create', 'implement'],
      objects: ['feature', 'function', 'component', 'module', 'api'],
      outcomes: ['working', 'completed', 'deployed', 'tested', 'released']
    },
    'learning_progress': {
      actions: ['learn', 'study', 'practice', 'understand', 'master'],
      objects: ['language', 'framework', 'concept', 'skill', 'technology'],
      outcomes: ['learned', 'understood', 'mastered', 'improved', 'progressed']
    }
  },

  // Context Indicators
  contextIndicators: {
    'technical_context': {
      strong: ['code', 'programming', 'development', 'software', 'system'],
      medium: ['install', 'setup', 'configure', 'tool', 'application'],
      weak: ['computer', 'internet', 'online', 'digital']
    },
    'social_context': {
      strong: ['friend', 'family', 'relationship', 'party', 'hangout'],
      medium: ['chat', 'talk', 'meet', 'conversation'],
      weak: ['people', 'person', 'someone']
    },
    'work_context': {
      strong: ['project', 'client', 'deadline', 'meeting', 'work'],
      medium: ['task', 'job', 'assignment', 'business'],
      weak: ['office', 'team', 'colleague']
    },
    'emotional_context': {
      strong: ['love', 'hate', 'angry', 'happy', 'sad', 'excited'],
      medium: ['feel', 'feeling', 'emotion', 'mood'],
      weak: ['think', 'believe', 'opinion']
    }
  }
};

