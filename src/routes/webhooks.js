const express = require('express');
const router = express.Router();

router.post('/supervisor', (req, res) => {
  console.log("[SUPERVISOR WEBHOOK] Received help request:", req.body);
  res.json({ success: true });
});

router.post('/caller', (req, res) => {
  console.log("[CALLER WEBHOOK] Message to caller:", req.body);
  res.json({ success: true });
});

module.exports = router;
