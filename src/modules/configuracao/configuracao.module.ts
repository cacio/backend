import { Module } from '@nestjs/common';
import { ConfiguracaoService } from './configuracao.service';
import { ConfiguracaoController } from './configuracao.controller';
import { PrismaService } from 'src/datrabase/PrismaService';
@Module({
  controllers: [ConfiguracaoController],
  providers: [ConfiguracaoService,PrismaService],
})
export class ConfiguracaoModule {}
