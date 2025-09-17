#!/bin/bash
# VPS Git Deployment Script
# Run this ON YOUR VPS to deploy from GitHub

echo "🚀 ClinIQ Git Deployment Script"
echo "==============================="

# Navigate to project directory
cd ~/cliniq-healthcare

# Check current branch
echo "📋 Current branch:"
git branch

# Pull latest changes from GitHub
echo "📦 Pulling latest changes from GitHub..."
git pull origin main

# Install dependencies (if package.json changed)
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Deploy to web directory
echo "🚀 Deploying to web directory..."
cp -r dist/* /var/www/html/

# Set correct permissions
echo "🔧 Setting permissions..."
chown -R www-data:www-data /var/www/html/
chmod -R 755 /var/www/html/

# Restart services if needed
echo "♻️ Checking services..."
pm2 status

# Test deployment
echo "🧪 Testing deployment..."
curl -s -I https://cliniq.org.in/ | head -n 5

echo ""
echo "✅ Deployment complete!"
echo "🌐 Website: https://cliniq.org.in"
echo "🎤 Speech Endpoint: wss://cliniq.org.in/stt"
echo ""
echo "🔄 To update again: run this script or set up GitHub Actions"
