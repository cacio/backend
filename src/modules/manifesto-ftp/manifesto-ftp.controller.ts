import { Controller } from '@nestjs/common';
import { ManifestoFtpService } from './manifesto-ftp.service';

@Controller('manifesto-ftp')
export class ManifestoFtpController {
  constructor(private readonly manifestoFtpService: ManifestoFtpService) {}
}
