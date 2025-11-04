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

app.listen(config.port, () => console.log(`Server running on http://localhost:${config.port}`));
