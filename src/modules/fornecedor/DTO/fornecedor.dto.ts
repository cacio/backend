import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateFornecedorDto {
  @IsInt()
  @IsOptional()
  codigo?: string;

  @IsString()
  @IsOptional()
  cod_retaquarda?: string;

  @IsString()
  @IsOptional()
  cnpj?: string;

  @IsString()
  @IsOptional()
  cpf?: string;

  @IsString()
  @IsOptional()
  xnome?: string;

  @IsString()
  @IsOptional()
  xfantasia?: string;

  @IsString()
  @IsOptional()
  enderdest?: string;

  @IsString()
  @IsOptional()
  xlgr?: string;

  @IsString()
  @IsOptional()
  nro?: string;

  @IsString()
  @IsOptional()
  xcpl?: string;

  @IsString()
  @IsOptional()
  xbairro?: string;

  @IsString()
  @IsOptional()
  cmun?: string;

  @IsString()
  @IsOptional()
  xmun?: string;

  @IsString()
  @IsOptional()
  uf?: string;

  @IsString()
  @IsOptional()
  cep?: string;

  @IsString()
  @IsOptional()
  cpais?: string;

  @IsString()
  @IsOptional()
  xpais?: string;

  @IsString()
  @IsOptional()
  fone?: string;

  @IsString()
  @IsOptional()
  ie?: string;

  @IsString()
  @IsOptional()
  isuf?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  id_representate?: string;

  @IsString()
  @IsOptional()
  forma_pag?: string;

  @IsInt()
  @IsOptional()
  prazo1?: number;

  @IsInt()
  @IsOptional()
  prazo2?: number;

  @IsInt()
  @IsOptional()
  prazo3?: number;

  @IsInt()
  @IsOptional()
  prazo4?: number;

  @IsInt()
  @IsOptional()
  prazo5?: number;

  @IsInt()
  @IsOptional()
  idemp?: number;

  @IsOptional()
  created_at?: Date;

  @IsOptional()
  updated_at?: Date;
}

export class UpdateFornecedorDto {
    @IsString()
    @IsOptional()
    cnpj?: string;

    @IsString()
    @IsOptional()
    cpf?: string;

    @IsString()
    @IsOptional()
    xnome?: string;

    @IsString()
    @IsOptional()
    xfantasia?: string;

    @IsString()
    @IsOptional()
    enderdest?: string;

    @IsString()
    @IsOptional()
    xlgr?: string;

    @IsString()
    @IsOptional()
    nro?: string;

    @IsString()
    @IsOptional()
    xcpl?: string;

    @IsString()
    @IsOptional()
    xbairro?: string;

    @IsString()
    @IsOptional()
    cmun?: string;

    @IsString()
    @IsOptional()
    xmun?: string;

    @IsString()
    @IsOptional()
    uf?: string;

    @IsString()
    @IsOptional()
    cep?: string;

    @IsString()
    @IsOptional()
    cpais?: string;

    @IsString()
    @IsOptional()
    xpais?: string;

    @IsString()
    @IsOptional()
    fone?: string;

    @IsString()
    @IsOptional()
    ie?: string;

    @IsString()
    @IsOptional()
    isuf?: string;

    @IsString()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    status?: string;

    @IsString()
    @IsOptional()
    id_representate?: string;

    @IsString()
    @IsOptional()
    forma_pag?: string;

    @IsInt()
    @IsOptional()
    prazo1?: number;

    @IsInt()
    @IsOptional()
    prazo2?: number;

    @IsInt()
    @IsOptional()
    prazo3?: number;

    @IsInt()
    @IsOptional()
    prazo4?: number;

    @IsInt()
    @IsOptional()
    prazo5?: number;

    @IsOptional()
    updated_at?: Date;
}