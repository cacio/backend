import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/datrabase/PrismaService';
import { Response } from 'express';

interface RelatorioFilters {
  empresaId?: string;
  usuarioId?: string;
  dataInicial?: Date;
  dataFinal?: Date;
  situacao?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class RelatorioNfeService {
  constructor(private prisma: PrismaService) {}

  /**
   * =============================================
   *   FUNÇÃO PRINCIPAL: GET RELATÓRIO
   * =============================================
   */
  async getRelatorio(filters: RelatorioFilters) {
    try {
      let {
        empresaId,
        usuarioId,
        dataInicial,
        dataFinal,
        situacao,
        page = 1,
        limit = 50,
      } = filters;

      const where: any = {};

      // ------------------------------------------
      //  FILTRO DIRETO POR EMPRESA
      // ------------------------------------------
      if (empresaId) {
        where.idemp = empresaId;
      }

      // ------------------------------------------
      //  FILTRO POR DATA
      // ------------------------------------------
      if (dataInicial || dataFinal) {
        where.nfe_dtemis = {};

        if (dataInicial) where.nfe_dtemis.gte = dataInicial;
        if (dataFinal) where.nfe_dtemis.lte = dataFinal;
      }

      // ------------------------------------------
      //  FILTRAR EMPRESAS POR USUÁRIO
      // ------------------------------------------
      if (usuarioId) {
        const empresasDoUsuario = await this.prisma.usuarioEmpresa.findMany({
          where: { usuarioId },
          select: { empresaId: true },
        });

        const empresaIds = empresasDoUsuario.map((e) => e.empresaId);

        if (empresaIds.length === 0) {
          return {
            success: true,
            data: [],
            pagination: { total: 0, page, limit, totalPages: 0 },
          };
        }

        // Se já tinha empresaId no filtro, faz interseção
        if (empresaId) {
          if (!empresaIds.includes(empresaId)) {
            return {
              success: true,
              data: [],
              pagination: { total: 0, page, limit, totalPages: 0 },
            };
          }
        } else {
          where.idemp = { in: empresaIds };
        }
      }

      const skip = (page - 1) * limit;

      /**
       * =============================================
       *   BUSCA PRINCIPAL
       * =============================================
       */
      const [nfes, total] = await Promise.all([
        this.prisma.nfe.findMany({
          where,
          include: {
            empresa: {
              select: { id: true, xnome: true, xfant: true, cnpj: true },
            },
            fornecedor: {
              select: { codigo: true, xnome: true, cnpj: true },
            },
            nfe_evento: {
              orderBy: { data_evento: 'desc' },
              take: 1,
            },
          },
          orderBy: { nfe_dtemis: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.nfe.count({ where }),
      ]);

      /**
       * =============================================
       *   FORMATAÇÃO DO RESULTADO
       * =============================================
       */
      const situacoesPermitidas: Record<string, string> = {
        '100': 'Autorizada',
        '150': 'Autorizada',
        '101': 'Cancelada',
        '135': 'Cancelada',
        '110': 'Denegada',
        '301': 'Denegada',
        '302': 'Denegada',
      };

      const dados = nfes
        .map((nfe) => {
          const ultimoEvento = nfe.nfe_evento[0];
          let situacaoNfe = 'Emitida';

          if (ultimoEvento) {
            const cstat = ultimoEvento.cstat;
            if (situacoesPermitidas[cstat]) {
              situacaoNfe = situacoesPermitidas[cstat];
            } else if (cstat?.startsWith('2') || cstat?.startsWith('3')) {
              situacaoNfe = 'Rejeitada';
            }
          }

          // Filtrar situação solicitada
          if (
            situacao &&
            situacaoNfe.toLowerCase() !== situacao.toLowerCase()
          ) {
            return null;
          }

          return {
            id: nfe.id,
            numero: nfe.nfe_numeracao,
            serie: nfe.nfe_serie,
            dataEmissao: nfe.nfe_dtemis,
            valorTotal: nfe.nfe_total_nota,

            empresa: {
              id: nfe.empresa?.id || null,
              nome: nfe.empresa?.xnome || '',
              nomeFantasia: nfe.empresa?.xfant || '',
              cnpj: nfe.empresa?.cnpj || '',
            },

            fornecedor: {
              codigo: nfe.fornecedor?.codigo || '',
              nome: nfe.fornecedor?.xnome || '',
              cnpj: nfe.fornecedor?.cnpj || '',
            },

            situacao: situacaoNfe,
            protocolo: ultimoEvento?.protocolo || '',
            chaveAcesso: ultimoEvento?.chave_acesso || '',
          };
        })
        .filter((x) => x !== null);

      return {
        success: true,
        data: dados,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * =============================================
   *   EXPORTAÇÃO PARA CSV (EXCEL)
   * =============================================
   */
  async exportToExcel(filters: RelatorioFilters, res: Response) {
    try {
      const result = await this.getRelatorio({
        ...filters,
        page: 1,
        limit: 999999,
      });

      if (!result.success) return res.status(400).json(result);

      const dados = result.data;

      let csv =
        'Número;Série;Data Emissão;Valor Total;Empresa;CNPJ Empresa;Fornecedor;CNPJ Fornecedor;Situação;Protocolo;Chave de Acesso\n';

      dados.forEach((nfe: any) => {
        csv += `${nfe.numero};${nfe.serie};${nfe.dataEmissao};${nfe.valorTotal};${nfe.empresa.nome};${nfe.empresa.cnpj};${nfe.fornecedor.nome};${nfe.fornecedor.cnpj};${nfe.situacao};${nfe.protocolo};${nfe.chaveAcesso}\n`;
      });

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=relatorio-nfe.csv',
      );

      return res.send('\uFEFF' + csv);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * =============================================
   *   EXPORTAÇÃO PARA PDF
   * =============================================
   */
  async exportToPdf(filters: RelatorioFilters, res: Response) {
    return res.status(501).json({
      success: false,
      message:
        'Exportação para PDF requer biblioteca adicional (pdfkit ou puppeteer).',
    });
  }
}
