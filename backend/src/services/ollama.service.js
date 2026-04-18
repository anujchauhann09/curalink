const axios = require('axios');
const env = require('../config/env');
const { getRedis } = require('../config/redis');

const SYNONYM_CACHE_TTL = 60 * 60 * 24; // 24 hours — synonyms don't change often
const SYNONYM_CACHE_PREFIX = 'synonyms:';


// ollama service — wraps all LLM interactions
// handles synonym resolution and (later) full response generation
const getSynonyms = async (disease) => {
  const cacheKey = `${SYNONYM_CACHE_PREFIX}${disease.toLowerCase()}`;

  // check cache first
  try {
    const cached = await getRedis().get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (_) {
    // redis unavailable — proceed to LLM
  }

  // ask LLM
  const synonyms = await fetchSynonymsFromLLM(disease);

  // cache result
  try {
    await getRedis().setex(cacheKey, SYNONYM_CACHE_TTL, JSON.stringify(synonyms));
  } catch (_) {
    // cache write failure is non-fatal
  }

  return synonyms;
};


// calls ollama to get synonyms.. returns [] on any failure
const fetchSynonymsFromLLM = async (disease) => {
  const prompt = `You are a medical terminology expert.
List exactly 4 medical synonyms or closely related clinical terms for: "${disease}".
Rules:
- Return ONLY a valid JSON array of strings
- No explanation, no markdown, no extra text
- Example output: ["term1", "term2", "term3", "term4"]`;

  try {
    const response = await axios.post(
      `${env.ollamaBaseUrl}/api/generate`,
      {
        model: env.ollamaModel,
        prompt,
        stream: false,
        options: { temperature: 0.1 }, // low temp for factual/consistent output
      },
      { timeout: 60000 } // 60s — accounts for cold-start model load (~10s) + generation time
    );

    return parseSynonyms(response.data?.response || '');
  } catch (err) {
    console.warn(`[OllamaService] Synonym fetch failed for "${disease}":`, err.message);
    return []; // graceful fallback — expansion continues without synonyms
  }
};


// safely parse LLM response into a string array.
// handles cases where the model wraps output in markdown or adds extra text
const parseSynonyms = (raw) => {
  try {
    // extract JSON array even if surrounded by extra text
    const match = raw.match(/\[.*?\]/s);
    if (!match) return [];
    const parsed = JSON.parse(match[0]);
    return Array.isArray(parsed)
      ? parsed.filter((s) => typeof s === 'string' && s.trim()).slice(0, 4)
      : [];
  } catch (_) {
    return [];
  }
};


// generic LLM generate — used for full response generation in phase 5
const generate = async (prompt) => {
  const response = await axios.post(
    `${env.ollamaBaseUrl}/api/generate`,
    {
      model: env.ollamaModel,
      prompt,
      stream: false,
      options: { temperature: 0.3, num_predict: 1024 }, // cap output tokens
    },
    { timeout: 180000 } // 3 min
  );
  return response.data?.response || '';
};

module.exports = { getSynonyms, generate };
