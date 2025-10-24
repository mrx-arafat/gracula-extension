// Response Cache System
// Stores and reuses previously generated suggestions to reduce API calls

class ResponseCache {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 100; // Store up to 100 responses
    this.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    this.storageKey = 'gracula_response_cache';
    this.loadFromStorage();
  }

  /**
   * Generate cache key from context
   */
  generateKey(context) {
    // Create a simple hash from last few messages
    const lastMessages = context.slice(-3).map(m => m.text || '').join('|');
    return this.simpleHash(lastMessages);
  }

  /**
   * Simple hash function
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Store a response in cache
   */
  set(context, suggestions, metadata = {}) {
    const key = this.generateKey(context);
    
    this.cache.set(key, {
      suggestions,
      metadata,
      timestamp: Date.now(),
      useCount: 0
    });

    // Limit cache size
    if (this.cache.size > this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.saveToStorage();
  }

  /**
   * Get cached response
   */
  get(context) {
    const key = this.generateKey(context);
    const cached = this.cache.get(key);

    if (!cached) return null;

    // Check if expired
    const age = Date.now() - cached.timestamp;
    if (age > this.maxAge) {
      this.cache.delete(key);
      this.saveToStorage();
      return null;
    }

    // Increment use count
    cached.useCount++;
    return cached.suggestions;
  }

  /**
   * Store user's selected suggestion for learning
   */
  recordSelection(context, selectedSuggestion) {
    const key = this.generateKey(context);
    const cached = this.cache.get(key);

    if (cached) {
      cached.metadata.lastSelected = selectedSuggestion;
      cached.metadata.selectionCount = (cached.metadata.selectionCount || 0) + 1;
      this.saveToStorage();
    }
  }

  /**
   * Get most frequently used responses
   */
  getPopularResponses(limit = 10) {
    const entries = Array.from(this.cache.entries());
    return entries
      .sort((a, b) => b[1].useCount - a[1].useCount)
      .slice(0, limit)
      .map(([key, value]) => ({
        key,
        suggestions: value.suggestions,
        useCount: value.useCount
      }));
  }

  /**
   * Save cache to chrome storage
   */
  async saveToStorage() {
    try {
      const cacheData = Array.from(this.cache.entries());
      await chrome.storage.local.set({
        [this.storageKey]: cacheData
      });
    } catch (error) {
      console.error('Failed to save response cache:', error);
    }
  }

  /**
   * Load cache from chrome storage
   */
  async loadFromStorage() {
    try {
      const result = await chrome.storage.local.get([this.storageKey]);
      if (result[this.storageKey]) {
        this.cache = new Map(result[this.storageKey]);
        console.log('🧛 Response cache loaded:', this.cache.size, 'entries');
      }
    } catch (error) {
      console.error('Failed to load response cache:', error);
    }
  }

  /**
   * Clear old entries
   */
  cleanup() {
    const now = Date.now();
    let removed = 0;

    for (const [key, value] of this.cache.entries()) {
      const age = now - value.timestamp;
      if (age > this.maxAge) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`🧛 Cleaned up ${removed} old cache entries`);
      this.saveToStorage();
    }
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      totalUses: Array.from(this.cache.values()).reduce((sum, v) => sum + v.useCount, 0)
    };
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.saveToStorage();
  }
}

// Export singleton instance
window.Gracula = window.Gracula || {};
window.Gracula.ResponseCache = window.Gracula.ResponseCache || new ResponseCache();

