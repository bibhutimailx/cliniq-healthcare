#!/bin/bash
# Deploy updated code to VPS
echo "🚀 Deploying ClinIQ to VPS with Google STT Proxy fix..."

# Copy files to VPS
echo "📦 Copying build files to VPS..."
scp -r dist/* root@77.37.44.205:/var/www/html/

# Set permissions on VPS
echo "🔧 Setting file permissions..."
ssh root@77.37.44.205 "chown -R www-data:www-data /var/www/html/ && chmod -R 755 /var/www/html/"

# Check status
echo "✅ Checking deployment status..."
ssh root@77.37.44.205 "ls -la /var/www/html/ && curl -s -I https://cliniq.org.in/"

echo ""
echo "🎉 Deployment complete!"
echo "🌐 Website: https://cliniq.org.in"
echo "🎤 Speech Endpoint: wss://cliniq.org.in/stt"
echo ""
echo "Now test the Google STT Proxy option in the speech provider dropdown!"
