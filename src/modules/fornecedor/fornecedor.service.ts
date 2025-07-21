import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/datrabase/PrismaService';
import { Prisma, fornecedor } from '@prisma/client';
import { CreateFornecedorDto, UpdateFornecedorDto } from './DTO/fornecedor.dto';

@Injectable()
export class FornecedorService {
    constructor(private prisma: PrismaService) { }

    async create(fornecedor: CreateFornecedorDto, cnpj: string) {

        try {
            const getEmpresa = await this.prisma.empresa.findFirst({
                where: {
                    cnpj
                }
            });

            const ForncedorExists = await this.prisma.fornecedor.findFirst({
                where: {
                    cnpj: fornecedor.cnpj,
                    OR: [
                        {
                            cpf: fornecedor.cpf
                        }
                    ],
                    AND: [{
                        idemp: getEmpresa.id
                    }]

                }
            })

            if (ForncedorExists) {
                throw new Error("Fornecedor ja exite");
            }

            const data = { ...fornecedor, idemp: getEmpresa.id };
            return await this.prisma.fornecedor.create({
                data
            });

        } catch (error) {
            return {
                mensage: error.message
            }
        }

    }

    async createLote(fornecedores: CreateFornecedorDto[], cnpj: string) {
        const results = [];

        try {
            const getEmpresa = await this.prisma.empresa.findFirst({
                where: { cnpj },
            });

            if (!getEmpresa) {
                throw new Error(`Empresa com CNPJ ${cnpj} não encontrada`);
            }

            for (const item of fornecedores) {
                const fornecedor = this.normalizarKeys(item); // converte chaves para lowercase

                try {
                    const fornecedorExistente = await this.prisma.fornecedor.findFirst({
                        where: {
                            cnpj: fornecedor.cnpj,
                            OR: [
                                {
                                    cpf: fornecedor.cpf
                                }
                            ],
                            AND: [{
                                idemp: getEmpresa.id
                            }]
                        }
                    });

                    const data = {
                        ...fornecedor,
                        idemp: getEmpresa.id,
                    };

                    if (fornecedorExistente) {
                        // Atualiza fornecedor existente
                        // console.log('existe');
                        // console.log(data);
                        const updated = await this.prisma.fornecedor.update({
                            where: { codigo: fornecedorExistente.codigo },
                            data,
                        });
                        results.push({ success: true, fornecedor: updated, updated: true });
                    } else {
                        // Cria novo fornecedor
                        const created = await this.prisma.fornecedor.create({ data });
                        results.push({ success: true, fornecedor: created, created: true });
                    }
                } catch (error) {
                    console.error(error);
                    results.push({ success: false, error: error.message, fornecedor });
                }
            }

            return results;
        } catch (error) {
            console.error(error);
            return [{ success: false, error: error.message }];
        }
    }


    private normalizarKeys(obj: Record<string, any>) {
        const novoObj: Record<string, any> = {};
        for (const key in obj) {
            novoObj[key.toLowerCase()] = obj[key];
        }
        return novoObj;
    }


    async update(id: string, cnpj: string, fornecedor: UpdateFornecedorDto) {

        try {
            const getEmpresa = await this.prisma.empresa.findFirst({
                where: {
                    cnpj
                }
            });

            const for_codigo = await this.prisma.fornecedor.findMany({
                where: {
                    cod_retaquarda: id,
                    idemp: getEmpresa.id
                }
            });
            // console.log(for_codigo);
            if (!for_codigo) {
                throw new Error("Fornecedor nao exite");
            }

            return await this.prisma.fornecedor.update({
                data: fornecedor,
                where: {
                    codigo: for_codigo[0].codigo
                }
            })
        } catch (error) {
            return {
                mensage: error.message
            }
        }

    }

    async delete(id: string, cnpj: string) {
        try {
            const getEmpresa = await this.prisma.empresa.findFirst({
                where: {
                    cnpj
                }
            });

            const for_codigo = await this.prisma.fornecedor.findMany({
                where: {
                    cod_retaquarda: id,
                    idemp: getEmpresa.id
                }
            });

            if (!for_codigo) {
                throw new Error("Fornecedor nao exite");
            }

            return await this.prisma.fornecedor.delete({
                where: {
                    codigo: for_codigo[0].codigo
                }
            })
        } catch (error) {
            return {
                mensage: error.message
            }
        }
    }
    async getFornecedores(cnpj: string) {

        const getEmpresa = await this.prisma.empresa.findFirst({
            where: {
                cnpj
            }
        });

        return await this.prisma.fornecedor.findMany({
            where: {
                idemp: getEmpresa.id
            }
        });
    }

    async ListaFornecedoresCriados(lastPulledVersion: Date, cnpj: string) {
        const getEmpresa = await this.prisma.empresa.findFirst({
            where: {
                cnpj
            }
        });

        const datafornec = await this.prisma.fornecedor.findMany({
            where: {
                created_at: {
                    gt: lastPulledVersion
                },
                idemp: getEmpresa.id
            }
        })
        return datafornec.map(fornecedor => ({
            ...fornecedor,
            id: fornecedor.codigo
        }));
    }

    async ListaFornecedorAlterado(lastPulledVersion: Date, cnpj: string) {
        const getEmpresa = await this.prisma.empresa.findFirst({
            where: { cnpj }
        });

        const datafornec = await this.prisma.fornecedor.findMany({
            where: {
                updated_at: {
                    gte: lastPulledVersion,
                },
                created_at: {
                    lt: lastPulledVersion, // só pega registros realmente atualizados
                },
                idemp: getEmpresa.id,
            },
        });

        return datafornec.map(fornecedor => ({
            ...fornecedor,
            id: fornecedor.codigo,
        }));
    }






}
