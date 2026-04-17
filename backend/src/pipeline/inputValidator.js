const ValidationError = require('../errors/ValidationError');


// input Layer — validates and normalises the mandatory fields
// for every chat request before anything else runs
const validate = ({ disease, query, location, sessionId }) => {
  if (!disease || !disease.trim()) {
    throw new ValidationError('disease is required');
  }
  if (!query || !query.trim()) {
    throw new ValidationError('query is required');
  }

  return {
    disease: disease.trim().toLowerCase(),
    query: query.trim(),
    location: location?.trim() || null,
    sessionId: sessionId?.trim() || null,
  };
};

module.exports = { validate };
