import { Controller } from '@nestjs/common';
import { NfeService } from './nfe.service';

@Controller('nfe')
export class NfeController {
  constructor(private readonly nfeService: NfeService) {}
}
