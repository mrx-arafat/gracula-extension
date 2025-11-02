// Phrase Predictor - N-gram based intelligent phrase prediction
// Uses bi-grams and tri-grams for context-aware completions

window.Gracula = window.Gracula || {};

window.Gracula.PhrasePredictor = class {
  constructor() {
    // N-gram models
    this.bigrams = new Map(); // "word1" -> { "word2": count }
    this.trigrams = new Map(); // "word1 word2" -> { "word3": count }
    this.wordFrequency = new Map(); // Track word frequency
    this.phraseFrequency = new Map(); // Track complete phrase frequency

    // Configuration
    this.maxNgramSize = 1000; // Limit storage
    this.minConfidence = 0.1; // Minimum probability threshold

    // Load existing models from localStorage
    this.load();

    console.log('✅ [PHRASE PREDICTOR] Initialized with', this.bigrams.size, 'bigrams and', this.trigrams.size, 'trigrams');
  }

  /**
   * Load n-gram models from localStorage
   */
  load() {
    try {
      const stored = localStorage.getItem('gracula_phrase_predictor');
      if (stored) {
        const data = JSON.parse(stored);

        // Convert plain objects back to Maps
        this.bigrams = new Map(data.bigrams || []);
        this.trigrams = new Map(data.trigrams || []);
        this.wordFrequency = new Map(data.wordFrequency || []);
        this.phraseFrequency = new Map(data.phraseFrequency || []);

        console.log('✅ [PHRASE PREDICTOR] Loaded from storage');
      } else {
        // Initialize with common English patterns
        this.initializeCommonPatterns();
      }
    } catch (error) {
      console.warn('[PHRASE PREDICTOR] Failed to load:', error);
      this.initializeCommonPatterns();
    }
  }

  /**
   * Save n-gram models to localStorage
   */
  save() {
    try {
      const data = {
        bigrams: Array.from(this.bigrams.entries()),
        trigrams: Array.from(this.trigrams.entries()),
        wordFrequency: Array.from(this.wordFrequency.entries()),
        phraseFrequency: Array.from(this.phraseFrequency.entries())
      };

      localStorage.setItem('gracula_phrase_predictor', JSON.stringify(data));
      console.log('✅ [PHRASE PREDICTOR] Saved to storage');
    } catch (error) {
      console.warn('[PHRASE PREDICTOR] Failed to save:', error);
    }
  }

  /**
   * Initialize with common English phrase patterns
   */
  initializeCommonPatterns() {
    const commonPhrases = [
      "how are you",
      "what's up",
      "let me know",
      "see you later",
      "talk to you",
      "I'll be there",
      "sounds good to",
      "thanks for the",
      "looking forward to",
      "can't wait to",
      "good to hear",
      "nice to meet",
      "happy to help",
      "sorry to hear",
      "I understand what",
      "that makes sense",
      "I think we",
      "let's do it",
      "on my way",
      "be right back",
      "got it thanks",
      "no problem at",
      "sure thing I'll",
      "sounds like a",
      "I don't think",
      "I'm not sure",
      "maybe we can",
      "would you like",
      "do you want",
      "I was thinking",
      "what do you",
      "when are you",
      "where did you",
      "how was your",
      "hope you're doing",
      "have a great",
      "take care of",
      "let's catch up",
      "we should meet",
      "I'll get back",
      "thanks a lot",
      "I appreciate it",
      "that works for",
      "I'm good with",
      "that sounds great",
      "perfect let's do",
      "I'm on my",
      "be there in",
      "running a bit",
      "sorry for the",
      "no worries take",
      "I'll see you"
    ];

    commonPhrases.forEach(phrase => this.learn(phrase));
    this.save();
  }

  /**
   * Learn from a complete phrase/sentence
   */
  learn(text) {
    if (!text || text.length < 3) return;

    const words = this.tokenize(text);
    if (words.length < 2) return;

    // Update phrase frequency
    const phraseKey = text.toLowerCase().trim();
    this.phraseFrequency.set(phraseKey, (this.phraseFrequency.get(phraseKey) || 0) + 1);

    // Update word frequency
    words.forEach(word => {
      this.wordFrequency.set(word, (this.wordFrequency.get(word) || 0) + 1);
    });

    // Build bigrams
    for (let i = 0; i < words.length - 1; i++) {
      const w1 = words[i];
      const w2 = words[i + 1];

      if (!this.bigrams.has(w1)) {
        this.bigrams.set(w1, new Map());
      }

      const nextWords = this.bigrams.get(w1);
      nextWords.set(w2, (nextWords.get(w2) || 0) + 1);
    }

    // Build trigrams
    for (let i = 0; i < words.length - 2; i++) {
      const w1w2 = `${words[i]} ${words[i + 1]}`;
      const w3 = words[i + 2];

      if (!this.trigrams.has(w1w2)) {
        this.trigrams.set(w1w2, new Map());
      }

      const nextWords = this.trigrams.get(w1w2);
      nextWords.set(w3, (nextWords.get(w3) || 0) + 1);
    }

    // Limit storage size
    this.trimModels();
  }

  /**
   * Tokenize text into words
   */
  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s']/g, ' ') // Keep apostrophes
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  /**
   * Predict next words based on current input
   */
  predict(input, count = 5) {
    if (!input || input.length < 2) {
      return this.getCommonStarters(count);
    }

    const words = this.tokenize(input);
    if (words.length === 0) {
      return this.getCommonStarters(count);
    }

    const predictions = [];

    // Strategy 1: Try trigram prediction (most specific)
    if (words.length >= 2) {
      const lastTwoWords = `${words[words.length - 2]} ${words[words.length - 1]}`;
      const trigramPredictions = this.predictFromTrigrams(lastTwoWords, input);
      predictions.push(...trigramPredictions);
    }

    // Strategy 2: Try bigram prediction
    if (predictions.length < count) {
      const lastWord = words[words.length - 1];
      const bigramPredictions = this.predictFromBigrams(lastWord, input);
      predictions.push(...bigramPredictions);
    }

    // Strategy 3: Try phrase completion
    if (predictions.length < count) {
      const phraseCompletions = this.predictPhraseCompletion(input);
      predictions.push(...phraseCompletions);
    }

    // Strategy 4: Common continuations based on last word
    if (predictions.length < count) {
      const lastWord = words[words.length - 1];
      const commonContinuations = this.getCommonContinuations(lastWord, input);
      predictions.push(...commonContinuations);
    }

    // Remove duplicates and return top results
    const unique = [...new Set(predictions)];
    return unique.slice(0, count);
  }

  /**
   * Predict using trigrams
   */
  predictFromTrigrams(lastTwoWords, currentInput) {
    const predictions = [];

    if (!this.trigrams.has(lastTwoWords)) {
      return predictions;
    }

    const nextWords = this.trigrams.get(lastTwoWords);
    const total = Array.from(nextWords.values()).reduce((sum, count) => sum + count, 0);

    // Sort by probability
    const sorted = Array.from(nextWords.entries())
      .map(([word, count]) => ({
        word,
        probability: count / total,
        count
      }))
      .filter(item => item.probability >= this.minConfidence)
      .sort((a, b) => b.probability - a.probability);

    // Generate completions
    sorted.forEach(item => {
      const completion = `${currentInput} ${item.word}`;
      predictions.push(completion);
    });

    return predictions.slice(0, 3);
  }

  /**
   * Predict using bigrams
   */
  predictFromBigrams(lastWord, currentInput) {
    const predictions = [];

    if (!this.bigrams.has(lastWord)) {
      return predictions;
    }

    const nextWords = this.bigrams.get(lastWord);
    const total = Array.from(nextWords.values()).reduce((sum, count) => sum + count, 0);

    // Sort by probability
    const sorted = Array.from(nextWords.entries())
      .map(([word, count]) => ({
        word,
        probability: count / total,
        count
      }))
      .filter(item => item.probability >= this.minConfidence)
      .sort((a, b) => b.probability - a.probability);

    // Generate completions
    sorted.forEach(item => {
      const completion = `${currentInput} ${item.word}`;
      predictions.push(completion);
    });

    return predictions.slice(0, 3);
  }

  /**
   * Predict phrase completion by matching stored phrases
   */
  predictPhraseCompletion(input) {
    const predictions = [];
    const inputLower = input.toLowerCase().trim();

    // Find phrases that start with the input
    const matches = [];
    for (const [phrase, count] of this.phraseFrequency.entries()) {
      if (phrase.startsWith(inputLower) && phrase !== inputLower) {
        matches.push({ phrase, count });
      }
    }

    // Sort by frequency
    matches.sort((a, b) => b.count - a.count);

    // Return top matches
    matches.slice(0, 3).forEach(match => {
      predictions.push(match.phrase);
    });

    return predictions;
  }

  /**
   * Get common continuations based on last word
   */
  getCommonContinuations(lastWord, currentInput) {
    const continuations = {
      'i': ['I am', 'I\'m', 'I can', 'I will', 'I\'d love to'],
      'you': ['you too', 'you know', 'you are', 'you can', 'you should'],
      'let': ['let me know', 'let\'s do it', 'let\'s meet', 'let me check'],
      'see': ['see you later', 'see you soon', 'see you tomorrow'],
      'talk': ['talk to you later', 'talk soon', 'talk to you'],
      'sounds': ['sounds good', 'sounds great', 'sounds perfect'],
      'that': ['that sounds good', 'that works', 'that\'s great'],
      'i\'m': ['I\'m good', 'I\'m on my way', 'I\'m free', 'I\'m here'],
      'i\'ll': ['I\'ll be there', 'I\'ll let you know', 'I\'ll do it'],
      'can': ['can you', 'can we', 'can\'t wait'],
      'what': ['what\'s up', 'what time', 'what do you think'],
      'when': ['when are you free', 'when should we meet'],
      'where': ['where are you', 'where should we meet'],
      'thanks': ['thanks for', 'thanks a lot', 'thanks so much'],
      'sorry': ['sorry about that', 'sorry for', 'sorry to hear'],
      'on': ['on my way', 'on it', 'on the way'],
      'got': ['got it', 'got it thanks'],
      'no': ['no problem', 'no worries', 'not sure']
    };

    const lastWordLower = lastWord.toLowerCase();
    if (continuations[lastWordLower]) {
      return continuations[lastWordLower].slice(0, 3);
    }

    return [];
  }

  /**
   * Get common conversation starters
   */
  getCommonStarters(count = 5) {
    return [
      'Hey! How are you?',
      'Hi there! What\'s up?',
      'Hello! Good to hear from you',
      'Good to hear from you!',
      'What\'s up?'
    ].slice(0, count);
  }

  /**
   * Calculate prediction confidence score
   */
  getConfidence(prediction, input) {
    const words = this.tokenize(prediction);
    const inputWords = this.tokenize(input);

    if (words.length === 0) return 0;

    // Calculate score based on word frequencies
    let totalScore = 0;
    let wordCount = 0;

    words.forEach(word => {
      const freq = this.wordFrequency.get(word) || 0;
      if (freq > 0) {
        totalScore += Math.log(freq + 1);
        wordCount++;
      }
    });

    if (wordCount === 0) return 0;

    // Normalize score (0-1 range)
    const avgScore = totalScore / wordCount;
    const normalized = Math.min(avgScore / 5, 1); // Assuming max log(freq) ~ 5

    return normalized;
  }

  /**
   * Trim models to prevent unlimited growth
   */
  trimModels() {
    // Trim bigrams
    if (this.bigrams.size > this.maxNgramSize) {
      const entries = Array.from(this.bigrams.entries());
      // Keep most frequent entries
      entries.sort((a, b) => {
        const sumA = Array.from(a[1].values()).reduce((s, c) => s + c, 0);
        const sumB = Array.from(b[1].values()).reduce((s, c) => s + c, 0);
        return sumB - sumA;
      });
      this.bigrams = new Map(entries.slice(0, this.maxNgramSize));
    }

    // Trim trigrams
    if (this.trigrams.size > this.maxNgramSize) {
      const entries = Array.from(this.trigrams.entries());
      entries.sort((a, b) => {
        const sumA = Array.from(a[1].values()).reduce((s, c) => s + c, 0);
        const sumB = Array.from(b[1].values()).reduce((s, c) => s + c, 0);
        return sumB - sumA;
      });
      this.trigrams = new Map(entries.slice(0, this.maxNgramSize));
    }

    // Trim phrase frequency
    if (this.phraseFrequency.size > this.maxNgramSize) {
      const entries = Array.from(this.phraseFrequency.entries())
        .sort((a, b) => b[1] - a[1]);
      this.phraseFrequency = new Map(entries.slice(0, this.maxNgramSize));
    }
  }

  /**
   * Get analytics about the learned models
   */
  getStats() {
    return {
      bigrams: this.bigrams.size,
      trigrams: this.trigrams.size,
      uniqueWords: this.wordFrequency.size,
      learnedPhrases: this.phraseFrequency.size,
      totalBigramConnections: Array.from(this.bigrams.values())
        .reduce((sum, map) => sum + map.size, 0),
      totalTrigramConnections: Array.from(this.trigrams.values())
        .reduce((sum, map) => sum + map.size, 0)
    };
  }

  /**
   * Clear all learned data
   */
  clear() {
    this.bigrams.clear();
    this.trigrams.clear();
    this.wordFrequency.clear();
    this.phraseFrequency.clear();
    localStorage.removeItem('gracula_phrase_predictor');
    this.initializeCommonPatterns();
    console.log('✅ [PHRASE PREDICTOR] Cleared and reinitialized');
  }
};
