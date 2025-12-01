import { Controller } from '@nestjs/common';
import { DuplicatasService } from './duplicatas.service';

@Controller('duplicatas')
export class DuplicatasController {
  constructor(private readonly duplicatasService: DuplicatasService) {}
}
