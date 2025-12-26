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
    try {
        // 1. Busca a empresa uma única vez
        const empresa = await this.prisma.empresa.findFirst({
            where: { cnpj },
            select: { id: true }
        });

        if (!empresa) {
            throw new Error(`Empresa com CNPJ ${cnpj} não encontrada`);
        }

        // 2. Normaliza todos os dados do lote de uma vez
        const fornecedoresNormalizados = fornecedores.map(item => ({
            ...this.normalizarKeys(item),
            idemp: empresa.id
        }));

        // 3. Extrai todos os CNPJs e CPFs para buscar em massa
        const cnpjs = fornecedoresNormalizados.map(f => f.cnpj).filter(Boolean);
        const cpfs = fornecedoresNormalizados.map(f => f.cpf).filter(Boolean);

        // 4. Busca todos os fornecedores existentes que coincidem com o lote
        const fornecedoresExistentes = await this.prisma.fornecedor.findMany({
            where: {
                idemp: empresa.id,
                OR: [
                    { cnpj: { in: cnpjs } },
                    { cpf: { in: cpfs } }
                ]
            }
        });

        // Criamos um mapa para busca rápida (O(1))
        const mapaExistentes = new Map();
        fornecedoresExistentes.forEach(f => {
            if (f.cnpj) mapaExistentes.set(f.cnpj, f);
            if (f.cpf) mapaExistentes.set(f.cpf, f);
        });

        // 5. Separa em grupos para processamento paralelo controlado ou transação única
        const updates = [];
        const creates = [];

        for (const data of fornecedoresNormalizados) {
            const existente = mapaExistentes.get(data.cnpj) || mapaExistentes.get(data.cpf);
            
            if (existente) {
                updates.push(
                    this.prisma.fornecedor.update({
                        where: { codigo: existente.codigo },
                        data
                    })
                );
            } else {
                creates.push(data);
            }
        }

        // 6. Executa as operações de forma eficiente
        // Usamos transação para garantir consistência e performance
        const results = await this.prisma.$transaction([
            // CreateMany é muito mais rápido para inserções em massa
            ...(creates.length > 0 ? [this.prisma.fornecedor.createMany({ data: creates, skipDuplicates: true })] : []),
            // Updates em paralelo
            ...updates
        ]);

        return {
            success: true,
            processados: fornecedoresNormalizados.length,
            criados: creates.length,
            atualizados: updates.length
        };

    } catch (error) {
        console.error("Erro no createLote:", error);
        return { success: false, error: error.message };
    }
}



    private normalizarKeys(obj: CreateFornecedorDto): CreateFornecedorDto {
        const novoObj: Record<string, any> = {};
        for (const key in obj) {
            novoObj[key.toLowerCase()] = (obj as Record<string, any>)[key];
        }
        return novoObj as CreateFornecedorDto;
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
