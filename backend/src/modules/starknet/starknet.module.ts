import { Module } from '@nestjs/common';
import { StarknetController } from './starknet.controller';
import { StarknetService } from './starknet.service';

@Module({
  controllers: [StarknetController],
  providers: [StarknetService],
})
export class StarknetModule {}
