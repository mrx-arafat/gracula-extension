# Data Flow & Lifecycle

This document explains how data moves through the Gracula Extension, from the user's browser to the vector database and back.

## 1. Context Extraction (The "Input")
When a user opens the Gracula modal or clicks the floating button:
1.  **`ContextExtractor.extract()`** scans the DOM of the active tab (WhatsApp, etc.).
2.  It identifies:
    *   **Messages**: Text content, sender, timestamp.
    *   **User Identity**: Who is "Me" vs "Friend".
    *   **Platform**: Which site we are on.
3.  It triggers **`_processMemoryInBackground()`** to asynchronously handle long-term memory storage without blocking the UI.

## 2. Memory Processing (The "Storage")
The `VectorMemory` class orchestrates the storage process:
1.  **Conversation Identification**:
    *   It checks if a conversation record exists for the current contact in Supabase (`conversations` table).
    *   If not, it creates one.
2.  **Embedding Generation**:
    *   It takes the last 10 messages from the extracted context.
    *   It calls `EmbeddingService.generateEmbeddingsBatch()`.
    *   **Cache Check**: The service first checks `IndexedDB` to see if we already have an embedding for this exact text.
    *   **API Call**: If not cached, it calls the OpenAI API (`text-embedding-3-small`) via `background.js`.
3.  **Vector Storage**:
    *   The generated embeddings (1536-dimensional vectors) are stored in the `message_embeddings` table in Supabase.
    *   Each record is linked to the `conversation_id` and the user's `user_id`.

## 3. Context Retrieval (The "Recall")
When the user requests a reply (e.g., selects a tone):
1.  **`ContextExtractor.getEnhancedContext()`** is called.
2.  It triggers **`SemanticSearch.findRelevantContext()`**.
3.  **Query Construction**:
    *   A sophisticated search query is built to capture interaction dynamics: `Friend: [last message] | Me: [my last reply] | Topic: [current topic]`.
    *   This structure helps find past examples where the user responded to similar prompts, enabling accurate tone matching.
    *   An embedding is generated for this structured query.
4.  **Vector Search**:
    *   **Stage 1 (Specific)**: It searches Supabase for similar messages *within the current conversation* (`filter_conversation_id`). This helps recall specific details discussed with *this* friend.
    *   **Stage 2 (Global)**: If few results are found, it expands the search to *all* conversations to understand the user's general tone and patterns.
5.  **Filtering**:
    *   Results are filtered to ensure we don't show messages that are already in the current visible context (deduplication).

## 4. Reply Generation (The "Output")
1.  The **Enhanced Context** is assembled:
    *   Current visible messages.
    *   Relevant past messages (from Vector DB).
    *   Tone instructions.
2.  This context is sent to the LLM (OpenAI or Google Gemini) via `background.js`.
3.  The LLM generates a reply that mimics the user's style and incorporates relevant past information.
4.  The reply is displayed in the UI for the user to insert.

## Security & Privacy
- **User Isolation**: All database queries are scoped by `user_id` using Supabase Row Level Security (RLS). User A can never access User B's embeddings.
- **Anonymous Auth**: The extension uses Supabase Anonymous Auth to create a secure session for each user without requiring a login.
- **Local Processing**: DOM extraction happens locally in the browser. Only the text needed for embedding/generation is sent to the API.