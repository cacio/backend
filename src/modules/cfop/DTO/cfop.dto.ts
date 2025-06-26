import {
  IsOptional,
  IsString,
  IsUUID,
  IsInt,
  IsNumber,
  IsEnum,
} from 'class-validator';

export enum CfopNaturaCalculasnDto {
  S = 'S',
  N = 'N',
}

export class CfopDto {

  @IsInt()
  Codigo: number;

  @IsOptional()
  @IsString()
  cod_especif?: string;

  @IsOptional()
  @IsString()
  Nome?: string;

  @IsOptional()
  @IsString()
  dados_ad_fisc?: string;

  @IsOptional()
  @IsString()
  dados_ad_cliente?: string;

  @IsOptional()
  @IsInt()
  CSTICMS?: number;

  @IsOptional()
  @IsInt()
  CSTIPI?: number;

  @IsOptional()
  @IsInt()
  CSTPISCOFINS?: number;

  @IsOptional()
  @IsNumber()
  aliquotaICMS?: number;

  @IsOptional()
  @IsNumber()
  percRedBcICMS?: number;

  @IsOptional()
  @IsNumber()
  AliquotaICMSST_MVA?: number;

  @IsOptional()
  @IsNumber()
  percRedBcICMSST?: number;

  @IsOptional()
  @IsNumber()
  percBcPis?: number;

  @IsOptional()
  @IsNumber()
  percBcCofins?: number;

  @IsOptional()
  @IsNumber()
  AliquotaPis?: number;

  @IsOptional()
  @IsNumber()
  AliquotaCofins?: number;

  @IsOptional()
  @IsNumber()
  percBcIpi?: number;

  @IsOptional()
  @IsNumber()
  AliquotaIpi?: number;

  @IsOptional()
  @IsEnum(CfopNaturaCalculasnDto)
  calculasn?: CfopNaturaCalculasnDto;

  @IsOptional()
  @IsString()
  CBENEF?: string;

  @IsOptional()
  @IsString()
  idemp?: string;
}


