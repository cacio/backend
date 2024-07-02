import { IsNotEmpty, IsString,IsEnum,IsNumber } from "class-validator";

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
    login:string;
    passwd:string;
    photo:string;
    created_at?:string;
    updated_at?:string;
    codrepre:string;
    @IsNotEmpty()
    @IsString()
    @IsEnum(usuario_user_ativo)
    user_ativo:usuario_user_ativo;
    @IsNotEmpty()
    @IsString()
    idemp:string;

};