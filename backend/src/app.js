require('dotenv').config();
const path = require('path'),
  express = require('express'),
  cors = require('cors'),
  routes = require('./routes'),
  { notFound, errorHandler } = require('./middlewares/error.middleware');
const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/v1', routes);
app.use(notFound);
app.use(errorHandler);
module.exports = app;
