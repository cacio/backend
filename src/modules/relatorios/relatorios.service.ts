import { Injectable } from '@nestjs/common';
import { FirebirdService } from '../firebird/firebird.service';
import { NotaDeEntradaDto, ObterNotasDeEntradaDto } from './DTO/relatorio.dto';

@Injectable()
export class RelatoriosService {
    constructor(private readonly firebirdService: FirebirdService) { }

    async RelatorioCanhoto(dto: ObterNotasDeEntradaDto): Promise<NotaDeEntradaDto[]> {
        let sql = `
        SELECT
            distinct
            C.NOME,
            NEM.DATA_EMISSAO,
            NEM.NUMERO_NOTA,
            NEM.SERIE_NOTA,
            NEM.VALOR_TOTAL_NOTA,
            NEM.PLACA
        FROM NOTAS_DE_ENTRADAS_M NEM
        inner join CLIENTES C on (C.CODIGO = NEM.COD_FORNEC)
        WHERE 1 = 1
        AND NEM.ENTRADA_SAIDA = 'S'
    `;
        const params: any[] = [];

        if (dto.dataInicial) {
            sql += ' AND NEM.DATA_EMISSAO >= ?';
            params.push(dto.dataInicial);
        }

        if (dto.dataFinal) {
            sql += ' AND NEM.DATA_EMISSAO <= ?';
            params.push(dto.dataFinal);
        }

        if (dto.placa) {
            sql += ' AND NEM.PLACA = ?';
            params.push(dto.placa);
        }

        try {
            const results = await this.firebirdService.query<any>(sql, params);
            return results.map(this.mapToNotaDeEntradaDto);
        } catch (error) {
            console.error('Erro ao buscar notas de entrada:', error);
            return [];
        }
    }

    private mapToNotaDeEntradaDto(row: any): NotaDeEntradaDto {
        const notaDeEntrada = new NotaDeEntradaDto();
        notaDeEntrada.id = row.NUMERO_NOTA;
        notaDeEntrada.dataEmissao = row.DATA_EMISSAO;
        notaDeEntrada.entradaSaida = row.ENTRADA_SAIDA;
        notaDeEntrada.placa = row.PLACA;
        notaDeEntrada.serie_nota = row.SERIE_NOTA;
        notaDeEntrada.valor_total_nota = row.VALOR_TOTAL_NOTA;
        notaDeEntrada.numero_nota = row.NUMERO_NOTA;
        notaDeEntrada.nome = row.NOME;
        return notaDeEntrada;
    }
}
