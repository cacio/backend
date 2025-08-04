import { Module } from '@nestjs/common';
import { SpedNfeTransmissorService } from './sped-nfe-transmissor.service';
import { SpedNfeTransmissorController } from './sped-nfe-transmissor.controller';

@Module({
  controllers: [SpedNfeTransmissorController],
  providers: [SpedNfeTransmissorService],
})
export class SpedNfeTransmissorModule {}
