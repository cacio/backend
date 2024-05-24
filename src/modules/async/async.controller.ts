import { Controller } from '@nestjs/common';
import { AsyncService } from './async.service';

@Controller('async')
export class AsyncController {
  constructor(private readonly asyncService: AsyncService) {}
}
