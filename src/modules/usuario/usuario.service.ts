import { Injectable } from '@nestjs/common';
import { UsuarioDTO } from './usuario.dto';
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
}
