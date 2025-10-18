// Topic Analyzer
// Advanced topic understanding using domain knowledge and semantic analysis

window.Gracula = window.Gracula || {};

window.Gracula.TopicAnalyzer = class {
  constructor() {
    this.knowledge = window.Gracula.Knowledge || {};
    this.domains = this.knowledge.Domains || {};
    this.languages = this.knowledge.Languages || {};
    this.patterns = this.knowledge.Patterns || {};
  }

  /**
   * Analyze topics with enhanced intelligence
   * @param {Array} messages - Array of Message objects
   * @param {String} depth - 'surface', 'medium', 'deep', or 'auto'
   * @returns {Object} Enhanced topic analysis
   */
  analyze(messages, depth = 'auto') {
    if (!Array.isArray(messages) || messages.length === 0) {
      return this.getEmptyAnalysis();
    }

    // Determine analysis depth
    const analysisDepth = depth === 'auto' 
      ? this.determineOptimalDepth(messages)
      : depth;

    // Extract entities and concepts
    const entities = this.extractEntities(messages);
    
    // Detect activities and intents
    const activities = this.detectActivities(messages);
    
    // Understand language mixing
    const languageAnalysis = this.analyzeLanguageMixing(messages);
    
    // Build context understanding
    const contextUnderstanding = this.buildContextUnderstanding(
      messages, 
      entities, 
      activities, 
      languageAnalysis
    );
    
    // Generate smart summary
    const summary = this.generateSmartSummary(
      messages,
      entities,
      activities,
      contextUnderstanding,
      analysisDepth
    );

    return {
      depth: analysisDepth,
      entities,
      activities,
      languageAnalysis,
      contextUnderstanding,
      summary,
      mainTopics: this.extractMainTopics(entities, activities, contextUnderstanding),
      conversationType: this.determineConversationType(activities, contextUnderstanding),
      suggestedResponseType: this.suggestResponseType(messages, activities, contextUnderstanding)
    };
  }

  /**
   * Determine optimal analysis depth based on conversation complexity
   */
  determineOptimalDepth(messages) {
    const totalWords = messages.reduce((sum, msg) => {
      return sum + (msg.text || '').split(/\s+/).length;
    }, 0);
    
    const avgWordsPerMessage = totalWords / messages.length;
    const uniqueSpeakers = new Set(messages.map(m => m.speaker)).size;
    
    // Check for technical terms
    const technicalDensity = this.calculateTechnicalDensity(messages);
    
    // Deep analysis for complex technical discussions
    if (technicalDensity > 0.3 || avgWordsPerMessage > 20) {
      return 'deep';
    }
    
    // Medium for normal conversations
    if (avgWordsPerMessage > 8 || uniqueSpeakers > 2) {
      return 'medium';
    }
    
    // Surface for quick exchanges
    return 'surface';
  }

  /**
   * Calculate technical term density
   */
  calculateTechnicalDensity(messages) {
    const techDomain = this.domains.Technology || {};
    const allTechTerms = new Set();
    
    // Collect all technical terms
    Object.values(techDomain.tools || {}).forEach(tool => {
      allTechTerms.add(tool.name.toLowerCase());
      (tool.relatedTerms || []).forEach(term => allTechTerms.add(term.toLowerCase()));
    });
    
    Object.keys(techDomain.terms || {}).forEach(term => {
      allTechTerms.add(term.toLowerCase());
    });
    
    let techTermCount = 0;
    let totalWords = 0;
    
    messages.forEach(msg => {
      const words = (msg.text || '').toLowerCase().split(/\s+/);
      totalWords += words.length;
      
      words.forEach(word => {
        const cleanWord = word.replace(/[^a-z0-9]/g, '');
        if (allTechTerms.has(cleanWord)) {
          techTermCount++;
        }
      });
    });
    
    return totalWords > 0 ? techTermCount / totalWords : 0;
  }

  /**
   * Extract entities (tools, people, concepts) from messages
   */
  extractEntities(messages) {
    const entities = {
      tools: new Set(),
      technologies: new Set(),
      people: new Set(),
      concepts: new Set(),
      actions: new Set()
    };
    
    const techDomain = this.domains.Technology || {};
    
    messages.forEach(msg => {
      const text = (msg.text || '').toLowerCase();
      const words = text.split(/\s+/);
      
      // Extract tools
      Object.entries(techDomain.tools || {}).forEach(([key, tool]) => {
        if (text.includes(key) || text.includes(tool.name.toLowerCase())) {
          entities.tools.add(tool.name);
        }
        (tool.relatedTerms || []).forEach(term => {
          if (text.includes(term.toLowerCase())) {
            entities.tools.add(tool.name);
          }
        });
      });
      
      // Extract technologies
      Object.entries(techDomain.languages || {}).forEach(([key, lang]) => {
        if (text.includes(key) || text.includes(lang.name.toLowerCase())) {
          entities.technologies.add(lang.name);
        }
      });
      
      Object.entries(techDomain.frameworks || {}).forEach(([key, framework]) => {
        if (text.includes(key) || text.includes(framework.name.toLowerCase())) {
          entities.technologies.add(framework.name);
        }
      });
      
      // Extract people (speakers)
      if (msg.speaker && msg.speaker !== 'Unknown') {
        entities.people.add(msg.speaker);
      }
      
      // Extract actions
      Object.entries(techDomain.activities || {}).forEach(([activity, keywords]) => {
        keywords.forEach(keyword => {
          if (text.includes(keyword)) {
            entities.actions.add(activity);
          }
        });
      });
    });
    
    return {
      tools: Array.from(entities.tools),
      technologies: Array.from(entities.technologies),
      people: Array.from(entities.people),
      concepts: Array.from(entities.concepts),
      actions: Array.from(entities.actions)
    };
  }

  /**
   * Detect activities and conversation patterns
   */
  detectActivities(messages) {
    const conversationPatterns = this.patterns.Conversation || {};
    const activityPatterns = conversationPatterns.activities || {};
    
    const detectedActivities = [];
    const combinedText = messages.map(m => (m.text || '').toLowerCase()).join(' ');
    
    Object.entries(activityPatterns).forEach(([activityId, pattern]) => {
      let score = 0;
      let matchedKeywords = [];
      let matchedIndicators = [];
      
      // Check keywords
      (pattern.keywords || []).forEach(keyword => {
        if (combinedText.includes(keyword.toLowerCase())) {
          score += 2;
          matchedKeywords.push(keyword);
        }
      });
      
      // Check indicators
      (pattern.indicators || []).forEach(indicator => {
        if (combinedText.includes(indicator.toLowerCase())) {
          score += 1;
          matchedIndicators.push(indicator);
        }
      });
      
      if (score > 0) {
        detectedActivities.push({
          id: activityId,
          name: activityId.replace(/_/g, ' '),
          description: pattern.description,
          confidence: score > 5 ? 'high' : score > 2 ? 'medium' : 'low',
          depth: pattern.depth,
          context: pattern.context,
          matchedKeywords,
          matchedIndicators,
          score
        });
      }
    });
    
    // Sort by score
    detectedActivities.sort((a, b) => b.score - a.score);
    
    return detectedActivities;
  }

  /**
   * Analyze language mixing (Bangla/English) - ENHANCED
   */
  analyzeLanguageMixing(messages) {
    const banglaKnowledge = this.languages.Bangla || {};
    const allBanglaWords = new Set();
    const allBanglaPhrases = new Set();

    // Collect all Bangla words
    Object.keys(banglaKnowledge.verbs || {}).forEach(word => allBanglaWords.add(word));
    Object.keys(banglaKnowledge.pronouns || {}).forEach(word => allBanglaWords.add(word));
    Object.keys(banglaKnowledge.questionWords || {}).forEach(word => {
      allBanglaWords.add(word);
      // Also add as phrase if it contains spaces
      if (word.includes(' ')) {
        allBanglaPhrases.add(word);
      }
    });
    Object.keys(banglaKnowledge.slang || {}).forEach(word => {
      allBanglaWords.add(word);
      if (word.includes(' ')) {
        allBanglaPhrases.add(word);
      }
    });
    Object.keys(banglaKnowledge.adjectives || {}).forEach(word => allBanglaWords.add(word));
    Object.keys(banglaKnowledge.time || {}).forEach(word => allBanglaWords.add(word));
    Object.keys(banglaKnowledge.places || {}).forEach(word => allBanglaWords.add(word));

    let banglaWordCount = 0;
    let englishWordCount = 0;
    let totalWords = 0;
    const detectedBanglaWords = [];
    const detectedBanglaPhrases = [];
    let intimacyLevel = 'neutral';
    let maxIntimacy = 0;

    const combinedText = messages.map(m => (m.text || '').toLowerCase()).join(' ');

    // Check for phrases first
    allBanglaPhrases.forEach(phrase => {
      if (combinedText.includes(phrase)) {
        detectedBanglaPhrases.push(phrase);
        banglaWordCount += phrase.split(' ').length;
      }
    });

    messages.forEach(msg => {
      const words = (msg.text || '').toLowerCase().split(/\s+/);

      words.forEach(word => {
        const cleanWord = word.replace(/[^a-z]/g, '');
        if (!cleanWord) return;

        totalWords++;

        if (allBanglaWords.has(cleanWord)) {
          banglaWordCount++;
          if (!detectedBanglaWords.includes(cleanWord)) {
            detectedBanglaWords.push(cleanWord);
          }

          // Check intimacy level
          const slangInfo = banglaKnowledge.slang?.[cleanWord];
          if (slangInfo && slangInfo.intimacy) {
            const intimacyMap = { 'very_high': 4, 'high': 3, 'medium': 2, 'low': 1 };
            const intimacyScore = intimacyMap[slangInfo.intimacy] || 0;
            if (intimacyScore > maxIntimacy) {
              maxIntimacy = intimacyScore;
              intimacyLevel = slangInfo.intimacy;
            }
          }
        } else if (/^[a-z]+$/.test(cleanWord)) {
          englishWordCount++;
        }
      });
    });

    const banglaPercentage = totalWords > 0 ? (banglaWordCount / totalWords) * 100 : 0;
    const englishPercentage = totalWords > 0 ? (englishWordCount / totalWords) * 100 : 0;

    let mixingLevel = 'none';
    if (banglaPercentage > 10 && englishPercentage > 10) {
      mixingLevel = 'heavy';
    } else if (banglaPercentage > 5 || englishPercentage > 5) {
      mixingLevel = 'moderate';
    } else if (banglaPercentage > 0 && englishPercentage > 0) {
      mixingLevel = 'light';
    }

    // Determine relationship intimacy
    let relationshipType = 'neutral';
    const relationshipMarkers = banglaKnowledge.relationshipMarkers || {};

    Object.entries(relationshipMarkers).forEach(([type, marker]) => {
      const indicators = marker.indicators || [];
      const hasIndicator = indicators.some(ind => detectedBanglaWords.includes(ind));
      if (hasIndicator) {
        relationshipType = type;
      }
    });

    return {
      mixingLevel,
      banglaPercentage: Math.round(banglaPercentage),
      englishPercentage: Math.round(englishPercentage),
      detectedBanglaWords: detectedBanglaWords.slice(0, 15),
      detectedBanglaPhrases: detectedBanglaPhrases.slice(0, 5),
      primaryLanguage: banglaPercentage > englishPercentage ? 'Bangla' : 'English',
      intimacyLevel,
      relationshipType
    };
  }

  /**
   * Build context understanding - ENHANCED with Bangla topics
   */
  buildContextUnderstanding(messages, entities, activities, languageAnalysis) {
    // Determine primary context
    const contexts = {
      technical: 0,
      social: 0,
      work: 0,
      emotional: 0,
      personal: 0
    };

    const banglaKnowledge = this.languages.Bangla || {};
    const banglaTopics = banglaKnowledge.topics || {};
    const combinedText = messages.map(m => (m.text || '').toLowerCase()).join(' ');

    // Detect Bangla-specific topics
    const detectedTopics = [];
    Object.entries(banglaTopics).forEach(([topicId, topic]) => {
      let score = 0;

      (topic.keywords || []).forEach(keyword => {
        if (combinedText.includes(keyword.toLowerCase())) {
          score += 2;
        }
      });

      (topic.indicators || []).forEach(indicator => {
        if (combinedText.includes(indicator.toLowerCase())) {
          score += 1;
        }
      });

      if (score > 0) {
        detectedTopics.push({
          id: topicId,
          description: topic.description,
          context: topic.context,
          score
        });

        // Add to context scores
        if (topic.context === 'personal') contexts.personal += score;
        if (topic.context === 'social') contexts.social += score;
        if (topic.context === 'professional') contexts.work += score;
      }
    });

    // Score based on entities
    if (entities.tools.length > 0 || entities.technologies.length > 0) {
      contexts.technical += entities.tools.length + entities.technologies.length;
    }

    // Score based on activities
    activities.forEach(activity => {
      if (activity.context === 'technical') contexts.technical += 2;
      if (activity.context === 'social') contexts.social += 2;
      if (activity.context === 'teamwork') contexts.work += 2;
      if (activity.context === 'emotional') contexts.emotional += 2;
    });

    // Score based on relationship intimacy
    if (languageAnalysis.relationshipType === 'very_close') {
      contexts.social += 3;
      contexts.personal += 2;
    } else if (languageAnalysis.relationshipType === 'close') {
      contexts.social += 2;
    }

    // Determine primary context
    let primaryContext = 'general';
    let maxScore = 0;

    Object.entries(contexts).forEach(([context, score]) => {
      if (score > maxScore) {
        maxScore = score;
        primaryContext = context;
      }
    });

    return {
      primaryContext,
      contextScores: contexts,
      confidence: maxScore > 5 ? 'high' : maxScore > 2 ? 'medium' : 'low',
      detectedTopics: detectedTopics.sort((a, b) => b.score - a.score)
    };
  }

  /**
   * Extract main topics from analysis
   */
  extractMainTopics(entities, activities, contextUnderstanding) {
    const topics = [];

    // Add tool/technology topics
    entities.tools.forEach(tool => {
      topics.push({ type: 'tool', name: tool, relevance: 'high' });
    });

    entities.technologies.forEach(tech => {
      topics.push({ type: 'technology', name: tech, relevance: 'high' });
    });

    // Add activity topics
    if (activities.length > 0) {
      const topActivity = activities[0];
      topics.push({
        type: 'activity',
        name: topActivity.name,
        relevance: topActivity.confidence
      });
    }

    // Add context topic
    if (contextUnderstanding.primaryContext !== 'general') {
      topics.push({
        type: 'context',
        name: contextUnderstanding.primaryContext,
        relevance: contextUnderstanding.confidence
      });
    }

    return topics;
  }

  /**
   * Determine conversation type
   */
  determineConversationType(activities, contextUnderstanding) {
    if (activities.length === 0) {
      return 'casual_chat';
    }

    const topActivity = activities[0];

    if (contextUnderstanding.primaryContext === 'technical') {
      return 'technical_discussion';
    }

    if (topActivity.context === 'social') {
      return 'social_conversation';
    }

    if (topActivity.context === 'teamwork') {
      return 'work_collaboration';
    }

    if (topActivity.context === 'emotional') {
      return 'emotional_exchange';
    }

    return 'general_conversation';
  }

  /**
   * Suggest appropriate response type
   */
  suggestResponseType(messages, activities, contextUnderstanding) {
    if (messages.length === 0) {
      return 'general';
    }

    const lastMessage = messages[messages.length - 1];
    const lastText = (lastMessage.text || '').toLowerCase();

    // Check if last message is a question
    if (lastText.includes('?') || lastText.includes('ki ') || lastText.includes('kemon')) {
      return 'answer_question';
    }

    // Check if it's a status update
    if (activities.some(a => a.id === 'completion_update')) {
      return 'acknowledge_completion';
    }

    // Check if it's a problem
    if (activities.some(a => a.id === 'problem_solving')) {
      return 'offer_help';
    }

    // Check if it's casual
    if (contextUnderstanding.primaryContext === 'social') {
      return 'casual_response';
    }

    // Check if technical
    if (contextUnderstanding.primaryContext === 'technical') {
      return 'technical_response';
    }

    return 'general_response';
  }

  /**
   * Generate smart summary - ENHANCED with relationship context
   */
  generateSmartSummary(messages, entities, activities, contextUnderstanding, depth) {
    const parts = [];
    const banglaKnowledge = this.languages.Bangla || {};

    // Get language analysis from the analyze method
    const languageAnalysis = this.analyzeLanguageMixing(messages);

    // Relationship context (for very close friends)
    if (languageAnalysis.relationshipType === 'very_close') {
      parts.push('Casual friend conversation');
    } else if (languageAnalysis.relationshipType === 'close') {
      parts.push('Friendly conversation');
    } else if (contextUnderstanding.primaryContext !== 'general') {
      parts.push(`${this.capitalizeFirst(contextUnderstanding.primaryContext)} conversation`);
    }

    // Bangla-specific topics
    if (contextUnderstanding.detectedTopics && contextUnderstanding.detectedTopics.length > 0) {
      const topTopic = contextUnderstanding.detectedTopics[0];
      parts.push(`- ${topTopic.description.toLowerCase()}`);
    }
    // Activity description
    else if (activities.length > 0) {
      const topActivity = activities[0];
      parts.push(`about ${topActivity.description.toLowerCase()}`);
    }

    // Entity details (for medium/deep analysis)
    if (depth === 'medium' || depth === 'deep') {
      if (entities.tools.length > 0) {
        parts.push(`involving ${entities.tools.join(', ')}`);
      }

      if (entities.people.length > 1) {
        const peopleList = entities.people.filter(p => p !== 'You').slice(0, 3);
        if (peopleList.length > 0) {
          parts.push(`with ${peopleList.join(', ')}`);
        }
      }
    }

    // Deep analysis details
    if (depth === 'deep' && activities.length > 0) {
      const topActivity = activities[0];
      if (topActivity.matchedKeywords.length > 0) {
        const keywords = topActivity.matchedKeywords.slice(0, 3).join(', ');
        parts.push(`(key terms: ${keywords})`);
      }
    }

    if (parts.length === 0) {
      return 'General conversation';
    }

    return this.capitalizeFirst(parts.join(' '));
  }

  /**
   * Capitalize first letter
   */
  capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getEmptyAnalysis() {
    return {
      depth: 'surface',
      entities: { tools: [], technologies: [], people: [], concepts: [], actions: [] },
      activities: [],
      languageAnalysis: { mixingLevel: 'none', banglaPercentage: 0, englishPercentage: 0 },
      contextUnderstanding: { primaryContext: 'general', contextScores: {}, confidence: 'low' },
      summary: 'No messages to analyze',
      mainTopics: [],
      conversationType: 'unknown',
      suggestedResponseType: 'general'
    };
  }
};

