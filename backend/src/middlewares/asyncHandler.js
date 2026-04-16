// wraps async route handlers to forward errors to Express error middleware
// eliminates repetitive try/catch in every controller method
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
