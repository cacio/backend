import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/datrabase/PrismaService';
@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) {}
    async getEstatisticas() {
    try {
      // Contar empresas
      const totalEmpresas = await this.prisma.empresa.count();

      // Contar usuários ativos
      const totalUsuariosAtivos = await this.prisma.usuario.count({
        where: {
          user_ativo: 'S',
        },
      });

      // Contar total de NF-e
      const totalNfe = await this.prisma.nfe.count();

      // Contar NF-e do mês atual
      const hoje = new Date();
      const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);

      const nfeEsteMes = await this.prisma.nfe.count({
        where: {
          nfe_dtemis: {
            gte: primeiroDiaMes,
            lte: ultimoDiaMes,
          },
        },
      });

      return {
        success: true,
        data: {
          totalEmpresas,
          totalUsuariosAtivos,
          totalNfe,
          nfeEsteMes,
        },
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        success: false,
        message: 'Erro ao buscar estatísticas',
        data: {
          totalEmpresas: 0,
          totalUsuariosAtivos: 0,
          totalNfe: 0,
          nfeEsteMes: 0,
        },
      };
    }
  }
}
