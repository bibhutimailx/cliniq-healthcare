# 🌐 IONOS Deployment Guide for ClinIQ

## 🚨 **Current Issue**
Your site `cliniq.info` is returning a 404 error, which means the hosting is not properly configured.

## 🎯 **Solution: Deploy to IONOS**

### **Step 1: Build Your Application**
```bash
# Build the production version
npm run build
```

This creates a `dist` folder with your production-ready files.

### **Step 2: Upload to IONOS**

#### **Method A: IONOS File Manager (Easiest)**
1. **Login to IONOS Control Panel**
   - Go to [ionos.com](https://ionos.com)
   - Login to your account
   - Go to "Web Hosting" → Your domain

2. **Access File Manager**
   - Click on "File Manager" or "FTP"
   - Navigate to `public_html` or `www` folder

3. **Upload Files**
   - Delete all existing files in `public_html`
   - Upload ALL contents of your local `dist` folder
   - Make sure `index.html` is in the root

#### **Method B: FTP Upload**
1. **Get FTP Credentials from IONOS**
   - Go to IONOS Control Panel
   - Find FTP credentials in hosting settings

2. **Use FTP Client**
   ```bash
   # Using command line FTP
   ftp your-domain.com
   # Enter username and password
   cd public_html
   put -r dist/*
   ```

#### **Method C: Git Deployment (Advanced)**
If IONOS supports Git deployment:
1. **Initialize Git in your project**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Connect to IONOS Git repository**
   - Get Git URL from IONOS
   - Push your code

### **Step 3: Configure IONOS Settings**

#### **PHP Settings (if needed)**
Create `.htaccess` file in `public_html`:
```apache
RewriteEngine On
RewriteBase /

# Handle React Router
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [QSA,L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
```

#### **SSL Certificate**
- ✅ IONOS usually provides free SSL
- ✅ Enable HTTPS in IONOS Control Panel
- ✅ Redirect HTTP to HTTPS

### **Step 4: Environment Variables**

Since IONOS doesn't support environment variables like Vercel, you need to:

#### **Option A: Hardcode (Not Recommended)**
Update your code to use hardcoded values (not secure for API keys).

#### **Option B: Use a Config File**
Create `public/config.js`:
```javascript
window.APP_CONFIG = {
  ASSEMBLYAI_API_KEY: 'your_key_here',
  REVERIE_API_ID: 'your_id_here',
  REVERIE_API_KEY: 'your_key_here',
  APP_ENVIRONMENT: 'production'
};
```

Then update your code to use `window.APP_CONFIG.ASSEMBLYAI_API_KEY`.

### **Step 5: Test Your Site**
1. Visit `https://cliniq.info`
2. Check browser console for errors
3. Test all features (speech recognition, etc.)

---

## 🔄 **Automated Deployment Workflow**

### **Create a Deployment Script**
Create `deploy-ionos.sh`:
```bash
#!/bin/bash

# Build the project
echo "Building project..."
npm run build

# Create deployment package
echo "Creating deployment package..."
cd dist
zip -r ../cliniq-deploy.zip .

echo "Deployment package created: cliniq-deploy.zip"
echo "Upload this zip file to IONOS and extract in public_html"
```

### **Make it executable:**
```bash
chmod +x deploy-ionos.sh
./deploy-ionos.sh
```

---

## 🚨 **Troubleshooting**

### **Site Still Shows 404**
1. **Check file structure**
   - Ensure `index.html` is in `public_html` root
   - Verify all assets are uploaded

2. **Check IONOS settings**
   - Verify domain is pointing to correct hosting
   - Check if hosting is active

3. **Check .htaccess**
   - Ensure rewrite rules are correct
   - Test with simple HTML file first

### **API Keys Not Working**
1. **Check browser console** for CORS errors
2. **Verify API keys** are correctly set
3. **Test API endpoints** directly

### **Performance Issues**
1. **Enable Gzip compression** in IONOS
2. **Optimize images** and assets
3. **Use CDN** for better performance

---

## 💡 **Alternative: Move to Vercel (Recommended)**

Since IONOS hosting can be complex for React apps, consider moving to Vercel:

### **Benefits of Vercel:**
- ✅ **Automatic deployments** from Git
- ✅ **Environment variables** support
- ✅ **Better performance** with CDN
- ✅ **Free SSL** certificates
- ✅ **Easy custom domain** setup

### **Migration Steps:**
1. **Deploy to Vercel**
   ```bash
   npm i -g vercel
   vercel login
   vercel --prod
   ```

2. **Update DNS in IONOS**
   - Point domain to Vercel servers
   - Keep domain registration with IONOS

3. **Set environment variables** in Vercel dashboard

---

## 🎯 **Recommended Action Plan**

### **Immediate Fix (IONOS):**
1. Build your project: `npm run build`
2. Upload `dist` contents to IONOS `public_html`
3. Add `.htaccess` file for React Router
4. Test the site

### **Long-term Solution (Vercel):**
1. Deploy to Vercel for better performance
2. Point your domain to Vercel
3. Set up automatic deployments

---

## 📞 **IONOS Support**

If you need help with IONOS:
- **Phone**: Check your IONOS account for support number
- **Live Chat**: Available in IONOS Control Panel
- **Documentation**: [ionos.com/help](https://ionos.com/help)

Your site will be live at `https://cliniq.info` once properly deployed! 🚀
