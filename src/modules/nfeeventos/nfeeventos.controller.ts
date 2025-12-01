import { Controller } from '@nestjs/common';
import { NfeeventosService } from './nfeeventos.service';

@Controller('nfeeventos')
export class NfeeventosController {
  constructor(private readonly nfeeventosService: NfeeventosService) {}
}
