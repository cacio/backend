import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/datrabase/PrismaService';
import * as moment from 'moment-timezone';
import { FornecedorService } from '../fornecedor/fornecedor.service';
import { ProdutoService } from '../produto/produto.service';
import { CondicoesPagamentoService } from '../condicoes-pagamento/condicoes-pagamento.service';
import { CfopService } from '../cfop/cfop.service';
import { ManifestoService } from '../manifesto/manifesto.service';
import {
    AsyncPushDto,
    ChangesDto,
    DuplicataDto,
    NfeDto,
    NfeEventoDto,
    NfeProdutoDto,
    removeFields,
    stripSyncFields,
    UserDto,
} from './DTO/async-push.dto';

@Injectable()
export class AsyncService {
    constructor(
        private prisma: PrismaService,
        private readonly fornecedor: FornecedorService,
        private readonly produto: ProdutoService,
        private readonly condicoesPagamento: CondicoesPagamentoService,
        private readonly cfop: CfopService,
        private readonly ManifestoService: ManifestoService,
    ) { }

    async AsyncPull(lastPulledVersion: string, cnpj: string, codrepre: string) {
        let dataFormatted: Date;

        if (lastPulledVersion !== '0') {
            const datalastpull = new Date(Number(lastPulledVersion));
            if (isNaN(datalastpull.getTime())) {
                throw new Error('Invalid lastPulledVersion timestamp');
            }
            dataFormatted = datalastpull;
        } else {
            dataFormatted = new Date(0);
        }

        const fornecedor = {
            created: await this.fornecedor.ListaFornecedoresCriados(dataFormatted, cnpj),
            updated: await this.fornecedor.ListaFornecedorAlterado(dataFormatted, cnpj),
            deleted: [],
        };

        const produtos = {
            created: await this.produto.ListaProdutoCriado(dataFormatted, cnpj),
            updated: await this.produto.ListaProdutoAlterado(dataFormatted, cnpj),
            deleted: [],
        };

        const condicoespagamento = {
            created: await this.condicoesPagamento.ListaCondicoesPagamentoCriado(dataFormatted, cnpj),
            updated: await this.condicoesPagamento.ListaCondicoesPagamentoAlterado(dataFormatted, cnpj),
            deleted: [],
        };

        const cfop_natura = {
            created: await this.cfop.ListaCfopCriados(dataFormatted, cnpj),
            updated: await this.cfop.ListaCfopAlterados(dataFormatted, cnpj),
            deleted: [],
        };

        const tb_manifestos = {
            created: await this.ManifestoService.ListaManifestoCriado(dataFormatted, cnpj, codrepre),
            updated: [],
            deleted: [],
        };

        return {
            latestVersion: Date.now(),
            changes: {
                fornecedor,
                produtos,
                condicoespagamento,
                cfop_natura,
                tb_manifestos,
            },
        };
    }

    async processChanges<T>(
        model: any, // Prisma delegate (tx.nfe, tx.tab_duplicata, etc)
        changes: ChangesDto<T>,
        uniqueKey: keyof T,
        fixTypesFn?: (item: Omit<T, '_status' | '_changed'>) => Promise<any> | any,
    ): Promise<void> {
        // Criar registros ou atualizar se já existir
        for (const item of changes.created || []) {
            let data = stripSyncFields(item);
            if (fixTypesFn) data = await fixTypesFn(data);

            const where = { [uniqueKey]: (item as any)[uniqueKey] };
            const exists = await model.findUnique({ where });

            if (exists) {
                await model.update({ where, data });
            } else {
                await model.create({ data });
            }
        }

        // Atualizar registros (update apenas se existir)
        for (const item of changes.updated || []) {
            let data = stripSyncFields(item);
            if (fixTypesFn) data = await fixTypesFn(data);

            const where = { [uniqueKey]: (item as any)[uniqueKey] };
            const exists = await model.findUnique({ where });

            if (exists) {
                await model.update({ where, data });
            }
        }

        // Deletar registros
        for (const id of changes.deleted || []) {
            const where = { [uniqueKey]: id };
            const exists = await model.findUnique({ where });
            if (exists) {
                await model.delete({ where });
            }
        }
    }

    async AsyncPush(data: AsyncPushDto) {
        try {
            console.log(data.nfe_produtos);

            await this.prisma.$transaction(async (tx) => {
                await this.processChanges(tx.nfe, data.nfe, 'id', this.fixTypesNfe);
                await this.processChanges(tx.nfe_produtos, data.nfe_produtos, 'id', this.fixTypesNfeProduto);
                await this.processChanges(tx.nfe_evento, data.nfe_evento, 'id', this.fixTypesNfeEvento);
                await this.processChanges(tx.tab_duplicata, data.duplicatas, 'id', this.fixTypesDuplicata);
                 await this.processChanges(tx.usuario, data.usuario, 'id', this.fixTypesUser);
            });

            throw new HttpException(
                {

                    message: 'Dados sincronizados com sucesso.',
                    latestVersion: new Date().getTime(),
                    counts: {
                        nfe: data.nfe.created.length + data.nfe.updated.length + data.nfe.deleted.length,
                        nfe_produtos: data.nfe_produtos.created.length + data.nfe_produtos.updated.length + data.nfe_produtos.deleted.length,
                        nfe_evento: data.nfe_evento.created.length + data.nfe_evento.updated.length + data.nfe_evento.deleted.length,
                        duplicatas: data.duplicatas.created.length + data.duplicatas.updated.length + data.duplicatas.deleted.length,
                    },
                },
                HttpStatus.OK,
            );
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                console.error('Error during push operation:', error);
                throw new HttpException(
                    `Erro ao sincronizar dados: ${error.message}`,
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    fixTypesNfe = async (item: Omit<NfeDto, '_status' | '_changed'>): Promise<any> => {
        const formatted = {
            ...item,
            nfe_codigo: Number(item.nfe_codigo),
            nfe_numeracao: item.nfe_numeracao ? Number(item.nfe_numeracao) : undefined,
            nfe_total_nota: item.nfe_total_nota ? Number(item.nfe_total_nota) : undefined,
            nfe_total_produtos: item.nfe_total_produtos ? Number(item.nfe_total_produtos) : undefined,
            nfe_natureza_operacao: item.nfe_natureza_operacao ? String(item.nfe_natureza_operacao) : undefined,
            nfe_totvbcicms: item.nfe_totvbcicms ? Number(item.nfe_totvbcicms) : undefined,
            nfe_totvicms: item.nfe_totvicms ? Number(item.nfe_totvicms) : undefined,
            nfe_totvbcicmsst: item.nfe_totvbcicmsst ? Number(item.nfe_totvbcicmsst) : undefined,
            nfe_totvicmsst: item.nfe_totvicmsst ? Number(item.nfe_totvicmsst) : undefined,
            nfe_totvbcipi: item.nfe_totvbcipi ? Number(item.nfe_totvbcipi) : undefined,
            nfe_totvipi: item.nfe_totvipi ? Number(item.nfe_totvipi) : undefined,
            nfe_totvbcpis: item.nfe_totvbcpis ? Number(item.nfe_totvbcpis) : undefined,
            nfe_totvpis: item.nfe_totvpis ? Number(item.nfe_totvpis) : undefined,
            nfe_totvbccofins: item.nfe_totvbccofins ? Number(item.nfe_totvbccofins) : undefined,
            nfe_totvcofins: item.nfe_totvcofins ? Number(item.nfe_totvcofins) : undefined,
            nfe_vtotfrete: item.nfe_vtotfrete ? Number(item.nfe_vtotfrete) : undefined,
            nfe_vtotseguro: item.nfe_vtotseguro ? Number(item.nfe_vtotseguro) : undefined,
            nfe_vtotdesconto: item.nfe_vtotdesconto ? Number(item.nfe_vtotdesconto) : undefined,
            nfe_voutros: item.nfe_voutros ? Number(item.nfe_voutros) : undefined,
            nfe_formpag: item.nfe_formpag ? String(item.nfe_formpag) : undefined,
            nfe_fatumento: item.nfe_fatumento === 'S' || item.nfe_fatumento === 'N' ? item.nfe_fatumento : undefined,
            nfe_dtemis: item.nfe_dtemis ? moment(item.nfe_dtemis).format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]') : undefined,
            nfe_dtentrega: item.nfe_dtentrega ? moment(item.nfe_dtentrega).format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]') : undefined,
        };

        if (item.nfe_formpag) {
            const forma = await this.prisma.condicoes_pagamento.findFirst({
                where: { codigo: String(item.nfe_formpag).padStart(4, '0') },
            });
            if (!forma) {
                throw new Error(`Forma de pagamento '${item.nfe_formpag}' não encontrada`);
            }
            formatted.nfe_formpag = forma.id;
        }

        if (item.nfe_natureza_operacao) {
            const cfop = await this.prisma.cfop_natura.findFirst({
                where: { Codigo: Number(item.nfe_natureza_operacao) }
            });

            if (!cfop) {
                throw new Error(`Cfop '${item.nfe_natureza_operacao}' não encontrada`);
            }

            formatted.nfe_natureza_operacao = cfop.id;
        }

        return formatted;
    };

    fixTypesNfeProduto = async (item: Omit<NfeProdutoDto, '_status' | '_changed'>): Promise<any> => {

        const formatted = {
            ...item,
            codigo: String(item.codigo),
            nfe_codigo: Number(item.nfe_codigo),
            nfe_subtotal: item.nfe_subtotal ? Number(item.nfe_subtotal) : undefined,
            nfe_vbcicms: item.nfe_vbcicms ? Number(item.nfe_vbcicms) : undefined,
            nfe_vicms: item.nfe_vicms ? Number(item.nfe_vicms) : undefined,
            nfe_vbcicmsst: item.nfe_vbcicmsst ? Number(item.nfe_vbcicmsst) : undefined,
            nfe_vicmsst: item.nfe_vicmsst ? Number(item.nfe_vicmsst) : undefined,
            nfe_vbcipi: item.nfe_vbcipi ? Number(item.nfe_vbcipi) : undefined,
            nfe_vipi: item.nfe_vipi ? Number(item.nfe_vipi) : undefined,
            nfe_vbcpis: item.nfe_vbcpis ? Number(item.nfe_vbcpis) : undefined,
            nfe_vpis: item.nfe_vpis ? Number(item.nfe_vpis) : undefined,
            nfe_vbccofins: item.nfe_vbccofins ? Number(item.nfe_vbccofins) : undefined,
            nfe_vcofins: item.nfe_vcofins ? Number(item.nfe_vcofins) : undefined,
            nfe_vdesconto: item.nfe_vdesconto ? Number(item.nfe_vdesconto) : undefined,
            nfe_pecas: item.nfe_pecas ? Number(item.nfe_pecas) : undefined,
            nfe_quantidade: item.nfe_quantidade ? Number(item.nfe_quantidade) : undefined,
            nfe_valorunitario: item.nfe_valorunitario ? Number(item.nfe_valorunitario) : undefined,
        };

        if (item.nfe_cfop) {
            const cfop = await this.prisma.cfop_natura.findFirst({
                where: { Codigo: Number(item.nfe_cfop) }
            });

            if (!cfop) {
                throw new Error(`Cfop '${item.nfe_cfop}' não encontrada`);
            }

            formatted.nfe_cfop = cfop.id;
        }

        return formatted;
    }

    fixTypesNfeEvento = async (
        item: Omit<NfeEventoDto, '_status' | '_changed'>,
    ): Promise<any> => {
        const clean = removeFields(item, ['id_evento', 'id_nfe', 'idemp']); // ou id_evento se for esse o nome

        const formatted = {
            ...clean,
            nfe: {
                connect: { id: item.id_nfe }
            },
            data_evento: item.data_evento
                ? moment(item.data_evento).format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]')
                : undefined,
        };


        return formatted;
    };

    fixTypesDuplicata = async (item: Omit<DuplicataDto, '_status' | '_changed'>): Promise<any> => {
        const clean = removeFields(item, ['id_dup', 'id_nfe', 'idemp']);
        return {
            ...clean,
            data_emissao: item.data_emissao ? moment(item.data_emissao).format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]') : undefined,
            data_vencimento: item.data_vencimento ? moment(item.data_vencimento).format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]') : undefined,
            valor_duplicata: item.valor_duplicata ? Number(item.valor_duplicata) : undefined,
            valor_nota: item.valor_nota ? Number(item.valor_nota) : undefined,
        };
    }

    fixTypesUser= async (item: Omit<UserDto, '_status' | '_changed'>): Promise<any> => {
        const clean = removeFields(item, ['user_id', 'idemp','token','passwd']);
        return {
            ...clean,
        };
    }
}
