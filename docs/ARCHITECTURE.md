# 🏗️ Gracula Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         GRACULA EXTENSION                        │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐ │
│  │   manifest.json │  │   config.js    │  │   styles.css     │ │
│  │   (Config)     │  │   (Settings)   │  │   (UI Styles)    │ │
│  └────────────────┘  └────────────────┘  └──────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    CONTENT SCRIPT                          │ │
│  │                    (content.js)                            │ │
│  │                                                            │ │
│  │  • Detect messaging platform                              │ │
│  │  • Find input fields                                      │ │
│  │  • Inject floating button                                 │ │
│  │  • Extract conversation context                           │ │
│  │  • Display modal with tones                               │ │
│  │  • Insert generated replies                               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            ↕                                     │
│                    (Chrome Messages)                             │
│                            ↕                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  BACKGROUND SCRIPT                         │ │
│  │                  (background.js)                           │ │
│  │                                                            │ │
│  │  • Handle API calls                                       │ │
│  │  • Build AI prompts                                       │ │
│  │  • Parse responses                                        │ │
│  │  • Manage settings                                        │ │
│  │  • Provide fallback replies                               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            ↕                                     │
│                      (HTTP Request)                              │
│                            ↕                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    POPUP INTERFACE                         │ │
│  │                (popup.html + popup.js)                     │ │
│  │                                                            │ │
│  │  • Settings configuration                                  │ │
│  │  • API key management                                     │ │
│  │  • Model selection                                        │ │
│  │  • Help & documentation                                   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                            ↕
                    (API Request)
                            ↕
┌─────────────────────────────────────────────────────────────────┐
│                    HUGGING FACE API                              │
│                                                                  │
│  • Mistral 7B (default)                                         │
│  • Llama 2 7B                                                   │
│  • Flan-T5 Large                                                │
│  • Falcon 7B                                                    │
└─────────────────────────────────────────────────────────────────┘
```

## Component Interaction Flow

### 1. Page Load & Initialization

```
User Opens Messaging Platform
        ↓
Chrome Loads Extension
        ↓
Content Script Injected
        ↓
Platform Detection
        ↓
Input Field Monitoring Starts
```

### 2. Button Injection

```
Input Field Detected
        ↓
Create Floating Button Element
        ↓
Position Near Input Field
        ↓
Attach Event Listeners
        ↓
Button Visible on Focus
```

### 3. Reply Generation Flow

```
User Clicks Floating Button
        ↓
Extract Conversation Context
        ↓
Display Modal with Tones
        ↓
User Selects Tone
        ↓
Send Message to Background
        ↓
Background Builds Prompt
        ↓
Call Hugging Face API
        ↓
Parse Response
        ↓
Return 3 Replies
        ↓
Display in Modal
        ↓
User Clicks Insert
        ↓
Text Added to Input Field
```

## File Responsibilities

### manifest.json
```
┌─────────────────────────────────┐
│ Extension Configuration         │
├─────────────────────────────────┤
│ • Name & version                │
│ • Permissions                   │
│ • Content script injection      │
│ • Background service worker     │
│ • Popup configuration           │
│ • Icons & resources             │
└─────────────────────────────────┘
```

### config.js
```
┌─────────────────────────────────┐
│ Configuration Data              │
├─────────────────────────────────┤
│ • 11 Tone definitions           │
│ • AI prompts for each tone      │
│ • Platform selectors            │
│ • API settings                  │
│ • Model configurations          │
└─────────────────────────────────┘
```

### content.js
```
┌─────────────────────────────────┐
│ Main Content Script             │
├─────────────────────────────────┤
│ GraculaAssistant Class:         │
│ • init()                        │
│ • detectPlatform()              │
│ • observeInputFields()          │
│ • attachFloatingButton()        │
│ • showToneSelector()            │
│ • extractConversationContext()  │
│ • handleToneSelection()         │
│ • generateReplies()             │
│ • displayReplies()              │
│ • insertReply()                 │
│ • copyReply()                   │
└─────────────────────────────────┘
```

### background.js
```
┌─────────────────────────────────┐
│ Background Service Worker       │
├─────────────────────────────────┤
│ Functions:                      │
│ • handleGenerateReplies()       │
│ • buildPrompt()                 │
│ • callAIAPI()                   │
│ • callHuggingFaceAPI()          │
│ • parseReplies()                │
│ • generateMockReplies()         │
│                                 │
│ Message Handlers:               │
│ • generateReplies               │
│ • updateApiConfig               │
│ • getApiConfig                  │
└─────────────────────────────────┘
```

### styles.css
```
┌─────────────────────────────────┐
│ UI Styling                      │
├─────────────────────────────────┤
│ • Floating button styles        │
│ • Modal dialog styles           │
│ • Tone selector grid            │
│ • Reply cards                   │
│ • Loading animations            │
│ • Responsive design             │
│ • Color scheme                  │
└─────────────────────────────────┘
```

### popup.html + popup.js
```
┌─────────────────────────────────┐
│ Settings Interface              │
├─────────────────────────────────┤
│ • API key input                 │
│ • Model selection               │
│ • Save settings                 │
│ • Load settings                 │
│ • Feature list                  │
│ • Instructions                  │
└─────────────────────────────────┘
```

## Data Flow Diagram

### Message Passing

```
┌──────────────┐                    ┌──────────────┐
│   Content    │ ─── Message ────→  │  Background  │
│   Script     │                    │   Script     │
│              │ ←── Response ───   │              │
└──────────────┘                    └──────────────┘
       ↕                                    ↕
   DOM Access                          API Calls
       ↕                                    ↕
┌──────────────┐                    ┌──────────────┐
│  Web Page    │                    │ Hugging Face │
│  (WhatsApp)  │                    │     API      │
└──────────────┘                    └──────────────┘
```

### Storage Flow

```
┌──────────────┐
│    Popup     │
│   (User)     │
└──────┬───────┘
       │ Save Settings
       ↓
┌──────────────┐
│   Chrome     │
│   Storage    │
│   (Sync)     │
└──────┬───────┘
       │ Load Settings
       ↓
┌──────────────┐
│  Background  │
│   Script     │
└──────────────┘
```

## Platform Detection Logic

```
┌─────────────────────────────────────────────────┐
│ Platform Detection                              │
├─────────────────────────────────────────────────┤
│                                                 │
│ Check window.location.hostname                  │
│         ↓                                       │
│ Match against config.platforms                  │
│         ↓                                       │
│ ┌─────────────────────────────────────────┐   │
│ │ web.whatsapp.com    → WhatsApp          │   │
│ │ instagram.com       → Instagram         │   │
│ │ messenger.com       → Messenger         │   │
│ │ linkedin.com        → LinkedIn          │   │
│ │ twitter.com/x.com   → Twitter/X         │   │
│ │ discord.com         → Discord           │   │
│ │ slack.com           → Slack             │   │
│ │ mail.google.com     → Gmail             │   │
│ │ web.telegram.org    → Telegram          │   │
│ └─────────────────────────────────────────┘   │
│         ↓                                       │
│ Load platform-specific selectors                │
│         ↓                                       │
│ Find input field using selectors                │
│         ↓                                       │
│ Attach floating button                          │
└─────────────────────────────────────────────────┘
```

## Context Extraction Process

```
┌─────────────────────────────────────────────────┐
│ Conversation Context Extraction                 │
├─────────────────────────────────────────────────┤
│                                                 │
│ Query DOM for message elements                  │
│         ↓                                       │
│ Use platform-specific selectors                 │
│         ↓                                       │
│ Get last 5 messages                             │
│         ↓                                       │
│ Extract text content                            │
│         ↓                                       │
│ Filter out empty/long messages                  │
│         ↓                                       │
│ Store in conversationContext array              │
│         ↓                                       │
│ Display preview in modal                        │
│         ↓                                       │
│ Send to background for AI prompt                │
└─────────────────────────────────────────────────┘
```

## AI Prompt Building

```
┌─────────────────────────────────────────────────┐
│ Prompt Construction                             │
├─────────────────────────────────────────────────┤
│                                                 │
│ Start with conversation context                 │
│         ↓                                       │
│ "Conversation context:                          │
│  Message 1: Hello!                              │
│  Message 2: How are you?                        │
│  Message 3: I'm good, thanks!"                  │
│         ↓                                       │
│ Add tone-specific instruction                   │
│         ↓                                       │
│ "Generate a funny, humorous response..."        │
│         ↓                                       │
│ Add formatting instruction                      │
│         ↓                                       │
│ "Generate 3 different reply options.            │
│  Each reply should be on a new line,            │
│  numbered 1., 2., and 3."                       │
│         ↓                                       │
│ Send to Hugging Face API                        │
└─────────────────────────────────────────────────┘
```

## Response Parsing

```
┌─────────────────────────────────────────────────┐
│ API Response Parsing                            │
├─────────────────────────────────────────────────┤
│                                                 │
│ Receive API response                            │
│         ↓                                       │
│ Extract generated_text field                    │
│         ↓                                       │
│ Split by newlines                               │
│         ↓                                       │
│ Match numbered patterns (1., 2., 3.)            │
│         ↓                                       │
│ Extract reply text                              │
│         ↓                                       │
│ Fallback: Split by sentences                    │
│         ↓                                       │
│ Return array of 3 replies                       │
│         ↓                                       │
│ Display in modal                                │
└─────────────────────────────────────────────────┘
```

## Error Handling Strategy

```
┌─────────────────────────────────────────────────┐
│ Error Handling                                  │
├─────────────────────────────────────────────────┤
│                                                 │
│ Try Hugging Face API                            │
│         ↓                                       │
│    Success? ──Yes──→ Return replies             │
│         ↓                                       │
│        No                                       │
│         ↓                                       │
│ Log error to console                            │
│         ↓                                       │
│ Use fallback mock replies                       │
│         ↓                                       │
│ Display with note about API key                 │
│         ↓                                       │
│ User can still use extension                    │
└─────────────────────────────────────────────────┘
```

## Security Considerations

```
┌─────────────────────────────────────────────────┐
│ Security Measures                               │
├─────────────────────────────────────────────────┤
│                                                 │
│ • Minimal permissions (activeTab, storage)      │
│ • No data collection or tracking               │
│ • API key stored in Chrome sync storage         │
│ • HTTPS-only API calls                          │
│ • Content Security Policy enforced              │
│ • No eval() or unsafe code execution            │
│ • Input sanitization (escapeHtml)               │
│ • XSS prevention in DOM manipulation            │
└─────────────────────────────────────────────────┘
```

## Performance Optimizations

```
┌─────────────────────────────────────────────────┐
│ Performance Features                            │
├─────────────────────────────────────────────────┤
│                                                 │
│ • Vanilla JS (no framework overhead)            │
│ • Lazy loading of UI elements                   │
│ • Efficient DOM queries                         │
│ • MutationObserver for dynamic content          │
│ • Debounced event listeners                     │
│ • Minimal CSS (< 10KB)                          │
│ • Small extension size (< 50KB)                 │
│ • Fast API responses (2-5 seconds)              │
└─────────────────────────────────────────────────┘
```

## Extension Lifecycle

```
┌─────────────────────────────────────────────────┐
│ Extension Lifecycle                             │
├─────────────────────────────────────────────────┤
│                                                 │
│ 1. Installation                                 │
│    • Extension installed in Chrome              │
│    • Icons registered                           │
│    • Permissions granted                        │
│                                                 │
│ 2. Page Load                                    │
│    • Content script injected                    │
│    • Platform detected                          │
│    • Input field monitoring starts              │
│                                                 │
│ 3. User Interaction                             │
│    • Button appears on focus                    │
│    • Modal opens on click                       │
│    • Replies generated                          │
│    • Text inserted                              │
│                                                 │
│ 4. Background Tasks                             │
│    • API calls handled                          │
│    • Settings managed                           │
│    • Responses cached                           │
│                                                 │
│ 5. Updates                                      │
│    • Extension can be updated                   │
│    • Settings preserved                         │
│    • No data loss                               │
└─────────────────────────────────────────────────┘
```

---

**This architecture ensures Gracula is:**
- ✅ Fast and responsive
- ✅ Secure and private
- ✅ Extensible and maintainable
- ✅ Compatible across platforms
- ✅ User-friendly and intuitive

