# Gracula Extension Architecture

## Overview
Gracula is a Chrome Extension designed to provide AI-powered context-aware replies for messaging platforms like WhatsApp. It uses a Feature-Sliced Design (FSD) architecture to ensure scalability and maintainability.

## Core Components

### 1. Context Extraction (`src/features/context`)
- **ContextExtractor**: The brain of the extension. It analyzes the DOM of the active tab to extract messages, identify the user, and understand the conversation flow.
- **UserProfileDetector**: Identifies the current user to distinguish between "sent" and "received" messages.
- **ConversationAnalyzer**: Uses heuristics and AI to determine the tone, topic, and urgency of the conversation.
- **SmartMessageSelector**: Intelligently selects the most relevant messages from long conversations (up to 200 messages) to maximize context quality within token limits. It prioritizes recent messages, topic keywords, and Q&A pairs.
- **ConversationSummarizer**: Compresses older parts of very long conversations into a concise summary, preserving the overall context while freeing up space for recent details.

### 2. Vector Memory (`src/features/memory`)
- **VectorMemory**: Orchestrates the long-term memory system. It captures conversations, generates embeddings, and stores them in Supabase.
- **EmbeddingService**: Generates vector embeddings for text using OpenAI's `text-embedding-3-small` model (1536 dimensions). It includes an IndexedDB cache to reduce API costs and latency.
- **VectorStore**: Handles CRUD operations with the Supabase database, including storing conversations and performing semantic searches.
- **SemanticSearch**: Retrieves relevant past messages based on the current conversation context. It uses a specialized query construction strategy (`Friend: [msg] | Me: [reply]`) to find past interactions with similar *dynamics* and *tone*, ensuring the AI mimics the user's specific style.

### 3. Background Services (`src/background.js`)
- Handles API calls (OpenAI, Google Gemini, Supabase) to avoid CORS issues in content scripts.
- Manages the extension's configuration and state.
- Coordinates hot reloading and keep-alive mechanisms.

### 4. UI Widgets (`src/widgets`)
- **FloatingButton**: The entry point for the user interaction.
- **Modal**: The main interface for selecting tones and viewing generated replies.
- **Autocomplete**: Provides inline suggestions while typing.

## Data Flow

1.  **Extraction**: User opens a chat -> `ContextExtractor` reads the DOM.
2.  **Memory Processing**:
    *   `ContextExtractor` triggers `VectorMemory.processConversation()` in the background.
    *   `EmbeddingService` generates vectors for new messages.
    *   `VectorStore` saves these vectors to Supabase (`message_embeddings` table).
3.  **Generation**:
    *   User clicks "Reply" -> `ContextExtractor` gathers current messages.
    *   `SemanticSearch` queries Supabase for similar past messages (filtered by the current contact).
    *   The enhanced context (current messages + relevant past history) is sent to the LLM (OpenAI/Gemini).
    *   The LLM generates a personalized reply based on the user's historical tone and patterns.

## Tech Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML, CSS.
- **Database**: Supabase (PostgreSQL + pgvector).
- **AI Models**: OpenAI (GPT-3.5/4, Embeddings), Google Gemini.
- **Build Tool**: None (Native ES Modules for Chrome Extension).

## Scalability Considerations
- **User Isolation**: Row Level Security (RLS) in Supabase ensures users can only access their own data.
- **Caching**: IndexedDB caches embeddings locally to minimize API calls.
- **Efficient Search**: `pgvector` with IVFFlat indexes (optional) allows fast similarity searches even with millions of vectors.
- **Batch Processing**: Embeddings are generated and stored in batches to handle high-volume chats.