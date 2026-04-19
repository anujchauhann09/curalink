const { v4: uuidv4 } = require('uuid');
const sessionRepo = require('../repositories/session.repository');
const { MESSAGE_ROLES } = require('../constants');
const NotFoundError = require('../errors/NotFoundError');
const { validate } = require('../pipeline/inputValidator');
const { extract } = require('../pipeline/queryUnderstanding');
const { expand } = require('../pipeline/queryExpansion');
const { retrieve } = require('../retrieval');
const { rank } = require('../pipeline/ranker');
const { build: buildPrompt } = require('../pipeline/promptBuilder');
const { parse: parseResponse } = require('../pipeline/responseParser');
const ollamaService = require('./ollama.service');


// chat service — orchestrates the full pipeline: validate → understand → expand → (retrieve → rank → LLM)
// depends on session repository and pipeline modules; has no knowledge of req/res
const processMessage = async ({ disease, query, location, sessionId }) => {
  // step 1 — validate and normalise mandatory input fields
  const input = validate({ disease, query, location, sessionId });

  // step 2 — extract structured understanding (intent, disease, location)
  const understood = extract(input);

  const sid = input.sessionId || uuidv4();

  // resolve disease/location from session on follow-up turns
  let sessionDisease = input.disease;
  let sessionLocation = input.location;

  if (input.sessionId) {
    const existing = await sessionRepo.findById(input.sessionId);
    if (existing) {
      sessionDisease = input.disease || existing.disease;
      sessionLocation = input.location || existing.location;
    }
  }

  // re-inject resolved context before expansion
  input.disease = sessionDisease;
  input.location = sessionLocation;
  understood.disease = sessionDisease;
  understood.location = sessionLocation;

  // step 3 — expand query with LLM synonyms (cached) + static intent keywords
  const expanded = await expand(understood);

  await sessionRepo.findOrCreate({
    sessionId: sid,
    disease: sessionDisease,
    location: sessionLocation,
  });

  // persist user query as message
  await sessionRepo.pushMessage(sid, {
    role: MESSAGE_ROLES.USER,
    content: query,
  });

  // step 4 — parallel retrieval from PubMed + OpenAlex + ClinicalTrials
  const { publications, trials, meta } = await retrieve({
    broadQuery: expanded.broadQuery,
    disease: sessionDisease,
    location: sessionLocation,
  });

  // step 5 — rank: score-based + optional semantic re-ranking via Qdrant
  const { publications: topPublications, trials: topTrials } = await rank({
    publications,
    trials,
    query: input.query,
    disease: sessionDisease,
    location: sessionLocation,
    focusedQuery: expanded.focusedQuery,
  });

  // step 6 — fetch conversation history for context continuity
  const session = await sessionRepo.findById(sid);
  const conversationHistory = session?.messages?.slice(-6) || [];

  // step 7 — build prompt and generate LLM response
  const prompt = buildPrompt({
    disease: sessionDisease,
    query: input.query,
    location: sessionLocation,
    publications: topPublications,
    trials: topTrials,
    conversationHistory,
  });

  const rawLLMResponse = await ollamaService.generate(prompt);

  // step 8 — parse structured response from LLM output
  const structured = parseResponse(rawLLMResponse, {
    publications: topPublications,
    trials: topTrials,
  });

  await sessionRepo.pushMessage(sid, {
    role: MESSAGE_ROLES.ASSISTANT,
    content: structured.conditionOverview || rawLLMResponse,
  });

  return {
    sessionId: sid,
    understood,
    expanded,
    retrieval: meta,
    response: structured,
  };
};


// retrieve full conversation history for a session
const getSessionHistory = async (sessionId) => {
  const session = await sessionRepo.findById(sessionId);
  if (!session) throw new NotFoundError('Session');
  return session;
};

module.exports = { processMessage, getSessionHistory };
