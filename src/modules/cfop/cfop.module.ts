import { Module } from '@nestjs/common';
import { CfopService } from './cfop.service';
import { CfopController } from './cfop.controller';

@Module({
  controllers: [CfopController],
  providers: [CfopService],
})
export class CfopModule {}
