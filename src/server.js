const config = require('./config/env');
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const callRoute = require('./routes/call');
app.use('/api', callRoute);
const tokenRoute = require('./routes/token');
app.use('/api', tokenRoute);
const notifyRoute = require('./routes/notify');
app.use('/api', notifyRoute);
const kbRoute = require('./routes/kb');
app.use('/api', kbRoute);
const requestsRoute = require('./routes/requests');
app.use('/api', requestsRoute);
const webhookRoutes = require('./routes/webhooks');
app.use('/webhooks', webhookRoutes);


app.get('/api/livekit-config', (req, res) => {
  res.json({ wsUrl: process.env.LIVEKIT_WS_URL || '' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test-call.html'));
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

const { timeoutStalePending } = require('./services/storage');
const { addNotification } = require('./services/notify');
const timeoutMs = Number(process.env.REQ_TIMEOUT_MS || 600000);
setInterval(async () => {
  try {
    const count = await timeoutStalePending({ timeoutMs });
  } catch (e) {}
}, Math.max(60000, Math.floor(timeoutMs / 2)));

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
  console.log(`Test Call: http://localhost:${config.port}/test-call.html`);
  console.log(`Supervisor: http://localhost:${config.port}/supervisor.html`);
});
