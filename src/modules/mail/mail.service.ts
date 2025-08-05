// src/modules/mail/mail.service.ts

import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { PrismaService } from 'src/datrabase/PrismaService'; // Ajuste o caminho se necessário

@Injectable()
export class MailService {
    // 1. Remova a propriedade 'transporter' daqui.
    // private transporter: Transporter;

    // 2. Injete o PrismaService no construtor.
    constructor(private prisma: PrismaService) {}

    // 3. Modifique o método para receber o CNPJ da empresa e buscar as configurações.
    async sendNfeEmail({
        to,
        subject,
        text,
        html,
        attachments,
        idEmpresa, // <-- Novo parâmetro essencial!
    }: {
        to: string;
        subject: string;
        text: string;
        html: string;
        attachments: { filename: string; content: Buffer | string; contentType: string }[];
        idEmpresa: string; // Adicionamos o CNPJ para buscar a configuração
    }) {
        try {
            // 4. Buscar a configuração de e-mail da empresa no banco de dados.
            const config = await this.prisma.empresa.findUnique({
                where: { id: idEmpresa },
                select: {
                    ConfiguracaoNFe: {
                        select: {
                            mailSmtp: true,
                            mailPort: true,
                            mailUser: true,
                            mailPass: true,
                            mailFrom: true, // O e-mail "De" (remetente)
                        },
                    },
                    xnome: true,
                    cnpj:true,
                },
            });

            // Validação das configurações encontradas
            if (!config?.ConfiguracaoNFe) {
                throw new NotFoundException(`Configurações de e-mail não encontradas para a empresa com CNPJ ${config.cnpj}.`);
            }

            const { mailSmtp, mailPort, mailUser, mailPass, mailFrom } = config.ConfiguracaoNFe;

            if (!mailSmtp || !mailPort || !mailUser || !mailPass) {
                throw new InternalServerErrorException(`As configurações de SMTP para a empresa ${config.cnpj} estão incompletas.`);
            }

            // 5. Criar um transporter dinâmico com as configurações do banco.
            const transporter: Transporter = nodemailer.createTransport({
                host: mailSmtp,
                port: mailPort,
                secure: mailPort === 465, // true para porta 465, false para as outras
                auth: {
                    user: mailUser,
                    pass: mailPass,
                },
                // Adiciona proteção contra certificados autoassinados, comum em servidores de teste
                tls: {
                    rejectUnauthorized: false
                }
            });

            // 6. Enviar o e-mail usando o transporter recém-criado.
            await transporter.sendMail({
                from: mailFrom, // Usa o email "De" configurado, ou o próprio usuário como fallback
                to: to,
                subject: subject,
                text: text,
                html: html,
                attachments: attachments,
            });

            console.log(`E-mail da NF-e (Empresa CNPJ: ${config.cnpj}) enviado com sucesso para: ${to}`);

        } catch (error) {
            console.error(`Falha ao enviar e-mail da NF-e para ${to} `, error.message);
            // Propaga o erro para que a rotina que chamou possa tratá-lo
            throw error;
        }
    }
}
