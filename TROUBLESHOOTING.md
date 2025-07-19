# 🔧 Troubleshooting Guide

## 🚨 AI Stuck "Typing" Issue

If the AI is stuck typing for more than 30 seconds, follow these steps:

### 1. Check OpenAI API Key

**Problem:** Missing or invalid OpenAI API key
**Solution:**
1. Create a `.env` file in the project root
2. Add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_actual_api_key_here
   ```
3. Get your API key from: https://platform.openai.com/api-keys

### 2. Verify Environment Setup

Run this command to check your setup:
```bash
node setup-env.js
```

### 3. Check Server Logs

When you send a message, check the server console for:
- ✅ "Sending request to OpenAI..."
- ✅ "OpenAI response received: ..."
- ❌ "OpenAI API key not configured"
- ❌ "OpenAI API error: ..."

### 4. Common Error Messages

| Error | Solution |
|-------|----------|
| `AI service not configured` | Add OpenAI API key to `.env` file |
| `Failed to generate AI response` | Check API key validity and internet connection |
| `Missing required fields` | Ensure all required data is sent |
| `Database error` | Check if database file exists and is writable |

### 5. Quick Fix Steps

1. **Stop the server** (Ctrl+C)
2. **Create/Update `.env` file:**
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   PORT=5000
   NODE_ENV=development
   ```
3. **Restart the server:**
   ```bash
   npm run dev
   ```
4. **Test the chat again**

### 6. Alternative: Use Test Mode

If you don't have an OpenAI API key, you can test with mock responses:

```javascript
// In server.js, temporarily replace the OpenAI call with:
const aiResponse = "Hello! I'm your AI companion. This is a test response since the OpenAI API key is not configured. Please add your API key to the .env file to enable real AI responses.";
```

### 7. Debug Information

**Check these files exist:**
- ✅ `.env` (with valid API key)
- ✅ `replika.db` (database file)
- ✅ `node_modules/` (dependencies installed)

**Verify server is running:**
- ✅ `http://localhost:5000` responds
- ✅ Console shows "Server running on port 5000"

### 8. Network Issues

If you're behind a firewall or proxy:
- Check if `https://api.openai.com` is accessible
- Try using a VPN if needed
- Ensure your network allows HTTPS connections

### 9. API Key Format

Your OpenAI API key should:
- Start with `sk-`
- Be 51 characters long
- Not contain spaces or special characters

Example: `sk-1234567890abcdef1234567890abcdef1234567890abcdef`

### 10. Still Not Working?

1. **Check browser console** for JavaScript errors
2. **Check server console** for Node.js errors
3. **Verify all dependencies** are installed: `npm install`
4. **Try a fresh start:**
   ```bash
   npm install
   node setup-env.js
   npm run dev
   ```

## 🎯 Expected Behavior

**With valid API key:**
- AI responds within 5-30 seconds
- Messages are saved to database
- Real-time updates work

**Without API key:**
- Clear error message appears
- No infinite "typing" state
- Helpful instructions shown

## 📞 Need Help?

If you're still having issues:
1. Check the server console output
2. Verify your API key is valid
3. Ensure all files are properly set up
4. Try the test mode as a fallback 