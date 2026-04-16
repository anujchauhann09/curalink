const { v4: uuidv4 } = require('uuid');
const sessionRepo = require('../repositories/session.repository');
const { MESSAGE_ROLES } = require('../constants');
const ValidationError = require('../errors/ValidationError');
const NotFoundError = require('../errors/NotFoundError');


// chat service — orchestrates session management and (later) the AI pipeline
// depends on the session repository; has no knowledge of req/res
const processMessage = async ({ message, sessionId, disease, location }) => {
  if (!message || !message.trim()) {
    throw new ValidationError('message is required');
  }

  const sid = sessionId || uuidv4();

  // ensure session exists
  await sessionRepo.findOrCreate({ sessionId: sid, disease, location });

  // persist user message
  await sessionRepo.pushMessage(sid, {
    role: MESSAGE_ROLES.USER,
    content: message.trim(),
  });

  // TODO phase 2: query expansion → retrieval → re-ranking → LLM reasoning
  const reply = `[Phase 1 stub] Received: "${message}". Pipeline coming in Phase 2.`;

  // persist assistant reply
  await sessionRepo.pushMessage(sid, {
    role: MESSAGE_ROLES.ASSISTANT,
    content: reply,
  });

  return { sessionId: sid, reply };
};


// retrieve full conversation history for a session.
const getSessionHistory = async (sessionId) => {
  const session = await sessionRepo.findById(sessionId);
  if (!session) throw new NotFoundError('Session');
  return session;
};

module.exports = { processMessage, getSessionHistory };
