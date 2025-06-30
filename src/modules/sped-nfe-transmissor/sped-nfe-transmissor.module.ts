import { Module } from '@nestjs/common';
import { SpedNfeTransmissorService } from './sped-nfe-transmissor.service';
import { SpedNfeTransmissorController } from './sped-nfe-transmissor.controller';
import { PrismaService } from 'src/datrabase/PrismaService';
@Module({
  controllers: [SpedNfeTransmissorController],
  providers: [SpedNfeTransmissorService,PrismaService],
})
export class SpedNfeTransmissorModule {}
