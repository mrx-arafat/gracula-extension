// Embedding Cache using IndexedDB
// Caches generated embeddings to reduce API costs and latency

window.Gracula = window.Gracula || {};
window.Gracula.Cache = window.Gracula.Cache || {};

window.Gracula.Cache.EmbeddingCache = class EmbeddingCache {
  constructor() {
    this.dbName = 'GraculaEmbeddingsDB';
    this.storeName = 'embeddings';
    this.version = 1;
    this.db = null;
    this.initPromise = this._initDB();
  }

  _initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = (event) => {
        console.error('EmbeddingCache DB error:', event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'hash' });
        }
      };
    });
  }

  /**
   * Generate a hash for the text to use as key
   * @param {string} text 
   */
  async _hashText(text) {
    const msgBuffer = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get cached embedding for text
   * @param {string} text 
   */
  async get(text) {
    await this.initPromise;
    if (!this.db) return null;

    try {
      const hash = await this._hashText(text);
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(hash);

        request.onsuccess = () => {
          resolve(request.result ? request.result.embedding : null);
        };

        request.onerror = () => {
          resolve(null);
        };
      });
    } catch (error) {
      console.warn('Error reading from embedding cache:', error);
      return null;
    }
  }

  /**
   * Store embedding in cache
   * @param {string} text 
   * @param {number[]} embedding 
   */
  async set(text, embedding) {
    await this.initPromise;
    if (!this.db) return;

    try {
      const hash = await this._hashText(text);
      const record = {
        hash,
        text: text.substring(0, 100), // Store prefix for debugging
        embedding,
        timestamp: Date.now()
      };

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put(record);

        request.onsuccess = () => resolve();
        request.onerror = (e) => {
          console.warn('Error writing to embedding cache:', e);
          resolve(); // Don't fail operation on cache write error
        };
      });
    } catch (error) {
      console.warn('Error writing to embedding cache:', error);
    }
  }

  /**
   * Clear old cache entries (older than 30 days)
   */
  async cleanup() {
    await this.initPromise;
    if (!this.db) return;

    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - THIRTY_DAYS;

    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    const request = store.openCursor();

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        if (cursor.value.timestamp < cutoff) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
  }
};
