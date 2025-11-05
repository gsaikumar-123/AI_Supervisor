const config = require('./config/env');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const callRoute = require('./routes/call');
const tokenRoute = require('./routes/token');
const notifyRoute = require('./routes/notify');
const kbRoute = require('./routes/kb');
const requestsRoute = require('./routes/requests');
const webhookRoutes = require('./routes/webhooks');

app.use('/api', callRoute);
app.use('/api', tokenRoute);
app.use('/api', notifyRoute);
app.use('/api', kbRoute);
app.use('/api', requestsRoute);
app.use('/webhooks', webhookRoutes);

app.get('/api/livekit-config', (req, res) => {
  res.json({ wsUrl: process.env.LIVEKIT_WS_URL || '' });
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

const { timeoutStalePending } = require('./services/storage');
const timeoutMs = Number(process.env.REQ_TIMEOUT_MS || 600000);
setInterval(async () => {
  try {
    await timeoutStalePending({ timeoutMs });
  } catch (e) {
    console.error('Timeout check error:', e.message);
  }
}, Math.max(60000, Math.floor(timeoutMs / 2)));

app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
  console.log(`📊 Health check: http://localhost:${config.port}/health`);
});
