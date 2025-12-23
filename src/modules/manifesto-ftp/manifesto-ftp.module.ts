import { Module } from '@nestjs/common';
import { ManifestoFtpService } from './manifesto-ftp.service';
import { ManifestoFtpController } from './manifesto-ftp.controller';

@Module({
  controllers: [ManifestoFtpController],
  providers: [ManifestoFtpService],
})
export class ManifestoFtpModule {}
