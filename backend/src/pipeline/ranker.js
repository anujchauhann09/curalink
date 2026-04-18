const embedderService = require('../services/embedder.service');
const qdrantService = require('../services/qdrant.service');

const CURRENT_YEAR = new Date().getFullYear();
const TOP_PUBLICATIONS = 8;
const TOP_TRIALS = 5;

// source credibility weights
const SOURCE_CREDIBILITY = Object.freeze({
  'PubMed': 1.0,
  'OpenAlex': 0.85,
  'ClinicalTrials.gov': 1.0,
});

/**
 * Ranker — scores and selects top results from the candidate pool
 *
 * Two-stage pipeline:
 *   Stage 1 (always runs): score-based ranking
 *     score = relevance(0.5) + recency(0.2) + locationMatch(0.2) + credibility(0.1)
 *
 *   Stage 2 (runs if Qdrant + embedder available): semantic re-ranking
 *     → embed query + top-50 abstracts
 *     → upsert to Qdrant
 *     → query Qdrant for semantic similarity
 *     → blend semantic score with stage-1 score
 *
 */
const rank = async ({ publications, trials, query, disease, location, focusedQuery }) => {
  // stage 1 — score-based ranking
  const scoredPubs = publications.map((p) => ({
    ...p,
    _score: scorePublication(p, focusedQuery, location),
  })).sort((a, b) => b._score - a._score);

  const scoredTrials = trials.map((t) => ({
    ...t,
    _score: scoreTrial(t, location),
  })).sort((a, b) => b._score - a._score);

  // stage 2 — semantic re-ranking via Qdrant 
  if (qdrantService.isAvailable()) {
    return await semanticRerank({ scoredPubs, scoredTrials, query, disease });
  }

  return {
    publications: scoredPubs.slice(0, TOP_PUBLICATIONS),
    trials: scoredTrials.slice(0, TOP_TRIALS),
  };
};


// score a publication using the weighted formula
const scorePublication = (pub, query, location) => {
  const relevance = computeRelevance(pub.title + ' ' + pub.summary, query);
  const recency = computeRecency(pub.year);
  const locationMatch = location ? computeLocationMatch(pub.summary + pub.title, location) : 0;
  const credibility = SOURCE_CREDIBILITY[pub.source] || 0.7;

  return relevance * 0.5 + recency * 0.2 + locationMatch * 0.2 + credibility * 0.1;
};


// score a clinical trial
const scoreTrial = (trial, location) => {
  const recency = computeRecency(trial.year);
  const locationMatch = location ? computeLocationMatch(trial.locations.join(' '), location) : 0;
  // active/recruiting trials ranked higher
  const statusBoost = ['RECRUITING', 'NOT_YET_RECRUITING'].includes(trial.status) ? 0.2 : 0;

  return recency * 0.3 + locationMatch * 0.4 + statusBoost + 0.1;
};


// keyword overlap relevance — normalized term frequency
const computeRelevance = (text, query) => {
  if (!text || !query) return 0;
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 3);
  const textLower = text.toLowerCase();
  const matches = terms.filter((t) => textLower.includes(t)).length;
  return Math.min(matches / Math.max(terms.length, 1), 1);
};


// recency score — newer = higher. Normalised to [0, 1] over last 10 years
const computeRecency = (year) => {
  if (!year) return 0.3; // unknown year gets neutral score
  const age = CURRENT_YEAR - year;
  if (age <= 0) return 1;
  if (age >= 10) return 0;
  return 1 - age / 10;
};

// location match — checks if location appears in text
const computeLocationMatch = (text, location) => {
  if (!text || !location) return 0;
  return text.toLowerCase().includes(location.toLowerCase()) ? 1 : 0;
};

/**
 * Stage 2 — semantic re-ranking using embeddings + Qdrant
 * Takes top-50 from stage 1, embeds them, upserts to Qdrant,
 * queries for semantic similarity, blends scores.
 */
const semanticRerank = async ({ scoredPubs, scoredTrials, query }) => {
  try {
    const candidates = scoredPubs.slice(0, 50);
    const texts = candidates.map((p) => `${p.title}. ${p.summary}`.slice(0, 512));

    // embed query and candidates in parallel
    const [queryVec, candidateVecs] = await Promise.all([
      embedderService.embedOne(query),
      embedderService.embedBatch(texts),
    ]);

    if (!queryVec || !candidateVecs) {
      // embedder unavailable — return stage 1 results
      return {
        publications: scoredPubs.slice(0, TOP_PUBLICATIONS),
        trials: scoredTrials.slice(0, TOP_TRIALS),
      };
    }

    // upsert to Qdrant
    const vectors = candidates.map((p, i) => ({
      id: p.url || `doc-${i}`,
      values: candidateVecs[i],
      metadata: { title: p.title, source: p.source },
    }));
    await qdrantService.upsert(vectors);

    // query Qdrant for semantic matches
    const matches = await qdrantService.query(queryVec, TOP_PUBLICATIONS);
    const semanticScores = Object.fromEntries(matches.map((m) => [m.id, m.score]));

    // blend: 60% semantic + 40% stage-1 score
    const reranked = candidates.map((p) => ({
      ...p,
      _score: (semanticScores[p.url] || 0) * 0.6 + p._score * 0.4,
    })).sort((a, b) => b._score - a._score);

    return {
      publications: reranked.slice(0, TOP_PUBLICATIONS),
      trials: scoredTrials.slice(0, TOP_TRIALS),
    };
  } catch (err) {
    console.warn('[Ranker] Semantic rerank failed, using stage-1:', err.message);
    return {
      publications: scoredPubs.slice(0, TOP_PUBLICATIONS),
      trials: scoredTrials.slice(0, TOP_TRIALS),
    };
  }
};

module.exports = { rank };
