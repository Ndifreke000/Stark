import { Controller, Get, Param } from '@nestjs/common';
import { StarknetService } from './starknet.service';

@Controller('starknet')
export class StarknetController {
  constructor(private readonly starknetService: StarknetService) {}

  @Get('contract/:address')
  async getContractData(@Param('address') address: string) {
    return this.starknetService.getContractData(address);
  }
}
