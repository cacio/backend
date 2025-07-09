import {
  IsArray,
  IsOptional,
  IsString,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// -------- NFe DTO --------
class NfeDto {
  @IsString()
  id: string;

  @IsString()
  nfe_codigo: string;

  @IsOptional()
  @IsString()
  nfe_numeracao?: string;

  @IsString()
  nfe_serie: string;

  @IsString()
  fornecedor_codigo: string;

  @IsOptional()
  @IsNumber()
  nfe_dtemis?: number;

  @IsOptional()
  @IsNumber()
  nfe_dtentrega?: number;

  @IsOptional()
  @IsNumber()
  nfe_total_nota?: number;

  @IsOptional()
  @IsNumber()
  nfe_total_produtos?: number;

  @IsOptional()
  @IsNumber()
  nfe_natureza_operacao?: number;

  @IsOptional()
  @IsNumber()
  nfe_totvbcicms?: number;

  @IsOptional()
  @IsNumber()
  nfe_totvicms?: number;

  @IsOptional()
  @IsNumber()
  nfe_totvbcicmsst?: number;

  @IsOptional()
  @IsNumber()
  nfe_totvicmsst?: number;

  @IsOptional()
  @IsNumber()
  nfe_totvbcipi?: number;

  @IsOptional()
  @IsNumber()
  nfe_totvipi?: number;

  @IsOptional()
  @IsNumber()
  nfe_totvbcpis?: number;

  @IsOptional()
  @IsNumber()
  nfe_totvpis?: number;

  @IsOptional()
  @IsNumber()
  nfe_totvbccofins?: number;

  @IsOptional()
  @IsNumber()
  nfe_totvcofins?: number;

  @IsOptional()
  @IsNumber()
  nfe_vtotfrete?: number;

  @IsOptional()
  @IsNumber()
  nfe_vtotseguro?: number;

  @IsOptional()
  @IsNumber()
  nfe_vtotdesconto?: number;

  @IsOptional()
  @IsNumber()
  nfe_voutros?: number;

  @IsOptional()
  @IsNumber()
  nfe_formpag?: number;

  @IsOptional()
  @IsString()
  nfe_manifesto?: string;

  @IsOptional()
  @IsString()
  nfe_fatumento?: string;

  @IsOptional()
  @IsString()
  idemp?: string;
}

// -------- Produto DTO --------
class ProdutoDto {
  @IsString()
  id: string;

  @IsString()
  codigo: string;

  @IsString()
  nfe_codigo: string;

  @IsString()
  nfe_id: string;

  @IsOptional()
  @IsString()
  produtos_codigo?: string;

  @IsOptional()
  @IsNumber()
  nfe_subtotal?: number;

  @IsOptional()
  @IsNumber()
  nfe_vbcicms?: number;

  @IsOptional()
  @IsNumber()
  nfe_vicms?: number;

  @IsOptional()
  @IsNumber()
  nfe_vbcicmsst?: number;

  @IsOptional()
  @IsNumber()
  nfe_vicmsst?: number;

  @IsOptional()
  @IsNumber()
  nfe_vbcipi?: number;

  @IsOptional()
  @IsNumber()
  nfe_vipi?: number;

  @IsOptional()
  @IsNumber()
  nfe_vbcpis?: number;

  @IsOptional()
  @IsNumber()
  nfe_vpis?: number;

  @IsOptional()
  @IsNumber()
  nfe_vbccofins?: number;

  @IsOptional()
  @IsNumber()
  nfe_vcofins?: number;

  @IsOptional()
  @IsNumber()
  nfe_vdesconto?: number;

  @IsOptional()
  @IsNumber()
  nfe_pecas?: number;

  @IsOptional()
  @IsNumber()
  nfe_quantidade?: number;

  @IsOptional()
  @IsNumber()
  nfe_valorunitario?: number;

  @IsOptional()
  @IsString()
  nfe_infadprod?: string;

  @IsOptional()
  @IsString()
  nfe_cfop?: string;

  @IsOptional()
  @IsNumber()
  vBCSTRet?: number;

  @IsOptional()
  @IsNumber()
  vICMSSTRet?: number;
}

// -------- Duplicata DTO --------
class DuplicataDto {
  @IsString()
  numero_nota: string;

  @IsString()
  numero_duplicata: string;

  @IsNumber()
  data_emissao: number;

  @IsNumber()
  data_vencimento: number;

  @IsNumber()
  valor_duplicata: number;

  @IsNumber()
  valor_nota: number;

  @IsString()
  forma_pagto: string;
}

// -------- Manifesto DTO --------
class ManifestoDto {
  @IsString()
  id: string;

  @IsString()
  n_manifesto: string;

  @IsString()
  n_item: string;

  @IsString()
  cod_produto: string;

  @IsNumber()
  qtd_prod: number;

  @IsNumber()
  vlr_unit: number;

  @IsString()
  vBCSTRet: string;

  @IsString()
  vICMSSTRet: string;

  @IsString()
  codrepresentante: string;

  @IsString()
  chave_acesso: string;
}


class EnventoDto{
    @IsString()
    id: string;

    @IsString()
    chave_acesso:string;

    @IsString()
    cstat:string;

    @IsString()
    caminho_xml?: string;

    @IsNumber()
    data_evento?: number;

    @IsString()
    xmotivo?: string;

    @IsString()
    id_nfe?: string;

    @IsString()
    idemp?: string;
}

// -------- Principal DTO --------
export class TransmissaoNfeDto {
  @ValidateNested()
  @Type(() => NfeDto)
  nfe: NfeDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProdutoDto)
  produtos: ProdutoDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DuplicataDto)
  duplicatas: DuplicataDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ManifestoDto)
  manifestos: ManifestoDto[];

  @ValidateNested()
  @Type(() => EnventoDto)
  evento: EnventoDto;
}

export class CancelamentoDto{
  @IsString()
  chNFe:string

  @IsString()
  nProt:string;

  @IsString()
  justificativa:string;

  @IsString()
  serie: string;

  @IsString()
  numero_nfe:string;

  @IsString()
  codigo_nfe:string;
}

export class CartaCorrecaoDto{
  @IsString()
  chNFe:string

  @IsString()
  nProt:string;

  @IsString()
  justificativa:string;

  @IsString()
  serie: string;

  @IsString()
  numero_nfe:string;

  @IsString()
  codigo_nfe:string;
}

export class InutilizaDto{
  @IsString()
  justificativa:string;

  @IsString()
  serie: string;

  @IsString()
  numero_nfe:string;

  @IsString()
  codigo_nfe:string;
}