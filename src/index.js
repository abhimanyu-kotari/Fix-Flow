const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const env = require('./config/env');
const { connectMongo } = require('./models');
const { PLANS } = require('./config/plans');
const authRoutes = require('./routes/authRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const customerRoutes = require('./routes/customerRoutes');
const trackRoutes = require('./routes/trackRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const premiumRoutes = require('./routes/premiumRoutes');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health & System Info
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'FixFlow API',
      database: 'MongoDB',
      environment: env.NODE_ENV,
      defaultCountry: env.DEFAULT_COUNTRY_CODE,
      timestamp: new Date().toISOString()
    });
  });

  // Configured Plans
  app.get('/api/plans', (req, res) => {
    res.json({
      status: 'success',
      plans: Object.values(PLANS)
    });
  });

  // Static Frontend Assets — serve original HTML/JS/CSS from src/public/
  app.use(express.static(path.join(__dirname, 'public')));

  // Route Modules
  app.use('/api/auth', authRoutes);
  app.use('/api/workspace', workspaceRoutes);
  app.use('/api/tickets', ticketRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/track', trackRoutes);
  app.use('/api/subscription', subscriptionRoutes);
  app.use('/api/features', premiumRoutes);

  // SPA Fallback for non-API client GET requests
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(__dirname, 'public/index.html'));
  });

  // 404 Handler for unhandled API routes
  app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found.' });
  });

  return app;
}

const app = createApp();

let server = null;
if (require.main === module) {
  connectMongo().then(() => {
    server = app.listen(env.PORT, () => {
      console.log(`[FixFlow] Backend running on http://localhost:${env.PORT} with MongoDB in ${env.NODE_ENV} mode`);
    });
  }).catch(err => {
    console.error('[FixFlow] Failed to connect to MongoDB:', err);
    process.exit(1);
  });
}

module.exports = { app, createApp, server };
