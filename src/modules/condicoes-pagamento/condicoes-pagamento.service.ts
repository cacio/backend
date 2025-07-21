import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/datrabase/PrismaService';
import { CondicoesPagamentoDto } from './DTO/condigoespaganto.dto';
@Injectable()
export class CondicoesPagamentoService {
    constructor(private prisma: PrismaService) { }

    async findAll(cnpj: string) {
        return this.prisma.condicoes_pagamento.findMany({
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
        return this.prisma.condicoes_pagamento.findUnique({
            where: { id },
        });
    }
    async create(data: CondicoesPagamentoDto, cnpj: string) {
        const empresa = await this.prisma.empresa.findFirst({
            where: { cnpj },
        });
        return this.prisma.condicoes_pagamento.create({
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

    async update(id: string, data: CondicoesPagamentoDto) {
        return this.prisma.condicoes_pagamento.update({
            where: { id },
            data: {
                ...data,
                updated_at: new Date(),
            },
        });
    }
    async delete(id: string) {
        return this.prisma.condicoes_pagamento.delete({
            where: { id },
        });
    }
    async findByCodigo(codigo: string) {
        return this.prisma.condicoes_pagamento.findFirst({
            where: { codigo },
        });
    }

    async createLote(data: CondicoesPagamentoDto[], cnpj: string) {
        try {
            const empresa = await this.prisma.empresa.findFirst({
                where: { cnpj },
            });

            if (!empresa) {
                throw new Error(`Empresa com CNPJ ${cnpj} não encontrada`);
            }

            const condicaoExist = await this.prisma.condicoes_pagamento.findMany({
                where: {
                    idemp: empresa.id
                }
            })

            const mapaCondicao = new Map(condicaoExist.map(p => [p.codigo, p]));

            const promessas = data.map(item => {
                const items = this.normalizarKeys(item);
                const codigo = items['codigo'];
                const existente = mapaCondicao.get(codigo);

                const dataCondicao = {
                    codigo: items['codigo'],
                    descricao: items['descricao'],
                }

                if (existente) {
                    return this.prisma.condicoes_pagamento.update({
                        where: {
                            id: existente.id
                        },
                        data: dataCondicao
                    })
                } else {
                    return this.prisma.condicoes_pagamento.create({
                        data: {
                            ...dataCondicao,
                            idemp: empresa.id,
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

    async ListaCondicoesPagamentoCriado(lastPulledVersion: Date, cnpj: string) {
        const empresa = await this.prisma.empresa.findFirst({
            where: { cnpj },
        });

        return this.prisma.condicoes_pagamento.findMany({
            where: {
                created_at: {
                    gt: lastPulledVersion,
                },
                idemp: empresa.id,
            },
        });
    }
    async ListaCondicoesPagamentoAlterado(lastPulledVersion: Date, cnpj: string) {
        const empresa = await this.prisma.empresa.findFirst({
            where: { cnpj },
        });

        return this.prisma.condicoes_pagamento.findMany({
            where: {
                updated_at: {
                    gte: lastPulledVersion,
                },
                created_at: {
                    lt: lastPulledVersion, // só pega registros realmente atualizados
                },
                idemp: empresa.id,
            },
        });
    }

    private normalizarKeys(obj: Record<string, any>) {
        const novoObj: Record<string, any> = {};
        for (const key in obj) {
            novoObj[key.toLowerCase()] = obj[key];
        }
        return novoObj;
    }
}
