import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/datrabase/PrismaService';
import { CreateConfiguracaoNfeDto, UpdateConfiguracaoNfeDto } from './configuracao-nfe.dto';
import * as forge from 'node-forge';

@Injectable()
export class ConfiguracaoNfeService {
  constructor(private prisma: PrismaService) {}

  async findByEmpresa(empresaId: string): Promise<{ success: boolean; message?: string; data: Record<string, any> | null }> {
    const config = await this.prisma.configuracaoNFe.findUnique({
      where: { empresaId },
      select: {
        id: true,
        empresaId: true,
        tpAmb: true,
        versao: true,
        mailFrom: true,
        mailSmtp: true,
        mailUser: true,
        mailProtocol: true,
        mailPort: true,
        createdAt: true,
        updatedAt: true,
        // Não retornar certPfx, certPassword e mailPass por segurança
      },
    });

    if (!config) {
      return {
        success: false,
        message: 'Configuração não encontrada',
        data: null,
      };
    }

    // Buscar validade do certificado
    const validade = await this.getValidadeCertificadoInterno(config.id);

    return {
      success: true,
      data: {
        ...config,
        certificadoValidade: validade,
      },
    };
  }

  async create(empresaId: string, data: CreateConfiguracaoNfeDto, certBuffer: Buffer) {
    // Verificar se empresa existe
    const empresa = await this.prisma.empresa.findUnique({
      where: { id: empresaId },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // Verificar se já existe configuração
    const existing = await this.prisma.configuracaoNFe.findUnique({
      where: { empresaId },
    });

    if (existing) {
      throw new BadRequestException('Empresa já possui configuração de NF-e');
    }

    // Validar certificado
    try {
      const p12Asn1 = forge.asn1.fromDer(certBuffer.toString('binary'));
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, data.certPassword);
      // Se chegou aqui, o certificado é válido
    } catch (error) {
      throw new BadRequestException('Certificado inválido ou senha incorreta');
    }

    const config = await this.prisma.configuracaoNFe.create({
      data: {
        empresaId,
        tpAmb: parseInt(data.tpAmb),
        versao: data.versao,
        certPfx: certBuffer,
        certPassword: data.certPassword,
        mailFrom: data.mailFrom,
        mailSmtp: data.mailSmtp,
        mailUser: data.mailUser,
        mailPass: data.mailPass,
        mailProtocol: data.mailProtocol,
        mailPort: parseInt(data.mailPort),
      },
    });

    return {
      success: true,
      message: 'Configuração criada com sucesso',
      data: {
        id: config.id,
        empresaId: config.empresaId,
      },
    };
  }

  async update(id: string, data: UpdateConfiguracaoNfeDto, certBuffer?: Buffer) {
    const config = await this.prisma.configuracaoNFe.findUnique({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException('Configuração não encontrada');
    }

    const updateData: any = {};

    if (data.tpAmb) updateData.tpAmb = parseInt(data.tpAmb);
    if (data.versao) updateData.versao = data.versao;
    if (data.mailFrom) updateData.mailFrom = data.mailFrom;
    if (data.mailSmtp) updateData.mailSmtp = data.mailSmtp;
    if (data.mailUser) updateData.mailUser = data.mailUser;
    if (data.mailPass) updateData.mailPass = data.mailPass;
    if (data.mailProtocol) updateData.mailProtocol = data.mailProtocol;
    if (data.mailPort) updateData.mailPort = parseInt(data.mailPort);

    // Se enviou novo certificado
    if (certBuffer && data.certPassword) {
      // Validar certificado
      try {
        const p12Asn1 = forge.asn1.fromDer(certBuffer.toString('binary'));
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, data.certPassword);
        // Se chegou aqui, o certificado é válido
        updateData.certPfx = certBuffer;
        updateData.certPassword = data.certPassword;
      } catch (error) {
        throw new BadRequestException('Certificado inválido ou senha incorreta');
      }
    }

    await this.prisma.configuracaoNFe.update({
      where: { id },
      data: updateData,
    });

    return {
      success: true,
      message: 'Configuração atualizada com sucesso',
    };
  }

  async getValidadeCertificado(id: string) {
    const validade = await this.getValidadeCertificadoInterno(id);
    return {
      success: true,
      data: validade,
    };
  }

  private async getValidadeCertificadoInterno(id: string) {
    const config = await this.prisma.configuracaoNFe.findUnique({
      where: { id },
      select: {
        certPfx: true,
        certPassword: true,
      },
    });

    if (!config) {
      return null;
    }

    try {
      const p12Asn1 = forge.asn1.fromDer(config.certPfx.toString('binary'));
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, config.certPassword);

      // Extrair certificado
      const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
      const certBag = certBags[forge.pki.oids.certBag][0];
      const certificate = certBag.cert;

      const dataValidade = certificate.validity.notAfter;
      const hoje = new Date();
      const diasRestantes = Math.floor((dataValidade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

      return {
        dataValidade: dataValidade.toISOString(),
        diasRestantes,
        vencido: diasRestantes < 0,
        proximoVencimento: diasRestantes <= 30 && diasRestantes >= 0,
      };
    } catch (error) {
      return null;
    }
  }
}
