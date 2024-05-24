import { Module } from '@nestjs/common';
import { AsyncService } from './async.service';
import { AsyncController } from './async.controller';
import { PrismaService } from 'src/datrabase/PrismaService';
@Module({
  controllers: [AsyncController],
  providers: [AsyncService,PrismaService],
})
export class AsyncModule {}
