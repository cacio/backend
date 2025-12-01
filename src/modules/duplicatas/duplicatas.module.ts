import { Module } from '@nestjs/common';
import { DuplicatasService } from './duplicatas.service';
import { DuplicatasController } from './duplicatas.controller';

@Module({
  controllers: [DuplicatasController],
  providers: [DuplicatasService],
})
export class DuplicatasModule {}
