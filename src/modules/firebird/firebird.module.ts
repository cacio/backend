import { Module } from '@nestjs/common';
import { FirebirdService } from './firebird.service';
import { FirebirdController } from './firebird.controller';

@Module({
  controllers: [FirebirdController],
  providers: [FirebirdService],
})
export class FirebirdModule {}
