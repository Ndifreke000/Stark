import https from 'https';
import { URL } from 'url';

const RPC_ENDPOINT = 'https://36c4832f2e9b.ngrok-free.app';

async function testRpcMethod(method, params = []) {
  console.log(`\n🔍 Testing: ${method}`);
  console.log('─'.repeat(40));
  
  const requestPayload = {
    jsonrpc: '2.0',
    method: method,
    params: params,
    id: 1
  };

  console.log('📤 Request:', JSON.stringify(requestPayload));

  try {
    const data = JSON.stringify(requestPayload);
    const url = new URL(RPC_ENDPOINT);
    
    const response = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
        },
        timeout: 5000
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body }));
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Timeout')));
      req.write(data);
      req.end();
    });

    const result = JSON.parse(response.body);
    console.log('📥 Response:', JSON.stringify(result));
    
    if (result.result) {
      console.log('✅ Success');
    } else if (result.error) {
      console.log('❌ Error:', result.error.message);
    }

  } catch (error) {
    console.log('❌ Failed:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Testing RPC Server:', RPC_ENDPOINT);
  console.log('='.repeat(50));
  
  await testRpcMethod('starknet_blockNumber');
  await testRpcMethod('starknet_chainId');
  await testRpcMethod('starknet_syncing');
  
  console.log('\n🎯 All tests completed!');
}

runAllTests();
