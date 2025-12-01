import { Module } from '@nestjs/common';
import { ConfiguracaoNfeService } from './configuracao-nfe.service';
import { ConfiguracaoNfeController } from './configuracao-nfe.controller';

@Module({
  controllers: [ConfiguracaoNfeController],
  providers: [ConfiguracaoNfeService],
})
export class ConfiguracaoNfeModule {}
