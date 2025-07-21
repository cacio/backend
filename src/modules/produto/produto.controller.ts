import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProdutoService } from './produto.service';
import { CreateProdutoDto, UpdateProdutoDto } from './DTO/produto.dto';

@Controller('produto')
export class ProdutoController {
  constructor(private readonly produtoService: ProdutoService) {}

  @Post(':cnpj')
  async create(@Body() data: CreateProdutoDto, @Param('cnpj') cnpj: string){
    return this.produtoService.create(data, cnpj);
  }

  @Post('sync/:cnpj')
  async createLote(@Body() data: any[], @Param('cnpj') cnpj: string){
    return this.produtoService.CreateLote(data, cnpj);
  }

  @Post('update/:cnpj/:id')
  async update(@Param('id') id: string, @Body() data: UpdateProdutoDto, @Param('cnpj') cnpj: string){
    return this.produtoService.update(id, cnpj, data);
  }
  @Post('delete/:cnpj/:id')
  async delete(@Param('id') id: string, @Param('cnpj') cnpj: string){
    return this.produtoService.delete(id, cnpj);
  }

  @Get(':cnpj')
  async findAll(@Param('cnpj') cnpj: string){
    return this.produtoService.findAll(cnpj);
  }

}
