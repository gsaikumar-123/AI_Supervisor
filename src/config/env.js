require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  livekit: {
    apiKey: process.env.LIVEKIT_API_KEY || '',
    apiSecret: process.env.LIVEKIT_API_SECRET || ''
  }
};