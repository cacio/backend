import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { RelatorioNfeService } from './relatorio-nfe.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('nfe')

export class RelatorioNfeController {
  constructor(private readonly relatorioNfeService: RelatorioNfeService) {}

  @Get('relatorio')
  async getRelatorio(
    @Query('empresaId') empresaId?: string,
    @Query('usuarioId') usuarioId?: string,
    @Query('dataInicial') dataInicial?: string,
    @Query('dataFinal') dataFinal?: string,
    @Query('situacao') situacao?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters = {
      empresaId,
      usuarioId,
      dataInicial: dataInicial ? new Date(dataInicial) : undefined,
      dataFinal: dataFinal ? new Date(dataFinal) : undefined,
      situacao,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    };

    return this.relatorioNfeService.getRelatorio(filters);
  }

  @Get('relatorio/export')
  async exportRelatorio(
    @Query('format') format: string,
    @Query('empresaId') empresaId?: string,
    @Query('usuarioId') usuarioId?: string,
    @Query('dataInicial') dataInicial?: string,
    @Query('dataFinal') dataFinal?: string,
    @Query('situacao') situacao?: string,
    @Res() res?: Response,
  ) {
    const filters = {
      empresaId,
      usuarioId,
      dataInicial: dataInicial ? new Date(dataInicial) : undefined,
      dataFinal: dataFinal ? new Date(dataFinal) : undefined,
      situacao,
    };

    if (format === 'excel') {
      return this.relatorioNfeService.exportToExcel(filters, res);
    } else if (format === 'pdf') {
      return this.relatorioNfeService.exportToPdf(filters, res);
    } else {
      return {
        success: false,
        message: 'Formato inválido. Use "excel" ou "pdf"'
      };
    }
  }
}
