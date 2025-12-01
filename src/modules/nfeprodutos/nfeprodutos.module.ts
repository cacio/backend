import { Module } from '@nestjs/common';
import { NfeprodutosService } from './nfeprodutos.service';
import { NfeprodutosController } from './nfeprodutos.controller';

@Module({
  controllers: [NfeprodutosController],
  providers: [NfeprodutosService],
})
export class NfeprodutosModule {}
