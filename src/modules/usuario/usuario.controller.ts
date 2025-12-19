import { Body, Controller, Param, Post, Get, Patch, Delete, UseGuards } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioDTO, UsuarioUpdateDTO, VincularEmpresasDTO,UpdateUsuarioDto,CreateUsuarioDto } from './usuario.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('usuario')
@UseGuards(AuthGuard)
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) { }

  @Post(':cnpj')
  async create(@Body() data: CreateUsuarioDto, @Param('cnpj') cnpj: string) {
    return this.usuarioService.create(cnpj, data);
  }

  @Get()
  async findAll() {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usuarioService.findOneById(id);
  }

  @Post('update/:cnpj/:id')
  async Userupdate(@Body() data: UsuarioUpdateDTO, @Param('id') id: string, @Param('cnpj') cnpj: string) {
    return this.usuarioService.updateUser(id, data, cnpj);
  }

  @Post('updateUser/:cnpj/:id')
  async update(@Body() data: UpdateUsuarioDto, @Param('id') id: string, @Param('cnpj') cnpj: string) {
    return this.usuarioService.update(id, cnpj, data);
  }

  @Patch(':id/status')
  async toggleStatus(@Param('id') id: string) {
    return this.usuarioService.toggleStatus(id);
  }

  @Get(':id/empresas')
  async getEmpresas(@Param('id') id: string) {
    return this.usuarioService.getUsuarioEmpresas(id);
  }

  @Post(':id/empresas')
  async vincularEmpresas(@Param('id') id: string, @Body() data: VincularEmpresasDTO) {
    return this.usuarioService.vincularEmpresas(id, data.empresaIds);
  }

  @Delete(':usuarioId/empresas/:empresaId')
  async desvincularEmpresa(@Param('usuarioId') usuarioId: string, @Param('empresaId') empresaId: string) {
    return this.usuarioService.desvincularEmpresa(usuarioId, empresaId);
  }
}
