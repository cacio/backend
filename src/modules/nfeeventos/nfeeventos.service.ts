import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/datrabase/PrismaService';
@Injectable()
export class NfeeventosService {
    constructor(private prisma: PrismaService) { }

    async ListaEventosCriados(lastPulledVersion: Date, cnpj: string, repre: string) {
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

        const eventos = await this.prisma.nfe_evento.findMany({
            where: {
                OR: [
                    {
                        id_nfe: { in: nfeIds },
                    },
                    {
                        numero_nfe: { in: nfeIds }
                    }
                ]

            }
        });
        //console.log(eventos);
        return eventos.map(dup => ({
            id: dup.id,
            id_evento: dup.id,
            chave_acesso: dup.chave_acesso,
            cstat: dup.cstat,
            protocolo: dup.protocolo,
            caminho_xml: dup.caminho_xml,
            data_evento: this.toAppDate(dup.data_evento),
            xmotivo: dup.xmotivo,
            id_nfe: dup.id_nfe,
            digVal: dup.digVal,
            serie: dup.serie,
            codigo_nfe: dup.codigo_nfe,
            numero_nfe: dup.numero_nfe,
            idemp: empresa.id,
        }));
    }

    toAppDate(date:Date) {
       if (!date) return null
       return new Date(date).getTime()
    }
}
