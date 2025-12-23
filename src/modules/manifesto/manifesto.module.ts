import { Module } from '@nestjs/common';
import { ManifestoService } from './manifesto.service';
import { ManifestoController } from './manifesto.controller';
import { ManifestoFtpService } from '../manifesto-ftp/manifesto-ftp.service';
@Module({
  controllers: [ManifestoController],
  providers: [ManifestoService,ManifestoFtpService],
})
export class ManifestoModule {}
