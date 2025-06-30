import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/datrabase/PrismaService';
import { CreateConfiguracaoNfeDto } from './DTO/create-configuracao-nfe.dto';
@Injectable()
export class ConfiguracaoService {
    constructor(private prisma: PrismaService) { }

    async salvarConfiguracaoComCertificado(certBuffer: Buffer, dto: CreateConfiguracaoNfeDto, cnpj: string) {

        try {

            const empresa = await this.prisma.empresa.findFirst({
                where: { cnpj: cnpj },
            });

            if (!empresa) {
                throw new HttpException(`Empresa com CNPJ ${cnpj} não encontrada`, HttpStatus.NOT_FOUND);
            }

            const config = await this.prisma.configuracaoNFe.upsert({
                where: { empresaId: empresa.id },
                update: {
                    tpAmb: Number(dto.tpAmb),
                    versao: dto.versao,
                    certPfx: certBuffer,
                    certPassword: dto.certPassword,
                    mailFrom: dto.mailFrom,
                    mailSmtp: dto.mailSmtp,
                    mailUser: dto.mailUser,
                    mailPass: dto.mailPass,
                    mailProtocol: dto.mailProtocol,
                    mailPort: Number(dto.mailPort),
                },
                create: {
                    empresa: { connect: { id: empresa.id } },
                    tpAmb: Number(dto.tpAmb),
                    versao: dto.versao,
                    certPfx: certBuffer,
                    certPassword: dto.certPassword,
                    mailFrom: dto.mailFrom,
                    mailSmtp: dto.mailSmtp,
                    mailUser: dto.mailUser,
                    mailPass: dto.mailPass,
                    mailProtocol: dto.mailProtocol,
                    mailPort: Number(dto.mailPort),
                },
            })

            throw new HttpException(
                {
                    msg: 'Salvo com sucesso!',
                    config
                },
                HttpStatus.CREATED,
            );

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {
                console.error('Error during push operation:', error);
                throw new HttpException(
                    'Ocorreu um erro durante a gravação',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }

    }
}
