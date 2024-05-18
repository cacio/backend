import { Module } from '@nestjs/common';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [UsuarioModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
