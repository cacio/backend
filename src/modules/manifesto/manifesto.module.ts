import { Module } from '@nestjs/common';
import { ManifestoService } from './manifesto.service';
import { ManifestoController } from './manifesto.controller';
import { PrismaService } from 'src/datrabase/PrismaService';
@Module({
  controllers: [ManifestoController],
  providers: [ManifestoService, PrismaService],
})
export class ManifestoModule {}
