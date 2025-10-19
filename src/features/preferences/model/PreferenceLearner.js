// User Preference Learning System
// Learns from user's reply selections to improve future suggestions

window.Gracula = window.Gracula || {};

window.Gracula.PreferenceLearner = class {
  constructor() {
    this.preferences = {
      toneUsage: {}, // Track which tones are used most
      replyLengthPref: 'medium', // short, medium, long
      emojiUsage: 'moderate', // none, light, moderate, heavy
      languagePreference: 'mixed', // english, bangla, mixed
      stylePatterns: {
        formalityLevel: 'casual', // formal, casual, mixed
        punctuationStyle: 'normal', // minimal, normal, expressive
        greetingStyle: 'casual' // formal, casual, friendly
      },
      replyTimePatterns: {}, // Track when user typically replies
      selectionPatterns: {} // Track which generated reply positions are selected most (1, 2, or 3)
    };

    this.learningData = {
      totalSelections: 0,
      toneSelections: {},
      lengthSelections: {
        short: 0,
        medium: 0,
        long: 0
      },
      positionSelections: {
        1: 0,
        2: 0,
        3: 0
      }
    };

    this.loadPreferences();
  }

  /**
   * Load saved preferences from storage
   */
  async loadPreferences() {
    try {
      const result = await chrome.storage.local.get(['userPreferences', 'learningData']);

      if (result.userPreferences) {
        this.preferences = { ...this.preferences, ...result.userPreferences };
      }

      if (result.learningData) {
        this.learningData = { ...this.learningData, ...result.learningData };
      }

      console.log('🧛 Gracula: User preferences loaded', this.preferences);
    } catch (error) {
      console.error('🧛 Gracula: Error loading preferences', error);
    }
  }

  /**
   * Save preferences to storage
   */
  async savePreferences() {
    try {
      await chrome.storage.local.set({
        userPreferences: this.preferences,
        learningData: this.learningData
      });

      console.log('🧛 Gracula: User preferences saved');
    } catch (error) {
      console.error('🧛 Gracula: Error saving preferences', error);
    }
  }

  /**
   * Record a user's reply selection
   */
  async recordSelection(selectionData) {
    const {
      tone,
      selectedReply,
      selectedPosition, // 1, 2, or 3
      replyLength,
      context
    } = selectionData;

    // Increment total selections
    this.learningData.totalSelections++;

    // Track tone usage
    if (tone) {
      this.learningData.toneSelections[tone] = (this.learningData.toneSelections[tone] || 0) + 1;
    }

    // Track reply length preference
    if (replyLength) {
      const lengthCategory = this.categorizeLength(selectedReply);
      this.learningData.lengthSelections[lengthCategory]++;
    }

    // Track which position is selected most
    if (selectedPosition >= 1 && selectedPosition <= 3) {
      this.learningData.positionSelections[selectedPosition]++;
    }

    // Update preferences based on learning data
    this.updatePreferences();

    // Save to storage
    await this.savePreferences();

    console.log('🧛 Gracula: Recorded selection', {
      tone,
      position: selectedPosition,
      totalSelections: this.learningData.totalSelections
    });
  }

  /**
   * Categorize reply length
   */
  categorizeLength(reply) {
    if (!reply) return 'medium';

    const length = reply.length;

    if (length < 50) return 'short';
    if (length < 120) return 'medium';
    return 'long';
  }

  /**
   * Update preferences based on accumulated learning data
   */
  updatePreferences() {
    // Update tone preference (most used tone)
    if (Object.keys(this.learningData.toneSelections).length > 0) {
      const mostUsedTone = Object.entries(this.learningData.toneSelections)
        .sort((a, b) => b[1] - a[1])[0][0];

      this.preferences.favoredTone = mostUsedTone;
    }

    // Update length preference
    const totalLengthSelections =
      this.learningData.lengthSelections.short +
      this.learningData.lengthSelections.medium +
      this.learningData.lengthSelections.long;

    if (totalLengthSelections > 0) {
      const lengthPrefs = Object.entries(this.learningData.lengthSelections)
        .sort((a, b) => b[1] - a[1]);

      this.preferences.replyLengthPref = lengthPrefs[0][0];
    }

    // Update position preference (for future reply ordering)
    const totalPositionSelections =
      this.learningData.positionSelections[1] +
      this.learningData.positionSelections[2] +
      this.learningData.positionSelections[3];

    if (totalPositionSelections > 0) {
      const positionPrefs = Object.entries(this.learningData.positionSelections)
        .sort((a, b) => b[1] - a[1]);

      this.preferences.favoredPosition = parseInt(positionPrefs[0][0]);
    }
  }

  /**
   * Get personalized recommendations
   */
  getRecommendations() {
    const recommendations = {
      suggestedTone: this.preferences.favoredTone || 'default',
      suggestedLength: this.preferences.replyLengthPref || 'medium',
      suggestedPosition: this.preferences.favoredPosition || 1,
      confidence: this.calculateConfidence()
    };

    return recommendations;
  }

  /**
   * Calculate confidence level based on amount of data collected
   */
  calculateConfidence() {
    const total = this.learningData.totalSelections;

    if (total < 5) return 'very_low';
    if (total < 15) return 'low';
    if (total < 30) return 'medium';
    if (total < 60) return 'high';
    return 'very_high';
  }

  /**
   * Get learning statistics
   */
  getStats() {
    return {
      totalSelections: this.learningData.totalSelections,
      toneBreakdown: this.learningData.toneSelections,
      lengthBreakdown: this.learningData.lengthSelections,
      positionBreakdown: this.learningData.positionSelections,
      currentPreferences: this.preferences,
      confidence: this.calculateConfidence()
    };
  }

  /**
   * Reset all learning data
   */
  async reset() {
    this.learningData = {
      totalSelections: 0,
      toneSelections: {},
      lengthSelections: {
        short: 0,
        medium: 0,
        long: 0
      },
      positionSelections: {
        1: 0,
        2: 0,
        3: 0
      }
    };

    this.preferences = {
      toneUsage: {},
      replyLengthPref: 'medium',
      emojiUsage: 'moderate',
      languagePreference: 'mixed',
      stylePatterns: {
        formalityLevel: 'casual',
        punctuationStyle: 'normal',
        greetingStyle: 'casual'
      },
      replyTimePatterns: {},
      selectionPatterns: {}
    };

    await this.savePreferences();
    console.log('🧛 Gracula: Preferences reset');
  }
}
