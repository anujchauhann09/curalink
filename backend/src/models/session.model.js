const mongoose = require('mongoose');
const { MESSAGE_ROLES } = require('../constants');

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: Object.values(MESSAGE_ROLES), required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const sessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    disease: { type: String, trim: true },
    location: { type: String, trim: true },
    messages: [messageSchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret._id;
        delete ret.__v;
        // strip _id from embedded messages too
        ret.messages = ret.messages?.map(({ _id: _mid, ...msg }) => msg) ?? [];
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Session', sessionSchema);
