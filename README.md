# CuraLink — AI Medical Research Assistant

CuraLink is a full-stack AI-powered medical research assistant that retrieves, ranks, and synthesizes the latest research papers and clinical trials into structured, personalized insights. It is not a chatbot — it is a research and reasoning system.

> Built with MERN stack + local LLM (Ollama) + semantic search (Qdrant) + local embeddings (sentence-transformers)

---

## What it does

- Accepts a disease, location, and query from the user
- Expands the query intelligently using LLM-generated medical synonyms
- Fetches a broad candidate pool (200+ results) from PubMed, OpenAlex, and ClinicalTrials.gov in parallel
- Ranks results using a two-stage pipeline: score-based (relevance, recency, location, credibility) + semantic re-ranking via Qdrant
- Feeds top results into a local LLM (llama3 via Ollama) to generate a structured response
- Returns: Condition Overview, Research Insights, Clinical Trials summary, Personalized Recommendation, and source attribution
- Supports multi-turn conversations with context inheritance across follow-up questions

---

## Architecture

```
User
 │
 ▼
React Frontend (Vite + Tailwind)
 │  POST /api/v1/chat
 ▼
Express Backend (Node.js)
 │
 ├── Input Validation
 ├── Query Understanding (intent detection)
 ├── Query Expansion (LLM synonyms + static intent keywords)
 │
 ├── Parallel Retrieval
 │   ├── PubMed API (100 results)
 │   ├── OpenAlex API (100 results)
 │   └── ClinicalTrials.gov API (80 results)
 │
 ├── Two-Stage Ranking
 │   ├── Stage 1: Score-based (relevance × 0.5 + recency × 0.2 + location × 0.2 + credibility × 0.1)
 │   └── Stage 2: Semantic re-ranking (embedder → Qdrant vector search)
 │
 ├── LLM Reasoning (Ollama / llama3)
 └── Structured Response Parser

Supporting Services
 ├── MongoDB (session + conversation history)
 ├── Redis (synonym cache, 24h TTL)
 ├── Qdrant (vector database for semantic search)
 └── Python Embedder (sentence-transformers/all-MiniLM-L6-v2)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express |
| Database | MongoDB |
| Cache | Redis |
| LLM | Ollama (llama3) — fully local, no API key |
| Embeddings | sentence-transformers/all-MiniLM-L6-v2 — local Python service |
| Vector DB | Qdrant — local, dockerized |
| Retrieval | PubMed (NCBI), OpenAlex, ClinicalTrials.gov |
| Infrastructure | Docker, Docker Compose |

---

## Project Structure

```
curalink/
├── backend/                  Node.js + Express API
│   └── src/
│       ├── config/           env, db, redis
│       ├── constants/        shared enums
│       ├── controllers/      thin request handlers
│       ├── errors/           typed error classes
│       ├── middlewares/      asyncHandler, errorHandler
│       ├── models/           Mongoose schemas
│       ├── pipeline/         inputValidator, queryUnderstanding, queryExpansion, ranker, promptBuilder, responseParser
│       ├── repositories/     DB query layer
│       ├── retrieval/        PubMed, OpenAlex, ClinicalTrials fetchers + normalizer
│       ├── routes/v1/        versioned API routes
│       ├── services/         chat, health, ollama, embedder, qdrant
│       └── utils/            ApiResponse
├── embedder/                 Python FastAPI embedding service
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                 React + Vite
│   ├── src/
│   │   ├── components/       Navbar, InputForm, ChatThread, ChatInput, ResultsSection, ResearchCard, TrialCard, Loader
│   │   ├── pages/            Home
│   │   └── services/         api.js
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
└── .env
```

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- At least 8GB RAM allocated to Docker (for llama3)
- A free [NCBI API key](https://www.ncbi.nlm.nih.gov/account/) for PubMed access

---

## Quick Start

**1. Clone the repository**

```bash
git clone https://github.com/your-username/curalink.git
cd curalink
```

**2. Configure environment**

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and fill in:

```env
PUBMED_API_KEY=your_ncbi_api_key
```

Everything else works out of the box with Docker.

**3. Start all services**

```bash
docker-compose up --build
```

This starts: MongoDB, Redis, Ollama, Embedder, Qdrant, Backend, Frontend.

**4. Pull the LLM model** (first time only)

```bash
docker exec -it curalink-ollama ollama pull llama3
```

**5. Open the app**

```
http://localhost:80
```

---

## Environment Variables

All backend config lives in `backend/.env`.

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Backend server port |
| `MONGO_URI` | Yes | `mongodb://mongo:27017/curalink` | MongoDB connection string |
| `REDIS_URL` | No | `redis://redis:6379` | Redis connection string |
| `OLLAMA_BASE_URL` | No | `http://ollama:11434` | Ollama API base URL |
| `OLLAMA_MODEL` | No | `llama3` | Ollama model name |
| `PUBMED_API_KEY` | Recommended | — | NCBI API key (free, increases rate limit) |
| `EMBEDDER_URL` | No | `http://embedder:8000` | Python embedder service URL |
| `QDRANT_URL` | No | `http://qdrant:6333` | Qdrant vector DB URL |
| `QDRANT_COLLECTION` | No | `medical-research` | Qdrant collection name |
| `NODE_ENV` | No | `development` | `development` or `production` |

---

## API Reference

Base URL: `http://localhost:5000/api/v1`

### POST /chat

Send a message and get a structured research response.

**First turn (new session):**
```json
{
  "disease": "lung cancer",
  "query": "latest treatment",
  "location": "India"
}
```

**Follow-up turn (existing session):**
```json
{
  "query": "Can I take Vitamin D?",
  "sessionId": "uuid-from-previous-response"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message processed",
  "data": {
    "sessionId": "uuid",
    "response": {
      "conditionOverview": "...",
      "researchInsights": "...",
      "clinicalTrials": "...",
      "recommendation": "...",
      "sources": [
        {
          "title": "...",
          "authors": ["..."],
          "year": 2024,
          "source": "PubMed",
          "url": "https://pubmed.ncbi.nlm.nih.gov/...",
          "type": "publication"
        }
      ]
    }
  }
}
```

### GET /chat/:sessionId/history

Retrieve full conversation history for a session.

### GET /health

Check status of all services (MongoDB, Redis).

---

## Docker Services

| Service | Port | Description |
|---|---|---|
| `frontend` | `80` | React app served via Nginx |
| `backend` | `5000` | Node.js API |
| `mongo` | `27017` | MongoDB |
| `redis` | `6379` | Redis cache |
| `ollama` | `11434` | Local LLM server |
| `embedder` | `8000` | Python embedding service |
| `qdrant` | `6333` | Vector database |

Backend only starts after MongoDB, Redis, Embedder, and Qdrant pass their healthchecks.

---

## Local Development (without Docker)

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Frontend dev server runs on `http://localhost:3000` and proxies `/api` to `http://localhost:5000`.

---

## LLM Model Options

| Model | Size | RAM needed | Quality |
|---|---|---|---|
| `tinyllama` | 638MB | ~1GB | Basic — good for testing |
| `llama3` | 4.7GB | ~6GB | Recommended |
| `mistral` | 4.1GB | ~6GB | Fast alternative to llama3 |

Change the model in `backend/.env`:
```env
OLLAMA_MODEL=llama3
```

Then pull it:
```bash
docker exec -it curalink-ollama ollama pull llama3
```

---

## How the Pipeline Works

```
1. Input Validation
   disease (required on first turn), query (required), location (optional)

2. Query Understanding
   Detects intent: treatment | trials | symptoms | drugs | surgery | prevention | research

3. Query Expansion
   LLM generates 4 medical synonyms for the disease (cached in Redis for 24h)
   Static intent keywords added (treatment → therapy, intervention, management...)
   Builds broadQuery for maximum recall and focusedQuery for precision

4. Parallel Retrieval
   PubMed: 100 results via esearch + efetch
   OpenAlex: 100 results (2 pages, relevance + recency sort)
   ClinicalTrials.gov: 80 results across 4 statuses (RECRUITING, ACTIVE, COMPLETED, NOT_YET_RECRUITING)
   Total: ~280 candidates

5. Two-Stage Ranking
   Stage 1 — Score formula:
     score = relevance×0.5 + recency×0.2 + locationMatch×0.2 + credibility×0.1
   Stage 2 — Semantic re-ranking (if Qdrant available):
     Embed top-50 abstracts → upsert to Qdrant → query for semantic similarity
     Blend: 60% semantic + 40% stage-1 score
   Output: top 8 publications + top 5 trials

6. LLM Reasoning
   Prompt includes: disease, query, location, top publications, top trials, conversation history
   Ollama generates structured response with 4 sections

7. Response Parsing
   Extracts sections by markdown headers
   Formats source attribution
   Returns structured JSON
```

---

## Data Sources

| Source | Type | Results |
|---|---|---|
| [PubMed (NCBI)](https://pubmed.ncbi.nlm.nih.gov/) | Research publications | 100 |
| [OpenAlex](https://openalex.org/) | Research publications | 100 |
| [ClinicalTrials.gov](https://clinicaltrials.gov/) | Clinical trials | 80 |

All APIs are free and open. No paid subscriptions required. A free NCBI API key is recommended for reliable PubMed access.

---

## License

MIT License — free to use, modify, and distribute.

---

## Disclaimer

CuraLink is a research tool for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional before making any medical decisions.
