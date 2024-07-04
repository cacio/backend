import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/datrabase/PrismaService';
import { CreateEmpresaDto } from './DTO/empresa.dto';

@Injectable()
export class EmpresaService {
    constructor(private prisma:PrismaService){}

    async createEmpresa(empresa:CreateEmpresaDto){
        try {
            const empresaExists = await this.prisma.empresa.findFirst({
                where:{
                    cnpj: empresa.cnpj
                }
            });

            if(empresaExists){
                throw new Error('CNPJ já cadastrado');
            }

            return await this.prisma.empresa.create({
                data: empresa
            });

        } catch (error) {
             return {
                mensage: error.message
            }
        }


    }

}
