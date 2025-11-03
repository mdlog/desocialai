// Quick test script to verify session is working
// Run: node test-session.js

const fetch = require('node-fetch');

async function testSession() {
  const baseUrl = 'http://localhost:5000';
  const cookieJar = {};
  
  console.log('🧪 Testing session persistence...\n');
  
  // Step 1: Connect wallet
  console.log('1️⃣ Connecting wallet...');
  const connectResponse = await fetch(`${baseUrl}/api/web3/connect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      address: '0x742d35Cc1234567890123456789012345678901234',
      chainId: 16661,
      network: '0G Mainnet'
    })
  });
  
  const connectData = await connectResponse.json();
  console.log('Connect response:', connectData);
  
  // Extract cookie from response
  const setCookie = connectResponse.headers.get('set-cookie');
  console.log('Set-Cookie header:', setCookie);
  
  if (setCookie) {
    const cookieMatch = setCookie.match(/connect\.sid=([^;]+)/);
    if (cookieMatch) {
      cookieJar['connect.sid'] = cookieMatch[1];
      console.log('✅ Cookie extracted:', cookieJar['connect.sid'].substring(0, 20) + '...');
    }
  }
  
  // Step 2: Try to get user with cookie
  console.log('\n2️⃣ Getting user profile with cookie...');
  const cookieHeader = Object.entries(cookieJar).map(([k, v]) => `${k}=${v}`).join('; ');
  
  const userResponse = await fetch(`${baseUrl}/api/users/me`, {
    headers: {
      'Cookie': cookieHeader
    }
  });
  
  console.log('User response status:', userResponse.status);
  const userData = await userResponse.json();
  console.log('User response:', userData);
  
  // Step 3: Check wallet status
  console.log('\n3️⃣ Checking wallet status...');
  const walletResponse = await fetch(`${baseUrl}/api/web3/wallet`, {
    headers: {
      'Cookie': cookieHeader
    }
  });
  
  console.log('Wallet response status:', walletResponse.status);
  const walletData = await walletResponse.json();
  console.log('Wallet response:', walletData);
}

testSession().catch(console.error);

