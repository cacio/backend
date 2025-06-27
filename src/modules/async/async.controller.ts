import { Body, Controller, Get, Param, Query } from '@nestjs/common';
import { AsyncService } from './async.service';

@Controller('async')
export class AsyncController {
  constructor(private readonly asyncService: AsyncService) {}
  @Get('pull')
  async Pull(@Query('lastPulledVersion') lastPulledVersion: string,@Query('cnpj') cnpj:string ,@Query('codrepre') codrepre:string ) {
    return this.asyncService.AsyncPull(lastPulledVersion,cnpj,codrepre);
  }
}
