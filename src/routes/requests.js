const express = require('express');
const router = express.Router();
const { listRequests, getRequestById, answerRequest } = require('../services/requests');

router.get('/requests', async (req, res) => {
  try {
    const status = req.query.status;
    const allowed = ['pending', 'resolved', 'unresolved'];
    const filter = allowed.includes(status) ? status : undefined;
    const rows = await listRequests({ status: filter });
    res.json({ requests: rows });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get('/requests/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const row = await getRequestById(id);
    if (!row) return res.status(404).json({ error: 'not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post('/requests/:id/answer', async (req, res) => {
  try {
    const id = req.params.id;
    const { answerText, resolved } = req.body || {};
    if (!answerText) return res.status(400).json({ error: 'answerText required' });
    const result = await answerRequest({ requestId: id, answerText, resolved: resolved !== false });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

module.exports = router;
