import { Module } from '@nestjs/common';
import { AsyncService } from './async.service';
import { AsyncController } from './async.controller';
import { PrismaService } from 'src/datrabase/PrismaService';
import { FornecedorService } from '../fornecedor/fornecedor.service';
import { ProdutoService } from '../produto/produto.service';
@Module({
  controllers: [AsyncController],
  providers: [AsyncService,PrismaService,FornecedorService,ProdutoService],
})
export class AsyncModule {}
