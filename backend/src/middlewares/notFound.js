const NotFoundError = require('../errors/NotFoundError');

const notFound = (req, _res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl}`));
};

module.exports = notFound;
