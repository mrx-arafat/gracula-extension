# Gracula Extension Technical Documentation

Welcome to the technical documentation for the Gracula Extension. This directory contains detailed information about the architecture, data flow, and setup of the project.

## 📚 Documentation Map

- **[Architecture](./ARCHITECTURE.md)**: High-level overview of the system components, including the new Smart Context system and Vector Memory.
- **[Data Flow](./DATA_FLOW.md)**: Step-by-step explanation of how data moves from the browser to the AI and back, including the RAG (Retrieval-Augmented Generation) pipeline.
- **[Supabase Setup](./SUPABASE_SETUP.md)**: Instructions for setting up the backend database for long-term memory.

## 🧠 Key Technical Features

### 1. Smart Context Extraction
The extension doesn't just grab the last few messages. It uses a sophisticated pipeline to ensure the AI understands the *full* context:
- **Deep History**: Captures up to 200 messages to understand long-term conversation threads.
- **Smart Selection**: Uses `SmartMessageSelector` to intelligently pick the most relevant messages from long histories, prioritizing:
    - Recent messages (immediate context).
    - Topic-relevant messages (using keyword scoring).
    - Question/Answer pairs (to preserve logical flow).
- **Summarization**: For extremely long chats, `ConversationSummarizer` creates a concise summary of older messages while keeping recent ones verbatim.

### 2. RAG (Retrieval-Augmented Generation)
To make replies sound like *you*, Gracula uses a specialized RAG pipeline:
- **Vector Memory**: Stores your past conversations in Supabase using `pgvector`.
- **Semantic Search**: When you reply, it searches your history for *similar interaction patterns*.
    - *Query Construction*: It builds a query like `Friend: [their message] | Me: [my previous reply]` to find past situations where you responded to similar prompts.
    - *Speaker Awareness*: It explicitly filters for your own past replies to capture your specific tone and style.

### 3. Hybrid Autocomplete
The autocomplete system combines three layers for speed and accuracy:
- **Instant Offline**: Uses local pattern matching and n-gram prediction for <10ms response times.
- **Cached AI**: Caches AI responses for common phrases.
- **Live AI**: Fetches context-aware completions from the LLM in the background.

## 🛠️ Debugging

The system includes built-in debug logging to help you understand what's happening "behind the scenes":
- **Semantic Search**: Look for `[SEMANTIC SEARCH DEBUG]` in the console to see exactly what query is being sent to the vector DB.
- **Memory**: Look for `[MEMORY DEBUG]` to verify that messages are being correctly stored with speaker metadata.