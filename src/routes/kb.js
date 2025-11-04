const express = require('express');
const router = express.Router();
const { listAll, listLearned } = require('../services/kb');

router.get('/kb', async (req, res) => {
  try {
    const answers = await listAll();
    res.json({ answers });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get('/kb/learned', async (req, res) => {
  try {
    const answers = await listLearned();
    res.json({ answers });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

module.exports = router;
