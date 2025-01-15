import { Controller, Get, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { RelatoriosService } from './relatorios.service';
import { NotaDeEntradaDto, ObterNotasDeEntradaDto } from './DTO/relatorio.dto';

@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly relatoriosService: RelatoriosService) {}

  @Get('canhoto')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getNotasDeEntrada(
    @Query() query: ObterNotasDeEntradaDto,
  ): Promise<NotaDeEntradaDto[]> {
    return this.relatoriosService.RelatorioCanhoto(query);
  }

}
