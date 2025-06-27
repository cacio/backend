import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/datrabase/PrismaService';
import * as moment from 'moment';
import { FornecedorService } from '../fornecedor/fornecedor.service';
import { ProdutoService } from '../produto/produto.service';
import { CondicoesPagamentoService } from '../condicoes-pagamento/condicoes-pagamento.service';
import { CfopService } from '../cfop/cfop.service';
import { ManifestoService } from '../manifesto/manifesto.service';
@Injectable()
export class AsyncService {
    constructor(
            private prisma: PrismaService,
            private readonly fornecedor:FornecedorService,
            private readonly produto:ProdutoService,
            private readonly condicoesPagamento: CondicoesPagamentoService,
            private readonly cfop: CfopService,
            private readonly ManifestoService: ManifestoService,
        ) { }

    async AsyncPull(lastPulledVersion: string,cnpj: string,codrepre:string) {

        console.log(codrepre);
        let dataFormatted: Date;

        if (lastPulledVersion !== '0') {

            const datalastpull = new Date(Number(lastPulledVersion));
            if (isNaN(datalastpull.getTime())) {
                throw new Error('Invalid lastPulledVersion timestamp');
            }
            dataFormatted = datalastpull;
            console.log(dataFormatted);
        } else {
            dataFormatted = new Date(0); // Epoch time for initial load
        }



        const created = await this.fornecedor.ListaFornecedoresCriados(dataFormatted,cnpj);
        const updated = await this.fornecedor.ListaFornecedorAlterado(dataFormatted,cnpj);
        const fornecedor = {
            created,
            updated,
            deleted: [],
        }

       const ProdutoCreated = await this.produto.ListaProdutoCriado(dataFormatted,cnpj);
       const ProdutoUpdated = await this.produto.ListaProdutoAlterado(dataFormatted,cnpj);
       const produtos ={
            created: ProdutoCreated,
            updated: ProdutoUpdated,
            deleted: [],
        }

        const condicoesPagamentoCreated = await this.condicoesPagamento.ListaCondicoesPagamentoCriado(dataFormatted,cnpj);
        const condicoesPagamentoUpdated = await this.condicoesPagamento.ListaCondicoesPagamentoAlterado(dataFormatted,cnpj);
        const condicoespagamento = {
            created: condicoesPagamentoCreated,
            updated: condicoesPagamentoUpdated,
            deleted: [],
        }

        const cfopCreated = await this.cfop.ListaCfopCriados(dataFormatted,cnpj);
        const cfopUpdated = await this.cfop.ListaCfopAlterados(dataFormatted,cnpj);
        const cfop_natura = {
            created: cfopCreated,
            updated: cfopUpdated,
            deleted: [],
        }

        const manifestoCreated = await this.ManifestoService.ListaManifestoCriado(dataFormatted,cnpj,codrepre);
        const tb_manifestos = {
            created: manifestoCreated,
            updated: [],
            deleted: [],
        }

        return {
            latestVersion: new Date().getTime(),
            changes:{
                fornecedor,
                produtos,
                condicoespagamento,
                cfop_natura,
                tb_manifestos,
            }
        }


    }
}
