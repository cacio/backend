import { IsString, IsNotEmpty, IsEmail, IsOptional, IsIn } from 'class-validator';

export class CreateConfiguracaoNfeDto {
  @IsString()
  @IsNotEmpty()
  tpAmb: string; // 1 = Produção, 2 = Homologação

  @IsString()
  @IsNotEmpty()
  versao: string; // Ex: "4.00"

  @IsString()
  @IsNotEmpty()
  certPassword: string;

  @IsEmail()
  @IsNotEmpty()
  mailFrom: string;

  @IsString()
  @IsNotEmpty()
  mailSmtp: string;

  @IsString()
  @IsNotEmpty()
  mailUser: string;

  @IsString()
  @IsNotEmpty()
  mailPass: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['SSL', 'TLS', 'NONE'])
  mailProtocol: string;

  @IsString()
  @IsNotEmpty()
  mailPort: string;
}

export class UpdateConfiguracaoNfeDto {
  @IsString()
  @IsOptional()
  tpAmb?: string;

  @IsString()
  @IsOptional()
  versao?: string;

  @IsString()
  @IsOptional()
  certPassword?: string;

  @IsEmail()
  @IsOptional()
  mailFrom?: string;

  @IsString()
  @IsOptional()
  mailSmtp?: string;

  @IsString()
  @IsOptional()
  mailUser?: string;

  @IsString()
  @IsOptional()
  mailPass?: string;

  @IsString()
  @IsOptional()
  @IsIn(['ssl', 'tls', 'none'])
  mailProtocol?: string;

  @IsString()
  @IsOptional()
  mailPort?: string;
}
