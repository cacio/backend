import { Body, Controller, Post, Get, Put, Patch, Param, UseGuards } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { CreateEmpresaDto,UpdateEmpresaDto } from './DTO/empresa.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('empresa')
@UseGuards(AuthGuard)
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}
  @Post()
  create(@Body() empresa: CreateEmpresaDto) {
    return this.empresaService.createEmpresa(empresa);
  }

  @Get()
  findAll() {
    return this.empresaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.empresaService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() empresa: UpdateEmpresaDto) {
    return this.empresaService.update(id, empresa);
  }

  @Patch(':id/status')
  toggleStatus(@Param('id') id: string) {
    return this.empresaService.toggleStatus(id);
  }
}
