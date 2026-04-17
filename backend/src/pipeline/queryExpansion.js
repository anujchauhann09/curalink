const { INTENT_KEYWORDS } = require('../constants/medicalTerms');
const ollamaService = require('../services/ollama.service');


// query expansion — enriches the base query with LLM-resolved synonyms (dynamic)
// and static intent keywords (hybrid approach).
const expand = async ({ disease, intent, rawQuery, location }) => {
  // LLM-powered synonym resolution with Redis cache + graceful fallback
  const diseaseSynonyms = await ollamaService.getSynonyms(disease);

  // static intent terms — stable, no LLM needed
  const intentTerms = resolveIntentTerms(intent);

  // broad query — wide net for candidate pool retrieval
  const broadQuery = buildBroadQuery({ disease, diseaseSynonyms, intentTerms, location });

  // focused query — tight string for precise ranked retrieval
  const focusedQuery = buildFocusedQuery({ disease, rawQuery, intentTerms });

  return {
    broadQuery,
    focusedQuery,
    diseaseSynonyms,
    intentTerms,
    intent,
    disease,
    location,
  };
};


const resolveIntentTerms = (intent) => INTENT_KEYWORDS[intent] || INTENT_KEYWORDS['research'];


const buildBroadQuery = ({ disease, diseaseSynonyms, intentTerms, location }) => {
  const diseaseTerms = [disease, ...diseaseSynonyms].join(' OR ');
  const keywords = intentTerms.slice(0, 3).join(' OR ');
  const locationPart = location ? ` ${location}` : '';

  return `(${diseaseTerms}) AND (${keywords})${locationPart}`;
};


const buildFocusedQuery = ({ disease, rawQuery, intentTerms }) => {
  return `${disease} ${rawQuery} ${intentTerms[0]}`;
};

module.exports = { expand, resolveIntentTerms };
