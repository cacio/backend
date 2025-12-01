import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateEmpresaDto {
  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsString()
  xnome?: string;

  @IsOptional()
  @IsString()
  xfant?: string;

  @IsOptional()
  @IsString()
  enderemit?: string;

  @IsOptional()
  @IsString()
  xlgr?: string;

  @IsOptional()
  @IsString()
  nro?: string;

  @IsOptional()
  @IsString()
  xcpl?: string;

  @IsOptional()
  @IsString()
  xbairro?: string;

  @IsOptional()
  @IsInt()
  cmun?: number;

  @IsOptional()
  @IsString()
  xmun?: string;

  @IsOptional()
  @IsString()
  uf?: string;

  @IsOptional()
  @IsString()
  cep?: string;

  @IsOptional()
  @IsString()
  cpais?: string;

  @IsOptional()
  @IsString()
  xpais?: string;

  @IsOptional()
  @IsString()
  fone?: string;

  @IsOptional()
  @IsString()
  ie?: string;

  @IsOptional()
  @IsString()
  iest?: string;

  @IsOptional()
  @IsString()
  im?: string;

  @IsOptional()
  @IsString()
  cnae?: string;

  @IsOptional()
  @IsInt()
  crt?: number;

  @IsOptional()
  @IsBoolean()
  ativaReformaTributaria?: boolean;

  @IsOptional()
  dataInicioReformaTributaria?: Date;
}

export class UpdateEmpresaDto {
  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsString()
  xnome?: string;

  @IsOptional()
  @IsString()
  xfant?: string;

  @IsOptional()
  @IsString()
  enderemit?: string;

  @IsOptional()
  @IsString()
  xlgr?: string;

  @IsOptional()
  @IsString()
  nro?: string;

  @IsOptional()
  @IsString()
  xcpl?: string;

  @IsOptional()
  @IsString()
  xbairro?: string;

  @IsOptional()
  @IsInt()
  cmun?: number;

  @IsOptional()
  @IsString()
  xmun?: string;

  @IsOptional()
  @IsString()
  uf?: string;

  @IsOptional()
  @IsString()
  cep?: string;

  @IsOptional()
  @IsString()
  cpais?: string;

  @IsOptional()
  @IsString()
  xpais?: string;

  @IsOptional()
  @IsString()
  fone?: string;

  @IsOptional()
  @IsString()
  ie?: string;

  @IsOptional()
  @IsString()
  iest?: string;

  @IsOptional()
  @IsString()
  im?: string;

  @IsOptional()
  @IsString()
  cnae?: string;

  @IsOptional()
  @IsInt()
  crt?: number;

  @IsOptional()
  @IsBoolean()
  ativaReformaTributaria?: boolean;

  @IsOptional()
  dataInicioReformaTributaria?: Date;
}
