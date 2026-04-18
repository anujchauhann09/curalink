from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from typing import List
import threading
import uvicorn

app = FastAPI(title="Curalink Embedder")

# load once on startup — stays warm for all subsequent requests
# all-MiniLM-L6-v2: 80MB, 384-dim, fast CPU inference
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# lock prevents concurrent tokenizer access — fixes "Already borrowed" error
_lock = threading.Lock()

class EmbedRequest(BaseModel):
    texts: List[str]

class EmbedResponse(BaseModel):
    embeddings: List[List[float]]
    dimensions: int

@app.get("/health")
def health():
    return {"status": "ok", "model": "all-MiniLM-L6-v2", "dimensions": 384}

@app.post("/embed", response_model=EmbedResponse)
def embed(req: EmbedRequest):
    with _lock:
        vectors = model.encode(req.texts, batch_size=32, show_progress_bar=False)
    return EmbedResponse(
        embeddings=vectors.tolist(),
        dimensions=vectors.shape[1]
    )

if __name__ == "__main__":
    # single worker — model is not thread-safe, lock handles concurrency
    uvicorn.run(app, host="0.0.0.0", port=8000, workers=1)
