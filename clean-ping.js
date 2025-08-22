import https from 'https';
import { URL } from 'url';

const RPC_ENDPOINT = 'https://36c4832f2e9b.ngrok-free.app';

// Simple clean output showing request and response
const requestPayload = {
  jsonrpc: '2.0',
  method: 'starknet_blockNumber',
  params: [],
  id: 1
};

console.log('📤 REQUEST:');
console.log(JSON.stringify(requestPayload, null, 2));

const data = JSON.stringify(requestPayload);
const url = new URL(RPC_ENDPOINT);

const req = https.request({
  hostname: url.hostname,
  port: url.port || 443,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
  }
}, (res) => {
  let responseBody = '';
  res.on('data', chunk => responseBody += chunk);
  res.on('end', () => {
    console.log('\n📥 RESPONSE:');
    console.log(JSON.stringify(JSON.parse(responseBody), null, 2));
  });
});

req.on('error', (error) => {
  console.log('❌ Error:', error.message);
});

req.write(data);
req.end();
