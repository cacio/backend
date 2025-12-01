import { Injectable } from '@nestjs/common';
import { format, formatISO } from 'date-fns';
import { PrismaService } from 'src/datrabase/PrismaService';
@Injectable()
export class DuplicatasService {
    constructor(private prisma: PrismaService) { }

    async ListaDuplicataCriadas(lastPulledVersion: Date, cnpj: string, repre: string){
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

            const duplicatas = await this.prisma.tab_duplicata.findMany({
                where:{
                    nfe_id: { in: nfeIds }
                }
            });

            return duplicatas.map(duplicata=>({
                id:duplicata.id,
                id_dup:duplicata.id,
                numero_nota:duplicata.numero_nota,
                numero_duplicata:duplicata.numero_duplicata,
                data_emissao: this.toAppDate(duplicata.data_emissao),
                data_vencimento:this.toAppDate(duplicata.data_vencimento),
                valor_duplicata:duplicata.valor_duplicata,
                valor_nota:duplicata.valor_nota,
                forma_pagto:duplicata.forma_pagto,
                nosso_numero:duplicata.nosso_numero,
                nfe_id:duplicata.nfe_id,
                idemp:empresa.id
            }));
    }

     toAppDate(date:Date) {
        if (!date) return null
        const d = new Date(date)
        d.setMinutes(d.getMinutes() + d.getTimezoneOffset()) // remove impacto do fuso
        return format(d, "yyyy-MM-dd")
    }
}
