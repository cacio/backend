import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FornecedorService } from './fornecedor.service';
import { CreateFornecedorDto, UpdateFornecedorDto } from './DTO/fornecedor.dto';

@Controller('fornecedor')
export class FornecedorController {
  constructor(private readonly fornecedorService: FornecedorService) {}
  @Post(':cnpj')
  create(@Body() fornecedor: CreateFornecedorDto, @Param('cnpj') cnpj: string) {
    return this.fornecedorService.create(fornecedor, cnpj);
  }

  @Post('lote/:cnpj')
  createLote(@Body() fornecedores: CreateFornecedorDto[], @Param('cnpj') cnpj: string) {
    return this.fornecedorService.createLote(fornecedores, cnpj);
  }

  @Post('update/:id/:cnpj')
  update(@Param('id') id: string, @Param('cnpj') cnpj: string, @Body() fornecedor: UpdateFornecedorDto) {
    return this.fornecedorService.update(id, cnpj, fornecedor);
  }

  @Post('delete/:id/:cnpj')
  delete(@Param('id') id: string, @Param('cnpj') cnpj: string) {
    return this.fornecedorService.delete(id, cnpj);
  }

  @Get(':cnpj')
  findOne(@Param('cnpj') cnpj: string) {
    return this.fornecedorService.getFornecedores(cnpj);
  }
}
