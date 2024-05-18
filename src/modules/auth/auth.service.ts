import { Injectable,UnauthorizedException } from '@nestjs/common';
import { UsuarioService } from '../usuario/usuario.service';
import { JwtService } from '@nestjs/jwt';
import { validatePassword } from './utils/bcrypt.utils';

@Injectable()
export class AuthService {
    constructor(
        private usersService:UsuarioService,
        private jwtService: JwtService
    ){}

    async signIn(username: string, pass: string): Promise<any> {

        const user = await this.usersService.findoOne(username);
        if(user != null){
          const isValidPassword = await validatePassword(pass,user?.passwd);
          console.log("aqui: ",isValidPassword);
          if (!isValidPassword) {
            throw new UnauthorizedException();
          }
          console.log(user);
          const payload = { sub: user.id, name: user.fist_name };
          return {
              usuario:user,
              token: await this.jwtService.signAsync(payload),
              msg:"Sucesso!",
          };
        }else{
          return {
            msg:"Usuario não existe!",
          };
        }
      }
}
