import { Controller,UsePipes, ValidationPipe,HttpCode, Post, Body, Param } from '@nestjs/common';
import { ManifestoService } from './manifesto.service';
import { CreateManifestoDto } from './DTO/manifesto.dto';

@Controller('manifesto')
export class ManifestoController {
  constructor(private readonly manifestoService: ManifestoService) {}

  @Post(':cnpj')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(201)
  async createManifesto(@Body() dados:CreateManifestoDto,@Param('cnpj') cnpj:string){
    return this.manifestoService.create(dados,cnpj);
  }

  @Post('lote/:cnpj')
  @UsePipes(new ValidationPipe({ transform: true }))
  @HttpCode(201)
  async createLote(@Body() dados:CreateManifestoDto[],@Param('cnpj') cnpj:string){
    return this.manifestoService.createLote(dados,cnpj);
  }
}
