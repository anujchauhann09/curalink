const Session = require('../models/session.model');

const findById = (sessionId) => Session.findOne({ sessionId });
const findByObjectId = (objectId) => Session.findById(objectId);


const findOrCreate = (data) =>
  Session.findOneAndUpdate(
    { sessionId: data.sessionId },
    { $setOnInsert: data },
    { upsert: true, new: true }
  );


const pushMessage = (sessionId, message) =>
  Session.findOneAndUpdate(
    { sessionId },
    { $push: { messages: message } },
    { new: true }
  );

module.exports = { findById, findByObjectId, findOrCreate, pushMessage };
