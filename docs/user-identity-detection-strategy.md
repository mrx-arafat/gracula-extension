# User Identity Detection Strategy - Complete Implementation Plan

## 📋 Overview

This document outlines the complete strategy for implementing robust user identity detection in the Gracula Chrome extension for WhatsApp Web.

## 🎯 Goal

Automatically detect the user's actual WhatsApp name (e.g., "Arafat") so the extension can:
- Recognize when "@Arafat" in messages refers to the current user
- Correctly attribute user's own messages (not as "Arafat (OTHER)" but as "Arafat (YOU)")
- Include user identity in conversation context sent to AI
- Avoid duplicate user entries in participant lists

## 🔍 Current Problem

**Issue**: UserProfileDetector fails on live WhatsApp Web because:
- User name is NOT exposed in the main chat view DOM
- User name is ONLY accessible in the Profile panel (requires clicking Profile button)
- Current detection strategies only check static DOM elements in the main view

**Evidence from Testing**:
```
Console Log:
🧛 [SPEAKER] Detecting speaker for: 013123003214:29 pm4:29 pmmsg-dblcheck
🧛 [SPEAKER] Using resolved sender name: Arafat (OTHER)  ← WRONG!

Expected:
🧛 [SPEAKER] Using resolved sender name: Arafat (YOU)  ← CORRECT!
```

## 🏗️ Complete Strategy

### **Detection Priority Order**

```
1. Cache (localStorage) - Fastest, use cached name if available
2. Profile Panel Strategy (NEW) - Most reliable for current WhatsApp Web
3. WhatsApp LocalStorage (NEW) - Check WhatsApp's own storage
4. Header Profile Button - Original strategy (may not work on current WhatsApp)
5. Profile Image Alt - Original strategy
6. Aria Labels - Original strategy
7. Header Text - Original strategy
8. Menu Button - Original strategy
9. Manual Input Fallback (NEW) - Last resort, ask user
```

---

## 📦 Implementation Components

### **Component 1: Helper Methods**

#### `waitForElement(selector, timeout = 3000)`
**Purpose**: Wait for a DOM element to appear  
**Parameters**:
- `selector` (string): CSS selector to wait for
- `timeout` (number): Max wait time in milliseconds (default: 3000ms)

**Returns**: Promise<Element | null>

**Implementation**:
```javascript
async waitForElement(selector, timeout = 3000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const element = document.querySelector(selector);
    if (element) return element;
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
  }
  
  return null; // Timeout
}
```

---

#### `isProfilePanelOpen()`
**Purpose**: Check if Profile panel is currently open  
**Returns**: boolean

**Implementation**:
```javascript
isProfilePanelOpen() {
  // Check for Profile heading
  const profileHeading = document.querySelector('heading:has-text("Profile")');
  if (profileHeading) return true;
  
  // Alternative: Check for Profile panel structure
  const profilePanel = document.querySelector('[data-testid="profile-panel"]');
  return !!profilePanel;
}
```

---

#### `clickProfileButton()`
**Purpose**: Click the Profile button and wait for panel to open  
**Returns**: Promise<boolean> - true if successful

**Implementation**:
```javascript
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
    
    // Wait for Profile panel to appear
    const profileHeading = await this.waitForElement('h1:has-text("Profile")', 3000);
    if (!profileHeading) {
      console.log('⚠️ [USER PROFILE] Profile panel did not open');
      return false;
    }
    
    console.log('✅ [USER PROFILE] Profile panel opened');
    return true;
  } catch (error) {
    console.error('❌ [USER PROFILE] Error clicking Profile button:', error);
    return false;
  }
}
```

---

#### `extractNameFromProfilePanel()`
**Purpose**: Extract user name from the Profile panel DOM  
**Returns**: string | null

**DOM Structure** (from testing):
```html
<generic>
  <generic>Name</generic>
  <generic>
    <generic>Arafat</generic>  ← TARGET THIS
    <button>Click to edit Name</button>
  </generic>
</generic>
```

**Implementation**:
```javascript
extractNameFromProfilePanel() {
  try {
    // Strategy 1: Find "Name" label, then get next sibling's text
    const nameLabels = Array.from(document.querySelectorAll('*')).filter(el => 
      el.textContent.trim() === 'Name' && el.children.length === 0
    );
    
    for (const label of nameLabels) {
      const parent = label.parentElement;
      if (!parent) continue;
      
      // Look for sibling containing the actual name
      const siblings = Array.from(parent.parentElement.children);
      const labelIndex = siblings.indexOf(parent);
      
      if (labelIndex >= 0 && labelIndex < siblings.length - 1) {
        const valueContainer = siblings[labelIndex + 1];
        const nameElement = valueContainer.querySelector('*');
        
        if (nameElement && nameElement.textContent) {
          const name = nameElement.textContent.trim();
          if (name && name !== 'Click to edit Name') {
            console.log('✅ [USER PROFILE] Extracted name from Profile panel:', name);
            return name;
          }
        }
      }
    }
    
    // Strategy 2: Look for pattern "Name" followed by text content
    const allElements = document.querySelectorAll('*');
    for (let i = 0; i < allElements.length - 1; i++) {
      if (allElements[i].textContent.trim() === 'Name') {
        const nextElement = allElements[i + 1];
        const name = nextElement.textContent.trim();
        if (name && name !== 'Click to edit Name' && name.length > 0) {
          console.log('✅ [USER PROFILE] Extracted name (strategy 2):', name);
          return name;
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
```

---

#### `closeProfilePanel()`
**Purpose**: Close the Profile panel by clicking Chats button  
**Returns**: Promise<boolean> - true if successful

**Implementation**:
```javascript
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
```

---

### **Component 2: New Detection Strategies**

#### **Strategy 1: Profile Panel Detection** (NEW - Priority 2)

**Purpose**: Most reliable method for current WhatsApp Web structure

**Implementation**:
```javascript
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
```

---

#### **Strategy 2: WhatsApp LocalStorage Detection** (NEW - Priority 3)

**Purpose**: Check if WhatsApp stores user info in localStorage

**Implementation**:
```javascript
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
```

---

#### **Strategy 3: Manual Input Fallback** (NEW - Priority last)

**Purpose**: Last resort - ask user to enter their name

**Implementation**:
```javascript
async detectFromManualInput() {
  console.log('🔍 [USER PROFILE] Trying Manual Input strategy (last resort)...');
  
  try {
    // Check if we've already asked the user
    const manualName = localStorage.getItem('gracula-user-name-manual');
    if (manualName) {
      console.log('✅ [USER PROFILE] Using manually entered name:', manualName);
      return manualName;
    }
    
    // Prompt user (only once)
    const name = prompt(
      '🧛 Gracula AI needs your WhatsApp name to work better.\n\n' +
      'Please enter your name (as it appears in WhatsApp):'
    );
    
    if (name && this.validateUserName(name)) {
      const trimmedName = name.trim();
      localStorage.setItem('gracula-user-name-manual', trimmedName);
      console.log('✅ [USER PROFILE] User manually entered name:', trimmedName);
      return trimmedName;
    }
    
    console.log('⚠️ [USER PROFILE] User did not provide a valid name');
    return null;
  } catch (error) {
    console.error('❌ [USER PROFILE] Manual Input strategy error:', error);
    return null;
  }
}
```

---

### **Component 3: Updated detectUserProfile() Method**

**Updated Priority Order**:

```javascript
async detectUserProfile() {
  console.log('🔍 [USER PROFILE] Starting user profile detection...');
  
  // 1. Try cache first (fastest)
  const cachedName = this.getCachedUserName();
  if (cachedName) {
    console.log('✅ [USER PROFILE] Using cached name:', cachedName);
    return cachedName;
  }
  
  // 2. Try Profile Panel (most reliable for current WhatsApp)
  const profilePanelName = await this.detectFromProfilePanel();
  if (profilePanelName && this.validateUserName(profilePanelName)) {
    this.cacheUserName(profilePanelName);
    return profilePanelName;
  }
  
  // 3. Try WhatsApp LocalStorage
  const localStorageName = this.detectFromWhatsAppLocalStorage();
  if (localStorageName && this.validateUserName(localStorageName)) {
    this.cacheUserName(localStorageName);
    return localStorageName;
  }
  
  // 4-8. Try original strategies (Header, Image, Aria, etc.)
  const strategies = [
    { name: 'Header Profile Button', method: () => this.detectFromHeaderProfile() },
    { name: 'Profile Image Alt', method: () => this.detectFromProfileImage() },
    { name: 'Aria Labels', method: () => this.detectFromAriaLabels() },
    { name: 'Header Text', method: () => this.detectFromHeaderText() },
    { name: 'Menu Button', method: () => this.detectFromMenuButton() }
  ];
  
  for (const strategy of strategies) {
    console.log(`🔍 [USER PROFILE] Trying strategy: ${strategy.name}`);
    const name = await strategy.method();
    if (name && this.validateUserName(name)) {
      console.log(`✅ [USER PROFILE] Success with ${strategy.name}:`, name);
      this.cacheUserName(name);
      return name;
    }
  }
  
  // 9. Last resort: Manual Input (only if all else fails)
  const manualName = await this.detectFromManualInput();
  if (manualName && this.validateUserName(manualName)) {
    this.cacheUserName(manualName);
    return manualName;
  }
  
  // All strategies failed
  console.log('⚠️ [USER PROFILE] All detection strategies failed, using fallback "You"');
  return null;
}
```

---

## ✅ Success Criteria

After implementation, the extension should:

1. ✅ Automatically detect user name "Arafat" from WhatsApp Web
2. ✅ Correctly attribute phone number message as "Arafat (YOU)" not "Arafat (OTHER)"
3. ✅ Include `👤 User: Arafat` in conversation context
4. ✅ Show only "Arafat" in participant list (not "You, Arafat")
5. ✅ Recognize "@Arafat" mentions as referring to the current user
6. ✅ Work non-intrusively (close Profile panel after extraction)
7. ✅ Cache result for 24 hours (avoid repeated Profile panel clicks)

---

## 🧪 Testing Plan

1. **Test on Live WhatsApp Web**:
   - Open "YouTube and Music Premium" chat
   - Click Gracula button
   - Verify console logs show: `✅ [CONTEXT] User profile detected: Arafat`
   - Verify phone number message attributed correctly

2. **Test Caching**:
   - First run: Should click Profile panel
   - Second run (within 24 hours): Should use cache (no Profile panel click)

3. **Test Fallback**:
   - Clear cache
   - Test with WhatsApp in different states
   - Verify graceful degradation

---

## 📊 Expected Console Output

```
🔍 [CONTEXT] Detecting user profile...
🔍 [USER PROFILE] Starting user profile detection...
🔍 [USER PROFILE] Trying Profile Panel strategy...
🔍 [USER PROFILE] Clicked Profile button
✅ [USER PROFILE] Profile panel opened
✅ [USER PROFILE] Extracted name from Profile panel: Arafat
🔍 [USER PROFILE] Clicked Chats button to close Profile panel
✅ [USER PROFILE] Profile panel closed
✅ [CONTEXT] User profile detected: Arafat
👤 [SPEAKER] Current user set to: Arafat
🧛 [SPEAKER] Detecting speaker for: 013123003214:29 pm4:29 pmmsg-dblcheck
🧛 [SPEAKER] Using resolved sender name: Arafat (YOU)  ← CORRECT!
```

---

## 🚀 Implementation Status

- [ ] Add helper methods to UserProfileDetector.js
- [ ] Implement Profile Panel detection strategy
- [ ] Implement WhatsApp LocalStorage strategy
- [ ] Implement Manual Input fallback
- [ ] Update detectUserProfile() with new priority order
- [ ] Test on live WhatsApp Web
- [ ] Verify all success criteria met

---

**End of Strategy Document**

