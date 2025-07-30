import { Injectable } from '@nestjs/common';
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
        console.log(users.passwd);
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
                },
                configuracao:{
                    where:{
                        empresa:{
                            cnpj:cnpj
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

    async updateUser(id: string, data: UsuarioUpdateDTO,cnpj: string) {

        const passwd = data.passwd ? await hashPassword(data.passwd) : '';
       // console.log('Senha: ',data);
        const user = await this.prisma.usuario.update({
            where: {
                id
            },
            data:{
                nome: data.nome,
                login: data.login,
                email: data.email,
                ...(data.passwd ? { passwd: passwd } : {}),
                codrepre: data.codrepre
            }
        });
       // console.log(user);
        return user;
    }
}
