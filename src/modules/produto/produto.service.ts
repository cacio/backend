import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/datrabase/PrismaService';
import { CreateProdutoDto, UpdateProdutoDto } from './DTO/produto.dto';
import * as moment from 'moment-timezone';
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

            const data = { ...produto, idemp: getEmpresa.id,dtContagemEstoque:moment(new Date()).toISOString()};

            return await this.prisma.produtos.create({
                data,
            });
        } catch (error) {
            return {
                mensage: error.message
            }
        }
    }


    async CreateLote(dados: any[], cnpj: string) {
        try {
            const getEmpresa = await this.prisma.empresa.findFirst({
                where: { cnpj },
            });

            if (!getEmpresa) {
                throw new Error(`Empresa com CNPJ ${cnpj} não encontrada`);
            }

            // Busca todos os produtos da empresa para cache
            const produtosExistentes = await this.prisma.produtos.findMany({
                where: { idemp: getEmpresa.id },
            });

            // Mapa para acesso rápido por cprod
            const mapaProdutos = new Map(produtosExistentes.map(p => [p.cprod, p]));

            // Monta um array de promessas para executar em paralelo
            const promessas = dados.map(produto => {
                const cprod = produto["CODIGO"];
                const existente = mapaProdutos.get(cprod);

                const dataAtualizacao = {
                    cean: String(produto["CEANTRIB"]),
                    xprod: produto["DESCRICAO"],
                    ncm: produto["NFE_NCM"],
                    cfop_expecif: produto["CFOPESPECIFO"],
                    ceantrib: produto["CEANTRIB"],
                    unMedida: produto["UNIDADE"],
                    dtContagemEstoque: moment(produto["DTCONTAGEM"]).toISOString(),
                    qtdContagemKg: produto["QTDECONTADA"],
                    qtdContagemPc: produto["QTDECONTADA"],
                    pesoLiquido: produto["PESO_LIQUIDO"],
                    pesoBruto: produto["PESO_BRUTO"],
                    aliquotaICMS: produto["ALIQUOTA_ICM"],
                    percRedBcICMS: produto["PREDBC"],
                    AliquotaICMSST_MVA: produto["PREDBCICMSS"],
                    percRedBcICMSST: produto["PREDBC"],
                    CSTICMS: produto["SITUACAO_TRIBU"],
                    CSTIPI: produto["ST_TRIB_IPI"],
                    CSTPISCOFINS_E: produto["CSTPISCOFINSENT"],
                    CSTPISCOFINS_S: produto["CSTPISCOFINSSAI"],
                    percBcPisCofins: 100,
                    AliquotaPisCofins_E: produto["ALIQUOTACOFINS"],
                    AliquotaPisCofins_S: produto["ALIQUOTACOFINS"],
                    xInfAdProd: produto["INFADPROD"],
                    percBcIpi: produto["PREDBIPI"],
                    AliquotaIpi: produto["PALIQIPI"],
                    valor_unitario: produto["PRECO_VENDA"],
                    fatorbcicmsret: produto["FATORBCICMSRET"],
                    fatorvlricmsret: produto["FATORVLRICMSRET"],
                    CENQ: produto["CENQ"],
                    CBENEF: produto["CBENEF"],
                };

                if (existente) {
                    // Atualiza o produto existente
                    return this.prisma.produtos.update({
                        where: { codigo: existente.codigo },
                        data: dataAtualizacao,
                    });
                } else {
                    // Cria um produto novo
                    return this.prisma.produtos.create({
                        data: {
                            ...dataAtualizacao,
                            cprod,
                            idemp: getEmpresa.id,
                        },
                    });
                }
            });

            await Promise.all(promessas);

            return { mensage: "dados gravados com sucesso!" };
        } catch (error) {
            console.error(error);
            return { mensage: error.message };
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
    async ListaProdutoAlterado(lastPulledVersion: Date, cnpj: string) {

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
