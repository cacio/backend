import { Module } from '@nestjs/common';
import { AsyncService } from './async.service';
import { AsyncController } from './async.controller';
import { FornecedorService } from '../fornecedor/fornecedor.service';
import { ProdutoService } from '../produto/produto.service';
import { CondicoesPagamentoService } from '../condicoes-pagamento/condicoes-pagamento.service';
import { CfopService } from '../cfop/cfop.service';
import { ManifestoService } from '../manifesto/manifesto.service';
import { NfeService } from '../nfe/nfe.service';
import { NfeprodutosService } from '../nfeprodutos/nfeprodutos.service';
import { DuplicatasService } from '../duplicatas/duplicatas.service';
import { NfeeventosService } from '../nfeeventos/nfeeventos.service';
import { ManifestoFtpService } from '../manifesto-ftp/manifesto-ftp.service';
@Module({
  controllers: [AsyncController],
  providers: [AsyncService,FornecedorService,ProdutoService,CondicoesPagamentoService,CfopService,ManifestoService,NfeService,NfeprodutosService,DuplicatasService,NfeeventosService,ManifestoFtpService],
})
export class AsyncModule {}
