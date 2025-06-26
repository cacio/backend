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
    async create(data: CondicoesPagamentoDto,cnpj: string) {
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
        const empresa = await this.prisma.empresa.findFirst({
            where: { cnpj },
        });

        return this.prisma.condicoes_pagamento.createMany({
            data: data.map(item => ({
                ...item,
                created_at: new Date(),
                updated_at: new Date(),
                idemp: empresa.id,
            })),
        });
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
}
