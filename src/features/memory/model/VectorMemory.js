// Vector Memory Manager
// Orchestrates embedding generation, storage, and retrieval

window.Gracula = window.Gracula || {};
window.Gracula.Memory = window.Gracula.Memory || {};

window.Gracula.Memory.VectorMemory = class VectorMemory {
  constructor(supabaseUrl, supabaseKey) {
    this.supabaseClient = new window.Gracula.Supabase.Client(supabaseUrl, supabaseKey);
    this.vectorStore = new window.Gracula.Memory.VectorStore(this.supabaseClient);
    this.embeddingService = new window.Gracula.Memory.EmbeddingService();
    this.isInitialized = !!(supabaseUrl && supabaseKey);
  }

  /**
   * Initialize with credentials if not provided in constructor
   */
  async init(url, key) {
    if (url && key) {
      this.supabaseClient = new window.Gracula.Supabase.Client(url, key);
      this.vectorStore = new window.Gracula.Memory.VectorStore(this.supabaseClient);
      
      // Ensure we are authenticated (anonymous auth)
      try {
        await this.supabaseClient.auth.signInAnonymously();
        this.isInitialized = true;
        console.log('✅ VectorMemory initialized with anonymous auth');
      } catch (error) {
        console.error('❌ Failed to sign in anonymously to Supabase:', error);
        this.isInitialized = false;
      }
    }
  }

  /**
   * Process and store a conversation
   * @param {object} context Extracted context object
   */
  async processConversation(context) {
    if (!this.isInitialized) {
      // Try to initialize if credentials are available in global config
      // This is a fallback if init() wasn't called explicitly
      const config = window.Gracula.Config?.API_CONFIG; // This might not be populated in content script context directly
      // Better to rely on explicit init() call from ContextExtractor
      console.warn('VectorMemory not initialized (auth missing)');
      return;
    }

    if (!context || !context.messages || context.messages.length === 0) {
      return;
    }

    try {
      // 1. Identify conversation
      const platform = context.platform || 'unknown';
      const contactName = this._extractContactName(context);
      
      if (!contactName) {
        console.warn('Could not identify contact name for memory storage');
        return;
      }

      // 2. Store/Get conversation record
      const conversation = await this.vectorStore.storeConversation({
        platform,
        contactName,
        contactId: context.contactId || null,
        metadata: {
          last_interaction: new Date().toISOString()
        }
      });

      if (!conversation) {
        throw new Error('Failed to store conversation record');
      }

      // 3. Filter new messages that need embedding
      // For now, we'll just process the last few messages to ensure we have recent context
      // In a real production system, we'd check which IDs already exist
      const messagesToProcess = context.messages.slice(-10); // Process last 10 messages

      // 4. Generate embeddings
      const texts = messagesToProcess.map(msg => msg.text);
      const embeddings = await this.embeddingService.generateEmbeddingsBatch(texts);

      // 5. Prepare records
      const messagesWithEmbeddings = messagesToProcess.map((msg, index) => ({
        ...msg,
        embedding: embeddings[index],
        // Explicitly ensure metadata contains speaker info for debugging
        metadata: {
          ...msg.metadata,
          speaker: msg.speaker,
          isOutgoing: msg.isOutgoing
        }
      })).filter(msg => msg.embedding); // Filter out failed embeddings

      // 6. Store embeddings
      if (messagesWithEmbeddings.length > 0) {
        await this.vectorStore.storeMessageEmbeddings(conversation.id, messagesWithEmbeddings);
        console.log(`✅ [MEMORY DEBUG] Stored ${messagesWithEmbeddings.length} message embeddings for ${contactName}`);
        // Log a sample to verify structure
        if (messagesWithEmbeddings.length > 0) {
          const sample = messagesWithEmbeddings[0];
          console.log('🔍 [MEMORY DEBUG] Sample stored message:', {
            text: sample.text,
            speaker: sample.speaker,
            isOutgoing: sample.isOutgoing,
            hasEmbedding: !!sample.embedding
          });
        }
      }

    } catch (error) {
      console.error('Error processing conversation for memory:', error);
    }
  }

  /**
   * Retrieve relevant context for a query
   * @param {string} query Text to search for
   * @param {object} options Search options
   */
  async retrieveContext(query, options = {}) {
    if (!this.isInitialized) return [];

    try {
      // 1. Generate query embedding
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);

      // 2. Search vector store
      const results = await this.vectorStore.searchSimilarMessages(queryEmbedding, options);

      return results;
    } catch (error) {
      console.error('Error retrieving context:', error);
      return [];
    }
  }

  _extractContactName(context) {
    // Try to find the other person's name
    if (context.summary && (context.summary.lastFriendSpeaker || context.summary.lastSpeaker)) {
      return context.summary.lastFriendSpeaker || context.summary.lastSpeaker;
    }
    
    // Fallback: look at messages
    const friendMsg = context.messages.find(m => !m.isOutgoing && m.speaker !== 'You');
    return friendMsg ? friendMsg.speaker : 'Unknown';
  }

  /**
   * Delete a conversation from memory
   * @param {string} platform
   * @param {string} contactName
   */
  async deleteConversation(platform, contactName) {
    if (!this.isInitialized) return;

    try {
      const conversation = await this.vectorStore.getConversation(platform, contactName);
      if (conversation) {
        await this.vectorStore.deleteConversation(conversation.id);
        console.log(`🗑️ Deleted conversation with ${contactName}`);
      } else {
        console.warn(`⚠️ Conversation with ${contactName} not found`);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }
};