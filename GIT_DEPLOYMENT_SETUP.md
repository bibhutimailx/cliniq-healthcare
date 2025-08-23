# 🚀 Git Deployment Setup with IONOS

## 📋 **Complete Step-by-Step Guide**

### **Step 1: Create GitHub Repository**

1. **Go to GitHub**
   - Visit [github.com](https://github.com)
   - Login to your account

2. **Create New Repository**
   - Click "New repository" or "+" → "New repository"
   - **Repository name**: `cliniq-healthcare`
   - **Description**: "AI-powered healthcare assistant for multilingual medical consultations"
   - **Visibility**: Public (or Private if you prefer)
   - **DO NOT** initialize with README (we already have one)
   - Click "Create repository"

3. **Copy Repository URL**
   - Copy the HTTPS URL (e.g., `https://github.com/yourusername/cliniq-healthcare.git`)

### **Step 2: Connect Local Repository to GitHub**

```bash
# Add GitHub as remote origin
git remote add origin https://github.com/yourusername/cliniq-healthcare.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### **Step 3: Configure IONOS Git Deployment**

#### **Option A: IONOS Git Integration (Recommended)**

1. **Login to IONOS Control Panel**
   - Go to [ionos.com](https://ionos.com)
   - Login to your account

2. **Access Web Hosting**
   - Go to "Web Hosting" → cliniq.info
   - Click "Manage" or "Settings"

3. **Enable Git Integration**
   - Look for "Git" or "Version Control" section
   - Click "Enable Git" or "Connect Repository"
   - Select "GitHub" as source

4. **Connect GitHub Repository**
   - Enter your GitHub repository URL
   - Authorize IONOS to access your GitHub
   - Select the branch (usually `main`)

5. **Configure Build Settings**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Node.js Version**: 18 or higher

6. **Set Environment Variables**
   - Add your API keys as environment variables:
     - `ASSEMBLYAI_API_KEY`
     - `REVERIE_API_ID`
     - `REVERIE_API_KEY`

#### **Option B: GitHub Actions (Alternative)**

If IONOS doesn't support direct Git integration, use GitHub Actions:

1. **Create GitHub Actions Workflow**
   Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to IONOS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build project
      run: npm run build
      
    - name: Deploy to IONOS
      uses: easingthemes/ssh-deploy@main
      env:
        SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
        REMOTE_HOST: ${{ secrets.REMOTE_HOST }}
        REMOTE_USER: ${{ secrets.REMOTE_USER }}
        SOURCE: "dist/"
        TARGET: "/public_html/"
```

### **Step 4: Configure IONOS SSH Access**

1. **Generate SSH Key**
   ```bash
   ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
   ```

2. **Add SSH Key to IONOS**
   - Go to IONOS Control Panel
   - Find SSH Key management
   - Add your public key

3. **Get IONOS SSH Details**
   - Note down your IONOS SSH hostname
   - Note down your SSH username

### **Step 5: Set Up GitHub Secrets**

1. **Go to GitHub Repository**
   - Click "Settings" → "Secrets and variables" → "Actions"

2. **Add Repository Secrets**
   - `SSH_PRIVATE_KEY`: Your private SSH key
   - `REMOTE_HOST`: Your IONOS SSH hostname
   - `REMOTE_USER`: Your IONOS SSH username

### **Step 6: Test Deployment**

1. **Make a Change**
   ```bash
   # Edit a file
   echo "# Test deployment" >> README.md
   
   # Commit and push
   git add README.md
   git commit -m "Test deployment"
   git push
   ```

2. **Check Deployment**
   - Visit https://cliniq.info
   - Should see your changes live

## 🔧 **IONOS-Specific Configuration**

### **IONOS Git Integration Settings**

If IONOS supports Git integration, configure these settings:

```json
{
  "repository": "https://github.com/yourusername/cliniq-healthcare.git",
  "branch": "main",
  "build_command": "npm run build",
  "output_directory": "dist",
  "node_version": "18",
  "environment_variables": {
    "ASSEMBLYAI_API_KEY": "your_key",
    "REVERIE_API_ID": "your_id",
    "REVERIE_API_KEY": "your_key"
  }
}
```

### **IONOS File Structure**

After deployment, your IONOS hosting should have:

```
public_html/
├── index.html
├── config.js
├── .htaccess
├── favicon.ico
├── robots.txt
└── assets/
    ├── index-*.js
    └── index-*.css
```

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **Build Fails**
   - Check Node.js version in IONOS
   - Verify build command is correct
   - Check for missing dependencies

2. **Files Not Uploading**
   - Verify SSH keys are correct
   - Check IONOS SSH access
   - Ensure target directory exists

3. **Site Not Working**
   - Check .htaccess file is uploaded
   - Verify index.html is in root
   - Check browser console for errors

### **IONOS Support**
- **Live Chat**: Available in Control Panel
- **Documentation**: [ionos.com/help](https://ionos.com/help)
- **Git Integration**: Check if your hosting plan supports it

## 🎯 **Expected Workflow**

1. **Make changes** in Cursor
2. **Commit and push** to GitHub
3. **IONOS automatically** builds and deploys
4. **Site updates** at https://cliniq.info

## 📞 **Need Help?**

If IONOS doesn't support Git integration:
1. **Use Vercel** instead (much easier)
2. **Use Netlify** (also supports Git)
3. **Manual deployment** with the zip file

Your site will automatically update when you push to Git! 🚀
