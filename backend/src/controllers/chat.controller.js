const asyncHandler = require('../middlewares/asyncHandler');
const chatService = require('../services/chat.service');
const ApiResponse = require('../utils/ApiResponse');


// POST /api/v1/chat
const chat = asyncHandler(async (req, res) => {
  const result = await chatService.processMessage(req.body);
  return ApiResponse.ok(res, 'Message processed', result);
});


// GET /api/v1/chat/:sessionId/history
const getHistory = asyncHandler(async (req, res) => {
  const session = await chatService.getSessionHistory(req.params.sessionId);
  return ApiResponse.ok(res, 'Session history retrieved', session);
});

module.exports = { chat, getHistory };
