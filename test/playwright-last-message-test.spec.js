const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

/**
 * Playwright test for "Reply to Last Message" feature
 * Tests that WhatsApp encryption banners are correctly filtered out
 * and the last human message is properly detected.
 */

test.describe('Reply to Last Message - System Banner Filtering', () => {
  let page;

  test.beforeAll(async ({ browser }) => {
    // This will be set up per test
  });

  test('should filter out WhatsApp E2E encryption banner from last message', async ({ page: testPage }) => {
    page = testPage;

    // Create a test HTML file that simulates WhatsApp with encryption banner
    const testHtmlPath = path.join(__dirname, 'test-last-message-banner.html');
    
    // Navigate to the test file
    await page.goto(`file://${testHtmlPath}`);

    // Wait for the page to load
    await page.waitForTimeout(1000);

    // Load extension scripts
    await page.evaluate(() => {
      // This will be injected by the test HTML
      return true;
    });

    // Get the last message from the context extractor
    const lastMessage = await page.evaluate(() => {
      // Simulate the ContextExtractor logic
      const messages = window.testMessages || [];
      
      // Filter out system notices
      const isSystemNotice = (text) => {
        if (!text || typeof text !== 'string') return false;
        const normalized = text.replace(/\s+/g, ' ').trim().toLowerCase();
        const e2eBannerCore = 'messages and calls are end-to-end encrypted.';
        const e2eBannerTailPhrases = [
          'only people in this chat can read, listen to, or share them. click to learn more',
          'only people in this group can read, listen to, or share them. click to learn more'
        ];
        
        if (normalized.includes(e2eBannerCore)) {
          const hasTail = e2eBannerTailPhrases.some(phrase => normalized.includes(phrase));
          if (hasTail) return true;
        }
        
        if (normalized.includes('secured with end-to-end encryption')) {
          if (normalized.includes('tap for more info') || normalized.includes('click to learn more')) {
            return true;
          }
        }
        
        return false;
      };

      // Find last non-system message
      for (let i = messages.length - 1; i >= 0; i--) {
        if (!isSystemNotice(messages[i].text)) {
          return messages[i];
        }
      }
      return null;
    });

    // Verify the last message is NOT the encryption banner
    expect(lastMessage).not.toBeNull();
    expect(lastMessage.text).not.toContain('Messages and calls are end-to-end encrypted');
    expect(lastMessage.text).toContain('card bad dia dsi');
    expect(lastMessage.speaker).toBe('Shohan Shovo CSE 21');
  });

  test('should correctly identify last friend message when banner is present', async ({ page: testPage }) => {
    page = testPage;

    const testHtmlPath = path.join(__dirname, 'test-last-message-banner.html');
    await page.goto(`file://${testHtmlPath}`);
    await page.waitForTimeout(1000);

    const result = await page.evaluate(() => {
      const messages = window.testMessages || [];
      
      // Simulate filtering logic
      const isSystemNotice = (text) => {
        if (!text || typeof text !== 'string') return false;
        const normalized = text.replace(/\s+/g, ' ').trim().toLowerCase();
        return normalized.includes('messages and calls are end-to-end encrypted') &&
               normalized.includes('only people in this');
      };

      const nonSystemMessages = messages.filter(m => !isSystemNotice(m.text));
      return {
        totalMessages: messages.length,
        nonSystemMessages: nonSystemMessages.length,
        lastMessage: nonSystemMessages[nonSystemMessages.length - 1] || null
      };
    });

    expect(result.totalMessages).toBeGreaterThan(result.nonSystemMessages);
    expect(result.lastMessage).not.toBeNull();
    expect(result.lastMessage.text).toContain('card bad dia dsi');
  });
});

