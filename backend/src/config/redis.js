const Redis = require('ioredis');
const env = require('./env');

let client = null;

const connectRedis = async () => {
  client = new Redis(env.redisUrl, {
    lazyConnect: true,
    retryStrategy: (times) => Math.min(times * 100, 3000),
  });

  client.on('connect', () => console.log('Redis connected'));
  client.on('error', (err) => console.error('Redis error:', err.message));

  await client.connect();
};

const getRedis = () => {
  if (!client) throw new Error('Redis client not initialised');
  return client;
};

module.exports = { connectRedis, getRedis };
