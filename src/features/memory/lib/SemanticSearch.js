// Semantic Search Utility
// Helper for performing semantic searches over conversation history

window.Gracula = window.Gracula || {};
window.Gracula.Memory = window.Gracula.Memory || {};

window.Gracula.Memory.SemanticSearch = class SemanticSearch {
  constructor(vectorMemory) {
    this.vectorMemory = vectorMemory;
  }

  /**
   * Find relevant past messages for the current context
   * @param {object} currentContext 
   * @param {number} limit 
   */
  async findRelevantContext(currentContext, limit = 5) {
    if (!this.vectorMemory || !this.vectorMemory.isInitialized) {
      return [];
    }

    // Construct a query from the current context
    // We want to find messages similar to what's being discussed now
    const query = this._constructQuery(currentContext);
    
    if (!query) return [];

    console.log('🔍 Semantic Search Query:', query);

    // Identify current contact to prioritize their history
    const contactName = this._extractContactName(currentContext);
    const platform = currentContext.platform?.name || 'unknown';
    let conversationId = null;

    if (contactName) {
      try {
        const conversation = await this.vectorMemory.vectorStore.getConversation(platform, contactName);
        if (conversation) {
          conversationId = conversation.id;
        }
      } catch (e) {
        console.warn('Failed to get conversation ID for filtering:', e);
      }
    }

    // Perform search
    // Strategy:
    // 1. Try to find highly relevant messages from THIS contact first
    // 2. If not enough, fall back to global search (optional, but good for general tone)
    
    let results = [];

    if (conversationId) {
      console.log(`🔍 Searching context for contact: ${contactName} (${conversationId})`);
      results = await this.vectorMemory.retrieveContext(query, {
        matchCount: limit,
        matchThreshold: 0.75,
        filter: { conversationId }
      });
    }

    // If we didn't get enough results from this contact, try global search
    if (results.length < limit) {
      console.log('🔍 Expanding search to global context...');
      const globalResults = await this.vectorMemory.retrieveContext(query, {
        matchCount: limit - results.length,
        matchThreshold: 0.80 // Higher threshold for global to ensure high relevance
      });
      
      // Merge unique results
      const existingIds = new Set(results.map(r => r.id));
      for (const res of globalResults) {
        if (!existingIds.has(res.id)) {
          results.push(res);
          existingIds.add(res.id);
        }
      }
    }

    // Filter out messages from the current session (if IDs match)
    const currentIds = new Set(currentContext.messages.map(m => m.id));
    const filtered = results.filter(r => !currentIds.has(r.id));

    return filtered;
  }

  _extractContactName(context) {
    if (context.summary && (context.summary.lastFriendSpeaker || context.summary.lastSpeaker)) {
      return context.summary.lastFriendSpeaker || context.summary.lastSpeaker;
    }
    const friendMsg = context.messages.find(m => !m.isOutgoing && m.speaker !== 'You');
    return friendMsg ? friendMsg.speaker : null;
  }

  /**
   * Construct a search query from context
   * @param {object} context 
   */
  _constructQuery(context) {
    // 1. Identify the last message from the OTHER person (what we are replying to)
    // This is critical for finding how the user responded to similar situations in the past
    const lastFriendMessage = context.messages.slice().reverse().find(m => !m.isOutgoing && m.speaker !== 'You');
    
    // 2. Identify the user's last message (to capture current thread/tone)
    const lastUserMessage = context.messages.slice().reverse().find(m => m.isOutgoing || m.speaker === 'You');

    if (!lastFriendMessage && !lastUserMessage) return null;

    let queryParts = [];

    // Priority 1: The message we are replying to (Context)
    if (lastFriendMessage) {
      queryParts.push(`Friend: ${lastFriendMessage.text}`);
    }

    // Priority 2: Our own last message (Continuity)
    if (lastUserMessage) {
      queryParts.push(`Me: ${lastUserMessage.text}`);
    }

    // Priority 3: Topic (Contextual grounding)
    const topic = context.analysis?.topicAnalysis?.summary;
    if (topic && topic !== 'None') {
      queryParts.unshift(`Topic: ${topic}`);
    }

    const query = queryParts.join(' | ');
    
    // DEBUG: Log the constructed query to help diagnose RAG issues
    console.log('🔍 [SEMANTIC SEARCH DEBUG] Constructed Query:', query);
    console.log('🔍 [SEMANTIC SEARCH DEBUG] Context Inputs:', {
      lastFriend: lastFriendMessage?.text,
      lastUser: lastUserMessage?.text,
      topic
    });

    return query;
  }
};