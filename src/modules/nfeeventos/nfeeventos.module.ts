import { Module } from '@nestjs/common';
import { NfeeventosService } from './nfeeventos.service';
import { NfeeventosController } from './nfeeventos.controller';

@Module({
  controllers: [NfeeventosController],
  providers: [NfeeventosService],
})
export class NfeeventosModule {}
