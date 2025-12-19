import { Injectable, NotFoundException } from '@nestjs/common';
import { UsuarioDTO, UsuarioUpdateDTO, CreateUsuarioDto, UpdateUsuarioDto } from './usuario.dto';
import { PrismaService } from 'src/datrabase/PrismaService';
import { hashPassword } from '../auth/utils/bcrypt.utils';

export type User = any;

@Injectable()
export class UsuarioService {

    constructor(private prisma: PrismaService) { }

    async create(cnpj: string, data: CreateUsuarioDto) {
        // Verificar se empresa existe
        const empresa = await this.prisma.empresa.findFirst({
            where: { cnpj },
        });

        if (!empresa) {
            throw new NotFoundException('Empresa não encontrada');
        }

        // Hash da senha
        const hashedPassword = await hashPassword(data.passwd);

        // Criar usuário
        const usuario = await this.prisma.usuario.create({
            data: {
                nome: data.nome,
                email: data.email,
                login: data.login,
                passwd: hashedPassword,
                codrepre: data.codrepre,
                user_ativo: 'S',
            },
        });

        // Vincular à empresa
        await this.prisma.usuarioEmpresa.create({
            data: {
                usuarioId: usuario.id,
                empresaId: empresa.id,
            },
        });

        // Criar configuração se houver dados
        if (this.hasConfigData(data)) {
            await this.prisma.usuarioConfiguracao.create({
                data: {
                    usuarioId: usuario.id,
                    serie: data.serie,
                    cfop: data.cfop,
                    numeroviaempressao: data.numeroviaempressao,
                    codproxnfe: data.codproxnfe,
                    idemp: data.idemp || empresa.id,
                    percpesoproduto: data.percpesoproduto,
                    percprecoproduto: data.percprecoproduto,
                },
            });
        }

        return {
            success: true,
            message: 'Usuário criado com sucesso',
            data: usuario,
        };
    }

    async update(id: string, cnpj: string, data: UpdateUsuarioDto) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { id },
        });

        if (!usuario) {
            throw new NotFoundException('Usuário não encontrado');
        }

        const updateData: any = {
            nome: data.nome,
            email: data.email,
            login: data.login,
            codrepre: data.codrepre,
        };

        // Atualizar senha se fornecida
        if (data.passwd) {
            updateData.passwd = await hashPassword(data.passwd);
        }

        await this.prisma.usuario.update({
            where: { id },
            data: updateData,
        });
        //console.log('Config Data:', data);

        // Atualizar ou criar configuração
        if (this.hasConfigData(data)) {
            const configExistente = await this.prisma.usuarioConfiguracao.findFirst({
                where: { usuarioId: id },
            });

            const configData = {
                serie: data.serie,
                cfop: data.cfop,
                numeroviaempressao: data.numeroviaempressao,
                codproxnfe: data.codproxnfe,
                idemp: data.idemp,
                percpesoproduto: data.percpesoproduto,
                percprecoproduto: data.percprecoproduto,
            };


            if (configExistente) {
                await this.prisma.usuarioConfiguracao.update({
                    where: { id: configExistente.id },
                    data: configData,
                });
            } else {
                await this.prisma.usuarioConfiguracao.create({
                    data: {
                        usuarioId: id,
                        ...configData,
                    },
                });
            }
        }

        return {
            success: true,
            message: 'Usuário atualizado com sucesso',
        };
    }

     async findAll() {
    const usuarios = await this.prisma.usuario.findMany({
      include: {
        empresas: {
          include: {
            empresa: {
              select: {
                id: true,
                xnome: true,
                cnpj: true,
              },
            },
          },
        },
        configuracao: {
          select: {
            serie: true,
            cfop: true,
            numeroviaempressao: true,
            codproxnfe: true,
            percpesoproduto: true,
            percprecoproduto: true,
          },
          take: 1,
        },
      },
    });

    return {
      success: true,
      data: usuarios.map(usuario => ({
        ...usuario,
        configuracao: usuario.configuracao[0] || null,
      })),
    };
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

    private hasConfigData(data: CreateUsuarioDto | UpdateUsuarioDto): boolean {
        return !!(
            data.serie ||
            data.cfop ||
            data.numeroviaempressao ||
            data.codproxnfe ||
            data.idemp ||
            data.percpesoproduto ||
            data.percprecoproduto
        );
    }
}
