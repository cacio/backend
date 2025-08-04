import { Module } from '@nestjs/common';
import { AsyncService } from './async.service';
import { AsyncController } from './async.controller';
import { FornecedorService } from '../fornecedor/fornecedor.service';
import { ProdutoService } from '../produto/produto.service';
import { CondicoesPagamentoService } from '../condicoes-pagamento/condicoes-pagamento.service';
import { CfopService } from '../cfop/cfop.service';
import { ManifestoService } from '../manifesto/manifesto.service';
@Module({
  controllers: [AsyncController],
  providers: [AsyncService,FornecedorService,ProdutoService,CondicoesPagamentoService,CfopService,ManifestoService],
})
export class AsyncModule {}
