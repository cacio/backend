import { Module } from '@nestjs/common';
import { NfeService } from './nfe.service';
import { NfeController } from './nfe.controller';

@Module({
  controllers: [NfeController],
  providers: [NfeService],
})
export class NfeModule {}
