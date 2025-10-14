# 🏗️ Feature-Sliced Design (FSD) Architecture

## Overview

Gracula v2.0 follows **Feature-Sliced Design (FSD)** principles for maximum scalability, maintainability, and developer experience.

## 📁 Directory Structure

```
src/
├── app/                          # Application Layer
│   ├── GraculaApp.js            # Main application orchestrator
│   └── index.js                 # Entry point
│
├── features/                     # Features Layer
│   └── context/                 # Context-awareness feature
│       ├── model/               # Business logic
│       │   ├── SpeakerDetector.js
│       │   ├── ConversationAnalyzer.js
│       │   └── ContextExtractor.js
│       └── index.js
│
├── widgets/                      # Widgets Layer (Reusable UI)
│   ├── floating-button/
│   │   ├── ui/
│   │   │   └── FloatingButton.js
│   │   └── index.js
│   ├── modal/
│   │   ├── ui/
│   │   │   └── Modal.js
│   │   └── index.js
│   ├── tone-selector/
│   │   ├── ui/
│   │   │   └── ToneSelector.js
│   │   └── index.js
│   ├── context-viewer/
│   │   ├── ui/
│   │   │   └── ContextViewer.js
│   │   └── index.js
│   └── reply-list/
│       ├── ui/
│       │   └── ReplyList.js
│       └── index.js
│
├── entities/                     # Entities Layer (Business Entities)
│   ├── platform/
│   │   ├── model/
│   │   │   └── Platform.js
│   │   ├── lib/
│   │   │   └── detector.js
│   │   └── index.js
│   ├── message/
│   │   ├── model/
│   │   │   └── Message.js
│   │   └── index.js
│   └── tone/
│       ├── model/
│       │   └── Tone.js
│       └── index.js
│
├── shared/                       # Shared Layer (Utilities & Config)
│   ├── config/
│   │   ├── platforms.js         # Platform configurations
│   │   ├── tones.js             # Tone definitions
│   │   ├── api.js               # API settings
│   │   └── index.js
│   └── lib/
│       ├── logger.js            # Logging utility
│       ├── dom-utils.js         # DOM helpers
│       └── index.js
│
├── background.js                 # Service worker (API handler)
├── popup.html                    # Settings popup UI
├── popup.js                      # Settings logic
├── styles.css                    # Global styles
├── manifest.json                 # Extension manifest
└── icons/                        # Extension icons
```

## 🎯 Layer Responsibilities

### 1. **App Layer** (`app/`)
- **Purpose**: Application initialization and orchestration
- **Responsibilities**:
  - Initialize the extension
  - Coordinate features and widgets
  - Handle high-level application flow
  - Manage global state
- **Key Files**:
  - `GraculaApp.js`: Main application class
  - `index.js`: Entry point that initializes the app

### 2. **Features Layer** (`features/`)
- **Purpose**: Encapsulated business features
- **Responsibilities**:
  - Implement specific features (e.g., context-awareness)
  - Contain feature-specific business logic
  - Can use entities, widgets, and shared utilities
- **Current Features**:
  - **context**: Advanced context-awareness with speaker detection

### 3. **Widgets Layer** (`widgets/`)
- **Purpose**: Reusable UI components
- **Responsibilities**:
  - Provide reusable UI components
  - Handle component-specific interactions
  - Independent of business logic
- **Current Widgets**:
  - `floating-button`: The purple vampire button
  - `modal`: Main dialog container
  - `tone-selector`: Tone selection grid
  - `context-viewer`: Context display and editing
  - `reply-list`: Generated replies display

### 4. **Entities Layer** (`entities/`)
- **Purpose**: Core business entities
- **Responsibilities**:
  - Define business entities and their behavior
  - Provide entity-specific utilities
  - No UI components
- **Current Entities**:
  - `platform`: Messaging platform representation
  - `message`: Message entity with validation
  - `tone`: Reply tone configuration

### 5. **Shared Layer** (`shared/`)
- **Purpose**: Shared utilities and configuration
- **Responsibilities**:
  - Provide common utilities
  - Store global configuration
  - No business logic
- **Contents**:
  - `config/`: All configuration files
  - `lib/`: Utility functions (logger, DOM helpers)

## 🔄 Data Flow

```
User Action
    ↓
App Layer (GraculaApp)
    ↓
Features Layer (ContextExtractor)
    ↓
Entities Layer (Platform, Message)
    ↓
Shared Layer (DOM Utils, Logger)
    ↓
Background Script (API Call)
    ↓
AI Response
    ↓
Widgets Layer (ReplyList)
    ↓
User sees results
```

## 📦 Import Rules

### ✅ Allowed Imports

- **App** can import from: Features, Widgets, Entities, Shared
- **Features** can import from: Entities, Shared, Widgets (for UI)
- **Widgets** can import from: Shared only
- **Entities** can import from: Shared only
- **Shared** cannot import from any other layer

### ❌ Forbidden Imports

- Shared → Any other layer
- Entities → Features, Widgets, App
- Widgets → Features, Entities, App
- Features → App
- Lower layers → Higher layers

## 🚀 Adding New Features

### Step 1: Create Feature Directory
```
src/features/your-feature/
├── model/           # Business logic
├── ui/              # Feature-specific UI (optional)
├── lib/             # Feature utilities
└── index.js         # Public API
```

### Step 2: Implement Business Logic
Create models in `model/` directory with clear responsibilities.

### Step 3: Create Widgets (if needed)
If your feature needs reusable UI, create widgets in `widgets/`.

### Step 4: Integrate in App Layer
Import and use your feature in `app/GraculaApp.js`.

### Step 5: Update Manifest
Add new files to `manifest.json` in correct order.

## 🎨 Benefits of FSD

1. **Scalability**: Easy to add new features without affecting existing code
2. **Maintainability**: Clear separation of concerns
3. **Testability**: Each layer can be tested independently
4. **Reusability**: Widgets and entities can be reused across features
5. **Team Collaboration**: Multiple developers can work on different features
6. **Clear Dependencies**: Import rules prevent circular dependencies

## 📚 Further Reading

- [Feature-Sliced Design Official Docs](https://feature-sliced.design/)
- [FSD Examples](https://github.com/feature-sliced/examples)

## 🔧 Development Guidelines

### Naming Conventions
- **Files**: PascalCase for classes (e.g., `SpeakerDetector.js`)
- **Directories**: kebab-case (e.g., `floating-button/`)
- **Exports**: Named exports preferred over default exports

### Code Organization
- Keep files under 300 lines
- One class per file
- Clear, descriptive names
- Comprehensive JSDoc comments

### Testing
- Test each layer independently
- Mock dependencies from lower layers
- Focus on business logic in features
- UI testing for widgets

## 🎯 Next Steps

1. Add more features to `features/` directory
2. Create more reusable widgets
3. Expand entity models
4. Add comprehensive tests
5. Document each feature thoroughly

