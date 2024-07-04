import { IsOptional, IsString, IsNumber, IsUUID, IsInt } from 'class-validator';

export class CreateEmpresaDto {

    @IsOptional()
    @IsString()
    cnpj?: string;

    @IsOptional()
    @IsString()
    cep?: string;

    @IsOptional()
    @IsInt()
    cmun?: number;

    @IsOptional()
    @IsString()
    cnae?: string;

    @IsOptional()
    @IsString()
    cpais?: string;

    @IsOptional()
    @IsString()
    cpf?: string;

    @IsOptional()
    @IsInt()
    crt?: number;

    @IsOptional()
    @IsString()
    enderemit?: string;

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
    nro?: string;

    @IsOptional()
    @IsString()
    uf?: string;

    @IsOptional()
    @IsString()
    xbairro?: string;

    @IsOptional()
    @IsString()
    xcpl?: string;

    @IsOptional()
    @IsString()
    xfant?: string;

    @IsOptional()
    @IsString()
    xlgr?: string;

    @IsOptional()
    @IsString()
    xmun?: string;

    @IsOptional()
    @IsString()
    xnome?: string;

    @IsOptional()
    @IsString()
    xpais?: string;
}
