const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const env = require('./config/env');
const connectDB = require('./config/db');
const { connectRedis } = require('./config/redis');
const v1Routes = require('./routes/v1');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// middlewares 
app.use(cors());
app.use(express.json());
app.use(morgan(env.isDev ? 'dev' : 'combined'));


// routes 
app.use('/api/v1', v1Routes);


// error handling
app.use(notFound);
app.use(errorHandler);


// bootstrap
const start = async () => {
  await connectDB();
  await connectRedis();
  app.listen(env.port, () => {
    console.log(`Curalink backend running on port ${env.port} [${env.nodeEnv}]`);
  });
};

start();
