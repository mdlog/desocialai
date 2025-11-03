#!/bin/bash

echo "=== Testing Session Cookie Flow ==="
echo ""

echo "1. Testing /api/web3/connect..."
RESPONSE=$(curl -X POST http://localhost:5000/api/web3/connect \
  -H "Content-Type: application/json" \
  -d '{"address":"0x3e4d881819768fab30c5a79F3A9A7e69f0a935a4","chainId":16661,"network":"0G Mainnet"}' \
  -c cookies.txt \
  -v 2>&1)

echo "$RESPONSE" | grep -i "set-cookie"
echo ""

echo "2. Checking cookies.txt..."
if [ -f cookies.txt ]; then
  cat cookies.txt
  echo ""
else
  echo "❌ cookies.txt not created!"
  echo ""
fi

echo "3. Testing /api/users/me with cookie..."
curl http://localhost:5000/api/users/me \
  -b cookies.txt \
  -v 2>&1 | grep -A 5 "< HTTP"

echo ""
echo "4. Testing /api/web3/wallet with cookie..."
curl http://localhost:5000/api/web3/wallet \
  -b cookies.txt \
  -v 2>&1 | grep -A 5 "< HTTP"

# Cleanup
rm -f cookies.txt
