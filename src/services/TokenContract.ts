import { Contract } from 'starknet';

export const ERC20_ABI = [
  {
    members: [
      {
        name: "low",
        offset: 0,
        type: "felt"
      },
      {
        name: "high",
        offset: 1,
        type: "felt"
      }
    ],
    name: "Uint256",
    size: 2,
    type: "struct"
  },
  {
    inputs: [
      {
        name: "account",
        type: "felt"
      }
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "Uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        name: "decimals",
        type: "felt"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        name: "symbol",
        type: "felt"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
];

export class TokenContract {
  private contract: Contract;

  constructor(address: string, provider: any) {
    this.contract = new Contract(ERC20_ABI, address, provider);
  }

  async getBalance(account: string): Promise<string> {
    try {
      const { balance } = await this.contract.balanceOf(account);
      const decimals = await this.contract.decimals();
      return this.formatBalance(balance, decimals);
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  }

  async getSymbol(): Promise<string> {
    try {
      const symbol = await this.contract.symbol();
      return symbol.toString();
    } catch (error) {
      console.error('Error getting symbol:', error);
      return '';
    }
  }

  private formatBalance(balance: { low: number; high: number }, decimals: number): string {
    const value = balance.low + (balance.high << 31);
    return (value / Math.pow(10, decimals)).toString();
  }
}
