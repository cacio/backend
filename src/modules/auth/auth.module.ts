import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/datrabase/PrismaService';
import { UsuarioModule } from '../usuario/usuario.module';

import { jwtConstants } from './constantes';
import { UsuarioService } from '../usuario/usuario.service';

@Module({
  imports: [
    UsuarioModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService,PrismaService,UsuarioService],
  exports: [AuthService],
})
export class AuthModule {}
