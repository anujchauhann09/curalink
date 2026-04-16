const asyncHandler = require('../middlewares/asyncHandler');
const healthService = require('../services/health.service');
const ApiResponse = require('../utils/ApiResponse');


// GET /api/v1/health
const getHealth = asyncHandler(async (_req, res) => {
  const status = await healthService.getStatus();
  return ApiResponse.ok(res, 'Service is healthy', status);
});

module.exports = { getHealth };
