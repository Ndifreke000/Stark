import { Injectable } from '@nestjs/common';
import { RpcProvider, Contract } from 'starknet';

@Injectable()
export class StarknetService {
  private readonly provider: RpcProvider;

  constructor() {
    this.provider = new RpcProvider({
      nodeUrl: 'https://e8eeb24f808b.ngrok-free.app',
    });
  }

  async getContractData(address: string) {
    try {
      const { abi: abi } = await this.provider.getClassAt(address);
      if (abi === undefined) {
        throw new Error('ABI not found');
      }
      const contract = new Contract(abi, address, this.provider);
      const events = await contract.getEvents();
      return {
        address,
        eventCount: events.length,
        firstEvent: events.length > 0 ? events[0] : null,
        lastEvent: events.length > 0 ? events[events.length - 1] : null,
        events,
      };
    } catch (error) {
      console.error('Error fetching contract data:', error);
      throw new Error('Failed to fetch contract data');
    }
  }
}
