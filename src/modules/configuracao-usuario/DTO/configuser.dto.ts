import { IsOptional, IsString, IsUUID, IsInt } from 'class-validator'
import { PartialType } from '@nestjs/mapped-types'

export class CreateUsuarioConfiguracaoDto {
  @IsUUID()
  usuarioId: string

  @IsOptional()
  @IsString()
  serie?: string

  @IsOptional()
  @IsString()
  cfop?: string

  @IsOptional()
  @IsInt()
  numeroviaempressao?: number

  @IsOptional()
  @IsString()
  codproxnfe?: string

  @IsOptional()
  @IsString()
  idemp?: string
}

export class UpdateUsuarioConfiguracaoDto extends PartialType(CreateUsuarioConfiguracaoDto) {}