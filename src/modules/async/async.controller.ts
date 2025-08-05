import {
  Body, Controller, Get, Param, Query, HttpException,
  HttpStatus,
  Post
} from '@nestjs/common';
import { AsyncService } from './async.service';
import { AsyncPushDto } from './DTO/async-push.dto';

@Controller('async')
export class AsyncController {
  constructor(private readonly asyncService: AsyncService) { }
  @Get('pull')
  async Pull(@Query('lastPulledVersion') lastPulledVersion: string, @Query('cnpj') cnpj: string, @Query('codrepre') codrepre: string) {
    return this.asyncService.AsyncPull(lastPulledVersion, cnpj, codrepre);
  }

  @Post('async-push')
  async asyncPush(@Body() body: AsyncPushDto) {
    console.log('🟡 Recebendo dados de sincronização...');
    await this.asyncService.AsyncPush(body);
  }

}
