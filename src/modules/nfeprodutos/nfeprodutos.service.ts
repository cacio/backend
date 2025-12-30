import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/datrabase/PrismaService';

@Injectable()
export class NfeprodutosService {
    constructor(private prisma: PrismaService) { }

    async ListaNfeProdutosCriados(lastPulledVersion: Date, cnpj: string, repre: string){
         const empresa = await this.prisma.empresa.findFirst({
            where: { cnpj }
        });

        const usuario = await this.prisma.usuario.findFirst({
            where: { codrepre: repre },
            include: { configuracao: true }
        });

        const serie = usuario?.configuracao[0].serie;

        // 3. Busca só NF-e dessa empresa e dessa série alteradas recentemente
        const nfes = await this.prisma.nfe.findMany({
            where: {
            created_at: { gt: lastPulledVersion },
            idemp: empresa.id,
            nfe_serie: serie,
            },
            select: { id: true }
        });

        if (nfes.length === 0) return []; // Não tem NF-e nova → não retorna nada

        const nfeIds = nfes.map(n => n.id);
        const produtos = await this.prisma.nfe_produtos.findMany({
            where: {
            nfe_id: { in: nfeIds }
            },
            select: {
                id: true,
                codigo:true,
                nfe_codigo:true,
                nfe_id:true,
                produtos_codigo:true,
                nfe_subtotal:true,
                nfe_vbcicms:true,
                nfe_vicms:true,
                nfe_vbcicmsst:true,
                nfe_vicmsst:true,
                nfe_vbcipi:true,
                nfe_vipi:true,
                nfe_vbcpis:true,
                nfe_vpis:true,
                nfe_vbccofins:true,
                nfe_vcofins:true,
                nfe_vdesconto:true,
                nfe_pecas:true,
                nfe_quantidade:true,
                nfe_valorunitario:true,
                nfe_infadprod:true,
                nfe_cfop:true,
                cfop_natura: {
                    select: {
                        Codigo: true,
                    }
                },
            }
        });

        return produtos.map(nfeprodutos =>({
                id: nfeprodutos.id,
                codigo:String(nfeprodutos.codigo),
                nfe_codigo:String(nfeprodutos.nfe_codigo),
                nfe_id:nfeprodutos.nfe_id,
                produtos_codigo:nfeprodutos.produtos_codigo,
                nfe_subtotal:this.toMoney(nfeprodutos.nfe_subtotal),
                nfe_vbcicms:this.toMoney(nfeprodutos.nfe_vbcicms),
                nfe_vicms:this.toMoney(nfeprodutos.nfe_vicms),
                nfe_vbcicmsst:this.toMoney(nfeprodutos.nfe_vbcicmsst),
                nfe_vicmsst:this.toMoney(nfeprodutos.nfe_vicmsst),
                nfe_vbcipi:this.toMoney(nfeprodutos.nfe_vbcipi),
                nfe_vipi:this.toMoney(nfeprodutos.nfe_vipi),
                nfe_vbcpis:this.toMoney(nfeprodutos.nfe_vbcpis),
                nfe_vpis:this.toMoney(nfeprodutos.nfe_vpis),
                nfe_vbccofins:this.toMoney(nfeprodutos.nfe_vbccofins),
                nfe_vcofins:this.toMoney(nfeprodutos.nfe_vcofins),
                nfe_vdesconto:this.toMoney(nfeprodutos.nfe_vdesconto),
                nfe_pecas:this.toMoney(nfeprodutos.nfe_pecas),
                nfe_quantidade:this.toMoney(nfeprodutos.nfe_quantidade),
                nfe_valorunitario:this.toMoney(nfeprodutos.nfe_valorunitario),
                nfe_infadprod:nfeprodutos.nfe_infadprod,
                nfe_cfop:String(nfeprodutos.cfop_natura.Codigo),
        }))
    }

    toNumber(value:String) {
     return value == null ? 0 : Number(value)
    }

    toMoney(value:Number) {
        if (value == null) return 0
        return Number(value)
    }
}
