# 🎤 Speech Recognition Troubleshooting Guide

## 🔧 **Quick Fixes for "Connection Error" Issue**

### **Issue**: "Speech recognition service is not available. Please check your microphone permissions and try again."

---

## 🚀 **Solution 1: Switch to Browser Native Mode (Immediate Fix)**

### **Steps:**
1. **Go to Speech Recognition Configuration** (in the app)
2. **Change Provider** from "AssemblyAI" to "Browser Native"
3. **Allow Microphone Access** when prompted
4. **Click "Test Speech Recognition"**

### **Why This Works:**
- Browser native mode doesn't require API keys
- Works directly with your browser's built-in speech recognition
- No external dependencies

---

## 🔑 **Solution 2: Configure API Key (Full Features)**

### **For Development (Local Testing):**

1. **Create `.env.local` file** in project root:
```env
VITE_ASSEMBLYAI_API_KEY=your_assemblyai_key_here
```

2. **Or update `public/config.js`**:
```javascript
window.APP_CONFIG = {
  ASSEMBLYAI_API_KEY: 'your_actual_assemblyai_key_here',
  // ... other config
};
```

### **Get AssemblyAI API Key:**
1. **Go to**: https://www.assemblyai.com/
2. **Sign up** for free account
3. **Get API key** from dashboard
4. **Copy key** to configuration

---

## 🌐 **Solution 3: Browser Compatibility Check**

### **Supported Browsers:**
- ✅ **Chrome/Chromium** (Best support)
- ✅ **Microsoft Edge** (Full support)
- ✅ **Safari** (Good support)
- ❌ **Firefox** (Limited support)

### **Check Support:**
```javascript
// Open browser console (F12) and run:
console.log('Speech Recognition Support:', {
  speechRecognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
  mediaDevices: !!navigator.mediaDevices,
  getUserMedia: !!navigator.mediaDevices?.getUserMedia
});
```

---

## 🎯 **Solution 4: Microphone Permissions**

### **Grant Microphone Access:**
1. **Click microphone icon** in browser address bar
2. **Select "Always allow"**
3. **Refresh the page**
4. **Test again**

### **Chrome Instructions:**
1. **Settings** → **Privacy and Security** → **Site Settings**
2. **Microphone** → Find your localhost
3. **Set to "Allow"**

### **Edge Instructions:**
1. **Settings** → **Cookies and site permissions**
2. **Microphone** → Add localhost to "Allow" list

---

## 🔍 **Solution 5: Debug Information**

### **Check Console Logs:**
1. **Open Developer Tools** (F12)
2. **Go to Console tab**
3. **Look for messages** like:
   - ✅ `🌐 Browser speech recognition initialized`
   - ✅ `✅ Microphone access granted`
   - ❌ `❌ Microphone access denied`
   - ❌ `Browser speech recognition not supported`

### **Common Console Messages:**
```
🚀 Using modern speech recognition service  // API key working
🌐 Using browser speech recognition fallback // No API key, using browser
❌ Microphone access denied                 // Permission issue
🎤 Speech recognition started               // Working correctly
```

---

## ⚡ **Quick Test Commands**

### **Test in Browser Console:**
```javascript
// Test microphone access
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('✅ Microphone working');
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(error => console.log('❌ Microphone error:', error));

// Test speech recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  console.log('✅ Speech Recognition supported');
  const recognition = new SpeechRecognition();
  recognition.onstart = () => console.log('🎤 Started');
  recognition.onresult = (event) => console.log('📝 Result:', event.results[0][0].transcript);
  recognition.start();
} else {
  console.log('❌ Speech Recognition not supported');
}
```

---

## 🏥 **Production Configuration**

### **For Live Deployment:**
1. **Update `public/config.js`** with real API keys
2. **Use HTTPS** (required for microphone access)
3. **Test on target devices** and browsers
4. **Monitor error logs** for issues

### **API Key Security:**
- ✅ **Use environment variables** in development
- ✅ **Secure API key storage** in production
- ❌ **Never commit API keys** to version control

---

## 📊 **Feature Comparison**

| Feature | Browser Native | AssemblyAI | Notes |
|---------|---------------|------------|--------|
| **Cost** | Free | Paid | Browser is always free |
| **Accuracy** | 80-85% | 90-95% | AssemblyAI better for medical terms |
| **Languages** | 5+ | 11+ | AssemblyAI supports more languages |
| **Medical Terms** | Basic | Advanced | AssemblyAI optimized for healthcare |
| **Setup** | None | API Key | Browser works immediately |
| **Real-time** | Yes | Yes | Both support real-time |

---

## 🎯 **Recommended Approach**

### **For Testing/Demo:**
1. **Use Browser Native** for immediate testing
2. **No API keys required**
3. **Works in most browsers**

### **For Production:**
1. **Use AssemblyAI** for best accuracy
2. **Get proper API key**
3. **Configure environment variables**
4. **Test thoroughly**

---

## 🚀 **Next Steps After Fix**

1. **Test basic speech recognition**
2. **Try different languages**
3. **Test medical terminology**
4. **Verify speaker detection**
5. **Check AI summary generation**

---

## 📞 **Still Having Issues?**

### **Check These:**
- [ ] Browser is Chrome/Edge/Safari
- [ ] Microphone permissions granted
- [ ] HTTPS enabled (for production)
- [ ] No VPN blocking microphone
- [ ] Microphone hardware working
- [ ] Console shows no errors

### **Advanced Debugging:**
- Check network requests in Developer Tools
- Verify API key format and validity
- Test with different microphones
- Try incognito/private browsing mode

**Your ClinIQ app should now work perfectly with speech recognition!** 🎉
