const { QdrantClient } = require('@qdrant/js-client-rest');
const env = require('../config/env');

const COLLECTION = env.qdrantCollection;
const VECTOR_SIZE = 384; // all-MiniLM-L6-v2 output dimension

let client = null;

const getClient = () => {
  if (!client) {
    client = new QdrantClient({ url: env.qdrantUrl });
  }
  return client;
};


const ensureCollection = async () => {
  const c = getClient();
  try {
    await c.getCollection(COLLECTION);
  } catch {
    // collection doesn't exist — create it
    await c.createCollection(COLLECTION, {
      vectors: { size: VECTOR_SIZE, distance: 'Cosine' },
    });
    console.log(`[Qdrant] Created collection: ${COLLECTION}`);
  }
};

// upsert document embeddings into Qdrant
const upsert = async (vectors) => {
  if (!vectors.length) return;
  try {
    await ensureCollection();
    const points = vectors.map((v, i) => ({
      // Qdrant requires numeric ids; hash the string id
      id: Math.abs(hashCode(v.id)) || i + 1,
      vector: v.values,
      payload: { ...v.metadata, originalId: v.id },
    }));
    await getClient().upsert(COLLECTION, { points, wait: true });
  } catch (err) {
    console.warn('[Qdrant] Upsert failed:', err.message);
  }
};


// query Qdrant for top-k semantically similar documents
const query = async (queryVector, topK = 50) => {
  try {
    await ensureCollection();
    const res = await getClient().search(COLLECTION, {
      vector: queryVector,
      limit: topK,
      with_payload: true,
    });
    return res.map((r) => ({
      id: r.payload?.originalId || String(r.id),
      score: r.score,
    }));
  } catch (err) {
    console.warn('[Qdrant] Query failed:', err.message);
    return [];
  }
};

const isAvailable = () => !!(env.qdrantUrl && env.qdrantCollection);

// simple djb2 hash for string → numeric id
const hashCode = (str) => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
};

module.exports = { upsert, query, isAvailable };
