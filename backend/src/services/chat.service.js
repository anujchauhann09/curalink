const { v4: uuidv4 } = require('uuid');
const sessionRepo = require('../repositories/session.repository');
const { MESSAGE_ROLES } = require('../constants');
const NotFoundError = require('../errors/NotFoundError');
const { validate } = require('../pipeline/inputValidator');
const { extract } = require('../pipeline/queryUnderstanding');
const { expand } = require('../pipeline/queryExpansion');
const { retrieve } = require('../retrieval');


// chat service — orchestrates the full pipeline: validate → understand → expand → (retrieve → rank → LLM)
// depends on session repository and pipeline modules; has no knowledge of req/res
const processMessage = async ({ disease, query, location, sessionId }) => {
  // step 1 — validate and normalise mandatory input fields
  const input = validate({ disease, query, location, sessionId });

  // step 2 — extract structured understanding (intent, disease, location)
  const understood = extract(input);

  // step 3 — expand query with LLM synonyms (cached) + static intent keywords
  const expanded = await expand(understood);

  const sid = input.sessionId || uuidv4();

  // ensure session exists with user context
  await sessionRepo.findOrCreate({
    sessionId: sid,
    disease: input.disease,
    location: input.location,
  });

  // persist user query as message
  await sessionRepo.pushMessage(sid, {
    role: MESSAGE_ROLES.USER,
    content: query,
  });

  // step 4 — parallel retrieval from PubMed + OpenAlex + ClinicalTrials
  const { publications, trials, meta } = await retrieve({
    broadQuery: expanded.broadQuery,
    disease: input.disease,
    location: input.location,
  });

  // TODO phase 4: re-ranking retrieved results
  // TODO phase 5: LLM reasoning over ranked results
  const reply = `[Phase 3 stub] Retrieved ${meta.totalPublications} publications and ${meta.totalTrials} trials in ${meta.retrievalTimeMs}ms.`;

  // persist assistant reply
  await sessionRepo.pushMessage(sid, {
    role: MESSAGE_ROLES.ASSISTANT,
    content: reply,
  });

  return {
    sessionId: sid,
    understood,
    expanded,
    retrieval: meta,
    publications,
    trials,
    reply,
  };
};


// retrieve full conversation history for a session
const getSessionHistory = async (sessionId) => {
  const session = await sessionRepo.findById(sessionId);
  if (!session) throw new NotFoundError('Session');
  return session;
};

module.exports = { processMessage, getSessionHistory };
