#!/bin/bash

echo "🚀 ClinIQ GitHub Setup Script"
echo "============================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo ""
echo "📋 Step-by-Step Instructions:"
echo ""

echo "1️⃣  Create GitHub Repository:"
echo "   - Go to https://github.com"
echo "   - Click 'New repository'"
echo "   - Name: cliniq-healthcare"
echo "   - Description: AI-powered healthcare assistant"
echo "   - Make it Public or Private"
echo "   - DO NOT initialize with README"
echo ""

echo "2️⃣  Copy the repository URL (it will look like):"
echo "   https://github.com/yourusername/cliniq-healthcare.git"
echo ""

echo "3️⃣  Run these commands (replace with your actual URL):"
echo "   git remote add origin https://github.com/yourusername/cliniq-healthcare.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""

echo "4️⃣  Set up GitHub Secrets:"
echo "   - Go to your GitHub repository"
echo "   - Settings → Secrets and variables → Actions"
echo "   - Add these secrets:"
echo "     * FTP_SERVER (your IONOS FTP server)"
echo "     * FTP_USERNAME (your IONOS FTP username)"
echo "     * FTP_PASSWORD (your IONOS FTP password)"
echo ""

echo "5️⃣  Configure IONOS:"
echo "   - Login to IONOS Control Panel"
echo "   - Go to Web Hosting → cliniq.info"
echo "   - Check if Git integration is available"
echo "   - If not, the GitHub Actions will handle deployment"
echo ""

echo "6️⃣  Test Deployment:"
echo "   - Make a small change to README.md"
echo "   - Commit and push:"
echo "     git add README.md"
echo "     git commit -m 'Test deployment'"
echo "     git push"
echo "   - Check https://cliniq.info for updates"
echo ""

echo "📚 For detailed instructions, see:"
echo "   - GIT_DEPLOYMENT_SETUP.md"
echo "   - IONOS_DEPLOYMENT_GUIDE.md"
echo ""

echo "🎯 Expected Result:"
echo "   - Push code to GitHub → Automatic deployment to cliniq.info"
echo "   - Site updates automatically when you push changes"
echo ""

echo "Need help? Check the documentation files or contact IONOS support."
