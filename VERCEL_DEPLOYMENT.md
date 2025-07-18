# 🚀 Vercel Deployment Guide

## Environment Variables Setup

### 1. Go to Vercel Dashboard
1. Navigate to your project in the Vercel dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the left sidebar

### 2. Add Environment Variables
Add these environment variables in Vercel:

| Name | Value | Environment |
|------|-------|-------------|
| `DISCORD_BOT_TOKEN` | `YOUR_BOT_TOKEN_HERE` | Production |
| `DISCORD_CHANNEL_ID` | `YOUR_CHANNEL_ID_HERE` | Production |
| `WEBSITE_NAME` | `YOUR_WEBSITE_NAME_HERE` | Production |
| `WEBHOOK_COUNT` | `13` | Production |
| `ENABLE_BOT` | `true` | Production |

### 3. Add Webhook URLs
Add these webhook URL environment variables (replace with your actual webhook URLs):

| Name | Value | Environment |
|------|-------|-------------|
| `WEBHOOK_URL_1` | `YOUR_WEBHOOK_URL_1` | Production |
| `WEBHOOK_URL_2` | `YOUR_WEBHOOK_URL_2` | Production |
| `WEBHOOK_URL_3` | `YOUR_WEBHOOK_URL_3` | Production |
| `WEBHOOK_URL_4` | `YOUR_WEBHOOK_URL_4` | Production |
| `WEBHOOK_URL_5` | `YOUR_WEBHOOK_URL_5` | Production |
| `WEBHOOK_URL_6` | `YOUR_WEBHOOK_URL_6` | Production |
| `WEBHOOK_URL_7` | `YOUR_WEBHOOK_URL_7` | Production |
| `WEBHOOK_URL_8` | `YOUR_WEBHOOK_URL_8` | Production |
| `WEBHOOK_URL_9` | `YOUR_WEBHOOK_URL_9` | Production |
| `WEBHOOK_URL_10` | `YOUR_WEBHOOK_URL_10` | Production |
| `WEBHOOK_URL_11` | `YOUR_WEBHOOK_URL_11` | Production |
| `WEBHOOK_URL_12` | `YOUR_WEBHOOK_URL_12` | Production |
| `WEBHOOK_URL_13` | `YOUR_WEBHOOK_URL_13` | Production |

### 4. Deploy
1. Push your code to GitHub
2. Vercel will automatically deploy
3. The system will use Vercel's environment variables

## 🔧 Configuration Details

### Environment Variables
- **DISCORD_BOT_TOKEN**: Your Discord bot token
- **DISCORD_CHANNEL_ID**: Your Discord channel ID
- **WEBSITE_NAME**: Your website name (optional, auto-detected)

### Vercel Configuration
- **Runtime**: Node.js
- **Entry Point**: `server.js`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

## 🎯 Features in Production

### Automatic Detection
- Website URL is automatically detected from request headers
- No hardcoded website names
- Dynamic webhook naming

### Stealth Operation
- Completely invisible IP logging
- No UI elements showing webhook functionality
- Silent background operation

### Anti-Spam Protection
- 10 messages/second threshold
- Automatic webhook regeneration
- Discord bot integration

## 📊 Monitoring

### Health Check
Visit: `https://your-domain.vercel.app/api/webhook/health`

### Webhook Status
Visit: `https://your-domain.vercel.app/api/webhook/status`

## 🔒 Security

- Environment variables are encrypted in Vercel
- No secrets in code
- Automatic HTTPS
- Global CDN

## 🚨 Troubleshooting

### Bot Not Connecting
- Check environment variables in Vercel dashboard
- Verify bot token is correct
- Check Discord API status

### Webhooks Not Working
- Validate webhook URLs
- Check Discord channel permissions
- Monitor spam detection settings

### Deployment Issues
- Check Vercel build logs
- Verify `vercel.json` configuration
- Ensure all dependencies are in `package.json`

---

**Your stealth webhook system is now ready for production deployment on Vercel! 🎯** 