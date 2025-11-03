#!/bin/bash

# DeSocialAI Tunnel Setup Script
# This script helps configure the app for tunnel usage

echo "🚀 DeSocialAI Tunnel Setup"
echo "=========================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
fi

# Ask for tunnel domain
echo ""
read -p "Enter your tunnel domain (e.g., desocialai.live): " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo "❌ Domain is required!"
    exit 1
fi

# Add https:// if not present
if [[ ! $DOMAIN =~ ^https?:// ]]; then
    DOMAIN="https://$DOMAIN"
fi

echo ""
echo "📝 Updating .env configuration..."

# Update or add USE_HTTPS
if grep -q "^USE_HTTPS=" .env; then
    sed -i.bak "s|^USE_HTTPS=.*|USE_HTTPS=true|" .env
else
    echo "USE_HTTPS=true" >> .env
fi

# Update or add ALLOWED_ORIGIN
if grep -q "^ALLOWED_ORIGIN=" .env; then
    sed -i.bak "s|^ALLOWED_ORIGIN=.*|ALLOWED_ORIGIN=$DOMAIN|" .env
else
    echo "ALLOWED_ORIGIN=$DOMAIN" >> .env
fi

# Check SESSION_SECRET
if ! grep -q "^SESSION_SECRET=" .env || grep -q "^SESSION_SECRET=$" .env; then
    echo ""
    echo "⚠️  SESSION_SECRET not set or empty!"
    echo "Generating random SESSION_SECRET..."
    
    # Generate random secret
    if command -v openssl &> /dev/null; then
        SECRET=$(openssl rand -base64 64 | tr -d '\n')
        if grep -q "^SESSION_SECRET=" .env; then
            sed -i.bak "s|^SESSION_SECRET=.*|SESSION_SECRET=$SECRET|" .env
        else
            echo "SESSION_SECRET=$SECRET" >> .env
        fi
        echo "✅ Generated SESSION_SECRET"
    else
        echo "⚠️  openssl not found. Please set SESSION_SECRET manually in .env"
    fi
fi

# Clean up backup files
rm -f .env.bak

echo ""
echo "✅ Configuration updated!"
echo ""
echo "📋 Current tunnel configuration:"
echo "   Domain: $DOMAIN"
echo "   HTTPS: enabled"
echo ""
echo "🔧 Next steps:"
echo ""
echo "1. Start your development server:"
echo "   npm run dev"
echo ""
echo "2. Start your tunnel (choose one):"
echo ""
echo "   Cloudflare Tunnel:"
echo "   cloudflared tunnel --url http://localhost:5000"
echo ""
echo "   Ngrok:"
echo "   ngrok http 5000"
echo ""
echo "   LocalTunnel:"
echo "   lt --port 5000"
echo ""
echo "3. Access your app at: $DOMAIN"
echo ""
echo "📚 For more details, see TUNNEL-SETUP.md"
echo ""
