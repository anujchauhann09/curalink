const axios = require('axios');
const env = require('../config/env');

/**
 * embedder service — calls the local Python embedding service
 * converts text into dense vectors for semantic similarity search
 * gracefully returns null if the embedder is unavailable
 */
const embedBatch = async (texts) => {
  if (!texts.length) return [];
  try {
    const res = await axios.post(
      `${env.embedderUrl}/embed`,
      { texts },
      { timeout: 30000 }
    );
    return res.data.embeddings;
  } catch (err) {
    console.warn('[Embedder] Batch embed failed:', err.message);
    return null; // null signals caller to skip semantic ranking
  }
};


const embedOne = async (text) => {
  const result = await embedBatch([text]);
  return result ? result[0] : null;
};

module.exports = { embedBatch, embedOne };
