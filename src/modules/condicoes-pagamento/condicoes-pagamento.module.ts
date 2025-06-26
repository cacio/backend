import { Module } from '@nestjs/common';
import { CondicoesPagamentoService } from './condicoes-pagamento.service';
import { CondicoesPagamentoController } from './condicoes-pagamento.controller';
import { PrismaService } from 'src/datrabase/PrismaService';

@Module({
  controllers: [CondicoesPagamentoController],
  providers: [CondicoesPagamentoService, PrismaService],
})
export class CondicoesPagamentoModule {}
