import { Module } from '@nestjs/common';
import { CfopService } from './cfop.service';
import { CfopController } from './cfop.controller';
import { PrismaService } from 'src/datrabase/PrismaService';
@Module({
  controllers: [CfopController],
  providers: [CfopService,PrismaService],
})
export class CfopModule {}
