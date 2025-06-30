import { IsEmail, IsInt, IsString } from 'class-validator'

export class CreateConfiguracaoNfeDto {
  @IsString()
  empresaId: string

  @IsString()
  tpAmb: string

  @IsString()
  versao: string

  @IsString()
  certPassword: string

  @IsEmail()
  mailFrom: string

  @IsString()
  mailSmtp: string

  @IsString()
  mailUser: string

  @IsString()
  mailPass: string

  @IsString()
  mailProtocol: string

  @IsString()
  mailPort: string
}
