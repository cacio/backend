import { Module } from '@nestjs/common';
import { SpedNfeTransmissorService } from './sped-nfe-transmissor.service';
import { SpedNfeTransmissorController } from './sped-nfe-transmissor.controller';
import { MailService } from '../mail/mail.service';
@Module({
  controllers: [SpedNfeTransmissorController],
  providers: [SpedNfeTransmissorService,MailService],
})
export class SpedNfeTransmissorModule {}
