import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfiguracaoNfeService } from './configuracao-nfe.service';
import { CreateConfiguracaoNfeDto, UpdateConfiguracaoNfeDto } from './configuracao-nfe.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('configuracao-nfe')
@UseGuards(AuthGuard)
export class ConfiguracaoNfeController {
  constructor(private readonly configuracaoNfeService: ConfiguracaoNfeService) {}

  @Get('empresa/:empresaId')
  async getByEmpresa(@Param('empresaId') empresaId: string) {
    return this.configuracaoNfeService.findByEmpresa(empresaId);
  }

  @Post('empresa/:empresaId')
  @UseInterceptors(FileInterceptor('certificado'))
  async create(
    @Param('empresaId') empresaId: string,
    @Body() data: CreateConfiguracaoNfeDto,
    @UploadedFile() certificado?: Express.Multer.File
  ) {
    if (!certificado) {
      throw new BadRequestException('Certificado digital é obrigatório');
    }

    return this.configuracaoNfeService.create(empresaId, data, certificado.buffer);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('certificado'))
  async update(
    @Param('id') id: string,
    @Body() data: UpdateConfiguracaoNfeDto,
    @UploadedFile() certificado?: Express.Multer.File
  ) {
    const certBuffer = certificado ? certificado.buffer : undefined;
    return this.configuracaoNfeService.update(id, data, certBuffer);
  }

  @Get(':id/validade-certificado')
  async getValidadeCertificado(@Param('id') id: string) {
    return this.configuracaoNfeService.getValidadeCertificado(id);
  }
}
