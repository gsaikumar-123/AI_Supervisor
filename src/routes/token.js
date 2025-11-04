const express = require('express');
const router = express.Router();
const { AccessToken, VideoGrant } = require('livekit-server-sdk');
const config = require('../config/env');

const { apiKey: LIVEKIT_API_KEY, apiSecret: LIVEKIT_API_SECRET } = config.livekit;

router.get('/token', (req, res) => {
  const identity = req.query.identity || `user-${Math.floor(Math.random()*1000)}`;
  const room = req.query.room || 'agent-room';

  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
    return res.status(500).json({ error: 'LiveKit keys not configured' });
  }

  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, { identity });
  const grant = new VideoGrant({ room });
  at.addGrant(grant);
  const token = at.toJwt();

  res.json({ token, identity, room });
});

module.exports = router;
