import { IsOptional, IsString, IsNumber, IsDateString, IsUUID } from 'class-validator';

export class CondicoesPagamentoDto {
    @IsOptional()
    @IsUUID()
    id?: string;

    @IsOptional()
    @IsString()
    codigo?: string;

    @IsString()
    descricao: string;

    @IsOptional()
    @IsDateString()
    created_at?: Date;

    @IsOptional()
    @IsDateString()
    updated_at?: Date;
}