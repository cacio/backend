import { Controller } from '@nestjs/common';
import { FirebirdService } from './firebird.service';

@Controller('firebird')
export class FirebirdController {
  constructor(private readonly firebirdService: FirebirdService) {}
}
