const express = require('express');
const router = express.Router();
const { subscribe, listNotifications } = require('../services/notify');

router.get('/stream/:callerId', async (req, res) => {
  subscribe(req.params.callerId, res);
});

router.get('/notifications/:callerId', async (req, res) => {
  try {
    const items = await listNotifications(req.params.callerId);
    res.json({ notifications: items });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

module.exports = router;
