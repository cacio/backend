import { Injectable } from '@nestjs/common';
import { format } from 'date-fns';
import { PrismaService } from 'src/datrabase/PrismaService';
@Injectable()
export class NfeService {
    constructor(private prisma: PrismaService) { }

    async ListaNfeCredenciadas(lastPulledVersion: Date, cnpj: string, repre: string) {
        try {

            const getEmpresa = await this.prisma.empresa.findFirst({
                where: {
                    cnpj
                }
            });


            const datanfe = await this.prisma.nfe.findMany({
                where: {
                    created_at: {
                        gt: lastPulledVersion
                    },
                    idemp: getEmpresa.id,
                    nfe_serie: (await this.prisma.usuario.findFirst({
                        where: {
                            codrepre: repre
                        },
                        include: { configuracao: true },
                    }))?.configuracao[0].serie,
                },
                select: {
                    id: true,
                    nfe_codigo: true,
                    nfe_numeracao: true,
                    fornecedor_codigo: true,
                    nfe_dtemis: true,
                    nfe_dtentrega: true,
                    nfe_total_nota: true,
                    nfe_total_produtos: true,
                    nfe_natureza_operacao: true,
                    nfe_totvbcicms: true,
                    nfe_totvicms: true,
                    nfe_totvbcicmsst: true,
                    nfe_totvicmsst: true,
                    nfe_totvbcipi: true,
                    nfe_totvipi: true,
                    nfe_totvbcpis: true,
                    nfe_totvpis: true,
                    nfe_totvbccofins: true,
                    nfe_totvcofins: true,
                    nfe_vtotfrete: true,
                    nfe_vtotseguro: true,
                    nfe_vtotdesconto: true,
                    nfe_voutros: true,
                    nfe_formpag: true,
                    nfe_manifesto: true,
                    nfe_fatumento: true,
                    nfe_serie: true,
                    created_at: true,
                    updated_at: true,
                    cfop_natura: {
                        select: {
                            Codigo: true,
                        }
                    },
                    condicoes_pagamento: {
                        select: {
                            codigo: true
                        }
                    },
                    idemp:true
                },
            });

            return datanfe.map(nfe => ({
                id: nfe.id,
                nfe_codigo: String(nfe.nfe_codigo),
                nfe_numeracao: nfe.nfe_numeracao,
                fornecedor_codigo: nfe.fornecedor_codigo,
                nfe_dtemis: this.toAppDate(nfe.nfe_dtemis),
                nfe_dtentrega: this.toAppDate(nfe.nfe_dtentrega),
                nfe_total_nota: this.toMoney(nfe.nfe_total_nota),
                nfe_total_produtos: this.toMoney(nfe.nfe_total_produtos),
                nfe_natureza_operacao: nfe.cfop_natura.Codigo,
                nfe_totvbcicms: this.toMoney(nfe.nfe_totvbcicms),
                nfe_totvicms: this.toMoney(nfe.nfe_totvicms),
                nfe_totvbcicmsst: this.toMoney(nfe.nfe_totvbcicmsst),
                nfe_totvicmsst: this.toMoney(nfe.nfe_totvicmsst),
                nfe_totvbcipi: this.toMoney(nfe.nfe_totvbcipi),
                nfe_totvipi: this.toMoney(nfe.nfe_totvipi),
                nfe_totvbcpis: this.toMoney(nfe.nfe_totvbcpis),
                nfe_totvpis: this.toMoney(nfe.nfe_totvpis),
                nfe_totvbccofins: this.toMoney(nfe.nfe_totvbccofins),
                nfe_totvcofins: this.toMoney(nfe.nfe_totvcofins),
                nfe_vtotfrete: this.toMoney(nfe.nfe_vtotfrete),
                nfe_vtotseguro: this.toMoney(nfe.nfe_vtotseguro),
                nfe_vtotdesconto: this.toMoney(nfe.nfe_vtotdesconto),
                nfe_voutros: this.toMoney(nfe.nfe_voutros),
                nfe_formpag: this.toNumber(nfe.condicoes_pagamento.codigo),
                nfe_manifesto: nfe.nfe_manifesto,
                nfe_fatumento: nfe.nfe_fatumento ?? '2',
                nfe_serie: nfe.nfe_serie,
                idemp:nfe.idemp,
                created_at: this.toAppDate(nfe.created_at),
                updated_at: this.toAppDate(nfe.updated_at),
            }));


        } catch (error) {
            return {
                message: error.message,
            };
        }
    }

    toAppDate(date:Date) {
       if (!date) return null
       return new Date(date).getTime()
    }

    toNumber(value:String) {
     return value == null ? 0 : Number(value)
    }

    toMoney(value:Number) {
        if (value == null) return 0
        return Number(value)
    }

}
