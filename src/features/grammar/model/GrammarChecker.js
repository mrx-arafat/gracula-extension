/**
 * GrammarChecker - Core service for grammar and spelling analysis
 * Handles text extraction, correction requests, and result processing
 */
class GrammarChecker {
    constructor() {
        this.analysisCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Analyze text for grammar, spelling, and style issues
     * @param {string} text - The text to analyze
     * @param {Object} options - Analysis options
     * @returns {Promise<Object>} - Analysis results with corrections
     */
    async analyzeText(text, options = {}) {
        if (!text || text.trim().length === 0) {
            return {
                success: false,
                error: 'No text to analyze'
            };
        }

        // DISABLED CACHE - Always get fresh results
        // Check cache first
        // const cacheKey = this.getCacheKey(text, options);
        // if (this.analysisCache.has(cacheKey)) {
        //     const cached = this.analysisCache.get(cacheKey);
        //     if (Date.now() - cached.timestamp < this.cacheTimeout) {
        //         console.log('[GrammarChecker] Using cached analysis');
        //         return cached.result;
        //     } else {
        //         this.analysisCache.delete(cacheKey);
        //     }
        // }

        console.log('[GrammarChecker] Analyzing text (no cache):', text);

        try {
            // Send to background script for AI processing
            const response = await chrome.runtime.sendMessage({
                action: 'analyzeGrammar',
                text: text,
                options: {
                    checkGrammar: options.checkGrammar !== false,
                    checkSpelling: options.checkSpelling !== false,
                    checkStyle: options.checkStyle !== false,
                    checkPunctuation: options.checkPunctuation !== false,
                    language: options.language || 'en-US'
                }
            });

            console.log('[GrammarChecker] Received response:', response);

            if (response && response.success) {
                // Cache the result (disabled for now)
                // this.analysisCache.set(cacheKey, {
                //     result: response,
                //     timestamp: Date.now()
                // });

                return response;
            } else {
                return {
                    success: false,
                    error: response?.error || 'Failed to analyze text'
                };
            }
        } catch (error) {
            console.error('[GrammarChecker] Error analyzing text:', error);
            return {
                success: false,
                error: error.message || 'Failed to analyze text'
            };
        }
    }

    /**
     * Apply a specific correction to text
     * @param {string} originalText - The original text
     * @param {Object} correction - The correction to apply
     * @returns {string} - Text with correction applied
     */
    applyCorrection(originalText, correction) {
        if (!correction || !correction.offset || !correction.length) {
            return originalText;
        }

        const before = originalText.substring(0, correction.offset);
        const after = originalText.substring(correction.offset + correction.length);
        return before + correction.replacement + after;
    }

    /**
     * Apply multiple corrections to text
     * @param {string} originalText - The original text
     * @param {Array} corrections - Array of corrections to apply
     * @returns {string} - Text with all corrections applied
     */
    applyAllCorrections(originalText, corrections) {
        if (!corrections || corrections.length === 0) {
            return originalText;
        }

        // Sort corrections by offset in reverse order to avoid offset shifts
        const sortedCorrections = [...corrections].sort((a, b) => b.offset - a.offset);

        let correctedText = originalText;
        for (const correction of sortedCorrections) {
            correctedText = this.applyCorrection(correctedText, correction);
        }

        return correctedText;
    }

    /**
     * Extract text from input element
     * @param {HTMLElement} element - The input element
     * @returns {string} - Extracted text
     */
    extractTextFromElement(element) {
        if (!element) return '';

        if (element.contentEditable === 'true') {
            return element.innerText || element.textContent || '';
        } else if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
            return element.value || '';
        }

        return '';
    }

    /**
     * Get cache key for text and options
     * @param {string} text - The text
     * @param {Object} options - Analysis options
     * @returns {string} - Cache key
     */
    getCacheKey(text, options) {
        const optionsStr = JSON.stringify(options);
        return `${text.substring(0, 100)}_${optionsStr}`;
    }

    /**
     * Clear analysis cache
     */
    clearCache() {
        this.analysisCache.clear();
    }

    /**
     * Get statistics about the analysis
     * @param {Object} analysisResult - The analysis result
     * @returns {Object} - Statistics
     */
    getStatistics(analysisResult) {
        if (!analysisResult || !analysisResult.corrections) {
            return {
                totalIssues: 0,
                grammarIssues: 0,
                spellingIssues: 0,
                styleIssues: 0,
                punctuationIssues: 0
            };
        }

        const corrections = analysisResult.corrections;
        return {
            totalIssues: corrections.length,
            grammarIssues: corrections.filter(c => c.type === 'grammar').length,
            spellingIssues: corrections.filter(c => c.type === 'spelling').length,
            styleIssues: corrections.filter(c => c.type === 'style').length,
            punctuationIssues: corrections.filter(c => c.type === 'punctuation').length
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GrammarChecker;
}
