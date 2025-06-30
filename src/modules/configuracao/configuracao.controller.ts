import { Controller,HttpCode, Post, Body,  UploadedFile,  UseInterceptors, Param} from '@nestjs/common';
import { ConfiguracaoService } from './configuracao.service';
import { FileInterceptor } from '@nestjs/platform-express'
import { CreateConfiguracaoNfeDto } from './DTO/create-configuracao-nfe.dto';

@Controller('configuracao')
export class ConfiguracaoController {
  constructor(private readonly configuracaoService: ConfiguracaoService) {}

  @Post('upload-certificado/:cnpj')
  @UseInterceptors(FileInterceptor('certificado'))
  @HttpCode(201)
  async uploadCertificado(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateConfiguracaoNfeDto,
    @Param('cnpj') cnpj: string
  ) {
    console.log(cnpj);
    return this.configuracaoService.salvarConfiguracaoComCertificado(file.buffer,body,cnpj);
  }

}
