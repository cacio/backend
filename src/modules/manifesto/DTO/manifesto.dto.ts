import {
  IsOptional,
  IsString,
  IsDateString,
  IsInt,
  IsNumber,
  Length,
} from 'class-validator';

export class CreateManifestoDto {

  @IsOptional()
  @IsDateString()
  data?: string;

  @IsOptional()
  @IsString()
  @Length(0, 10)
  n_manifesto?: string;

  @IsOptional()
  @IsInt()
  n_item?: number;

  @IsOptional()
  @IsString()
  @Length(0, 60)
  cod_produto?: string;

  @IsOptional()
  @IsString()
  @Length(0, 45)
  qtd_prod?: string;

  @IsOptional()
  @IsNumber()
  vlr_unit?: number;

  @IsOptional()
  @IsNumber()
  vBCSTRet?: number;

  @IsOptional()
  @IsNumber()
  vICMSSTRet?: number;

  @IsOptional()
  @IsString()
  @Length(0, 44)
  chave_acesso?: string;

  @IsOptional()
  @IsString()
  @Length(0, 10)
  codrepresentante?: string;

  @IsOptional()
  @IsString()
  @Length(0, 191)
  idemp?: string;
}
