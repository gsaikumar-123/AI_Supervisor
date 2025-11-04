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
const requestsRoute = require('./routes/requests');
app.use('/api', requestsRoute);

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

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
  console.log(`Test Call: http://localhost:${config.port}/test-call.html`);
  console.log(`Supervisor: http://localhost:${config.port}/supervisor.html`);
});
