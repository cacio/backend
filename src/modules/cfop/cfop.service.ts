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

    async ListaCfopCriados(lastPulledVersion: Date,cnpj: string) {
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
