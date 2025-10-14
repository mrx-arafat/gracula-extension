// DOM Utility Functions
// Helper functions for DOM manipulation

window.Gracula = window.Gracula || {};
window.Gracula.DOMUtils = window.Gracula.DOMUtils || {};

/**
 * Safely query selector with error handling
 */
window.Gracula.DOMUtils.safeQuerySelector = function(selector, context = document) {
  try {
    return context.querySelector(selector);
  } catch (error) {
    console.error('Invalid selector:', selector, error);
    return null;
  }
}

/**
 * Safely query all selectors
 */
window.Gracula.DOMUtils.safeQuerySelectorAll = function(selector, context = document) {
  try {
    return context.querySelectorAll(selector);
  } catch (error) {
    console.error('Invalid selector:', selector, error);
    return [];
  }
};

/**
 * Wait for element to appear in DOM
 */
window.Gracula.DOMUtils.waitForElement = function(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
};

/**
 * Check if element is visible
 */
window.Gracula.DOMUtils.isElementVisible = function(element) {
  if (!element) return false;

  const style = window.getComputedStyle(element);
  return style.display !== 'none' &&
         style.visibility !== 'hidden' &&
         style.opacity !== '0';
};

/**
 * Get element position relative to viewport
 */
window.Gracula.DOMUtils.getElementPosition = function(element) {
  if (!element) return null;

  const rect = element.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    bottom: rect.bottom,
    right: rect.right,
    width: rect.width,
    height: rect.height
  };
};

/**
 * Escape HTML to prevent XSS
 */
window.Gracula.DOMUtils.escapeHtml = function(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Create element with attributes
 */
window.Gracula.DOMUtils.createElement = function(tag, attributes = {}, children = []) {
  const element = document.createElement(tag);
  
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      element.addEventListener(key.substring(2).toLowerCase(), value);
    } else {
      element.setAttribute(key, value);
    }
  });
  
  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      element.appendChild(child);
    }
  });
  
  return element;
};

/**
 * Trigger input event on element
 */
window.Gracula.DOMUtils.triggerInputEvent = function(element) {
  if (!element) return;

  const event = new Event('input', { bubbles: true, cancelable: true });
  element.dispatchEvent(event);

  // Also trigger change event for some platforms
  const changeEvent = new Event('change', { bubbles: true, cancelable: true });
  element.dispatchEvent(changeEvent);
};

