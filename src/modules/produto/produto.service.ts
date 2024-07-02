import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/datrabase/PrismaService';
import { CreateProdutoDto, UpdateProdutoDto } from './DTO/produto.dto';

@Injectable()
export class ProdutoService {
    constructor (private prisma: PrismaService){}

    async create(produto:CreateProdutoDto,cnpj: string){
        const getEmpresa = await this.prisma.empresa.findFirst({
            where: {
                cnpj
            }
        });

        const produtoExistes = await this.prisma.produtos.findFirst({
            where:{
                codigo: produto.codigo,
                idemp: getEmpresa.id
            }
        });

        if(produtoExistes){
            throw new Error("Produto ja exite");
        }

        const data = {...produto,idemp: getEmpresa.id};

        return await this.prisma.produtos.create({
            data,
        });

    }

    async update(id: string, cnpj: string,produto:UpdateProdutoDto){

        try {
            const getEmpresa = await this.prisma.empresa.findFirst({
                where: {
                    cnpj
                }
            });

            const produtoExists = await this.prisma.produtos.findFirst({
                where:{
                    cprod:id,
                    idemp: getEmpresa.id
                }
            });

            if(!produtoExists){
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
    async delete(id: string, cnpj: string){
        try {
            const getEmpresa = await this.prisma.empresa.findFirst({
                where: {
                    cnpj
                }
            });

            const produtoExists = await this.prisma.produtos.findFirst({
                where:{
                    cprod:id,
                    idemp: getEmpresa.id
                }
            });

            if(!produtoExists){
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

    async ListaProdutoCriado(lastPulledVersion: Date,cnpj:string){
        const dataproduct = await this.prisma.produtos.findMany({
            where:{
                created_at:{
                    gt:lastPulledVersion
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
            id:prod.codigo
        }));
    }
    async findAll(){
        return await this.prisma.produtos.findMany();
    }
}
