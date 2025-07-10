import { Module } from '@nestjs/common';
import { ConfiguracaoUsuarioService } from './configuracao-usuario.service';
import { ConfiguracaoUsuarioController } from './configuracao-usuario.controller';
import { PrismaService } from 'src/datrabase/PrismaService';
@Module({
  controllers: [ConfiguracaoUsuarioController],
  providers: [ConfiguracaoUsuarioService,PrismaService],
})
export class ConfiguracaoUsuarioModule {}
