# BuildYourOwnRAG

<img width="3384" height="1858" alt="BuildyourownRagdrawing" src="https://github.com/user-attachments/assets/d175ad72-481f-4c6a-9f1f-25ec0127a67c" />

## 1. Project Overview
**BuildYourOwnRAG** is a production-inspired Retrieval-Augmented Generation system built from scratch using JavaScript. It features a custom Vector Database with HNSW, KD-Tree, and Brute Force search, local Ollama-powered embeddings and LLMs, semantic search, document ingestion, and a complete RAG pipeline without LangChain or LlamaIndex. It is not a wrapper around LangChain, LlamaIndex, or Pinecone. Instead, it is a ground-up reconstruction of the core primitives required for semantic search and retrieval-augmented generation:

- A **custom in-memory Vector Database** supporting multiple index structures simultaneously.
- A **from-scratch HNSW** (Hierarchical Navigable Small World) graph for approximate nearest-neighbor search.
- A **from-scratch KD-Tree** for exact spatial partitioning search.
- Native distance metrics (Cosine, Euclidean, Manhattan) implemented without external math libraries.
- A pluggable RAG orchestration layer that uses **Ollama** for local embeddings and inference.

The project is designed as a **reference implementation** for engineers who want to understand how vector retrieval actually works under the hood, rather than treating it as a black-box API call.

---

## 2. Motivation

Most RAG repositories today are integration exercises: they connect OpenAI embeddings to a Pinecone index, wrap it in a LangChain chain, and call it a day. That teaches deployment patterns, but it does not teach retrieval algorithms.

This project exists to answer deeper questions:

- How does a vector index actually store and traverse high-dimensional points?
- What are the trade-offs between exact KD-Tree search, brute-force linear scan, and approximate HNSW graph search?
- What is the real latency cost of each approach, and how do they scale?
- Can you build a functional RAG system using only local models and zero managed cloud APIs?

If you are studying information retrieval, vector databases, or the internals of semantic search, this repository is intended as a readable, hackable baseline.

---

## 3. Key Features

- **Custom Vector Search Engine**: Brute-force linear scan, KD-Tree, and HNSW all run side-by-side in the same process.
- **Algorithm Benchmarking**: Built-in endpoint to compare latency and recall across all three search strategies on the same query vector.
- **Local-First RAG**: Uses Ollama for both embedding (`nomic-embed-text`) and generation (`llama3.2:3b`). No API keys required.
- **Document Chunking Pipeline**: Configurable sliding-window chunking with overlap, producing vector embeddings per chunk.
- **Context-Aware Prompt Builder**: Strict-context prompting to prevent hallucination when retrieved chunks do not contain the answer.
- **In-Memory Architecture**: No external database dependencies. The entire vector store lives in JavaScript heap memory for fast iteration and debugging.

---

## 4. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        HTTP Client                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Express Server                           │
│  ┌──────────────┐ ┌─────────────┐ ┌──────────────────────┐  │
│  │ /api/vectors │ │ /api/docs   │ │ /api/ask             │  │
│  │ /api/search  │ │ /api/ask    │ │ /api/visualization   │  │
│  └──────┬───────┘ └──────┬──────┘ └──────────┬───────────┘  │
└─────────┼────────────────┼─────────────────────┼────────────┘
          │                │                     │
┌─────────▼────────────────┼─────────────────────▼────────────┐
│   Controllers            │            RAGService            │
│  ┌─────────────┐         │  ┌──────────────────────────┐    │
│  │ vector      │         │  │ 1. Embed query           │    │
│  │ document    │         │  │ 2. HNSW search           │    │
│  │ rag         │         │  │ 3. Build context         │    │
│  │ system      │         │  │ 4. Generate answer       │    │
│  └──────┬──────┘         │  └──────────────────────────┘    │
└─────────┼────────────────┼──────────────────────────────────┘
          │                │
┌─────────▼────────────────▼──────────────────────────────────┐
│                        Services                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ ChunkService │  │ OllamaService│  │ TextChunker  │       │
│  │ (chunking)   │  │ (embed + LLM)│  │ (overlap)    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                     Databases / Indices                     │
│  ┌────────────────────────────────────────────────────┐     │
│  │  VectorDB (multi-index)                            │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │     │
│  │  │BruteForce│  │ KD-Tree  │  │ HNSW (custom)    │  │     │
│  │  │ O(n)     │  │ O(log n) │  │ O(log n) approx  │  │     │
│  │  └──────────┘  └──────────┘  └──────────────────┘  │     │
│  └────────────────────────────────────────────────────┘     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  DocumentDB (HNSW-only)                             │    │
│  │  Stores {id, title, chunkIndex, text, vector}       │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
                  ┌───────────────┐
                  │    Ollama     │
                  │  (localhost)  │
                  └───────────────┘
```

---

## 5. System Architecture

The system is organized into four vertical layers:

1. **Transport Layer**: Express HTTP server with JSON body parsing and CORS.
2. **Application Layer**: REST controllers and route handlers. No middleware-heavy frameworks.
3. **Service Layer**: Business logic for chunking, embedding, and RAG orchestration.
4. **Data Layer**: In-memory data structures (`VectorDB`, `DocumentDB`) backed by custom search algorithms.

All state is held in memory. There are no database drivers, no ORMs, and no connection pools. This is intentional: it keeps the project focused on algorithms and retrieval mechanics rather than persistence and schema migration.

---

## 6. RAG Pipeline

The end-to-end RAG pipeline operates in five deterministic steps:

1. **Ingest**: Raw text is split into overlapping chunks (`chunkSize` words, `overlap` words). Each chunk receives a UUID.
2. **Embed**: Every chunk is sent to Ollama (`nomic-embed-text`) to produce a 768-dimensional vector.
3. **Index**: Each chunk document `{id, title, chunkIndex, text, vector}` is inserted into `DocumentDB`, which uses the custom HNSW index.
4. **Query**: The user question is embedded via the same Ollama model, producing a query vector.
5. **Retrieve & Generate**: The query vector performs a k-NN search on HNSW. The top-k chunks are concatenated into a strict-context prompt and sent to the LLM (`llama3.2:3b`) for a grounded answer.

If no relevant chunk is found, the prompt explicitly instructs the model to reply:
> *"I couldn't find that information in the provided documents."*

---

## 7. Project Structure

```
BACKEND/
├── src/
│   ├── algorithms/
│   │   ├── bruteforce/BruteForce.js      # Linear scan k-NN
│   │   ├── hnsw/
│   │   │   ├── HNSW.js                  # Approximate graph index
│   │   │   ├── HNSWNode.js              # Node with layered neighbor sets
│   │   │   └── PriorityQueue.js         # Sorted-array priority queue
│   │   ├── kdtree/
│   │   │   ├── KDTree.js                # Space-partitioning tree
│   │   │   └── KDNode.js                # Axis-aligned node
│   │   └── metrics/
│   │       ├── cosine.js                # Cosine distance
│   │       ├── euclidean.js             # L2 distance
│   │       ├── manhattan.js             # L1 distance
│   │       └── index.js                 # Metric dispatch
│   ├── config/
│   │   └── database.js                  # Singleton wiring (VectorDB, DocumentDB, Ollama)
│   ├── controllers/
│   │   ├── document.controller.js       # Document CRUD
│   │   ├── rag.controller.js            # /api/ask endpoint
│   │   ├── vector.controller.js         # Vector search, insert, benchmark
│   │   ├── system.controller.js         # Health, stats, HNSW graph info
│   │   └── visualizationController.js   # Aggregated document vectors for UI plotting
│   ├── database/
│   │   ├── VectorDB.js                  # Multi-index vector store
│   │   └── DocumentDB.js                # HNSW-backed document chunk store
│   ├── data/
│   │   ├── demoVectors.js               # 16D synthetic vectors (CS, Math, Food, Sports)
│   │   └── loadDemoData.js              # Boot-time loader
│   ├── routes/
│   │   ├── document.routes.js
│   │   ├── rag.routes.js
│   │   ├── system.routes.js
│   │   ├── vector.routes.js
│   │   └── VisualizationRoutes.js
│   ├── services/
│   │   ├── ChunkService.js              # Static word-level chunking
│   │   ├── DocumentService.js           # Async chunk + embed + store
│   │   ├── OllamaService.js             # HTTP client for Ollama
│   │   └── RAGService.js                # End-to-end RAG orchestration
│   ├── utils/
│   │   ├── PromptBuilder.js             # Strict-context prompt template
│   │   └── TextChunker.js               # Configurable chunker instance
│   ├── app.js                           # Express application setup
│   ├── server.js                        # Entry point / listener
│   └── test.js                          # Algorithm unit tests and manual RAG tests
├── package.json
└── .gitignore
```

---


## 8. Core Components

### Document Pipeline

- `TextChunker` splits text on word boundaries using configurable `chunkSize` and `overlap`.
- `DocumentService` orchestrates chunking, embedding, and insertion into `DocumentDB`.
- Each chunk is treated as an independent retrievable unit, preserving metadata (`title`, `chunkIndex`).

  
### Embedding Engine

- `OllamaService` communicates with a local Ollama instance via HTTP.
- Embedding model: `nomic-embed-text` (768-d output).
- Generation model: `llama3.2:3b` (or any model you pull locally).
- No OpenAI, no Cohere, no cloud API keys.


### Vector Database

- `VectorDB` is a multi-index registry. Every inserted vector is written into three independent indices simultaneously.
- This allows A/B testing and latency benchmarking without duplicating data or replicating infrastructure.
- `DocumentDB` is a specialized HNSW-only index for the RAG document store, using 768-d embeddings.


### Search Algorithms

Three algorithms are implemented and exposed through a unified interface:

| Algorithm   | Time Complexity| Exact? | Use Case                                |
|-------------|----------------|--------|-----------------------------------------|
| BruteForce  | O(n)           | Yes    | Baseline correctness, small n           |
| KD-Tree     | O(log n) avg   | Yes    | Low-dimensional exact search            |
| HNSW        | O(log n) approx| No     | High-dim approximate retrieval at scale |

### RAG Engine

- `RAGService` couples `DocumentDB` with `OllamaService`.
- It guarantees deterministic behavior: embed → search → build prompt → generate.
- `PromptBuilder` enforces a strict-context fence to reduce hallucination risk.

---

## 9. HNSW Implementation

The HNSW index is written from scratch in pure JavaScript. It is not a binding to `hnswlib` or `faiss`.

### Design Parameters

| Parameter         | Default | Description                                      |
|-------------------|---------|--------------------------------------------------|
| `M`               | 8       | Max neighbors per node per layer                 |
| `efConstruction`  | 200     | Candidate pool size during insert                |
| `efSearch`        | 50      | Candidate pool size during query                 |
| `metric`          | cosine  | Distance function (cosine, euclidean, manhattan) |

### Graph Mechanics

- **Layered graph**: Each node is assigned a random level via a coin-flip geometric distribution (`randomLevel`).
- **Greedy descent**: Query starts at the entry point and descends layer-by-layer, always moving to the nearest neighbor at the current layer.
- **Beam search at layer 0**: A best-first expansion collects the `ef` closest candidates, then prunes to the top `k`.
- **Neighbor pruning**: When a node exceeds `M` edges, it is pruned to the `M` closest neighbors by the chosen metric.

### Node Structure

```js
class HNSWNode {
  constructor(item, level) {
    this.item = item;           // { id, vector, ... }
    this.level = level;         // highest layer this node exists in
    this.neighbors = new Map(); // layer -> Set<neighborId>
  }
}
```

### Search API

```js
const results = hnsw.search(queryVector, k = 5);
// returns: [{ id, vector, distance, ... }, ...]
```

---

## 10. Search Algorithms Comparison

The `VectorDB` class exposes a `benchmark()` method that runs the same query vector through all three algorithms and returns wall-clock timing.

### Benchmark Endpoint

```http
GET /api/benchmark?v=0.9,0.8,0.7,0.6,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1&k=5&metric=cosine
```

### Response Shape

```json
{
  "success": true,
  "benchmark": [
    { "algorithm": "bruteforce", "time": 0.052, "results": [...] },
    { "algorithm": "kdtree",     "time": 0.018, "results": [...] },
    { "algorithm": "hnsw",       "time": 0.004, "results": [...] }
  ]
}
```

### Trade-off Summary

- **BruteForce**: Simpler than binary search. Always correct. Becomes slow past a few thousand vectors.
- **KD-Tree**: Excellent for exact search in low-to-moderate dimensions. Performance degrades in very high dimensions (curse of dimensionality).
- **HNSW**: The practical choice for 768-d dense embeddings. Approximate, but sub-millisecond retrieval even with tens of thousands of nodes in memory.

---

## 11. API Endpoints

### System

| Method | Endpoint         | Description                                  |
|--------|------------------|----------------------------------------------|
| `GET`  | `/api/status`    | Ollama health check + active model names     |
| `GET`  | `/api/stats`     | Vector counts (demo + documents)             |
| `GET`  | `/api/hnsw-info` | HNSW graph statistics (nodes, levels, edges) |

### Vectors (Multi-Index)

| Method | Endpoint          | Description                                    |
|--------|------------------ |------------------------------------------------|
| `GET`  | `/api/items`      | List all vectors in `VectorDB`                 |
| `POST` | `/api/search`     | Semantic search via text embedding             |
| `POST` | `/api/insert`     | Insert a raw vector object                     |
| `DEL`  | `/api/delete/:id` | Remove a vector                                |
| `GET`  | `/api/benchmark`  | Compare all three algorithms on the same query |

### Documents (RAG Corpus)

| Method | Endpoint               | Description                           |
|--------|------------------------|---------------------------------------|
| `POST` | `/api/documents`       | Ingest a document (`{ title, text }`) |
| `GET`  | `/api/documents`       | List all stored document chunks       |
| `DEL`  | `/api/documents/:id`   | Delete a chunk by UUID                |

### RAG

| Method | Endpoint   | Description                                                           |
|--------|------------|-----------------------------------------------------------------------|
| `POST` | `/api/ask` | Ask a question (`{ question, k = 3 }`).  Returns `answer` + `sources` |

### Visualization

| Method | Endpoint                | Description                                          |
|--------|-------------------------|------------------------------------------------------|
| `GET`  | `/api/visualization`    | Aggregated per-document average vectors for plotting |

---


## 12. Installation

```bash
git clone <repo-url>
cd BuildYourOwnRAG/BACKEND
npm install
```

---

## 13. Prerequisites

- **Node.js** >= 18
- **Ollama** installed and running locally: https://ollama.com
- Pull the required models:

```bash
ollama pull nomic-embed-text
ollama pull llama3.2:3b
```

---

## 14. Environment Variables

Create a `.env` file in `BACKEND/` (optional; defaults are provided):

```env
PORT=8080
OLLAMA_URL=http://localhost:11434
EMBED_MODEL=nomic-embed-text
GEN_MODEL=llama3.2:3b
```

| Variable      | Default                  | Purpose                          |
|---------------|--------------------------|----------------------------------|
| `PORT`        | `8080`                   | HTTP listener port               |
| `OLLAMA_URL`  | `http://localhost:11434` | Ollama server base URL           |
| `EMBED_MODEL` | `nomic-embed-text`       | Model used for embeddings        |
| `GEN_MODEL`   | `llama3.2:3b`            | Model used for answer generation |

---

## 15. Running the Project

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

On startup, 20 synthetic demo vectors are auto-loaded into `VectorDB` so you can test search immediately without ingesting documents.

---

## 16. Example Workflow

### 1. Ingest a Document

```bash
curl -X POST http://localhost:8080/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Operating Systems",
    "text": "Operating systems manage memory, processes, files, and hardware resources. Virtual memory allows processes to use more memory than physically available."
  }'
```

### 2. Ask a Question

```bash
curl -X POST http://localhost:8080/api/ask \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is virtual memory?",
    "k": 3
  }'
```

**Response:**

```json
{
  "success": true,
  "question": "What is virtual memory?",
  "answer": "Virtual memory is a technique that allows processes to use more memory than is physically available by mapping virtual addresses to physical storage.",
  "sources": [
    { "id": "...", "title": "Operating Systems", "chunkIndex": 1, "text": "...", "distance": 0.12 }
  ]
}
```

### 3. Benchmark Search Algorithms

```bash
curl "http://localhost:8080/api/benchmark?v=0.9,0.8,0.7,0.6,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1,0.1&k=5&metric=cosine"
```

---

## 17. Performance

All numbers are approximate and measured on a local development machine with demo data in memory. They are intended to illustrate relative algorithmic complexity, not production throughput.

| Algorithm | 20 Vectors | 1,000 Vectors (projected) | Indexing Cost             |
|-----------|------------|---------------------------|---------------------------|
| BruteForce| ~0.05 ms   | ~2–5 ms                   | O(1) append               |
| KD-Tree   | ~0.02 ms   | ~0.1–0.5 ms               | O(n log n) rebuild        |
| HNSW      | ~0.005 ms  | ~0.05–0.2 ms              | O(n log n) layered insert |

Because the project is in-memory and single-node, the bottleneck is typically the Ollama embedding round-trip (~50–200 ms per request) rather than the search latency.

---

## 18. Technologies Used

- **Runtime**: Node.js (ES Modules)
- **HTTP Server**: Express.js
- **Embedding & LLM**: Ollama (local)
- **Language**: Pure JavaScript (no TypeScript, no transpilation step)
- **Dependencies**: `express`, `cors`, `axios`, `dotenv`
- **Zero External Vector Libraries**: No `faiss`, `hnswlib`, `chromadb`, `pinecone-client`, or `langchain`

---


## 19. Future Improvements

- **Persistent Storage**: Serialize HNSW graph and document index to disk (JSON or binary) for reload across restarts.
- **HNSW Deletes**: Implement soft-delete and graph repair strategies rather than skipping removal.
- **Multi-tenant Collections**: Namespace indices by collection name instead of a single global store.
- **Streaming Generation**: Pipe Ollama streaming responses through SSE to the client instead of buffering the full response.
- **Quantization**: Experiment with scalar or product quantization to reduce memory footprint of 768-d vectors.
- **Multi-modal**: Extend the pipeline to support image embeddings (e.g., `llava`) and cross-modal retrieval.
- **Recall Benchmarking**: Add ground-truth datasets to compute recall@k for HNSW vs. exact BruteForce baseline.
- **Frontend**: A minimal React or vanilla-JS visualization to render the HNSW graph and 2D/3D vector projections.

---

## 20. Contributing

This is a reference implementation. Contributions that improve clarity, add educational comments, or extend the algorithm suite are welcome.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-name`)
3. Commit your changes
4. Open a pull request

Please keep dependencies minimal. The goal is to show how things work, not to add abstraction layers.

---

## 21. License

MIT

---

## 22. Author

Built as an educational systems project to understand the internals of vector retrieval and RAG pipelines.

---


