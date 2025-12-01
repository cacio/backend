import { IsNotEmpty, IsString,IsEnum,IsOptional,IsArray } from "class-validator";

export enum usuario_user_ativo {
    S = 'S',
    N = 'N'
  }

export class UsuarioDTO {
    //id?: number;

    @IsNotEmpty({ message: 'Nome não pode ser vazio' })
    @IsString({ message: 'Interior must be a valid string' })
    nome:string;

    @IsNotEmpty({ message: 'Email não pode ser vazio' })
    email:string;

    @IsString()
    login:string;

    @IsString()
    passwd:string;

    @IsString()
    photo?:string;

    created_at?:string;

    updated_at?:string;

    @IsString()
    codrepre:string;
    @IsNotEmpty()
    @IsString()
    @IsEnum(usuario_user_ativo)
    user_ativo:usuario_user_ativo;

};

export class UsuarioUpdateDTO {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  login?: string;

  @IsOptional()
  @IsString()
  passwd?: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsString()
  codrepre?: string;
}

export class VincularEmpresasDTO {
  @IsArray()
  @IsString({ each: true })
  empresaIds: string[];
}