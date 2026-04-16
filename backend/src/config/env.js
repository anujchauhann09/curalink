// centralised env config with validation
const required = (key) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env variable: ${key}`);
  return value;
};

const optional = (key, fallback) => process.env[key] || fallback;

const env = {
  port: optional('PORT', '5000'),
  nodeEnv: optional('NODE_ENV', 'development'),
  mongoUri: required('MONGO_URI'),
  redisUrl: optional('REDIS_URL', 'redis://localhost:6379'),
  ollamaBaseUrl: optional('OLLAMA_BASE_URL', 'http://localhost:11434'),
  ollamaModel: optional('OLLAMA_MODEL', 'llama3'),
  pubmedApiKey: optional('PUBMED_API_KEY', ''),
  isDev: optional('NODE_ENV', 'development') === 'development',
};

module.exports = env;
