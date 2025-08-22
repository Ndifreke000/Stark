import https from 'https';
import { URL } from 'url';

// RPC endpoint from your existing test file
const RPC_ENDPOINT = 'https://36c4832f2e9b.ngrok-free.app';

// Simple ping test with clear payload display
async function pingRpcServer() {
  console.log('🔍 Pinging RPC Server...');
  console.log('📡 Endpoint:', RPC_ENDPOINT);
  console.log('─'.repeat(50));

  // Create the JSON-RPC request payload
  const requestPayload = {
    jsonrpc: '2.0',
    method: 'starknet_blockNumber',
    params: [],
    id: 1
  };

  console.log('📤 REQUEST PAYLOAD:');
  console.log(JSON.stringify(requestPayload, null, 2));
  console.log('─'.repeat(50));

  const data = JSON.stringify(requestPayload);
  const url = new URL(RPC_ENDPOINT);

  const options = {
    hostname: url.hostname,
    port: url.port || 443,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    },
    timeout: 10000 // 10 second timeout
  };

  console.log('⏳ Sending request...');

  const req = https.request(options, (res) => {
    let responseBody = '';
    
    console.log('📥 RESPONSE STATUS:', res.statusCode);
    console.log('📥 RESPONSE HEADERS:', res.headers);

    res.on('data', (chunk) => {
      responseBody += chunk;
    });

    res.on('end', () => {
      console.log('─'.repeat(50));
      console.log('📥 RESPONSE PAYLOAD:');
      
      try {
        const jsonResponse = JSON.parse(responseBody);
        console.log(JSON.stringify(jsonResponse, null, 2));
        
        if (jsonResponse.result) {
          console.log('✅ SUCCESS: RPC server is responding!');
          console.log('📊 Block Number:', jsonResponse.result);
        } else if (jsonResponse.error) {
          console.log('❌ ERROR:', jsonResponse.error.message);
        }
      } catch (error) {
        console.log('❌ Failed to parse JSON response:');
        console.log('Raw response:', responseBody);
      }
      
      console.log('─'.repeat(50));
    });
  });

  req.on('error', (error) => {
    console.log('❌ REQUEST ERROR:', error.message);
    console.log('💡 Check if the RPC server is running and accessible');
  });

  req.on('timeout', () => {
    console.log('❌ REQUEST TIMEOUT: Server did not respond within 10 seconds');
    req.destroy();
  });

  req.write(data);
  req.end();
}

// Run the ping test
pingRpcServer().catch(console.error);
