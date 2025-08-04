import { Module } from '@nestjs/common';
import { CondicoesPagamentoService } from './condicoes-pagamento.service';
import { CondicoesPagamentoController } from './condicoes-pagamento.controller';

@Module({
  controllers: [CondicoesPagamentoController],
  providers: [CondicoesPagamentoService],
})
export class CondicoesPagamentoModule {}
