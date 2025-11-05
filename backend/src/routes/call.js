const express = require('express');
const router = express.Router();
const { handleIncomingCall } = require('../services/aiAgent');

router.post('/call', async (req, res) => {
  try {
    const { callerId, question } = req.body;
    if (!callerId || !question) {
      return res.status(400).json({ error: 'callerId and question required' });
    }

    const result = await handleIncomingCall({ callerId, question });
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
});

module.exports = router;
