#!/bin/bash

echo "🔍 Testing Server Connection..."
echo ""

# Check if server is running
if curl -s http://localhost:5000/api/web3/status > /dev/null 2>&1; then
    echo "✅ Server is running on port 5000"
    echo ""
    
    # Test /api/web3/status endpoint
    echo "📡 Testing /api/web3/status endpoint:"
    curl -s http://localhost:5000/api/web3/status | jq '.' 2>/dev/null || curl -s http://localhost:5000/api/web3/status
    echo ""
    echo ""
    
    # Test /api/web3/connect endpoint
    echo "📡 Testing /api/web3/connect endpoint (should return 400 without data):"
    curl -s -X POST http://localhost:5000/api/web3/connect \
      -H "Content-Type: application/json" \
      -d '{}' | jq '.' 2>/dev/null || curl -s -X POST http://localhost:5000/api/web3/connect -H "Content-Type: application/json" -d '{}'
    echo ""
    echo ""
    
else
    echo "❌ Server is NOT running on port 5000"
    echo ""
    echo "Please start the server with:"
    echo "  npm run dev"
    echo ""
    exit 1
fi

echo "✅ All tests completed!"
