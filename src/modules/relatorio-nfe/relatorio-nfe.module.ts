import { Module } from '@nestjs/common';
import { RelatorioNfeService } from './relatorio-nfe.service';
import { RelatorioNfeController } from './relatorio-nfe.controller';

@Module({
  controllers: [RelatorioNfeController],
  providers: [RelatorioNfeService],
})
export class RelatorioNfeModule {}
