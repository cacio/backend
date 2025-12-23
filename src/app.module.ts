import { Module } from '@nestjs/common';
import { DatabaseModule } from './datrabase/database.module';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { AuthModule } from './modules/auth/auth.module';
import { AsyncModule } from './modules/async/async.module';
import { FornecedorModule } from './modules/fornecedor/fornecedor.module';
import { ProdutoModule } from './modules/produto/produto.module';
import { EmpresaModule } from './modules/empresa/empresa.module';
import { CondicoesPagamentoModule } from './modules/condicoes-pagamento/condicoes-pagamento.module';
import { CfopModule } from './modules/cfop/cfop.module';
import { ManifestoModule } from './modules/manifesto/manifesto.module';
import { SpedNfeTransmissorModule } from './modules/sped-nfe-transmissor/sped-nfe-transmissor.module';
import { ConfiguracaoModule } from './modules/configuracao/configuracao.module';
import { ConfiguracaoUsuarioModule } from './modules/configuracao-usuario/configuracao-usuario.module';
import { MailModule } from './modules/mail/mail.module';
import { NfeModule } from './modules/nfe/nfe.module';
import { NfeprodutosModule } from './modules/nfeprodutos/nfeprodutos.module';
import { DuplicatasModule } from './modules/duplicatas/duplicatas.module';
import { NfeeventosModule } from './modules/nfeeventos/nfeeventos.module';
import { RelatorioNfeModule } from './modules/relatorio-nfe/relatorio-nfe.module';
import { ConfiguracaoNfeModule } from './modules/configuracao-nfe/configuracao-nfe.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ManifestoFtpModule } from './modules/manifesto-ftp/manifesto-ftp.module';

@Module({
  imports: [DatabaseModule,UsuarioModule, AuthModule, AsyncModule, FornecedorModule, ProdutoModule, EmpresaModule, CondicoesPagamentoModule, CfopModule, ManifestoModule, SpedNfeTransmissorModule, ConfiguracaoModule, ConfiguracaoUsuarioModule, MailModule, NfeModule, NfeprodutosModule, DuplicatasModule, NfeeventosModule, RelatorioNfeModule, ConfiguracaoNfeModule, DashboardModule, ManifestoFtpModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
