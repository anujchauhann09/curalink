const { INTENT_PATTERNS } = require('../constants/medicalTerms');


// query understanding — extracts structured intent from raw user input
const extract = ({ disease, query, location }) => {
  const intent = detectIntent(query);

  return {
    disease,
    intent,
    location,
    rawQuery: query,
  };
};


// detect the primary intent from the query string
// falls back to 'research' if no pattern matches
const detectIntent = (query) => {
  for (const { pattern, intent } of INTENT_PATTERNS) {
    if (pattern.test(query)) return intent;
  }
  return 'research'; // default intent
};

module.exports = { extract, detectIntent };
