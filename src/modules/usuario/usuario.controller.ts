import {Body, Controller,Post } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioDTO } from './usuario.dto';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  async create(@Body() data:UsuarioDTO){
    return this.usuarioService.create(data);
  }
}
