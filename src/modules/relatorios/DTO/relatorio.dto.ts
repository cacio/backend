import { IsOptional, IsString, IsDateString, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class ObterNotasDeEntradaDto {
    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dataInicial must be in YYYY-MM-DD format' })
    @Type(() => String) // Garante que a entrada seja tratada como string
    dataInicial?: string;

    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dataFinal must be in YYYY-MM-DD format' })
    @Type(() => String)
    dataFinal?: string;

  @IsOptional()
  @IsString()
  placa?: string;
}

export class NotaDeEntradaDto {
    id: number;
    dataEmissao: Date;
    entradaSaida: string;
    placa: string;
    numero_nota:string;
    serie_nota:string;
    valor_total_nota:number;
    nome:string;
    // Adicione os outros campos da sua tabela aqui
  }