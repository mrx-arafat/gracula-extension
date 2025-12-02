// Vector Store
// Handles storage and retrieval of vectors from Supabase

window.Gracula = window.Gracula || {};
window.Gracula.Memory = window.Gracula.Memory || {};

window.Gracula.Memory.VectorStore = class VectorStore {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Store a conversation session
   * @param {object} conversation 
   */
  async storeConversation(conversation) {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('conversations')
      .upsert({
        platform: conversation.platform,
        contact_name: conversation.contactName,
        contact_id: conversation.contactId,
        updated_at: new Date().toISOString(),
        metadata: conversation.metadata || {}
      }, { onConflict: 'platform,contact_name' }); // Assuming unique constraint on platform+contact

    if (error) throw error;
    return data ? data[0] : null;
  }

  /**
   * Store message embeddings
   * @param {string} conversationId 
   * @param {object[]} messagesWithEmbeddings 
   */
  async storeMessageEmbeddings(conversationId, messagesWithEmbeddings) {
    if (!this.supabase || !messagesWithEmbeddings.length) return;

    const records = messagesWithEmbeddings.map(msg => ({
      conversation_id: conversationId,
      content: msg.text,
      speaker: msg.speaker,
      embedding: msg.embedding,
      timestamp: msg.timestamp,
      metadata: msg.metadata || {}
    }));

    const { error } = await this.supabase
      .from('message_embeddings')
      .insert(records);

    if (error) throw error;
  }

  /**
   * Search for similar messages
   * @param {number[]} queryEmbedding 
   * @param {object} options 
   */
  async searchSimilarMessages(queryEmbedding, options = {}) {
    if (!this.supabase) return [];

    const {
      matchThreshold = 0.7,
      matchCount = 5,
      filter = {}
    } = options;

    // Call the RPC function defined in schema.sql
    const { data, error } = await this.supabase.rpc('match_messages', {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
      filter_conversation_id: filter.conversationId || null
    });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get conversation by contact
   * @param {string} platform 
   * @param {string} contactName 
   */
  async getConversation(platform, contactName) {
    if (!this.supabase) return null;

    const { data, error } = await this.supabase
      .from('conversations')
      .select('*')
      .eq('platform', platform)
      .eq('contact_name', contactName)
      .limit(1);

    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  }

  /**
   * Delete a conversation and all its embeddings
   * @param {string} conversationId
   */
  async deleteConversation(conversationId) {
    if (!this.supabase || !conversationId) return;

    // Delete conversation (cascade will handle embeddings)
    const { error } = await this.supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) throw error;
  }
};