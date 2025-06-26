import { Module } from '@nestjs/common';
import { RelatoriosService } from './relatorios.service';
import { RelatoriosController } from './relatorios.controller';
import { FirebirdService } from '../firebird/firebird.service';
@Module({
  controllers: [RelatoriosController],
  providers: [RelatoriosService,FirebirdService],
})
export class RelatoriosModule {}
