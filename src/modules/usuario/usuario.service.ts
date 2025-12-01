import { Injectable, NotFoundException } from '@nestjs/common';
import { UsuarioDTO, UsuarioUpdateDTO } from './usuario.dto';
import { PrismaService } from 'src/datrabase/PrismaService';
import { hashPassword } from '../auth/utils/bcrypt.utils';

export type User = any;

@Injectable()
export class UsuarioService {

    constructor(private prisma: PrismaService) { }

    async create(users: UsuarioDTO, cnpj: string) {

        const getEmpresa = await this.prisma.empresa.findFirst({
            where: {
                cnpj
            }
        });

        const userExists = await this.prisma.usuario.findFirst({
            where: {
                email: users.email,
            }
        });

        if (userExists) {
            throw new Error("Usuario ja exite");
        }

        const passwd = await hashPassword(users.passwd);
        const data = { ...users, passwd };

        const user = await this.prisma.usuario.create({
            data,
        });

        await this.prisma.usuarioEmpresa.create({
            data: {
                usuarioId: user.id,
                empresaId: getEmpresa.id,
            },
        });

        return user;
    }

    async findAll() {
        try {
            const usuarios = await this.prisma.usuario.findMany({
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    login: true,
                    codrepre: true,
                    user_ativo: true,
                    created_at: true,
                    empresas: {
                        include: {
                            empresa: {
                                select: {
                                    id: true,
                                    xnome: true,
                                    xfant: true,
                                    cnpj: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            empresas: true
                        }
                    }
                },
                orderBy: {
                    nome: 'asc'
                }
            });

            return {
                success: true,
                data: usuarios
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async findOneById(id: string) {
        try {
            const usuario = await this.prisma.usuario.findUnique({
                where: { id },
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    login: true,
                    codrepre: true,
                    user_ativo: true,
                    photo: true,
                    created_at: true,
                    updated_at: true,
                    empresas: {
                        include: {
                            empresa: {
                                select: {
                                    id: true,
                                    xnome: true,
                                    xfant: true,
                                    cnpj: true
                                }
                            }
                        }
                    }
                }
            });

            if (!usuario) {
                throw new NotFoundException('Usuário não encontrado');
            }

            return {
                success: true,
                data: usuario
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async findoOne(fist_name: string, cnpj: string): Promise<User | undefined> {
        return this.prisma.usuario.findFirst({
            where: {
                email: fist_name,
                empresas: {
                    some: {
                        empresa: {
                            cnpj: cnpj
                        }
                    }
                }
            },
            include: {
                empresas: {
                    where: {
                        empresa: {
                            cnpj: cnpj
                        }
                    },
                    include: {
                        empresa: true
                    }
                },
                configuracao: {
                    where: {
                        empresa: {
                            cnpj: cnpj
                        }
                    }
                }
            }
        });
    }

    async findoOneChange(fist_name: string): Promise<User | undefined> {
        return this.prisma.usuario.findFirst({
            where: {
                email: fist_name
            },
            include: {
                empresas: {
                    include: {
                        empresa: true
                    }
                }
            }
        })
    }

    async updateUser(id: string, data: UsuarioUpdateDTO, cnpj: string) {

        const passwd = data.passwd ? await hashPassword(data.passwd) : '';

        const user = await this.prisma.usuario.update({
            where: {
                id
            },
            data: {
                nome: data.nome,
                login: data.login,
                email: data.email,
                ...(data.passwd ? { passwd: passwd } : {}),
                codrepre: data.codrepre
            }
        });

        return user;
    }

    async toggleStatus(id: string) {
        try {
            const usuario = await this.prisma.usuario.findUnique({
                where: { id }
            });

            if (!usuario) {
                throw new NotFoundException('Usuário não encontrado');
            }

            const novoStatus = usuario.user_ativo === 'S' ? 'N' : 'S';

            const updated = await this.prisma.usuario.update({
                where: { id },
                data: {
                    user_ativo: novoStatus as any
                }
            });

            return {
                success: true,
                message: `Usuário ${novoStatus === 'S' ? 'ativado' : 'desativado'} com sucesso`,
                data: updated
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async getUsuarioEmpresas(id: string) {
        try {
            const usuario = await this.prisma.usuario.findUnique({
                where: { id },
                include: {
                    empresas: {
                        include: {
                            empresa: true
                        }
                    }
                }
            });

            if (!usuario) {
                throw new NotFoundException('Usuário não encontrado');
            }

            return {
                success: true,
                data: usuario.empresas.map(ue => ue.empresa)
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async vincularEmpresas(usuarioId: string, empresaIds: string[]) {
        try {
            const usuario = await this.prisma.usuario.findUnique({
                where: { id: usuarioId }
            });

            if (!usuario) {
                throw new NotFoundException('Usuário não encontrado');
            }

            // Remove todas as vinculações existentes
            await this.prisma.usuarioEmpresa.deleteMany({
                where: { usuarioId }
            });

            // Cria novas vinculações
            const vinculacoes = empresaIds.map(empresaId => ({
                usuarioId,
                empresaId
            }));

            await this.prisma.usuarioEmpresa.createMany({
                data: vinculacoes
            });

            return {
                success: true,
                message: 'Empresas vinculadas com sucesso'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    async desvincularEmpresa(usuarioId: string, empresaId: string) {
        try {
            await this.prisma.usuarioEmpresa.delete({
                where: {
                    usuarioId_empresaId: {
                        usuarioId,
                        empresaId
                    }
                }
            });

            return {
                success: true,
                message: 'Empresa desvinculada com sucesso'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
}
