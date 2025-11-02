// Suggestion Worker - Background processing for autocomplete
// Handles pattern matching, context analysis, and n-gram prediction off the main thread

// Import is not supported in workers, so we'll expect the data to be passed

let patternDatabase = null;
let ngramModels = null;

/**
 * Initialize worker with pattern database and n-gram models
 */
function initialize(data) {
  patternDatabase = data.patterns;
  ngramModels = data.ngrams;
  return { success: true, message: 'Worker initialized' };
}

/**
 * Find offline pattern matches
 */
function findPatternMatches(input, context) {
  if (!patternDatabase) {
    return [];
  }

  const lowerInput = input.toLowerCase().trim();
  const matches = [];

  // Exact matches
  for (const category in patternDatabase) {
    const patterns = patternDatabase[category];
    if (patterns[lowerInput]) {
      matches.push(...patterns[lowerInput].map(text => ({
        text,
        source: 'offline',
        confidence: 0.9,
        category
      })));
    }
  }

  // Partial matches
  if (matches.length < 5) {
    for (const category in patternDatabase) {
      const patterns = patternDatabase[category];
      for (const pattern in patterns) {
        if (pattern.startsWith(lowerInput) && pattern !== lowerInput) {
          patterns[pattern].forEach(text => {
            matches.push({
              text,
              source: 'offline',
              confidence: 0.7,
              category
            });
          });
        }
      }
    }
  }

  // Fuzzy matches (for typos)
  if (matches.length < 5) {
    const fuzzyMatches = findFuzzyMatches(lowerInput, patternDatabase);
    matches.push(...fuzzyMatches);
  }

  // Remove duplicates
  const unique = removeDuplicates(matches);

  // Sort by confidence
  unique.sort((a, b) => b.confidence - a.confidence);

  return unique.slice(0, 5);
}

/**
 * Find fuzzy matches using Levenshtein distance
 */
function findFuzzyMatches(input, database) {
  const matches = [];
  const maxDistance = 2;

  for (const category in database) {
    const patterns = database[category];
    for (const pattern in patterns) {
      const distance = levenshteinDistance(input, pattern);
      if (distance <= maxDistance && distance > 0) {
        patterns[pattern].forEach(text => {
          matches.push({
            text,
            source: 'offline',
            confidence: 0.5 - (distance * 0.1), // Lower confidence for fuzzy matches
            category
          });
        });
      }
    }
  }

  return matches;
}

/**
 * Calculate Levenshtein distance
 */
function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Predict using n-gram models
 */
function predictWithNgrams(input, models) {
  if (!models) return [];

  const words = tokenize(input);
  if (words.length === 0) return [];

  const predictions = [];

  // Try trigram
  if (words.length >= 2 && models.trigrams) {
    const lastTwoWords = `${words[words.length - 2]} ${words[words.length - 1]}`;
    if (models.trigrams[lastTwoWords]) {
      const nextWords = models.trigrams[lastTwoWords];
      Object.entries(nextWords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .forEach(([word, count]) => {
          predictions.push({
            text: `${input} ${word}`,
            source: 'ngram',
            confidence: Math.min(count / 10, 0.95),
            method: 'trigram'
          });
        });
    }
  }

  // Try bigram
  if (predictions.length < 3 && models.bigrams) {
    const lastWord = words[words.length - 1];
    if (models.bigrams[lastWord]) {
      const nextWords = models.bigrams[lastWord];
      Object.entries(nextWords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .forEach(([word, count]) => {
          predictions.push({
            text: `${input} ${word}`,
            source: 'ngram',
            confidence: Math.min(count / 10, 0.85),
            method: 'bigram'
          });
        });
    }
  }

  return predictions;
}

/**
 * Tokenize text
 */
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0);
}

/**
 * Remove duplicate suggestions
 */
function removeDuplicates(suggestions) {
  const seen = new Set();
  return suggestions.filter(item => {
    const key = item.text.toLowerCase().trim();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Score and rank suggestions based on context
 */
function scoreAndRank(suggestions, input, context) {
  const scored = suggestions.map(suggestion => {
    let score = suggestion.confidence || 0.5;

    // Boost if matches context
    if (context && context.length > 0) {
      const contextText = context.join(' ').toLowerCase();
      const suggestionWords = tokenize(suggestion.text);

      // Check word overlap
      const overlap = suggestionWords.filter(word => contextText.includes(word)).length;
      score += (overlap / suggestionWords.length) * 0.2;
    }

    // Boost shorter suggestions slightly (easier to read)
    const wordCount = suggestion.text.split(/\s+/).length;
    if (wordCount <= 5) {
      score += 0.05;
    }

    // Penalize very long suggestions
    if (wordCount > 15) {
      score -= 0.1;
    }

    return {
      ...suggestion,
      score: Math.min(score, 1.0)
    };
  });

  // Sort by score
  scored.sort((a, b) => b.score - a.score);

  return scored;
}

/**
 * Ensure diversity in suggestions (avoid too similar results)
 */
function ensureDiversity(suggestions) {
  if (suggestions.length <= 5) return suggestions;

  const diverse = [suggestions[0]]; // Always keep the best
  const minSimilarity = 0.3; // Require at least 30% difference

  for (let i = 1; i < suggestions.length; i++) {
    const candidate = suggestions[i];
    let isDifferent = true;

    // Check similarity with already selected suggestions
    for (const selected of diverse) {
      const similarity = calculateSimilarity(candidate.text, selected.text);
      if (similarity > minSimilarity) {
        isDifferent = false;
        break;
      }
    }

    if (isDifferent) {
      diverse.push(candidate);
    }

    if (diverse.length >= 5) break;
  }

  return diverse;
}

/**
 * Calculate text similarity (Jaccard index)
 */
function calculateSimilarity(text1, text2) {
  const words1 = new Set(tokenize(text1));
  const words2 = new Set(tokenize(text2));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Main message handler
 */
self.addEventListener('message', (event) => {
  const { action, data, id } = event.data;

  try {
    let result;

    switch (action) {
      case 'initialize':
        result = initialize(data);
        break;

      case 'findSuggestions':
        const { input, context, ngrams } = data;

        // Find pattern matches
        const patternMatches = findPatternMatches(input, context);

        // Find n-gram predictions
        const ngramPredictions = predictWithNgrams(input, ngrams);

        // Combine and score
        const combined = [...patternMatches, ...ngramPredictions];
        const scored = scoreAndRank(combined, input, context);

        // Ensure diversity
        const diverse = ensureDiversity(scored);

        result = {
          suggestions: diverse.slice(0, 5),
          stats: {
            totalFound: combined.length,
            patternMatches: patternMatches.length,
            ngramPredictions: ngramPredictions.length,
            finalCount: diverse.length
          }
        };
        break;

      case 'analyzeContext':
        // Analyze conversation context for better predictions
        const { messages } = data;
        result = {
          topics: extractTopics(messages),
          sentiment: detectSentiment(messages),
          recentPatterns: extractRecentPatterns(messages)
        };
        break;

      default:
        result = { error: 'Unknown action' };
    }

    self.postMessage({ id, success: true, result });
  } catch (error) {
    self.postMessage({
      id,
      success: false,
      error: error.message
    });
  }
});

/**
 * Extract topics from conversation
 */
function extractTopics(messages) {
  if (!messages || messages.length === 0) return [];

  const topicKeywords = {
    work: ['work', 'project', 'meeting', 'deadline', 'office', 'task'],
    social: ['party', 'dinner', 'lunch', 'movie', 'hangout', 'meet'],
    time: ['today', 'tomorrow', 'tonight', 'weekend', 'monday', 'tuesday'],
    location: ['here', 'there', 'place', 'restaurant', 'cafe', 'home']
  };

  const foundTopics = {};

  messages.forEach(msg => {
    const text = (msg.text || msg).toLowerCase();
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      const matches = keywords.filter(keyword => text.includes(keyword));
      if (matches.length > 0) {
        foundTopics[topic] = (foundTopics[topic] || 0) + matches.length;
      }
    }
  });

  return Object.entries(foundTopics)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([topic]) => topic);
}

/**
 * Detect sentiment from conversation
 */
function detectSentiment(messages) {
  if (!messages || messages.length === 0) return 'neutral';

  const positive = ['good', 'great', 'awesome', 'love', 'happy', 'excited', '!', '😊', '😄'];
  const negative = ['bad', 'terrible', 'sad', 'hate', 'angry', 'sorry', '😢', '😔'];

  let positiveCount = 0;
  let negativeCount = 0;

  messages.slice(-5).forEach(msg => {
    const text = (msg.text || msg).toLowerCase();
    positiveCount += positive.filter(word => text.includes(word)).length;
    negativeCount += negative.filter(word => text.includes(word)).length;
  });

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

/**
 * Extract recent patterns from conversation
 */
function extractRecentPatterns(messages) {
  if (!messages || messages.length === 0) return [];

  const patterns = [];
  messages.slice(-5).forEach(msg => {
    const text = (msg.text || msg).toLowerCase();
    if (text.includes('?')) patterns.push('question');
    if (text.includes('!')) patterns.push('excitement');
    if (text.match(/\b(yes|yeah|yep|ok)\b/)) patterns.push('agreement');
    if (text.match(/\b(no|nope|nah)\b/)) patterns.push('disagreement');
  });

  return [...new Set(patterns)];
}

console.log('✅ [WORKER] Suggestion worker loaded and ready');
