import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/datrabase/PrismaService';
import { CreateManifestoDto } from './DTO/manifesto.dto';
import * as moment from 'moment-timezone';
@Injectable()
export class ManifestoService {
    constructor(private prisma: PrismaService) { }

    async create(dados: CreateManifestoDto, cnpj: string) {

        try {

            const getEmpresa = await this.prisma.empresa.findFirst({
                where: {
                    cnpj: cnpj
                }
            });

            if (!getEmpresa) {
                throw new HttpException(`Empresa ${cnpj} não encontrada ou sem configuração`, HttpStatus.NOT_FOUND);
            }

            const response = await this.prisma.tb_manifestos.create({
                data: dados
            })

            throw new HttpException(response, HttpStatus.CREATED);

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    'Ocorreu um erro dutante a gravação do manifesto',
                    HttpStatus.INTERNAL_SERVER_ERROR
                )
            }

        }

    }

    async createLote(dados: CreateManifestoDto[], cnpj: string){
        try {
            const results = [];
            const getEmpresa = await this.prisma.empresa.findFirst({
                where: {
                    cnpj: cnpj
                }
            });

            if (!getEmpresa) {
                throw new HttpException(`Empresa ${cnpj} não encontrada ou sem configuração`, HttpStatus.NOT_FOUND);
            }
           // console.log(dados);
            for(const manifesto of dados){

                //const data = { ...manifesto, idemp: getEmpresa.id };

                const createdManifesto = await this.prisma.tb_manifestos.create({
                    data: {
                        data:moment(manifesto.data).format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]',),
                        n_manifesto:manifesto.n_manifesto,
                        n_item:manifesto.n_item,
                        cod_produto:manifesto.cod_produto,
                        qtd_prod:manifesto.qtd_prod,
                        vlr_unit:manifesto.vlr_unit,
                        vBCSTRet:manifesto.vBCSTRet,
                        vICMSSTRet:manifesto.vICMSSTRet,
                        chave_acesso:manifesto.chave_acesso,
                        codrepresentante:manifesto.codrepresentante,
                        idemp:getEmpresa.id
                    }
                })

                 results.push({ success: true, manifesto: createdManifesto });
            }


            throw new HttpException(results, HttpStatus.CREATED);

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                throw new HttpException(
                    'Ocorreu um erro dutante a gravação do manifesto '+error,
                    HttpStatus.INTERNAL_SERVER_ERROR
                )
            }

        }

    }
    async ListaManifestoCriado(lastPulledVersion: Date, cnpj: string,codrepre:string){
         const empresa = await this.prisma.empresa.findFirst({
            where: { cnpj },
        });

        const dataManifesto = await this.prisma.tb_manifestos.findMany({
             where: {
                created_at: {
                    gte: lastPulledVersion
                },
                idemp: empresa.id,
                codrepresentante:codrepre
            }
        });

       return dataManifesto.map((manifesto) => ({
            ...manifesto,
            created_at: new Date(manifesto.created_at).getTime(),
            updated_at: new Date(manifesto.updated_at).getTime(),
        }));
    }
}

