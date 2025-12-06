# Gracula Extension: Strategic Technical Report

**Date:** December 3, 2025
**Role:** CTO / Senior Software Architect
**Subject:** Comprehensive Codebase Audit & Optimization Strategy

---

## 1. Executive Summary

The Gracula extension is a sophisticated, privacy-focused AI messaging assistant built on a solid Feature-Sliced Design (FSD) foundation. It successfully implements complex capabilities like local DOM extraction, semantic analysis, and Retrieval-Augmented Generation (RAG) within the constraints of a browser extension.

However, the system currently faces significant risks regarding **fragility in data extraction** (reliance on unstable DOM selectors) and **latency in the RAG pipeline**. To elevate this to a production-grade standard, we must shift from "reactive scraping" to "proactive state management" and optimize the context window construction to maximize LLM performance while minimizing costs.

---

## 2. Architectural Audit

### Strengths
*   **Feature-Sliced Design (FSD):** The codebase is well-organized (`features/`, `entities/`, `widgets/`), promoting separation of concerns and maintainability.
*   **Local-First Analysis:** `ConversationAnalyzer` and `TopicAnalyzer` perform impressive heavy lifting (sentiment, intent, language detection) locally, preserving privacy and reducing API dependency.
*   **Sophisticated RAG:** The implementation of `VectorMemory` with `pgvector` and `IndexedDB` caching is architecturally sound and ahead of many similar extensions.

### Critical Weaknesses & Technical Debt
*   **DOM Fragility (High Risk):** `ContextExtractor.js` relies heavily on specific class names (e.g., `tail-out`, `role="row"`) and attributes (`data-pre-plain-text`). WhatsApp updates frequently; this logic is a ticking time bomb.
    *   *Evidence:* Multiple fallback strategies in `SpeakerDetector.js` suggest a struggle to reliably identify the user.
*   **Sync Latency:** The memory synchronization (`_processMemoryInBackground`) is currently disabled/commented out. When enabled, it processes embeddings in the foreground flow, potentially blocking the UI or delaying replies.
*   **Context Window Inefficiency:** `SmartMessageSelector` selects messages based on count (e.g., "last 30"), not token density. This risks truncating critical context or filling the window with fluff.
*   **Prompt Construction:** `getContextStrings` flattens rich structured data into a single string. Modern Chat LLMs perform significantly better when history is passed as structured `{"role": "user", "content": "..."}` objects.

---

## 3. Feature Gap Analysis

| Feature Area | Current State | Missing / Gap | Impact |
| :--- | :--- | :--- | :--- |
| **Context Awareness** | Extracts text & basic metadata. | **Visual Context & State Tracking:** No awareness of "typing" status, online status, or visual media content beyond basic detection. | AI misses non-verbal cues (e.g., urgency implied by rapid typing). |
| **Memory System** | Basic Semantic Search. | **Hybrid Search & Re-ranking:** Relies purely on cosine similarity. Lacks keyword matching (BM25) for specific terms (names, codes). | RAG misses specific references despite high semantic similarity. |
| **User Identity** | Heuristic detection (`UserProfileDetector`). | **Explicit User Configuration:** No robust way for the user to explicitly set "Who am I?" if detection fails. | Critical failure in "Me" vs "Friend" attribution, corrupting memory. |
| **Feedback Loop** | None. | **RLHF / Correction Mechanism:** User cannot flag bad suggestions to improve future performance. | System repeats mistakes; no personalization learning curve. |

---

## 4. Optimization Strategy

### A. Precision Context Management
**Objective:** Maximize the "Signal-to-Noise" ratio in the LLM context window.

1.  **Token-Aware Selection:** Refactor `SmartMessageSelector` to use a lightweight tokenizer (e.g., `gpt-tokenizer`) to fill the context window to exactly 90% of the limit, prioritizing:
    *   *Immediate Context:* Last 10 messages (High fidelity).
    *   *Semantic Echoes:* RAG results from `VectorMemory`.
    *   *Topical Anchors:* Messages containing high-value keywords identified by `TopicAnalyzer`.
2.  **Structured Prompting:** Deprecate `getContextStrings` in favor of a `getChatMessages()` method that returns an array of OpenAI-compatible message objects. This allows the LLM to distinguish between "System Instructions", "RAG Context", and "Actual Conversation".

### B. Robust Extraction Pipeline
**Objective:** Decouple logic from specific CSS classes.

1.  **MutationObserver Engine:** Replace on-demand scraping with a persistent `MutationObserver` that maintains a "Shadow State" of the conversation. This ensures we capture messages as they arrive, not just when the user clicks "Reply".
2.  **Heuristic Scoring:** Instead of checking `class="tail-out"`, use geometric heuristics (e.g., "messages on the right are mine") which are UI-framework agnostic.

### C. RAG Optimization
**Objective:** Reduce latency and improve recall.

1.  **Asynchronous Vectorization:** Move embedding generation to a dedicated Web Worker or background alarm to prevent UI jank.
2.  **Query Expansion:** In `SemanticSearch.js`, instead of querying just the raw message, generate a "hypothetical document embedding" (HyDE) - ask the LLM to hallucinate a potential answer, embed *that*, and search for it.

---

## 5. Strategic Roadmap

### Phase 1: Foundation Hardening (Weeks 1-2)
*   **Goal:** Stabilize extraction and ensure data integrity.
*   [ ] **Refactor `ContextExtractor`:** Implement `MutationObserver` for real-time message tracking.
*   [ ] **Fix User Detection:** Add a manual override in settings for "My Name" to bypass heuristic failures.
*   [ ] **Enable Background Sync:** Uncomment and robustify `_processMemoryInBackground` with retry logic.

### Phase 2: Intelligence Upgrade (Weeks 3-4)
*   **Goal:** Improve the quality of generated replies.
*   [ ] **Implement Token-Aware Selector:** Replace count-based slicing with token-budgeting logic.
*   [ ] **Structured Prompts:** Update `GraculaApp.js` to send structured chat history to the LLM.
*   [ ] **Enhanced RAG:** Implement "Query Expansion" in `SemanticSearch.js`.

### Phase 3: Production Polish (Weeks 5-6)
*   **Goal:** UX and Performance.
*   [ ] **Feedback UI:** Add Thumbs Up/Down on replies to tune local preferences.
*   [ ] **Performance:** Move `TopicAnalyzer` heavy regex logic to a Web Worker.
*   [ ] **Security:** Audit Supabase RLS policies and implement key rotation.

---

### Immediate Recommendation
**Start with Phase 1: Refactor `ContextExtractor`.** The entire system depends on the quality of input data. If extraction is flaky, the best AI model in the world will produce garbage.