import { Provider } from 'starknet';
import { useState, useEffect } from 'react';

const defaultProvider = new Provider({
  sequencer: {
    network: 'mainnet-alpha',
  },
});

export const useProvider = () => {
  const [provider, setProvider] = useState<Provider>(defaultProvider);

  useEffect(() => {
    // You can add custom provider initialization logic here
    // For example, switching networks based on user preferences
  }, []);

  return provider;
};
