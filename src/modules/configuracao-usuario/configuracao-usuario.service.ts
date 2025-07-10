import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/datrabase/PrismaService';
import { CreateUsuarioConfiguracaoDto } from './DTO/configuser.dto';
@Injectable()
export class ConfiguracaoUsuarioService {
    constructor(private prisma: PrismaService) { }

    async create(coniguser:CreateUsuarioConfiguracaoDto,cnpj:string){

        const getEmpresa = await this.prisma.empresa.findFirst({
            where: {
                cnpj
            }
        });


        return await this.prisma.usuarioConfiguracao.create({
            data:{
                cfop:coniguser.cfop,
                idemp:getEmpresa.id,
                usuarioId:coniguser.usuarioId,
                serie:coniguser.serie,
                codproxnfe:coniguser.codproxnfe,
                numeroviaempressao:coniguser.numeroviaempressao
            }
        });

    }
}
