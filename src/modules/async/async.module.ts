import { Module } from '@nestjs/common';
import { AsyncService } from './async.service';
import { AsyncController } from './async.controller';
import { PrismaService } from 'src/datrabase/PrismaService';
import { FornecedorService } from '../fornecedor/fornecedor.service';
import { ProdutoService } from '../produto/produto.service';
import { CondicoesPagamentoService } from '../condicoes-pagamento/condicoes-pagamento.service';
import { CfopService } from '../cfop/cfop.service';
@Module({
  controllers: [AsyncController],
  providers: [AsyncService,PrismaService,FornecedorService,ProdutoService,CondicoesPagamentoService,CfopService],
})
export class AsyncModule {}
