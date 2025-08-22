import https from 'https';
import { URL } from 'url';

const rpcUrl = 'https://33b60227a006.ngrok-free.app';
const parsedUrl = new URL(rpcUrl);

const data = JSON.stringify({
  jsonrpc: '2.0',
  method: 'starknet_blockNumber',
  params: [],
  id: 1,
});

const options = {
  hostname: parsedUrl.hostname,
  port: parsedUrl.port || 443,
  path: parsedUrl.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
  },
};

const req = https.request(options, (res) => {
  let responseBody = '';
  console.log('Status Code:', res.statusCode);

  res.on('data', (chunk) => {
    responseBody += chunk;
  });

  res.on('end', () => {
    try {
      const jsonResponse = JSON.parse(responseBody);
      console.log('Response:', jsonResponse);
    } catch (error) {
      console.error('Failed to parse JSON response:', responseBody);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.write(data);
req.end();
