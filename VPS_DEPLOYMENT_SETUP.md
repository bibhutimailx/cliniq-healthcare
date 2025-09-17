# 🚀 VPS Git Deployment Setup Guide

## 📋 Overview

This guide sets up automatic deployment from your GitHub repository to your VPS. When you push to the `main` branch, your website automatically updates!

## 🔧 Setup Steps

### **Step 1: Configure VPS for Git Deployment**

**SSH into your VPS:**
```bash
ssh root@77.37.44.205
```

**Setup Git repository on VPS:**
```bash
# Navigate to project directory
cd ~/cliniq-healthcare

# Set up remote origin (if not already done)
git remote add origin https://github.com/bibhutimailx/cliniq-healthcare.git

# Set main branch as default
git checkout main || git checkout -b main

# Make sure we're tracking the remote main branch
git branch --set-upstream-to=origin/main main
```

**Make deployment script executable:**
```bash
chmod +x deploy-from-git.sh
```

### **Step 2: Manual Git Deployment (Option A)**

**On VPS, run this whenever you want to update:**
```bash
cd ~/cliniq-healthcare
./deploy-from-git.sh
```

### **Step 3: Automatic GitHub Actions (Option B)**

**Setup GitHub Secrets:**
1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add these secrets:
   - `VPS_HOST`: `77.37.44.205`
   - `VPS_USER`: `root`
   - `VPS_SSH_KEY`: Your private SSH key

**Generate SSH Key (if needed):**
```bash
# On your local machine
ssh-keygen -t rsa -b 4096 -C "github-actions"

# Copy public key to VPS
ssh-copy-id -i ~/.ssh/id_rsa.pub root@77.37.44.205

# Copy private key content to GitHub Secret VPS_SSH_KEY
cat ~/.ssh/id_rsa
```

## 🎯 Development Workflow

### **Local Development:**
```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make changes and test locally
npm run dev

# 3. Commit changes
git add .
git commit -m "feat: description of changes"

# 4. Push feature branch
git push origin feature/your-feature-name
```

### **Deployment:**
```bash
# 1. Merge to main (after testing)
git checkout main
git merge feature/your-feature-name

# 2. Push to main (triggers auto-deployment)
git push origin main

# 3. Website updates automatically! 🎉
```

## 🔄 Deployment Options

| Method | Trigger | Best For |
|--------|---------|----------|
| **Manual Script** | Run `./deploy-from-git.sh` on VPS | Quick updates, testing |
| **GitHub Actions** | Push to main branch | Production, team collaboration |
| **Webhook** | GitHub webhook to VPS | Advanced setups |

## 🛠️ Troubleshooting

**If deployment fails:**
```bash
# Check VPS logs
pm2 logs google-stt-proxy
tail -f /var/log/nginx/error.log

# Manual build
cd ~/cliniq-healthcare
npm run build
cp -r dist/* /var/www/html/
```

**If GitHub Actions fail:**
- Check secrets are set correctly
- Verify SSH key has access to VPS
- Check VPS disk space: `df -h`

## ✅ Benefits

- ✅ **Professional workflow** with feature branches
- ✅ **Automatic deployments** on main branch push
- ✅ **Rollback capability** via Git history
- ✅ **Team collaboration** ready
- ✅ **Production safety** with testing before merge

## 🎉 Result

Your ClinIQ healthcare application now has:
- Professional Git workflow
- Automatic deployments
- Google STT Proxy with speaker diarization
- Production-ready infrastructure
- Team collaboration capabilities
