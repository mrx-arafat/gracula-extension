/**
 * UserProfileDetector - Detects the current user's actual name from WhatsApp Web
 * 
 * This class extracts the user's real name (e.g., "Arafat") from WhatsApp's UI
 * so the extension can recognize when the user's name appears in messages.
 * 
 * Features:
 * - Multiple detection strategies with fallbacks
 * - Caching to avoid repeated DOM queries
 * - Validation to ensure detected name is reasonable
 * - Graceful degradation if detection fails
 */

(function() {
    'use strict';

    class UserProfileDetector {
        constructor() {
            this.userName = null;
            this.cacheKey = 'gracula_user_name';
            this.cacheDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            
            console.log('🔍 [USER PROFILE] UserProfileDetector initialized');
        }

        /**
         * Main method to detect user profile
         * @returns {Promise<string|null>} User's name or null if detection fails
         */
        async detectUserProfile() {
            console.log('🔍 [USER PROFILE] Starting user profile detection...');

            // Strategy 1: Try cache first (fastest)
            const cachedName = this.getCachedUserName();
            if (cachedName) {
                console.log('✅ [USER PROFILE] Using cached name:', cachedName);
                this.userName = cachedName;
                return cachedName;
            }

            // Strategy 2: Try extracting from current chat messages (MOST RELIABLE!)
            const chatName = this.detectFromChatMessages();
            if (chatName && this.validateUserName(chatName)) {
                console.log('✅ [USER PROFILE] Detected from chat messages:', chatName);
                this.userName = chatName;
                this.cacheUserName(chatName);
                return chatName;
            }

            // Strategy 3: Try Profile Panel (fallback if no chat is open)
            const profilePanelName = await this.detectFromProfilePanel();
            if (profilePanelName && this.validateUserName(profilePanelName)) {
                console.log('✅ [USER PROFILE] Detected from Profile Panel:', profilePanelName);
                this.userName = profilePanelName;
                this.cacheUserName(profilePanelName);
                return profilePanelName;
            }

            // Strategy 4: Try WhatsApp LocalStorage
            const localStorageName = this.detectFromWhatsAppLocalStorage();
            if (localStorageName && this.validateUserName(localStorageName)) {
                console.log('✅ [USER PROFILE] Detected from WhatsApp LocalStorage:', localStorageName);
                this.userName = localStorageName;
                this.cacheUserName(localStorageName);
                return localStorageName;
            }

            // Strategy 5-9: Try original detection methods
            const detectionStrategies = [
                { name: 'Header Profile Button', method: () => this.detectFromHeaderProfile() },
                { name: 'Profile Image Alt', method: () => this.detectFromProfileImage() },
                { name: 'Aria Labels', method: () => this.detectFromAriaLabels() },
                { name: 'Header Text', method: () => this.detectFromHeaderText() },
                { name: 'Menu Button', method: () => this.detectFromMenuButton() }
            ];

            for (const strategy of detectionStrategies) {
                try {
                    console.log(`🔍 [USER PROFILE] Trying strategy: ${strategy.name}`);
                    const name = await strategy.method();

                    if (name && this.validateUserName(name)) {
                        console.log(`✅ [USER PROFILE] Detected from ${strategy.name}:`, name);
                        this.userName = name;
                        this.cacheUserName(name);
                        return name;
                    }
                } catch (error) {
                    console.warn(`⚠️ [USER PROFILE] Strategy "${strategy.name}" failed:`, error.message);
                }
            }

            // Strategy 10: Last resort - Manual Input (REMOVED - not user-friendly)
            // Manual input is no longer used as it's intrusive

            console.warn('⚠️ [USER PROFILE] All detection strategies failed, using fallback "You"');
            return null;
        }

        /**
         * Helper: Wait for a DOM element to appear
         * @param {string} selector - CSS selector to wait for
         * @param {number} timeout - Max wait time in milliseconds
         * @returns {Promise<Element|null>}
         */
        async waitForElement(selector, timeout = 3000) {
            const startTime = Date.now();

            while (Date.now() - startTime < timeout) {
                const element = document.querySelector(selector);
                if (element) return element;
                await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
            }

            return null; // Timeout
        }

        /**
         * Helper: Check if Profile panel is currently open
         * @returns {boolean}
         */
        isProfilePanelOpen() {
            // Check for Profile heading
            const headings = document.querySelectorAll('h1, heading[level="1"]');
            for (const heading of headings) {
                if (heading.textContent.trim() === 'Profile') {
                    return true;
                }
            }

            return false;
        }

        /**
         * Helper: Click the Profile button and wait for panel to open
         * @returns {Promise<boolean>} - true if successful
         */
        async clickProfileButton() {
            try {
                // Find Profile button
                const profileButton = document.querySelector('button[aria-label="Profile"]');
                if (!profileButton) {
                    console.log('⚠️ [USER PROFILE] Profile button not found');
                    return false;
                }

                // Click it
                profileButton.click();
                console.log('🔍 [USER PROFILE] Clicked Profile button');

                // Wait for Profile panel to appear (check for "Profile" heading)
                await new Promise(resolve => setTimeout(resolve, 500)); // Initial wait

                const maxWait = 3000; // 3 seconds max
                const startTime = Date.now();

                while (Date.now() - startTime < maxWait) {
                    if (this.isProfilePanelOpen()) {
                        console.log('✅ [USER PROFILE] Profile panel opened');
                        return true;
                    }
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                console.log('⚠️ [USER PROFILE] Profile panel did not open');
                return false;
            } catch (error) {
                console.error('❌ [USER PROFILE] Error clicking Profile button:', error);
                return false;
            }
        }

        /**
         * Helper: Extract user name from the Profile panel DOM
         * @returns {string|null}
         */
        extractNameFromProfilePanel() {
            try {
                // Strategy 1: Find "Name" label, then get the next element's text
                const allElements = Array.from(document.querySelectorAll('*'));

                for (let i = 0; i < allElements.length; i++) {
                    const el = allElements[i];

                    // Check if this element contains only "Name" text
                    if (el.textContent.trim() === 'Name' && el.children.length === 0) {
                        // Look at parent's next sibling or nearby elements
                        const parent = el.parentElement;
                        if (!parent) continue;

                        const grandParent = parent.parentElement;
                        if (!grandParent) continue;

                        const siblings = Array.from(grandParent.children);
                        const parentIndex = siblings.indexOf(parent);

                        if (parentIndex >= 0 && parentIndex < siblings.length - 1) {
                            const nextSibling = siblings[parentIndex + 1];

                            // Look for the first child with text content
                            const nameElements = nextSibling.querySelectorAll('*');
                            for (const nameEl of nameElements) {
                                const text = nameEl.textContent.trim();

                                // Skip if it's the edit button text
                                if (text &&
                                    text !== 'Click to edit Name' &&
                                    !text.includes('edit') &&
                                    text.length > 0 &&
                                    text.length < 100) {
                                    console.log('✅ [USER PROFILE] Extracted name from Profile panel:', text);
                                    return text;
                                }
                            }
                        }
                    }
                }

                console.log('⚠️ [USER PROFILE] Could not extract name from Profile panel');
                return null;
            } catch (error) {
                console.error('❌ [USER PROFILE] Error extracting name:', error);
                return null;
            }
        }

        /**
         * Helper: Close the Profile panel by clicking Chats button
         * @returns {Promise<boolean>} - true if successful
         */
        async closeProfilePanel() {
            try {
                // Find Chats button
                const chatsButton = document.querySelector('button[aria-label="Chats"]');
                if (!chatsButton) {
                    console.log('⚠️ [USER PROFILE] Chats button not found');
                    return false;
                }

                // Click it
                chatsButton.click();
                console.log('🔍 [USER PROFILE] Clicked Chats button to close Profile panel');

                // Wait for Profile panel to close
                await new Promise(resolve => setTimeout(resolve, 500));

                console.log('✅ [USER PROFILE] Profile panel closed');
                return true;
            } catch (error) {
                console.error('❌ [USER PROFILE] Error closing Profile panel:', error);
                return false;
            }
        }

        /**
         * NEW Strategy: Detect from current chat messages (MOST RELIABLE!)
         * Extracts sender names from data-pre-plain-text attribute in outgoing messages
         * @returns {string|null}
         */
        detectFromChatMessages() {
            console.log('🔍 [USER PROFILE] Trying to extract from chat messages...');

            try {
                // Find all message elements with data-pre-plain-text attribute
                const messageElements = document.querySelectorAll('[data-pre-plain-text]');

                if (messageElements.length === 0) {
                    console.log('⚠️ [USER PROFILE] No messages found in current chat');
                    return null;
                }

                console.log(`🔍 [USER PROFILE] Found ${messageElements.length} messages in chat`);

                // Map to store sender names and their frequency in outgoing messages
                const senderCounts = new Map();

                // Iterate through all messages
                for (const msgEl of messageElements) {
                    // Get the data-pre-plain-text attribute
                    // Format: "[10:35 am, 20/10/2025] Arafat: " or "[1:32 pm, 20/10/2025] Sowmik Piggy: "
                    const prePlainText = msgEl.getAttribute('data-pre-plain-text');

                    if (!prePlainText) continue;

                    // Check if this is an outgoing message (tail-out class)
                    // Traverse up to find the message container
                    let messageContainer = msgEl;
                    let depth = 0;
                    while (messageContainer && depth < 10) {
                        if (messageContainer.classList &&
                            (messageContainer.classList.contains('message-out') ||
                             messageContainer.classList.contains('tail-out'))) {

                            // This is an outgoing message - extract sender name
                            // Format: "[10:35 am, 20/10/2025] Arafat: "
                            const match = prePlainText.match(/\]\s*([^:]+):\s*$/);

                            if (match && match[1]) {
                                const senderName = match[1].trim();

                                // Increment count for this sender
                                senderCounts.set(senderName, (senderCounts.get(senderName) || 0) + 1);

                                console.log(`🔍 [USER PROFILE] Found outgoing message from: ${senderName}`);
                            }

                            break;
                        }
                        messageContainer = messageContainer.parentElement;
                        depth++;
                    }
                }

                // Find the most common sender in outgoing messages
                if (senderCounts.size === 0) {
                    console.log('⚠️ [USER PROFILE] No outgoing messages found');
                    return null;
                }

                // Get the sender with highest count
                let maxCount = 0;
                let detectedName = null;

                for (const [name, count] of senderCounts.entries()) {
                    console.log(`🔍 [USER PROFILE] Sender "${name}" appears in ${count} outgoing messages`);
                    if (count > maxCount) {
                        maxCount = count;
                        detectedName = name;
                    }
                }

                if (detectedName) {
                    console.log(`✅ [USER PROFILE] Detected user name from chat messages: ${detectedName} (${maxCount} messages)`);
                    return detectedName;
                }

                return null;

            } catch (error) {
                console.error('❌ [USER PROFILE] Error detecting from chat messages:', error);
                return null;
            }
        }

        /**
         * NEW Strategy: Detect from Profile Panel (fallback if no chat is open)
         * @returns {Promise<string|null>}
         */
        async detectFromProfilePanel() {
            console.log('🔍 [USER PROFILE] Trying Profile Panel strategy...');

            let wasAlreadyOpen = false;

            try {
                // Check if Profile panel is already open
                wasAlreadyOpen = this.isProfilePanelOpen();

                if (!wasAlreadyOpen) {
                    // Open Profile panel
                    const opened = await this.clickProfileButton();
                    if (!opened) return null;
                } else {
                    console.log('ℹ️ [USER PROFILE] Profile panel already open');
                }

                // Extract name from panel
                const name = this.extractNameFromProfilePanel();

                return name;

            } catch (error) {
                console.error('❌ [USER PROFILE] Profile Panel strategy error:', error);
                return null;
            } finally {
                // Always close the panel if we opened it
                if (!wasAlreadyOpen && this.isProfilePanelOpen()) {
                    await this.closeProfilePanel();
                }
            }
        }

        /**
         * NEW Strategy: Detect from WhatsApp LocalStorage
         * @returns {string|null}
         */
        detectFromWhatsAppLocalStorage() {
            console.log('🔍 [USER PROFILE] Trying WhatsApp LocalStorage strategy...');

            try {
                // Check common WhatsApp localStorage keys
                const possibleKeys = [
                    'WAWebUser',
                    'WAWebUserInfo',
                    'WAWebProfile',
                    'wa-user',
                    'whatsapp-user'
                ];

                for (const key of possibleKeys) {
                    const value = localStorage.getItem(key);
                    if (!value) continue;

                    try {
                        const data = JSON.parse(value);

                        // Look for name fields
                        const nameFields = ['name', 'displayName', 'pushname', 'userName'];
                        for (const field of nameFields) {
                            if (data[field] && typeof data[field] === 'string') {
                                const name = data[field].trim();
                                if (this.validateUserName(name)) {
                                    console.log(`✅ [USER PROFILE] Found name in localStorage[${key}].${field}:`, name);
                                    return name;
                                }
                            }
                        }
                    } catch (parseError) {
                        // Not JSON, skip
                        continue;
                    }
                }

                console.log('⚠️ [USER PROFILE] No user name found in WhatsApp localStorage');
                return null;
            } catch (error) {
                console.error('❌ [USER PROFILE] LocalStorage strategy error:', error);
                return null;
            }
        }



        /**
         * Strategy 1: Detect from header profile button
         */
        detectFromHeaderProfile() {
            // Try WhatsApp's header profile button
            const selectors = [
                'header [data-testid="default-user"]',
                'header [data-testid="default-user"] span[title]',
                'header [data-testid="default-user"] span[dir="auto"]'
            ];

            for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element) {
                    const name = element.getAttribute('title') || 
                                element.getAttribute('aria-label') || 
                                element.textContent?.trim();
                    if (name) {
                        console.log(`🔍 [USER PROFILE] Found in header profile (${selector}):`, name);
                        return this.cleanUserName(name);
                    }
                }
            }

            return null;
        }

        /**
         * Strategy 2: Detect from profile image alt text
         */
        detectFromProfileImage() {
            const selectors = [
                'header img[alt]',
                'header [data-testid="default-user"] img',
                '[data-testid="menu-bar"] img[alt]'
            ];

            for (const selector of selectors) {
                const img = document.querySelector(selector);
                if (img) {
                    const alt = img.getAttribute('alt');
                    if (alt && !alt.toLowerCase().includes('profile') && 
                        !alt.toLowerCase().includes('photo')) {
                        console.log(`🔍 [USER PROFILE] Found in image alt (${selector}):`, alt);
                        return this.cleanUserName(alt);
                    }
                }
            }

            return null;
        }

        /**
         * Strategy 3: Detect from aria-labels
         */
        detectFromAriaLabels() {
            const selectors = [
                '[aria-label*="Profile"]',
                'header button[aria-label]',
                '[data-testid="menu-bar"] button[aria-label]'
            ];

            for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element) {
                    const ariaLabel = element.getAttribute('aria-label');
                    if (ariaLabel) {
                        // Extract name from patterns like "Profile: John Doe" or "John Doe's profile"
                        const patterns = [
                            /Profile:\s*(.+)/i,
                            /(.+)'s?\s+profile/i,
                            /(.+)\s+profile/i
                        ];

                        for (const pattern of patterns) {
                            const match = ariaLabel.match(pattern);
                            if (match && match[1]) {
                                console.log(`🔍 [USER PROFILE] Found in aria-label (${selector}):`, match[1]);
                                return this.cleanUserName(match[1]);
                            }
                        }
                    }
                }
            }

            return null;
        }

        /**
         * Strategy 4: Detect from header text content
         */
        detectFromHeaderText() {
            const header = document.querySelector('header');
            if (!header) return null;

            // Look for span elements with dir="auto" that might contain the name
            const spans = header.querySelectorAll('span[dir="auto"]');
            for (const span of spans) {
                const text = span.textContent?.trim();
                if (text && text.length >= 2 && text.length <= 50) {
                    // Skip common UI text
                    const skipTexts = ['whatsapp', 'search', 'menu', 'new chat', 'status', 'channels'];
                    if (!skipTexts.some(skip => text.toLowerCase().includes(skip))) {
                        console.log('🔍 [USER PROFILE] Found in header text:', text);
                        return this.cleanUserName(text);
                    }
                }
            }

            return null;
        }

        /**
         * Strategy 5: Detect from menu button
         */
        detectFromMenuButton() {
            const menuButton = document.querySelector('[data-testid="menu-bar-menu"]');
            if (menuButton) {
                const ariaLabel = menuButton.getAttribute('aria-label');
                if (ariaLabel) {
                    // Extract name from "Menu: John Doe" or similar patterns
                    const match = ariaLabel.match(/Menu:\s*(.+)/i);
                    if (match && match[1]) {
                        console.log('🔍 [USER PROFILE] Found in menu button:', match[1]);
                        return this.cleanUserName(match[1]);
                    }
                }
            }

            return null;
        }

        /**
         * Clean and normalize user name
         */
        cleanUserName(name) {
            if (!name) return null;

            // Remove common prefixes/suffixes
            let cleaned = name
                .replace(/^(Profile:\s*|Menu:\s*)/i, '')
                .replace(/('s?\s+profile|profile)$/i, '')
                .trim();

            // Remove extra whitespace
            cleaned = cleaned.replace(/\s+/g, ' ');

            return cleaned;
        }

        /**
         * Validate that the detected name is reasonable
         */
        validateUserName(name) {
            if (!name || typeof name !== 'string') {
                console.warn('⚠️ [USER PROFILE] Invalid name: not a string');
                return false;
            }

            const trimmed = name.trim();

            // Check length (2-50 characters is reasonable)
            if (trimmed.length < 2 || trimmed.length > 50) {
                console.warn('⚠️ [USER PROFILE] Invalid name: length out of range:', trimmed.length);
                return false;
            }

            // Check it's not a generic label
            const genericLabels = ['you', 'me', 'user', 'profile', 'menu', 'whatsapp', 'unknown'];
            if (genericLabels.includes(trimmed.toLowerCase())) {
                console.warn('⚠️ [USER PROFILE] Invalid name: generic label:', trimmed);
                return false;
            }

            // Check it's not just numbers (phone numbers)
            if (/^\d+$/.test(trimmed)) {
                console.warn('⚠️ [USER PROFILE] Invalid name: only numbers:', trimmed);
                return false;
            }

            console.log('✅ [USER PROFILE] Name validation passed:', trimmed);
            return true;
        }

        /**
         * Cache the detected user name in localStorage
         */
        cacheUserName(name) {
            try {
                const cacheData = {
                    name: name,
                    timestamp: Date.now()
                };
                localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
                console.log('💾 [USER PROFILE] Cached user name:', name);
            } catch (error) {
                console.warn('⚠️ [USER PROFILE] Failed to cache user name:', error.message);
            }
        }

        /**
         * Get cached user name if it exists and is fresh
         */
        getCachedUserName() {
            try {
                const cached = localStorage.getItem(this.cacheKey);
                if (!cached) return null;

                const cacheData = JSON.parse(cached);
                const age = Date.now() - cacheData.timestamp;

                // Check if cache is still fresh (< 24 hours)
                if (age < this.cacheDuration) {
                    console.log('💾 [USER PROFILE] Cache hit (age: ' + Math.round(age / 1000 / 60) + ' minutes)');
                    return cacheData.name;
                } else {
                    console.log('💾 [USER PROFILE] Cache expired (age: ' + Math.round(age / 1000 / 60 / 60) + ' hours)');
                    localStorage.removeItem(this.cacheKey);
                    return null;
                }
            } catch (error) {
                console.warn('⚠️ [USER PROFILE] Failed to read cache:', error.message);
                return null;
            }
        }

        /**
         * Clear cached user name (useful for testing)
         */
        clearCache() {
            try {
                localStorage.removeItem(this.cacheKey);
                console.log('🗑️ [USER PROFILE] Cache cleared');
            } catch (error) {
                console.warn('⚠️ [USER PROFILE] Failed to clear cache:', error.message);
            }
        }

        /**
         * Get current detected user name
         */
        getUserName() {
            return this.userName;
        }
    }

    // Export to global namespace
    if (!window.Gracula) {
        window.Gracula = {};
    }
    window.Gracula.UserProfileDetector = UserProfileDetector;

    console.log('✅ [USER PROFILE] UserProfileDetector class registered');
})();

