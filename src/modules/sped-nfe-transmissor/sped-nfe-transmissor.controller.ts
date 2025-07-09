import { Controller, Post,HttpCode, Param, Body,UsePipes, ValidationPipe } from '@nestjs/common';
import { SpedNfeTransmissorService } from './sped-nfe-transmissor.service';
import { TransmissaoNfeDto,CancelamentoDto,CartaCorrecaoDto,InutilizaDto } from './DTO/transmissao-nfe.dto';

@Controller('sped-nfe-transmissor')
export class SpedNfeTransmissorController {
  constructor(private readonly spedNfeTransmissorService: SpedNfeTransmissorService) {}

  @Post(':cnpj')
  @UsePipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }))
  @HttpCode(200)
  async TransmicaoNfe(@Body() dadosNFE:TransmissaoNfeDto[], @Param('cnpj') cnpj:string){
    return this.spedNfeTransmissorService.transmitirNFE(dadosNFE,cnpj);
  }
  @Post('cancelamento/:cnpj')
  @HttpCode(200)
  async CancelamentoNFe(@Body() dados:CancelamentoDto,@Param('cnpj') cnpj:string){
    return this.spedNfeTransmissorService.HandlerCancelamentoNFe(dados,cnpj);
  }

  @Post('cartacorrecao/:cnpj')
  @HttpCode(200)
  async cartaCorrecao(@Body() dados:CartaCorrecaoDto,@Param('cnpj') cnpj:string){
    return this.spedNfeTransmissorService.HandlerCartaCorrecao(dados,cnpj);
  }
  @Post('inutilizacao/:cnpj')
  @HttpCode(200)
  async InutlizacaoNFe(@Body() dados:InutilizaDto,@Param('cnpj') cnpj:string){
    return this.spedNfeTransmissorService.HandlerInutilizaNFe(dados,cnpj);
  }
}
