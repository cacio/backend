import { Body, Controller, Param, Post } from '@nestjs/common';
import { CondicoesPagamentoService } from './condicoes-pagamento.service';
import { CondicoesPagamentoDto } from './DTO/condigoespaganto.dto';
@Controller('condicoes-pagamento')
export class CondicoesPagamentoController {
  constructor(private readonly condicoesPagamentoService: CondicoesPagamentoService) {}

  @Post('findAll/:cnpj')
  async findAll(@Param() cnpj: string) {
    return this.condicoesPagamentoService.findAll(cnpj);
  }


  @Post(':cnpj')
  async create(@Body() data: CondicoesPagamentoDto, @Param('cnpj') cnpj: string) {
    console.log(data);
    return this.condicoesPagamentoService.create(data, cnpj);
  }
  @Post(':id')
  async update(@Param() id: string, data: CondicoesPagamentoDto) {
    return this.condicoesPagamentoService.update(id, data);
  }
  @Post('delete/:id')
  async delete(@Param() id: string) {
    return this.condicoesPagamentoService.delete(id);
  }

  @Post('lote/:cnpj')
  async createLote(@Body() data: CondicoesPagamentoDto[],@Param('cnpj') cnpj: string) {
    return this.condicoesPagamentoService.createLote(data, cnpj);
  }
}
