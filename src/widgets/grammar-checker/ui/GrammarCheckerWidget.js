/**
 * GrammarCheckerWidget - UI component for displaying grammar corrections
 * Shows corrections in an interactive panel with apply/ignore options
 */
class GrammarCheckerWidget {
    constructor() {
        this.container = null;
        this.corrections = [];
        this.originalText = '';
        this.onApplyCorrectionCallback = null;
        this.onApplyAllCallback = null;
    }

    /**
     * Render the grammar checker widget in a modal
     * @param {Object} analysisResult - The grammar analysis result
     * @param {HTMLElement} modalBody - The modal body element
     * @param {Function} onApplyCorrection - Callback when a correction is applied
     * @param {Function} onApplyAll - Callback when all corrections are applied
     */
    render(analysisResult, modalBody, onApplyCorrection, onApplyAll) {
        this.corrections = analysisResult.corrections || [];
        this.originalText = analysisResult.originalText || '';
        this.onApplyCorrectionCallback = onApplyCorrection;
        this.onApplyAllCallback = onApplyAll;

        // Clear modal body
        modalBody.innerHTML = '';

        // Create main container
        this.container = document.createElement('div');
        this.container.className = 'gracula-grammar-checker-container';

        // Add summary header
        const summary = this.createSummaryHeader(analysisResult);
        this.container.appendChild(summary);

        // Add corrections list or success message
        if (this.corrections.length === 0) {
            const successMessage = this.createSuccessMessage();
            this.container.appendChild(successMessage);
        } else {
            const correctionsList = this.createCorrectionsList();
            // Show details by default for better UX
            correctionsList.style.display = 'block';
            this.container.appendChild(correctionsList);
        }

        modalBody.appendChild(this.container);
    }

    /**
     * Create summary header with statistics
     */
    createSummaryHeader(analysisResult) {
        const header = document.createElement('div');
        header.className = 'gracula-grammar-summary';

        const stats = this.getStatistics();
        const summary = analysisResult.summary || 'Analysis complete';
        const correctedText = analysisResult.correctedText || '';

        const providerInfo = analysisResult.provider ?
            `<div class="gracula-provider-badge">Powered by ${analysisResult.provider.toUpperCase()}${analysisResult.model ? ` (${analysisResult.model})` : ''}</div>` : '';

        header.innerHTML = `
            <div class="gracula-grammar-summary-title">
                <span class="gracula-grammar-icon">✍️</span>
                <h3>Grammar Check</h3>
            </div>
            ${providerInfo}
            <div class="gracula-grammar-summary-text">${summary}</div>
            ${this.corrections.length > 0 ? `
                <div class="gracula-grammar-stats">
                    ${stats.grammarIssues > 0 ? `<span class="stat-badge grammar">${stats.grammarIssues} Grammar</span>` : ''}
                    ${stats.spellingIssues > 0 ? `<span class="stat-badge spelling">${stats.spellingIssues} Spelling</span>` : ''}
                    ${stats.styleIssues > 0 ? `<span class="stat-badge style">${stats.styleIssues} Style</span>` : ''}
                    ${stats.punctuationIssues > 0 ? `<span class="stat-badge punctuation">${stats.punctuationIssues} Punctuation</span>` : ''}
                </div>
                <div class="gracula-corrected-preview">
                    <div class="preview-label">Corrected Text:</div>
                    <div class="preview-text">${this.escapeHtml(correctedText)}</div>
                </div>
                <div class="gracula-action-buttons">
                    <button class="gracula-btn gracula-btn-replace gracula-replace-all-btn">
                        ✓ Replace Text
                    </button>
                    <button class="gracula-btn gracula-btn-secondary gracula-view-details-btn">
                        Hide Details
                    </button>
                </div>
            ` : ''}
        `;

        // Attach event listeners
        if (this.corrections.length > 0) {
            const replaceBtn = header.querySelector('.gracula-replace-all-btn');
            const viewDetailsBtn = header.querySelector('.gracula-view-details-btn');

            replaceBtn.addEventListener('click', () => {
                if (this.onApplyAllCallback) {
                    this.onApplyAllCallback(this.corrections);
                }
            });

            viewDetailsBtn.addEventListener('click', () => {
                // Toggle corrections list visibility
                const correctionsList = document.querySelector('.gracula-grammar-corrections-list');
                if (correctionsList) {
                    const isHidden = correctionsList.style.display === 'none';
                    correctionsList.style.display = isHidden ? 'flex' : 'none';
                    viewDetailsBtn.textContent = isHidden ? 'Hide Details' : 'View Details';
                }
            });
        }

        return header;
    }

    /**
     * Create success message when no issues found
     */
    createSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'gracula-grammar-success';
        message.innerHTML = `
            <div class="gracula-grammar-success-icon">✓</div>
            <div class="gracula-grammar-success-text">
                <h4>Great job!</h4>
                <p>No grammar, spelling, or style issues detected in your text.</p>
            </div>
        `;
        return message;
    }

    /**
     * Create list of corrections
     */
    createCorrectionsList() {
        const list = document.createElement('div');
        list.className = 'gracula-grammar-corrections-list';

        this.corrections.forEach((correction, index) => {
            const correctionCard = this.createCorrectionCard(correction, index);
            list.appendChild(correctionCard);
        });

        return list;
    }

    /**
     * Create a single correction card
     */
    createCorrectionCard(correction, index) {
        const card = document.createElement('div');
        card.className = `gracula-grammar-correction-card correction-${correction.type}`;
        card.dataset.index = index;

        const typeLabel = this.getTypeLabel(correction.type);
        const typeIcon = this.getTypeIcon(correction.type);

        card.innerHTML = `
            <div class="gracula-correction-header">
                <span class="correction-type-badge ${correction.type}">
                    ${typeIcon} ${typeLabel}
                </span>
            </div>
            <div class="gracula-correction-body">
                <div class="correction-text">
                    <div class="correction-original">
                        <span class="label">Original:</span>
                        <span class="text">${this.escapeHtml(correction.original || this.getTextAtOffset(correction))}</span>
                    </div>
                    <div class="correction-arrow">→</div>
                    <div class="correction-replacement">
                        <span class="label">Suggested:</span>
                        <span class="text">${this.escapeHtml(correction.replacement)}</span>
                    </div>
                </div>
                ${correction.explanation ? `
                    <div class="correction-explanation">
                        ${this.escapeHtml(correction.explanation)}
                    </div>
                ` : ''}
            </div>
            <div class="gracula-correction-actions">
                <button class="gracula-btn gracula-btn-secondary gracula-ignore-btn" data-index="${index}">
                    Ignore
                </button>
                <button class="gracula-btn gracula-btn-primary gracula-apply-btn" data-index="${index}">
                    Apply
                </button>
            </div>
        `;

        // Attach event listeners
        const applyBtn = card.querySelector('.gracula-apply-btn');
        const ignoreBtn = card.querySelector('.gracula-ignore-btn');

        applyBtn.addEventListener('click', () => {
            this.handleApplyCorrection(correction, index, card);
        });

        ignoreBtn.addEventListener('click', () => {
            this.handleIgnoreCorrection(index, card);
        });

        return card;
    }

    /**
     * Handle applying a single correction
     */
    handleApplyCorrection(correction, index, card) {
        if (this.onApplyCorrectionCallback) {
            this.onApplyCorrectionCallback(correction, index);
        }

        // Mark card as applied
        card.classList.add('correction-applied');
        card.querySelector('.gracula-apply-btn').disabled = true;
        card.querySelector('.gracula-ignore-btn').disabled = true;
    }

    /**
     * Handle ignoring a correction
     */
    handleIgnoreCorrection(index, card) {
        card.classList.add('correction-ignored');
        card.style.opacity = '0.5';
        card.querySelector('.gracula-apply-btn').disabled = true;
        card.querySelector('.gracula-ignore-btn').disabled = true;
    }

    /**
     * Get statistics about corrections
     */
    getStatistics() {
        return {
            totalIssues: this.corrections.length,
            grammarIssues: this.corrections.filter(c => c.type === 'grammar').length,
            spellingIssues: this.corrections.filter(c => c.type === 'spelling').length,
            styleIssues: this.corrections.filter(c => c.type === 'style').length,
            punctuationIssues: this.corrections.filter(c => c.type === 'punctuation').length
        };
    }

    /**
     * Get text at the correction offset
     */
    getTextAtOffset(correction) {
        if (!this.originalText || !correction.offset || !correction.length) {
            return '';
        }
        return this.originalText.substring(correction.offset, correction.offset + correction.length);
    }

    /**
     * Get human-readable label for correction type
     */
    getTypeLabel(type) {
        const labels = {
            grammar: 'Grammar',
            spelling: 'Spelling',
            style: 'Style',
            punctuation: 'Punctuation'
        };
        return labels[type] || type;
    }

    /**
     * Get icon for correction type
     */
    getTypeIcon(type) {
        const icons = {
            grammar: '📝',
            spelling: '🔤',
            style: '✨',
            punctuation: '.,!?'
        };
        return icons[type] || '•';
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show loading state
     */
    static showLoading(container) {
        container.innerHTML = `
            <div class="gracula-grammar-loading">
                <div class="gracula-spinner"></div>
                <p>Analyzing your text...</p>
            </div>
        `;
    }

    /**
     * Show error message
     */
    static showError(message, container, onRetry) {
        container.innerHTML = `
            <div class="gracula-grammar-error">
                <div class="error-icon">⚠️</div>
                <h3>Analysis Failed</h3>
                <p>${message}</p>
                ${onRetry ? `
                    <button class="gracula-btn gracula-btn-primary gracula-retry-btn">
                        Try Again
                    </button>
                ` : ''}
                <button class="gracula-btn gracula-btn-secondary gracula-open-settings-btn">
                    Open Settings
                </button>
            </div>
        `;

        // Attach retry button
        if (onRetry) {
            const retryBtn = container.querySelector('.gracula-retry-btn');
            if (retryBtn) {
                retryBtn.addEventListener('click', onRetry);
            }
        }

        // Attach settings button
        const settingsBtn = container.querySelector('.gracula-open-settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                chrome.runtime.openOptionsPage();
            });
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GrammarCheckerWidget;
}
