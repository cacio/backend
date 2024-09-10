import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/datrabase/PrismaService';
import * as moment from 'moment';
import { FornecedorService } from '../fornecedor/fornecedor.service';
import { ProdutoService } from '../produto/produto.service';

@Injectable()
export class AsyncService {
    constructor(
            private prisma: PrismaService,
            private readonly fornecedor:FornecedorService,
            private readonly produto:ProdutoService
        ) { }

    async AsyncPull(lastPulledVersion: string,cnpj: string) {


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
            //updated,
            updated: [],
            deleted: [],
        }

       const ProdutoCreated = await this.produto.ListaProdutoCriado(dataFormatted,cnpj);
        const produtos ={
            created: ProdutoCreated,
            updated: [],
            deleted: [],
        }
        return {
            latestVersion: new Date().getTime(),
            changes:{
                fornecedor,
                produtos
            }
        }


    }
}
