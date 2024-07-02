import { Controller, Get, Query } from '@nestjs/common';
import { AsyncService } from './async.service';

@Controller('async')
export class AsyncController {
  constructor(private readonly asyncService: AsyncService) {}
  @Get('pull')
  async Pull(@Query('lastPulledVersion')lastPulledVersion: string) {
    return this.asyncService.AsyncPull(lastPulledVersion);
  }
}
