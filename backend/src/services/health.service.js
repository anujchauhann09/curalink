const mongoose = require('mongoose');
const { getRedis } = require('../config/redis');


// health service — checks liveness of all dependent services
const getStatus = async () => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  let redisStatus = 'disconnected';
  try {
    const redis = getRedis();
    await redis.ping();
    redisStatus = 'connected';
  } catch (_) {}

  return {
    status: 'ok',
    services: { mongo: mongoStatus, redis: redisStatus },
    timestamp: new Date().toISOString(),
  };
};

module.exports = { getStatus };
