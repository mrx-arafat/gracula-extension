// Embedding Service
// Handles generation of vector embeddings for text

window.Gracula = window.Gracula || {};
window.Gracula.Memory = window.Gracula.Memory || {};

window.Gracula.Memory.EmbeddingService = class EmbeddingService {
  constructor() {
    this.apiConfig = window.Gracula.Config?.API_CONFIG || {};
    this.cache = new window.Gracula.Cache.EmbeddingCache();
  }

  /**
   * Generate embedding for a single text string
   * @param {string} text
   * @returns {Promise<number[]>} Vector embedding (1536 dimensions for OpenAI)
   */
  async generateEmbedding(text) {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('Invalid text for embedding generation');
    }

    const trimmedText = text.trim();

    // Check cache first
    const cached = await this.cache.get(trimmedText);
    if (cached) {
      return cached;
    }

    // Use background script to handle API call to avoid CORS issues
    const embedding = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'generateEmbedding',
        text: trimmedText
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response && response.success) {
          resolve(response.embedding);
        } else {
          reject(new Error(response?.error || 'Failed to generate embedding'));
        }
      });
    });

    // Cache the result
    if (embedding) {
      await this.cache.set(trimmedText, embedding);
    }

    return embedding;
  }

  /**
   * Generate embeddings for multiple texts in batch
   * @param {string[]} texts 
   * @returns {Promise<number[][]>} Array of vector embeddings
   */
  async generateEmbeddingsBatch(texts) {
    if (!Array.isArray(texts) || texts.length === 0) {
      return [];
    }

    const results = new Array(texts.length).fill(null);
    const textsToFetch = [];
    const indicesToFetch = [];

    // Check cache for all texts
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      if (!text) continue;
      
      const cached = await this.cache.get(text);
      if (cached) {
        results[i] = cached;
      } else {
        textsToFetch.push(text);
        indicesToFetch.push(i);
      }
    }

    if (textsToFetch.length === 0) {
      return results;
    }

    // Process remaining texts in chunks
    const CHUNK_SIZE = 10;
    
    for (let i = 0; i < textsToFetch.length; i += CHUNK_SIZE) {
      const chunk = textsToFetch.slice(i, i + CHUNK_SIZE);
      const chunkIndices = indicesToFetch.slice(i, i + CHUNK_SIZE);
      
      try {
        const chunkEmbeddings = await this._processBatchChunk(chunk);
        
        // Store results and cache them
        for (let j = 0; j < chunkEmbeddings.length; j++) {
          const embedding = chunkEmbeddings[j];
          const originalIndex = chunkIndices[j];
          const text = chunk[j];
          
          if (embedding) {
            results[originalIndex] = embedding;
            await this.cache.set(text, embedding);
          }
        }
      } catch (error) {
        console.error('Error processing embedding batch chunk:', error);
        // Failed items remain null in results array
      }
    }

    return results;
  }

  async _processBatchChunk(texts) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'generateEmbeddingsBatch',
        texts: texts
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response && response.success) {
          resolve(response.embeddings);
        } else {
          reject(new Error(response?.error || 'Failed to generate embeddings batch'));
        }
      });
    });
  }
};