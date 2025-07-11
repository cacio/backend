import {
  IsArray,
  IsObject,
  IsOptional,
  ValidateNested,
  IsNotEmpty,
  IsString,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class NfeDto {
  id: string;
  nfe_codigo: number;
  nfe_numeracao?: number;
  fornecedor_codigo: string;
  nfe_dtemis?: string;
  nfe_dtentrega?: string;
  nfe_total_nota?: number;
  nfe_total_produtos?: number;
  nfe_natureza_operacao?: string;
  nfe_totvbcicms?: number;
  nfe_totvicms?: number;
  nfe_totvbcicmsst?: number;
  nfe_totvicmsst?: number;
  nfe_totvbcipi?: number;
  nfe_totvipi?: number;
  nfe_totvbcpis?: number;
  nfe_totvpis?: number;
  nfe_totvbccofins?: number;
  nfe_totvcofins?: number;
  nfe_vtotfrete?: number;
  nfe_vtotseguro?: number;
  nfe_vtotdesconto?: number;
  nfe_voutros?: number;
  nfe_formpag?: string;
  nfe_manifesto?: string;
  nfe_fatumento?: 'S' | 'N';
  idemp?: string;
  created_at?: string;
  updated_at?: string;
  nfe_serie?: string;

  _status?: 'created' | 'updated' | 'deleted';
  _changed?: string;
}

export class NfeProdutoDto {
  id: string;
  codigo: string;
  nfe_codigo: number;
  produtos_codigo?: string;
  nfe_subtotal?: number;
  nfe_vbcicms?: number;
  nfe_vicms?: number;
  nfe_vbcicmsst?: number;
  nfe_vicmsst?: number;
  nfe_vbcipi?: number;
  nfe_vipi?: number;
  nfe_vbcpis?: number;
  nfe_vpis?: number;
  nfe_vbccofins?: number;
  nfe_vcofins?: number;
  nfe_vdesconto?: number;
  nfe_pecas?: number;
  nfe_quantidade?: number;
  nfe_valorunitario?: number;
  nfe_infadprod?: string;
  nfe_cfop?: string;
  nfe_id: string;

  _status?: 'created' | 'updated' | 'deleted';
  _changed?: string;
}

export class NfeEventoDto {
  id: string;
  chave_acesso?: string;
  cstat?: string;
  protocolo?: string;
  caminho_xml?: string;
  data_evento?: string;
  xmotivo?: string;
  id_nfe?: string;
  digVal?: string;
  serie: string;
  codigo_nfe?: string;
  numero_nfe?: string;

  _status?: 'created' | 'updated' | 'deleted';
  _changed?: string;
}

export class DuplicataDto {
  id: string;
  numero_nota?: string;
  numero_duplicata?: string;
  data_emissao?: string;
  data_vencimento?: string;
  valor_duplicata?: number;
  valor_nota?: number;
  forma_pagto?: string;
  nosso_numero?: string;
  nfe_id: string;
  created_at?: string;
  updated_at?: string;

  _status?: 'created' | 'updated' | 'deleted';
  _changed?: string;
}

export class ChangesDto<T = any> {
  @IsArray()
  @IsOptional()
  created: T[];

  @IsArray()
  @IsOptional()
  updated: T[];

  @IsArray()
  @IsOptional()
  deleted: (string | number)[];
}

export class AsyncPushDto {
  @IsObject()
  @ValidateNested()
  @Type(() => ChangesDto)
  nfe: ChangesDto<NfeDto>;

  @IsObject()
  @ValidateNested()
  @Type(() => ChangesDto)
  nfe_produtos: ChangesDto<NfeProdutoDto>;

  @IsObject()
  @ValidateNested()
  @Type(() => ChangesDto)
  nfe_evento: ChangesDto<NfeEventoDto>;

  @IsObject()
  @ValidateNested()
  @Type(() => ChangesDto)
  duplicatas: ChangesDto<DuplicataDto>;
}

export function stripSyncFields<T extends Record<string, any>>(obj: T): Omit<T, '_status' | '_changed'> {
  const { _status, _changed, ...rest } = obj;
  return rest;
}

export function removeFields<T extends Record<string, any>>(obj: T, fields: string[]): Partial<T> {
  const result = { ...obj };
  for (const field of fields) {
    delete result[field];
  }
  return result;
}

export async function processChanges<T extends { id?: string; codigo?: string }>(
  prismaModel: any,
  data: ChangesDto<T>,
  idField: keyof T
) {
  // Created
  for (const item of data.created || []) {
    await prismaModel.create({ data: stripSyncFields(item) });
  }

  // Updated
  for (const item of data.updated || []) {
    const whereClause = { [idField]: item[idField] };
    const exists = await prismaModel.findUnique({ where: whereClause });
    if (exists) {
      await prismaModel.update({ where: whereClause, data: stripSyncFields(item) });
    }
  }

  // Deleted
  for (const id of data.deleted || []) {
    const whereClause = { [idField]: id };
    const exists = await prismaModel.findUnique({ where: whereClause });
    if (exists) {
      await prismaModel.delete({ where: whereClause });
    }
  }
}
