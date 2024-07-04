import { Body, Controller, Post } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { CreateEmpresaDto } from './DTO/empresa.dto';

@Controller('empresa')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}
  @Post()
  create(@Body() empresa: CreateEmpresaDto) {
    return this.empresaService.createEmpresa(empresa);
  }
}
