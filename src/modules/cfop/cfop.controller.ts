import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CfopService } from './cfop.service';
import { CfopDto } from './DTO/cfop.dto';

@Controller('cfop')
export class CfopController {
  constructor(private readonly cfopService: CfopService) {}

  // Endpoint to find all CFOPs for a given CNPJ
  @Get('findAll/:cnpj')
  async findAll(@Param('cnpj') cnpj: string) {
    return this.cfopService.findAll(cnpj);
  }
  // Endpoint to find a specific CFOP by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.cfopService.findOne(id);
  }
  // Endpoint to create a new CFOP
  @Post(':cnpj')
  async create(@Param('cnpj') cnpj: string,@Body() data: CfopDto) {
    return this.cfopService.create(cnpj, data);
  }
  // Endpoint to update an existing CFOP by ID
  @Post('update/:id')
  async update(@Param('id') id: string,@Body() data: CfopDto) {
    return this.cfopService.update(id, data);
  }

}
