import { Body, Controller, Param, Post } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioDTO, UsuarioUpdateDTO } from './usuario.dto';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) { }

  @Post(':cnpj')
  async create(@Body() data: UsuarioDTO, @Param('cnpj') cnpj) {
    return this.usuarioService.create(data, cnpj);
  }

  @Post('update/:cnpj/:id')
  async Userupdate(@Body() data: UsuarioUpdateDTO, @Param('id') id, @Param('cnpj') cnpj) {
    // console.log('aqui');
    return this.usuarioService.updateUser(id, data, cnpj);
  }
}
