import { Module } from '@nestjs/common';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { AuthModule } from './modules/auth/auth.module';
import { AsyncModule } from './modules/async/async.module';
import { FornecedorModule } from './modules/fornecedor/fornecedor.module';
import { ProdutoModule } from './modules/produto/produto.module';
import { EmpresaModule } from './modules/empresa/empresa.module';
import { CondicoesPagamentoModule } from './modules/condicoes-pagamento/condicoes-pagamento.module';
import { CfopModule } from './modules/cfop/cfop.module';

@Module({
  imports: [UsuarioModule, AuthModule, AsyncModule, FornecedorModule, ProdutoModule, EmpresaModule, CondicoesPagamentoModule, CfopModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
