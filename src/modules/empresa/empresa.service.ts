import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/datrabase/PrismaService';
import { CreateEmpresaDto, UpdateEmpresaDto } from './DTO/empresa.dto';

@Injectable()
export class EmpresaService {
    constructor(private prisma: PrismaService) {}

    async createEmpresa(empresa: CreateEmpresaDto) {
        try {
            const empresaExists = await this.prisma.empresa.findFirst({
                where: {
                    cnpj: empresa.cnpj
                }
            });

            if (empresaExists) {
                throw new Error('CNPJ já cadastrado');
            }

            return await this.prisma.empresa.create({
                data: empresa
            });

        } catch (error) {
            return {
                mensage: error.message
            }
        }
    }

    async findAll() {
        try {
            const empresas = await this.prisma.empresa.findMany({
                select: {
                    id: true,
                    cnpj: true,
                    cpf: true,
                    xnome: true,
                    xfant: true,
                    xlgr: true,
                    nro: true,
                    xcpl: true,
                    xbairro: true,
                    xmun: true,
                    uf: true,
                    cep: true,
                    fone: true,
                    ie: true,
                    im: true,
                    cnae: true,
                    crt: true,
                    _count: {
                        select: {
                            usuarios: true,
                            nfe: true
                        }
                    }
                },
                orderBy: {
                    xnome: 'asc'
                }
            });

            return {
                success: true,
                data: empresas
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async findOne(id: string) {
        try {
            const empresa = await this.prisma.empresa.findUnique({
                where: { id },
                include: {
                    usuarios: {
                        include: {
                            usuario: {
                                select: {
                                    id: true,
                                    nome: true,
                                    email: true,
                                    user_ativo: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            nfe: true
                        }
                    }
                }
            });

            if (!empresa) {
                throw new NotFoundException('Empresa não encontrada');
            }

            return {
                success: true,
                data: empresa
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async update(id: string, data: UpdateEmpresaDto) {
        try {
            const empresa = await this.prisma.empresa.findUnique({
                where: { id }
            });

            if (!empresa) {
                throw new NotFoundException('Empresa não encontrada');
            }

            // Verifica se está tentando alterar CNPJ para um já existente
            if (data.cnpj && data.cnpj !== empresa.cnpj) {
                const cnpjExists = await this.prisma.empresa.findFirst({
                    where: {
                        cnpj: data.cnpj,
                        id: { not: id }
                    }
                });

                if (cnpjExists) {
                    throw new Error('CNPJ já cadastrado para outra empresa');
                }
            }

            const updated = await this.prisma.empresa.update({
                where: { id },
                data
            });

            return {
                success: true,
                message: 'Empresa atualizada com sucesso',
                data: updated
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async toggleStatus(id: string) {
        try {
            const empresa = await this.prisma.empresa.findUnique({
                where: { id }
            });

            if (!empresa) {
                throw new NotFoundException('Empresa não encontrada');
            }

            // Como não há campo de status na tabela empresa,
            // você pode adicionar um campo 'ativo' ou usar soft delete
            // Por enquanto, vou retornar uma mensagem
            return {
                success: true,
                message: 'Funcionalidade de ativar/desativar requer adicionar campo "ativo" na tabela empresa'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
}
