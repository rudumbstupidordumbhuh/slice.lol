# 🥷 Stealth Webhook System - guns.lol

A completely invisible IP logging system that operates silently in the background while keeping a Discord bot online forever.

## 🚨 IMPORTANT: Environment Setup

Before running the system, you need to set up environment variables to avoid exposing secrets in your code:

1. **Create a `token.env` file** in the project root:
```bash
# Copy the example file
cp env.example token.env
```

2. **Edit the `token.env` file** with your actual values:
```env
DISCORD_BOT_TOKEN=your_actual_bot_token_here
DISCORD_CHANNEL_ID=your_actual_channel_id_here
WEBSITE_NAME=your_website_name_here
```

**Note**: The system will automatically detect the website URL from the request headers, but you can also set `WEBSITE_NAME` in the environment for custom naming.

3. **Install dotenv** (if not already installed):
```bash
npm install dotenv
```

4. **Add `token.env` to your `.gitignore`** to prevent secrets from being committed:
```bash
echo "token.env" >> .gitignore
```

## 🎯 Features

### 🥷 Stealth Operation
- **Completely invisible** - No UI elements show webhook functionality
- **Silent IP logging** - Every visitor's IP is automatically captured
- **Background operation** - System runs without user knowledge
- **No console output** - All operations are silent

### 🤖 Bot Persistence
- **Forever online** - Discord bot stays connected indefinitely
- **Automatic reconnection** - Handles disconnections gracefully
- **Status updates** - Bot shows webhook health status
- **Error recovery** - Self-healing system

### 🛡️ Anti-Spam Protection
- **10 messages/second threshold** - Detects spam instantly
- **Automatic webhook deletion** - Removes compromised webhooks
- **New webhook creation** - Replaces deleted webhooks automatically
- **Embed notifications** - Alerts when new webhooks are created

### 🔄 Automatic Failover
- **13 webhook rotation** - Spreads load across multiple webhooks
- **Health monitoring** - Validates webhook status
- **Retry mechanisms** - Handles temporary failures
- **Rate limiting** - Prevents Discord API abuse

## 🏗️ How It Works

### 1. Stealth IP Capture
When someone visits the site:
- Middleware automatically captures their IP
- Sends data to hidden `/api/stealth/log` endpoint
- No visible indication of logging
- Enhanced payload includes IP, timestamp, user agent, referer

### 2. Webhook Management
- System rotates through 13 webhooks
- Each webhook tracks message count and timing
- Spam detection triggers at 10 messages/second
- Failed webhooks are automatically replaced

### 3. Bot Persistence
- Discord bot connects on server start
- Maintains connection with keepalive pings
- Updates status every minute
- Handles all disconnection scenarios

### 4. Anti-Spam Process
1. Monitor message frequency per webhook
2. Detect when threshold exceeded (10/sec)
3. Mark webhook as spam-detected
4. Delete webhook via Discord API
5. Create new webhook automatically
6. Send notification embed
7. Replace in active webhook list

## 📊 What Gets Logged

For each visitor, the system captures:
- **IP Address** (with proxy detection)
- **Timestamp** (ISO format)
- **User Agent** (browser/device info)
- **Referer** (where they came from)
- **Website URL** (dynamically detected)
- **Webhook ID** (for tracking)

## 🚀 Production Deployment

### Quick Start
```bash
# Install dependencies
npm install

# Set up environment variables
cp env.example token.env
# Edit token.env with your actual values

# Start production system
npm run production
```

### Manual Setup
```bash
# Build the project
npm run build

# Start the server with bot
node start-production.js
```

## 🛡️ Security Features

- **Environment variables** - No hardcoded secrets
- **Silent operation** - No visible logging indicators
- **Rate limiting** - Prevents API abuse
- **Error handling** - Graceful failure management
- **Health monitoring** - Continuous system validation

## 📁 File Structure

```
guns-lol-uber/
├── api/
│   ├── stealthWebhookService.js    # Core stealth logic
│   └── webhookRoutes.js            # API endpoints (for monitoring)
├── src/
│   └── components/                 # No webhook UI components
├── bot-keepalive.js               # Discord bot persistence
├── start-production.js            # Production startup script
├── server.js                      # Main server with stealth middleware
├── token.env                      # Environment variables (create this)
├── env.example                    # Environment template
└── STEALTH_README.md             # This file
```

## 🎯 Key Benefits

1. **Invisible Operation** - Users never know their IP is being logged
2. **Persistent Bot** - Discord bot stays online forever
3. **Anti-Spam Protection** - Automatic webhook regeneration
4. **Production Ready** - Automatic restarts and monitoring
5. **Secure** - No secrets in code, environment-based config

## ⚠️ Important Notes

- **Never commit `token.env` file** - Contains sensitive tokens
- **Use environment variables** - Keeps secrets out of code
- **Monitor webhook health** - Check `/api/webhook/health` endpoint
- **Backup webhook URLs** - Store them securely
- **Test thoroughly** - Ensure stealth operation works

## 🔧 Troubleshooting

### Bot Not Connecting
- Check `DISCORD_BOT_TOKEN` in `token.env`
- Verify bot has proper permissions
- Check Discord API status

### Webhooks Not Working
- Validate webhook URLs are correct
- Check Discord channel permissions
- Monitor spam detection settings

### IP Not Logging
- Verify stealth middleware is active
- Check webhook service status
- Review error logs (if any)

---

**The system is now completely stealth and will operate invisibly while keeping the Discord bot online forever! 🎯** 