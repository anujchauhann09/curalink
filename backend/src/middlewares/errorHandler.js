const AppError = require('../errors/AppError');
const ApiResponse = require('../utils/ApiResponse');
const env = require('../config/env');

// central error handling middleware.
const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return ApiResponse.error(res, err.statusCode, err.message);
  }

  console.error('Unhandled error:', err);

  return ApiResponse.error(
    res,
    500,
    env.isDev ? err.message : 'Internal server error'
  );
};

module.exports = errorHandler;
