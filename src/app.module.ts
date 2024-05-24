import { Module } from '@nestjs/common';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { AuthModule } from './modules/auth/auth.module';
import { ModulesModule } from './async/modules/modules.module';
import { AsyncModule } from './modules/async/async.module';

@Module({
  imports: [UsuarioModule, AuthModule, ModulesModule, AsyncModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
