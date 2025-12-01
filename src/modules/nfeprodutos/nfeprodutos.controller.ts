import { Controller } from '@nestjs/common';
import { NfeprodutosService } from './nfeprodutos.service';

@Controller('nfeprodutos')
export class NfeprodutosController {
  constructor(private readonly nfeprodutosService: NfeprodutosService) {}
}
