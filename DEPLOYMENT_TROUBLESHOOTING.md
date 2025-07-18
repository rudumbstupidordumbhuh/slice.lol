# Vercel Deployment Troubleshooting Guide

If your deployment is not building or working on Vercel, follow these steps:

## 1. Check Vercel Project Settings

### Build Settings
- **Framework Preset**: Select "Other" or "Node.js"
- **Build Command**: Leave empty (or use `npm run vercel-build`)
- **Output Directory**: Leave empty (or use `.`)
- **Install Command**: `npm install`

### Root Directory
- Make sure the root directory is set to the project root (where `package.json` is located)

## 2. Verify File Structure

Your project should have this structure:
```
guns-lol-uber/
├── package.json
├── server.js
├── vercel.json
├── api/
│   ├── stealthWebhookService.js
│   └── test.js
├── bot-keepalive.js
└── ... (other files)
```

## 3. Check Vercel Logs

1. Go to your Vercel dashboard
2. Click on your project
3. Go to "Deployments" tab
4. Click on the latest deployment
5. Check the "Build Logs" and "Function Logs"

## 4. Common Issues and Solutions

### Issue: "Build failed" or "No build output"
**Solution**: 
- Make sure `vercel.json` is in the root directory
- Verify `package.json` has the correct `main` field pointing to `server.js`
- Check that all dependencies are in `package.json`

### Issue: "Function not found"
**Solution**:
- Ensure `server.js` exists and is properly formatted
- Check that the route in `vercel.json` points to the correct file

### Issue: "Module not found"
**Solution**:
- Make sure all required files exist (`api/stealthWebhookService.js`, `bot-keepalive.js`)
- Check that all dependencies are listed in `package.json`

## 5. Test Deployment

After deployment, test these endpoints:

1. **Basic Test**: `https://your-domain.vercel.app/api/test`
2. **Health Check**: `https://your-domain.vercel.app/api/health`
3. **Server Test**: `https://your-domain.vercel.app/api/test-webhook`

## 6. Environment Variables

Make sure these are set in Vercel:
- `DISCORD_BOT_TOKEN`
- `DISCORD_CHANNEL_ID`
- `WEBHOOK_COUNT`
- `WEBHOOK_URL_1` through `WEBHOOK_URL_13`
- `ENABLE_BOT`

## 7. Force Redeploy

If nothing works:
1. Go to Vercel dashboard
2. Click "Redeploy" on your project
3. Select "Clear cache and redeploy"

## 8. Alternative Deployment Method

If Vercel continues to fail:

1. **Use Vercel CLI**:
   ```bash
   npm i -g vercel
   vercel login
   vercel --prod
   ```

2. **Manual Deployment**:
   - Zip your project files
   - Upload to Vercel manually
   - Set environment variables in dashboard

## 9. Debug Information

Add this to your `server.js` at the top to get more debug info:

```javascript
console.log('🚀 Server starting...');
console.log('📁 Current directory:', __dirname);
console.log('📦 Package.json location:', require.resolve('./package.json'));
console.log('🔧 Node version:', process.version);
console.log('🌍 Platform:', process.platform);
```

## 10. Contact Support

If all else fails:
1. Check Vercel status page
2. Contact Vercel support with your deployment logs
3. Share the specific error messages you're seeing

## Quick Fix Checklist

- [ ] `vercel.json` exists in root directory
- [ ] `package.json` has correct `main` field
- [ ] All dependencies are in `package.json`
- [ ] `server.js` exists and is valid
- [ ] Environment variables are set in Vercel
- [ ] Build settings are correct
- [ ] No syntax errors in any files 