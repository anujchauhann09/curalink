const ValidationError = require('../errors/ValidationError');

// input layer — validates and normalises mandatory fields
// disease is required on first turn; follow-up turns inherit it from session
const validate = ({ disease, query, location, sessionId }) => {
  if (!query || !query.trim()) {
    throw new ValidationError('query is required');
  }

  // disease required only on first turn (no sessionId)
  // follow-up turns resolve disease from session in chat.service
  if (!sessionId && (!disease || !disease.trim())) {
    throw new ValidationError('disease is required for new sessions');
  }

  return {
    disease: disease?.trim().toLowerCase() || null,
    query: query.trim(),
    location: location?.trim() || null,
    sessionId: sessionId?.trim() || null,
  };
};

module.exports = { validate };
