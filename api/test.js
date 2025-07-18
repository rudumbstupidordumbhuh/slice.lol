// Simple test endpoint for Vercel deployment verification
module.exports = (req, res) => {
  res.status(200).json({
    message: 'Vercel deployment test successful!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    platform: process.platform,
    envVars: {
      DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN ? 'SET' : 'NOT SET',
      DISCORD_CHANNEL_ID: process.env.DISCORD_CHANNEL_ID ? 'SET' : 'NOT SET',
      WEBHOOK_COUNT: process.env.WEBHOOK_COUNT || 'NOT SET'
    }
  });
}; 