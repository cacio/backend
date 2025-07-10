import { Body, Controller, Param, Post } from '@nestjs/common';
import { ConfiguracaoUsuarioService } from './configuracao-usuario.service';
import { CreateUsuarioConfiguracaoDto } from './DTO/configuser.dto';
@Controller('configuracao-usuario')
export class ConfiguracaoUsuarioController {
  constructor(private readonly configuracaoUsuarioService: ConfiguracaoUsuarioService) {}

  @Post(':cnpj')
  async create(@Body() data: CreateUsuarioConfiguracaoDto, @Param('cnpj') cnpj){
    return this.configuracaoUsuarioService.create(data,cnpj);
  }
}
