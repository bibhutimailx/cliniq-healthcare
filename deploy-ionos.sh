#!/bin/bash

echo "🚀 ClinIQ IONOS Deployment Script"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project for production..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed. dist folder not found."
    exit 1
fi

# Create deployment package
echo "📦 Creating deployment package..."
cd dist
zip -r ../cliniq-deploy.zip .

echo ""
echo "✅ Deployment package created: cliniq-deploy.zip"
echo ""
echo "📋 Next Steps:"
echo "1. Login to IONOS Control Panel"
echo "2. Go to File Manager for cliniq.info"
echo "3. Navigate to public_html folder"
echo "4. Delete all existing files"
echo "5. Upload cliniq-deploy.zip and extract it"
echo "6. Ensure index.html is in the root of public_html"
echo ""
echo "🔗 Your site will be available at: https://cliniq.info"
echo ""
echo "📞 Need help? Check IONOS_DEPLOYMENT_GUIDE.md for detailed instructions."
