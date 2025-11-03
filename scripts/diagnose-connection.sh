#!/bin/bash

echo "🔍 DeSocialAI Connection Diagnostics"
echo "===================================="
echo ""

# 1. Check if server is running
echo "1️⃣ Checking if server is running..."
if curl -s http://localhost:5000/api/web3/status > /dev/null 2>&1; then
    echo "   ✅ Server is running on port 5000"
else
    echo "   ❌ Server is NOT running"
    echo "   💡 Start server with: npm run dev"
    exit 1
fi
echo ""

# 2. Check database connection
echo "2️⃣ Checking database connection..."
if PGPASSWORD=desocialai_secure_2024 psql -h localhost -U desocialai_user -d desocialai -c "SELECT 1;" > /dev/null 2>&1; then
    echo "   ✅ Database connection OK"
else
    echo "   ❌ Cannot connect to database"
    echo "   💡 Check if PostgreSQL is running: sudo systemctl status postgresql"
    exit 1
fi
echo ""

# 3. Check if tables exist
echo "3️⃣ Checking database tables..."
TABLE_COUNT=$(PGPASSWORD=desocialai_secure_2024 psql -h localhost -U desocialai_user -d desocialai -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
if [ "$TABLE_COUNT" -gt 0 ]; then
    echo "   ✅ Found $TABLE_COUNT tables in database"
else
    echo "   ❌ No tables found in database"
    echo "   💡 Run: npm run db:push"
    exit 1
fi
echo ""

# 4. Test /api/web3/status endpoint
echo "4️⃣ Testing /api/web3/status endpoint..."
STATUS_RESPONSE=$(curl -s http://localhost:5000/api/web3/status)
if echo "$STATUS_RESPONSE" | grep -q "network"; then
    echo "   ✅ Endpoint working"
    echo "   Response: $STATUS_RESPONSE"
else
    echo "   ❌ Endpoint not working properly"
    echo "   Response: $STATUS_RESPONSE"
fi
echo ""

# 5. Test /api/web3/connect endpoint (should return error without data)
echo "5️⃣ Testing /api/web3/connect endpoint..."
CONNECT_RESPONSE=$(curl -s -X POST http://localhost:5000/api/web3/connect \
  -H "Content-Type: application/json" \
  -d '{"address":"0x1234567890123456789012345678901234567890","chainId":16661,"network":"0G Mainnet"}')

if echo "$CONNECT_RESPONSE" | grep -q "success"; then
    echo "   ✅ Endpoint working"
    echo "   Response: $CONNECT_RESPONSE"
else
    echo "   ⚠️  Endpoint returned error (expected for test)"
    echo "   Response: $CONNECT_RESPONSE"
fi
echo ""

# 6. Check session configuration
echo "6️⃣ Checking session configuration..."
if grep -q "SESSION_SECRET" .env; then
    echo "   ✅ SESSION_SECRET found in .env"
else
    echo "   ❌ SESSION_SECRET not found in .env"
    echo "   💡 Add SESSION_SECRET to .env file"
fi
echo ""

# 7. Check CORS headers
echo "7️⃣ Checking CORS headers..."
CORS_HEADERS=$(curl -s -I http://localhost:5000/api/web3/status | grep -i "access-control")
if [ -n "$CORS_HEADERS" ]; then
    echo "   ✅ CORS headers present"
    echo "$CORS_HEADERS" | sed 's/^/   /'
else
    echo "   ⚠️  No CORS headers found"
fi
echo ""

echo "===================================="
echo "✅ Diagnostics completed!"
echo ""
echo "💡 If you're still having issues:"
echo "   1. Check browser console for detailed errors"
echo "   2. Make sure you're accessing http://localhost:5000"
echo "   3. Try clearing browser cache and cookies"
echo "   4. Check if any firewall is blocking connections"
