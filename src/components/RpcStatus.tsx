import { useState, useEffect } from 'react';

const RPC_URL = 'https://36c4832f2e9b.ngrok-free.app';

const RpcStatus = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [blockNumber, setBlockNumber] = useState<number | null>(null);

  useEffect(() => {
    const checkRpcStatus = async () => {
      try {
        const response = await fetch(RPC_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'starknet_blockNumber',
            params: [],
            id: 1,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.result) {
            setIsOnline(true);
            setBlockNumber(data.result);
          } else {
            setIsOnline(false);
          }
        } else {
          setIsOnline(false);
        }
      } catch (error) {
        console.error('Error checking RPC status:', error);
        setIsOnline(false);
      }
    };

    checkRpcStatus();
    const interval = setInterval(checkRpcStatus, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 border rounded-lg shadow-md bg-gray-800 text-white">
      <h3 className="text-lg font-semibold mb-2">RPC Status</h3>
      <div className="flex items-center">
        <div className={`w-4 h-4 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span>{isOnline ? 'Online' : 'Offline'}</span>
      </div>
      {isOnline && blockNumber && (
        <div className="mt-4">
          <p className="text-sm">Block Number: {blockNumber}</p>
          <div className="w-full h-8 bg-gray-700 rounded-md mt-2 overflow-hidden">
            <div
              className="h-full bg-green-500"
              style={{ width: `${(blockNumber % 100)}%`, transition: 'width 0.5s ease-in-out' }}
            ></div>
          </div>
        </div>
      )}
      {!isOnline && (
        <div className="mt-4">
          <div className="w-full h-8 bg-gray-700 rounded-md mt-2 flex items-center justify-center">
            <p className="text-gray-400 text-sm">Offline</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RpcStatus;
