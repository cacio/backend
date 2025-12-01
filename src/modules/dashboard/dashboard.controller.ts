import { Controller,Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}
  @Get('estatisticas')
  async getEstatisticas() {
    return this.dashboardService.getEstatisticas();
  }
}
