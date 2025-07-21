import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/datrabase/PrismaService';
@Injectable()
export class CfopService {
    constructor(private prisma: PrismaService) { }
    async findAll(cnpj: string) {
        return this.prisma.cfop_natura.findMany({
            where: {
                empresa: {
                    cnpj: cnpj,
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });
    }
    async findOne(id: string) {
        return this.prisma.cfop_natura.findUnique({
            where: { id },
        });
    }
    async create(cnpj: string, data: any) {
        const empresa = await this.prisma.empresa.findFirst({
            where: { cnpj },
        });
        return this.prisma.cfop_natura.create({
            data: {
                ...data,
                created_at: new Date(),
                updated_at: new Date(),
                empresa: {
                    connect: {
                        id: empresa.id,
                    },
                },
            },
        });
    }

    async createLote(data: any[], cnpj: string) {
        try {
            const getEmpresa = await this.prisma.empresa.findFirst({
                where: { cnpj },
            });

            if (!getEmpresa) {
                throw new Error(`Empresa com CNPJ ${cnpj} não encontrada`);
            }

            const cfopExist = await this.prisma.cfop_natura.findMany({
                where:{
                    idemp:getEmpresa.id
                }
            })

             const mapaCfop = new Map(cfopExist.map(p => [p.Codigo, p]));

             const promessas = data.map(cfop =>{
                    const codigocfop = cfop['CODIGO']
                    const existente  = mapaCfop.get(codigocfop);

                   const dataAtualizacao = {
                        Codigo: cfop['CODIGOFISCAL'],
                        cod_especif: cfop['CODIGO'],
                        Nome: cfop['NOME'],
                        dados_ad_fisc: cfop['OBSERVACOESFISCO'],
                        dados_ad_cliente: cfop['OBSERVACOESCLIENTE'],
                        CSTICMS: cfop['CSTICMS'],
                        CSTIPI: cfop['CSTIPI'],
                        CSTPISCOFINS: cfop['CSTPISCOFINS'],
                        aliquotaICMS: cfop['ALIQUOTAICMS'],
                        percRedBcICMS: cfop['PERCREDBCICMS'],
                        AliquotaICMSST_MVA: cfop['ALIQUOTAICMSST_MVA'],
                        percRedBcICMSST: cfop['PERCREDBCICMSST'],
                        percBcPis: cfop['PERCBCPIS'],
                        percBcCofins: cfop['PERCBCCOFINS'],
                        AliquotaPis: cfop['ALIQUOTAPIS'],
                        AliquotaCofins: cfop['ALIQUOTACOFINS'],
                        percBcIpi: cfop['PERCBCIPI'],
                        AliquotaIpi: cfop['ALIQUOTAIPI'],
                        calculasn: cfop['PAUTA'], // 'S' ou 'N'
                        CBENEF: 'SEM CBENEF',
                    }


                     if (existente) {
                        //existe
                        return this.prisma.cfop_natura.update({
                            where:{
                                id:existente.id
                            },
                            data:dataAtualizacao
                        })
                     }else{
                        //criar
                        return this.prisma.cfop_natura.create({
                             data: {
                                ...dataAtualizacao,
                                idemp: String(getEmpresa.id),
                            }
                        })

                     }
             });
            await Promise.all(promessas);

            return { mensage: "dados gravados com sucesso!" };
        } catch (error) {
            console.log(error);
            return { mensage: error.message };
        }
    }

    async update(id: string, data: any) {
        return this.prisma.cfop_natura.update({
            where: { id },
            data: {
                ...data,
                updated_at: new Date(),
            },
        });
    }
    async delete(id: string) {
        return this.prisma.cfop_natura.delete({
            where: { id },
        });
    }

    async ListaCfopCriados(lastPulledVersion: Date, cnpj: string) {
        return this.prisma.cfop_natura.findMany({
            where: {
                created_at: {
                    gt: lastPulledVersion
                },
                empresa: {
                    cnpj: cnpj,
                },
            },
        });
    }
    async ListaCfopAlterados(lastPulledVersion: Date, cnpj: string) {
        return this.prisma.cfop_natura.findMany({
            where: {
                updated_at: {
                    gte: lastPulledVersion,
                },
                created_at: {
                    lt: lastPulledVersion, // só pega registros realmente atualizados
                },
                empresa: {
                    cnpj: cnpj,
                },
            },
        });
    }
}
