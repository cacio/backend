import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/datrabase/PrismaService';
import { CreateProdutoDto, UpdateProdutoDto } from './DTO/produto.dto';

@Injectable()
export class ProdutoService {
    constructor(private prisma: PrismaService) { }

    async create(produto: CreateProdutoDto, cnpj: string) {
        try {


            const getEmpresa = await this.prisma.empresa.findFirst({
                where: {
                    cnpj
                }
            });

            const produtoExistes = await this.prisma.produtos.findFirst({
                where: {
                    cprod: produto.cprod,
                    idemp: getEmpresa.id
                }
            });

            if (produtoExistes) {
                throw new Error("Produto ja existe");
            }

            const data = { ...produto, idemp: getEmpresa.id };

            return await this.prisma.produtos.create({
                data,
            });
        } catch (error) {
            return {
                mensage: error.message
            }
        }
    }

    async update(id: string, cnpj: string, produto: UpdateProdutoDto) {

        try {
            const getEmpresa = await this.prisma.empresa.findFirst({
                where: {
                    cnpj
                }
            });

            const produtoExists = await this.prisma.produtos.findFirst({
                where: {
                    cprod: id,
                    idemp: getEmpresa.id
                }
            });

            if (!produtoExists) {
                throw new Error("Produto não encontrado");
            }

            return this.prisma.produtos.update({
                data: produto,
                where: {
                    codigo: produtoExists.codigo,
                    idemp: getEmpresa.id
                }
            });

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

            const produtoExists = await this.prisma.produtos.findFirst({
                where: {
                    cprod: id,
                    idemp: getEmpresa.id
                }
            });

            if (!produtoExists) {
                throw new Error("Produto não encontrado");
            }

            return this.prisma.produtos.delete({
                where: {
                    codigo: produtoExists.codigo,
                    idemp: getEmpresa.id
                }
            });

        } catch (error) {
            return {
                mensage: error.message
            }
        }
    }

    async ListaProdutoCriado(lastPulledVersion: Date, cnpj: string) {

        const dataproduct = await this.prisma.produtos.findMany({
            where: {
                created_at: {
                    gte: lastPulledVersion
                },
                idemp: (await this.prisma.empresa.findFirst({
                    where: {
                        cnpj
                    }
                })).id
            }
        });

        return dataproduct.map(prod => ({
            ...prod,
            id: prod.codigo
        }));
    }
    async ListaProdutoAlterado(lastPulledVersion: Date, cnpj: string){

         const empresa = await this.prisma.empresa.findFirst({
            where: { cnpj },
        });

        const dataproduct = await this.prisma.produtos.findMany({
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

         return dataproduct.map(prod => ({
            ...prod,
            id: prod.codigo
        }));
    }
    async findAll(cnpj) {
        const getEmpresa = await this.prisma.empresa.findFirst({
            where: {
                cnpj
            }
        });
        return await this.prisma.produtos.findMany({
            where: {
                idemp: getEmpresa.id
            }
        });
    }
}
