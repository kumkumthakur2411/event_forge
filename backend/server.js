const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

try {
  console.log('Server startup: dotenv config');
  dotenv.config();

  console.log('Server startup: creating express app');
  const app = express();
  app.use(cors());
  app.use(express.json());

  console.log('Server startup: connecting to DB');
  connectDB();

  console.log('Server startup: loading routes');
  // Routes
  try {
    console.log('Loading auth routes...');
    app.use('/api/auth', require('./routes/auth'));
    console.log('Loading admin routes...');
    app.use('/api/admin', require('./routes/admin'));
    console.log('Loading client routes...');
    app.use('/api/client', require('./routes/client'));
    console.log('Loading vendor routes...');
    app.use('/api/vendor', require('./routes/vendor'));
    console.log('Loading categories routes...');
    app.use('/api/categories', require('./routes/categories'));
    console.log('Loading public routes...');
    app.use('/api/public', require('./routes/public'));
  } catch (e) {
    console.error('ERROR loading routes:', e.message);
    console.error(e);
    process.exit(1);
  }

  app.get('/', (req, res) => res.send({ ok: true, message: 'Event Forge API' }));

  // Error handler
  app.use((err, req, res, next) => {
    console.error('Express error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  });

  // Unhandled promise rejection handler
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err);
  });

  // Unhandled exception handler
  process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    process.exit(1);
  });

  const PORT = process.env.PORT || 5000;
  console.log('Server startup: listening on port', PORT);
  app.listen(PORT, '127.0.0.1', () => console.log(`Server running on port ${PORT}`));
} catch (e) {
  console.error('CRITICAL ERROR during server startup:', e.message);
  console.error(e);
  process.exit(1);
}
