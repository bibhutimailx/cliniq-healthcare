#!/bin/bash
# Google STT Proxy Setup Script for VPS
# Copy and paste this entire script into your VPS terminal

echo "🚀 Setting up Google STT Proxy on VPS..."

# Step 1: Install PM2
echo "📦 Installing PM2..."
npm install -g pm2

# Step 2: Verify PM2 installation
echo "✅ Checking PM2 version..."
pm2 --version

# Step 3: Navigate to project directory
echo "📁 Navigating to project directory..."
cd ~/cliniq-healthcare

# Step 4: Start the proxy with PM2
echo "🎤 Starting Google STT Proxy..."
GOOGLE_APPLICATION_CREDENTIALS=/etc/cliniq/gcp-s2t.json pm2 start server/google-stt-proxy.cjs --name google-stt-proxy --update-env

# Step 5: Check PM2 status
echo "📊 Checking PM2 status..."
pm2 status

# Step 6: Test the proxy
echo "🧪 Testing proxy connection..."
sleep 2
curl http://localhost:3001

# Step 7: Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save

# Step 8: Enable PM2 auto-start
echo "🔄 Enabling PM2 auto-start..."
pm2 startup

echo ""
echo "✅ Setup complete! Your Google STT Proxy should be running."
echo "If you see 'Google STT proxy running' above, the setup was successful."
echo ""
echo "Next steps:"
echo "1. Configure Nginx to expose WebSocket at wss://cliniq.org.in/stt"
echo "2. Test the complete setup from your application"
