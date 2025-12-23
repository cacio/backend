import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/datrabase/PrismaService';
import { ManifestoFtpService,NotaFiscalPayload } from '../manifesto-ftp/manifesto-ftp.service';
import { Make, Tools, xml2json, Complements, UF2cUF } from 'node-sped-nfe-custom';
import { join } from 'path'
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as xmljs from 'xml-js';

import { TransmissaoNfeDto, CancelamentoDto, CartaCorrecaoDto, InutilizaDto } from './DTO/transmissao-nfe.dto';
import { formatInTimeZone, format } from 'date-fns-tz';
import { limparCamposZero } from '../../utils/limpar-campos-zero';
import { MailService } from '../mail/mail.service';
import { DANFe } from 'node-sped-pdf';
const EVT_CANCELA = '110111';
const EVT_CANCELASUBSTITUICAO = '110112';

// @ts-ignore: No type declarations available for 'node-sped-pdf'
@Injectable()
export class SpedNfeTransmissorService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
        private readonly manifestoFtpService: ManifestoFtpService
    ) { }

    async transmitirNFE(dadosNFE: TransmissaoNfeDto[], cnpj: string) {
        try {
            const empresa = await this.prisma.empresa.findFirst({
                where: { cnpj: cnpj },
                include: {
                    ConfiguracaoNFe: true
                }
            });

            if (!empresa) {
                throw new HttpException(`Empresa com CNPJ ${cnpj} não encontrada`, HttpStatus.NOT_FOUND);
            }

            const xmllintPath = join(process.cwd(), 'src', 'modules', 'sped-nfe-transmissor', 'libs', 'libxml', 'bin', 'xmllint.exe')
            const opensslPath = join(process.cwd(), 'src', 'modules', 'sped-nfe-transmissor', 'libs', 'openssl', 'bin', 'openssl.exe')
            const certBuffer = Buffer.isBuffer(empresa.ConfiguracaoNFe.certPfx)
                ? empresa.ConfiguracaoNFe.certPfx
                : Buffer.from(empresa.ConfiguracaoNFe.certPfx as any)

            // Cria um caminho temporário único para o arquivo .pfx
            const tempPfxPath = path.join(os.tmpdir(), `cert-${empresa.cnpj}.pfx`);

            fs.writeFileSync(tempPfxPath, new Uint8Array(certBuffer));

            let eTools = new Tools({
                mod: '55',
                //xmllint: xmllintPath, // path to xmllint para local windows
                xmllint: '/usr/bin/xmllint', // path to xmllint para linux
                UF: empresa.uf,
                tpAmb: 2,
                CSC: '', // Código de Segurança do Contribuinte (emissor)
                CSCid: '', // Identificador do CSC
                versao: '4.00',
                timeout: 60000,
                //openssl: opensslPath as any,
                openssl: null,
                CPF: '',
                CNPJ: empresa.cnpj // use the CNPJ from the empresa object
            }, {
                pfx: tempPfxPath,
                senha: empresa.ConfiguracaoNFe.certPassword
            });

            // Aqui usamos await para esperar a resposta
            const statusResponse = await eTools.sefazStatus();

            const json = await xml2json(statusResponse) as { retConsStatServ?: any, [key: string]: any };

            const ret = json.retConsStatServ || json['retConsStatServ'];

            if (!ret) {
                throw new HttpException('Resposta inválida da SEFAZ', HttpStatus.INTERNAL_SERVER_ERROR);
            }

            if (ret.cStat !== '107') {
                throw new HttpException(`SEFAZ não está em operação: ${ret.xMotivo}`, HttpStatus.SERVICE_UNAVAILABLE);
            }

            const resultados = [];
            for (const transmissao of dadosNFE) {

                try {
                    let NFe = new Make();

                    const jaExiste = await this.prisma.nfe_evento.findFirst({
                        where: {
                            numero_nfe: transmissao.nfe.id,
                            codigo_nfe: transmissao.nfe.nfe_codigo,
                            cstat: '100', // NF-e autorizada
                            serie:transmissao.nfe.nfe_serie
                        }
                    });

                    if (jaExiste) {
                        // mandar a nota para o sistema legado
                        const notaPayload: NotaFiscalPayload[] = [
                            {
                                series: transmissao.manifestos[0].codrepresentante,
                                chave_acesso: jaExiste?.chave_acesso,
                                xml: jaExiste.caminho_xml,
                            },
                        ];
                        const nomepasta = await this.pegarTresPrimeirosSemEspaco(empresa.xnome);
                        const resultado = await this.manifestoFtpService.enviarNotaParaSistemaLegado(
                            nomepasta.toLowerCase(),
                            notaPayload,
                            );

                        const retornoCompleto = {
                            retEnviNFe: {
                                tpAmb: empresa.ConfiguracaoNFe.tpAmb,
                                verAplic: "",
                                cStat: '104',
                                xMotivo: 'Lote processado',
                                cUF: empresa.cmun?.toString().substring(0, 2) || '43',
                                dhRecbto: jaExiste.data_evento,
                                protNFe: {
                                    infProt: {
                                        tpAmb: empresa.ConfiguracaoNFe.tpAmb,
                                        verAplic: "",
                                        chNFe: jaExiste.chave_acesso,
                                        dhRecbto: jaExiste.data_evento,
                                        nProt: jaExiste.protocolo,
                                        digVal: jaExiste.digVal,
                                        cStat: jaExiste.cstat,
                                        xMotivo: jaExiste.xmotivo,
                                    },
                                    '@versao': '4.00'
                                },
                                '@versao': '4.00',
                                '@xmlns': 'http://www.portalfiscal.inf.br/nfe'
                            }
                        }
                        resultados.push({
                            nfe_codigo: transmissao.nfe.nfe_codigo,
                            idnfe: transmissao.nfe.id,
                            xml: jaExiste.caminho_xml,
                            ideventos: jaExiste.id,
                            retorno: JSON.stringify(retornoCompleto),
                            status: 'sucesso',
                            erro: '',
                        });

                        continue; // pula para o próximo sem enviar novamente
                    }

                    NFe.tagInfNFe({ Id: null, versao: '4.00' });

                    const cfop = await this.prisma.cfop_natura.findFirst({
                        where: {
                            Codigo: transmissao.nfe.nfe_natureza_operacao
                        }
                    });

                    const chaveManifeto = await this.prisma.tb_manifestos.findFirst({
                        where: {
                            n_manifesto: transmissao.nfe.nfe_manifesto,
                            idemp: empresa.id
                        }
                    });

                    console.log("data emissão: ", format(new Date(transmissao.nfe.nfe_dtemis), "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: 'America/Sao_Paulo' }));
                    console.log("data emissão2: ", transmissao.nfe.nfe_dtemis);

                    const timeZone = 'America/Sao_Paulo';
                    const formatString = "yyyy-MM-dd'T'HH:mm:ssXXX";
                    const dataemissao = formatInTimeZone(transmissao.nfe.nfe_dtemis, timeZone, formatString);
                    console.log("numeracao: ", transmissao.nfe.nfe_numeracao);

                    NFe.tagIde({
                        cUF: String(empresa.cmun).substring(0, 2),
                        cNF: String(transmissao.nfe.nfe_numeracao).padStart(8, "0"),
                        natOp: cfop.Nome,
                        mod: "55",
                        serie: String(Number(transmissao.nfe.nfe_serie)),
                        nNF: Number(transmissao.nfe.nfe_codigo),
                        dhEmi: dataemissao,
                        tpNF: "1",
                        idDest: "1",
                        cMunFG: empresa.cmun,
                        tpImp: "3",
                        tpEmis: "1",
                        cDV: "1",
                        tpAmb: empresa.ConfiguracaoNFe.tpAmb,
                        finNFe: "1",
                        indFinal: "0",
                        indPres: "9",
                        indIntermed: "0",
                        procEmi: "0",
                        verProc: "4.13"
                    });

                    //NFe.tagRefNFe(chaveManifeto.chave_acesso);
                    NFe.tagEmit({
                        CNPJ: empresa.cnpj,
                        xNome: empresa.xnome,
                        xFant: empresa.xfant,
                        IE: empresa.ie,
                        CRT: empresa.crt
                    });

                    const enderecoEmitente = Object.entries({
                        xLgr: empresa.xlgr,
                        nro: String(empresa.nro).trim(),
                        xBairro: empresa.xbairro,
                        cMun: empresa.cmun,
                        xMun: empresa.xmun,
                        UF: empresa.uf,
                        CEP: empresa.cep,
                        cPais: empresa.cpais,
                        xPais: empresa.xpais,
                        fone: empresa.fone
                    }).reduce((acc, [key, value]) => {
                        if (value !== null && value !== undefined && value !== '') {
                            acc[key] = value;
                        }
                        return acc;
                    }, {} as Record<string, any>);

                    NFe.tagEnderEmit(enderecoEmitente);

                    const clienteDest = await this.prisma.fornecedor.findUnique({
                        where: {
                            codigo: transmissao.nfe.fornecedor_codigo,
                            idemp: empresa.id
                        }
                    })

                    //console.log(clienteDest);
                    if (!clienteDest) {
                        throw new HttpException(`Cliente com código ${transmissao.nfe.fornecedor_codigo} não encontrado`, HttpStatus.NOT_FOUND);
                    }
                    NFe.tagDest({
                        ...(this.isCpf(clienteDest.cpf)
                            ? { CPF: clienteDest.cpf }
                            : { CNPJ: clienteDest.cnpj }),
                        xNome: `(${clienteDest.cod_retaquarda}) ${clienteDest.xnome}`,
                        indIEDest: clienteDest.ie ? 1 : 2,
                        IE: clienteDest.ie || undefined,
                        ...(clienteDest.email && { email: clienteDest.email })
                    });


                    NFe.tagEnderDest({
                        xLgr: String(clienteDest.xlgr).trim().toUpperCase(),
                        nro: this.limpaCampoValorNFe(String(clienteDest.nro).trim()),
                        xBairro: String(clienteDest.xbairro).trim().toUpperCase(),
                        cMun: clienteDest.cmun,
                        xMun: String(clienteDest.xmun).trim().toUpperCase(),
                        UF: String(clienteDest.uf).trim().toUpperCase(),
                        CEP: clienteDest.cep,
                        cPais: clienteDest.cpais,
                        xPais: clienteDest.xpais
                    });


                    const produtos = transmissao.produtos;


                    let tot_prod_voutros = 0;
                    let obsitemfator = '';
                    const listaProdutos = await Promise.all(
                        produtos.map(async (p, index) => {
                            const dadosproduto = await this.prisma.produtos.findUnique({
                                where: {
                                    codigo: p.produtos_codigo,
                                    idemp: empresa.id
                                }
                            });

                            const valor_qv = parseFloat(String(p.nfe_quantidade)) * parseFloat(String(p.nfe_valorunitario));
                            const vator = parseFloat(String(transmissao.nfe.nfe_voutros)) / parseFloat(String(transmissao.nfe.nfe_total_produtos));
                            const prod_voutros = parseFloat((vator * valor_qv).toFixed(2));
                            tot_prod_voutros += prod_voutros;
                            obsitemfator += p.nfe_infadprod;
                            const dadosmanifesto = transmissao.manifestos.find((mani) =>
                                mani.n_manifesto == transmissao.nfe.nfe_manifesto && mani.cod_produto == dadosproduto.cprod
                            );

                            //console.log(dadosmanifesto,' - ',transmissao.nfe.nfe_manifesto,' - ',dadosproduto.cprod);
                            const numeromanifesto = await this.somenteNumeros(transmissao.nfe.nfe_manifesto.substring(0, 15) || '');
                            return limparCamposZero({
                                cProd: String(dadosproduto.cprod).trim(),
                                cEAN: dadosproduto?.cean == '0' || dadosproduto?.cean == '' ? 'SEM GTIN' : dadosproduto?.cean,
                                xProd: dadosproduto?.xprod ?? '',
                                NCM: String(dadosproduto?.ncm ?? '').padStart(8, "0"),
                                cBenef: cfop?.CBENEF || dadosproduto?.CBENEF || '',
                                //EXTIPI: '',
                                CFOP: p.nfe_cfop,
                                uCom: dadosproduto?.unMedida + "M",
                                qCom: p.nfe_quantidade,
                                vUnCom: p.nfe_valorunitario,
                                vProd: p.nfe_subtotal,
                                cEANTrib: String(dadosproduto?.ceantrib).trim() ?? 'SEM GTIN',
                                uTrib: dadosproduto?.unMedida + "M",
                                qTrib: p.nfe_quantidade,
                                vUnTrib: p.nfe_valorunitario,
                                //vFrete: Number(0).toFixed(2),
                                //vSeg: Number(0).toFixed(2),
                                //vDesc: Number(0).toFixed(2),
                                vOutro: parseFloat(String(prod_voutros)) || Number(0).toFixed(2),
                                indTot: 1,
                                xPed: numeromanifesto || '0',
                                nItemPed: dadosmanifesto?.n_item || '0',
                                //nFCI: ''
                            });
                        })
                    );

                    //console.log(listaProdutos);
                    NFe.tagProd(listaProdutos);

                    for (let index = 0; index < produtos.length; index++) {
                        const p = produtos[index];
                        //console.log(p);
                        const dadosproduto = await this.prisma.produtos.findUnique({
                            where: {
                                codigo: p.produtos_codigo,
                                idemp: empresa.id
                            }
                        });


                        let csticms = '';
                        let aliquotaICMS = 0;
                        let AliquotaICMSST_MVA = 0;
                        let percRedBcICMS = 0;
                        let CSTIPI = 0;
                        let AliquotaIpi = 0;
                        let CSTPISCOFINS = 0;
                        let AliquotaPis = 0;
                        let AliquotaCofins = 0;
                        if (cfop.calculasn == 'N') {
                            csticms = String(cfop.CSTICMS);
                            aliquotaICMS = 0;
                            AliquotaICMSST_MVA = 0;
                            percRedBcICMS = 0;
                            CSTIPI = cfop.CSTIPI;
                            AliquotaIpi = 0;
                            CSTPISCOFINS = cfop.CSTPISCOFINS;
                            AliquotaPis = 0;
                            AliquotaCofins = 0;
                        } else {
                            csticms = Number(cfop.aliquotaICMS) > 0 ? String(cfop.CSTICMS) : String(dadosproduto.CSTICMS);
                            aliquotaICMS = Number(cfop.aliquotaICMS) > 0 ? Number(cfop.aliquotaICMS) : dadosproduto.aliquotaICMS;
                            AliquotaICMSST_MVA = Number(cfop.AliquotaICMSST_MVA) > 0 ? Number(cfop.AliquotaICMSST_MVA) : dadosproduto.AliquotaICMSST_MVA;
                            percRedBcICMS = Number(cfop.percRedBcICMS) > 0 ? Number(cfop.percRedBcICMS) : dadosproduto.percRedBcICMSST;
                            CSTIPI = cfop.percBcIpi > 0 ? cfop.CSTIPI : dadosproduto.CSTIPI;
                            AliquotaIpi = cfop.AliquotaIpi > 0 ? cfop.AliquotaIpi : dadosproduto.AliquotaIpi;
                            CSTPISCOFINS = cfop.percRedBcICMS > 0 ? cfop.CSTPISCOFINS : dadosproduto.CSTPISCOFINS_S;
                            AliquotaPis = cfop.AliquotaPis > 0 ? cfop.AliquotaPis : dadosproduto.AliquotaPisCofins_S;
                            AliquotaCofins = cfop.AliquotaCofins > 0 ? cfop.AliquotaCofins : dadosproduto.AliquotaPisCofins_S;
                            if (CSTPISCOFINS == 0) {
                                CSTPISCOFINS = cfop.CSTPISCOFINS;
                            }
                        }
                        //NFe.tagProdICMS(index, { orig: 0, CST: '00', modBC: 3, vBC: 0, pICMS: 0, vICMS: 0 });
                        //console.log(csticms);
                        try {
                            NFe.tagProdICMS(index, {
                                orig: "0", // origem da mercadoria
                                CST: csticms,
                                modBC: 3,
                                vBC: p.nfe_vbcicms,
                                pICMS: aliquotaICMS,
                                vICMS: p.nfe_vicms,
                                //pFCP: null,
                                //vFCP: null,
                                //vBCFCP: null,
                                modBCST: 4,
                                pMVAST: AliquotaICMSST_MVA,
                                // pRedBCST: '',
                                vBCST: p.nfe_vbcicmsst,
                                pICMSST: aliquotaICMS,
                                vICMSST: p.nfe_vbcicmsst,
                                //vBCFCPST: null,
                                //pFCPST: null,
                                //vFCPST: null,
                                // vICMSDeson: '',
                                // motDesICMS: '',
                                pRedBC: (100 - percRedBcICMS),
                                // vICMSOp: '',
                                // pDif: '',
                                // vICMSDif: '',
                                vBCSTRet: p.vBCSTRet,
                                pST: 12.00,
                                vICMSSTRet: p.vICMSSTRet,
                                //vBCFCPSTRet: null,
                                //pFCPSTRet: null,
                                //vFCPSTRet: null,
                                vICMSSubstituto: 0.01,
                            });

                            //console.log(String(CSTIPI).padStart(2, "0"));
                            NFe.tagProdIPI(index, {
                                //clEnq: '',
                                //CNPJProd: '',
                                // cSelo: '',
                                // qSelo: '',
                                cEnq: dadosproduto.CENQ,
                                CST: String(CSTIPI).padStart(2, "0"),
                                vIPI: p.nfe_vipi,
                                vBC: p.nfe_vbcipi,
                                pIPI: AliquotaIpi,
                                // qUnid: '',
                                // vUnid: ''
                            });

                            //NFe.tagProdICMSSN(index+1, { orig: "0", CSOSN: "400" });

                            NFe.tagProdPIS(index, {
                                CST: String(CSTPISCOFINS).padStart(2, "0").trim(),
                                vBC: p.nfe_vbcpis,
                                pPIS: AliquotaPis,
                                //qBCProd: 0,
                                vAliqProd: 0,
                                vPIS: p.nfe_vpis,
                            });

                            NFe.tagProdCOFINS(index, {
                                CST: String(CSTPISCOFINS).padStart(2, "0"),
                                vBC: p.nfe_vbccofins,
                                pCOFINS: AliquotaCofins,
                                vCOFINS: p.nfe_vcofins,
                                //qBCProd: 0,
                                vAliqProd: 0,

                            });

                            // console.log("CST PIS: ", {
                            //     CST: String(CSTPISCOFINS).padStart(2, "0").trim(),
                            //     vBC: p.nfe_vbcpis,
                            //     pPIS: AliquotaPis,
                            //     //qBCProd: 0,
                            //     vAliqProd: 0,
                            //     vPIS: p.nfe_vpis,
                            // });

                            NFe.taginfAdProd(index, {
                                infAdProd: `PC:${p.nfe_pecas}`
                            });

                            let vIBS = 0;
                            let vCBS = 0;
                            let vIS = 0;
                            const vProd = p.nfe_subtotal ?? 0;

                            if (dadosproduto.sujeitoIS || cfop.aplicaIS) {
                                const valorBC = Number(p.nfe_subtotal || 0);
                                const aliquotaIS = Number(dadosproduto.aliquotaIS || cfop.aliquotaIS_cfop || 0);
                                const valorIS = valorBC * (aliquotaIS / 100);

                                NFe.tagProdIS(index, {
                                    CST: String(dadosproduto.CSTIS || cfop.CSTIS_padrao || "04").padStart(3, "0"),
                                    cClassTribIS: dadosproduto.CClassTribIS,
                                    vBC: valorBC,
                                    pIS: aliquotaIS,
                                    vIS: valorIS
                                });
                            }

                            // ✅ 4. IBS E CBS - Usando campos EXATOS do banco
                            // if (dadosproduto.sujeitoIBSCBS || cfop.aplicaIBSCBS) {

                            // Divisão do IBS conforme NT
                            const anoEmissao = new Date(transmissao.nfe.nfe_dtemis).getFullYear();
                            let aliquotaIBSUF, aliquotaIBSMun;

                            const aliquotaIBSTotal = Number(dadosproduto.aliquotaIBS || cfop.aliquotaIBS_cfop || 0);

                            if (anoEmissao === 2026) {
                                aliquotaIBSUF = 0.1; // 0,1% para UF em 2026
                                aliquotaIBSMun = Math.max(0, aliquotaIBSTotal - aliquotaIBSUF);
                            } else if (anoEmissao >= 2027 && anoEmissao <= 2028) {
                                aliquotaIBSUF = 0.5; // 0,05% para UF em 2027-2028
                                aliquotaIBSMun = Math.max(0, aliquotaIBSTotal - aliquotaIBSUF);
                            } else {
                                // Para outros anos, dividir meio a meio
                                aliquotaIBSUF = 0.1;
                                aliquotaIBSMun = aliquotaIBSTotal / 2;
                            }


                            // Soma produto + tributos
                            let vItem = (Number(vProd) + Number(vIBS) + Number(vCBS) + Number(vIS)).toFixed(2);


                            NFe.tagProdIBSCBS(index, {
                                CST: dadosproduto.CSTIBSCBS,
                                cClassTrib: dadosproduto.CClassTribIBSCBS,

                                vBC: p.nfe_subtotal,

                                // Percentuais reais
                                pIBSUF: aliquotaIBSUF ?? 0,
                                pIBSMun: 0,
                                pCBS: dadosproduto.aliquotaCBS ?? 0,
                            });



                            vCBS = Number(((vProd * (Number(dadosproduto.aliquotaIBS) ?? 0)) / 100).toFixed(2));
                            const vUF = Number(((vProd * (Number(aliquotaIBSUF))) / 100).toFixed(2));
                            const valorMun = Number(((vProd * (Number(0))) / 100).toFixed(2));
                            //const vIBS = Number(((vProd * (Number(aliquotaIBSMun))) / 100).toFixed(2));
                            if (dadosproduto.sujeitoIS || cfop.aplicaIS) {
                                vIS = ((vProd * (Number(dadosproduto.aliquotaIS) ?? 0)) / 100);
                            }
                            // ✅ 5. TOTAL DO ITEM - Campo VB01
                            const valorTotalItem = Number(p.nfe_subtotal) || 0 +
                                0 +
                                0 +
                                Number(p.nfe_vdesconto) || 0;
                            vItem = (vProd + vUF + valorMun + vCBS + vIS).toFixed(2);
                            console.log(vProd,vUF,valorMun,vCBS,vIS);
                            NFe.tagTotalItem(index, {
                                vItem: vItem
                            });


                        } catch (error) {
                            if (error instanceof HttpException) {
                                throw error;
                            } else {
                                console.error('Error during push operation:', error);
                                throw new HttpException(
                                    'Ocorreu um erro durante a trasmição => ' + error,
                                    HttpStatus.INTERNAL_SERVER_ERROR,
                                );
                            }
                        }

                    };
                    NFe.tagICMSTot({
                        vBC: transmissao.nfe.nfe_totvbcicms.toFixed(2),
                        vICMS: transmissao.nfe.nfe_totvicms.toFixed(2),
                        vICMSDeson: "0.00",
                        vFCP: "0.00",
                        vBCST: transmissao.nfe.nfe_totvbcicmsst.toFixed(2),
                        vST: transmissao.nfe.nfe_totvicmsst.toFixed(2),
                        vFCPST: "0.00",
                        vFCPSTRet: "0.00",
                        vProd: transmissao.nfe.nfe_total_produtos.toFixed(2),
                        vFrete: "0.00",
                        vSeg: "0.00",
                        vDesc: "0.00",
                        vII: "0.00",
                        vIPI: transmissao.nfe.nfe_totvipi.toFixed(2),
                        vIPIDevol: "0.00",
                        vPIS: transmissao.nfe.nfe_totvpis.toFixed(2),
                        vCOFINS: transmissao.nfe.nfe_totvcofins.toFixed(2),
                        vOutro: transmissao.nfe.nfe_voutros.toFixed(2),
                        vNF: transmissao.nfe.nfe_total_nota.toFixed(2)
                    } as any);

                    // Monta os totais da Reforma Tributária
                    NFe.calcTotaisReformaTributaria();

                    NFe.tagTransp({ modFrete: 0 });

                    const formpag = await this.prisma.condicoes_pagamento.findFirst({
                        where: {
                            codigo: String(transmissao.nfe.nfe_formpag).padStart(4, "0"),
                            idemp: empresa.id
                        }
                    })


                    NFe.tagFat({
                        nFat: `Nº Fatura: ${transmissao.nfe.nfe_codigo} - ${formpag.descricao} - Vlr Tot: ${transmissao.nfe.nfe_total_nota}`,
                        vOrig: transmissao.nfe.nfe_total_nota,
                        vDesc: 0,
                        vLiq: transmissao.nfe.nfe_total_nota,
                    });

                    let valorpag = 0;
                    const listaDup = await Promise.all(
                        transmissao.duplicatas.map((dup, index) => {
                            valorpag += dup.valor_duplicata;
                            return {
                                nDup: String(index + 1).padStart(3, "0"),
                                dVenc: format(new Date(dup.data_vencimento), "yyyy-MM-dd", { timeZone: 'America/Sao_Paulo' }),
                                vDup: dup.valor_duplicata
                            }
                        })
                    )

                    let tpag = '';
                    if (listaDup.length > 1) {
                        tpag = '15';
                    } else {
                        tpag = '01';
                    }

                    if (listaDup.length > 0) {
                        NFe.tagDup(listaDup);
                    } else {
                        valorpag = transmissao.nfe.nfe_total_nota;
                    }
                    //NFe.tagTroco("0.00");

                    NFe.tagDetPag([{ tPag: tpag, vPag: valorpag.toFixed(2) }]);
                    const manifestoadfisco = await this.somenteNumeros(transmissao.nfe.nfe_manifesto.substring(0, 15) || '');
                    let msgmanifeto = '';

                    if (manifestoadfisco) {
                        msgmanifeto = `Referente ao manifesto n°:${manifestoadfisco}`;
                    } else {
                        msgmanifeto = '';
                    }

                    const adfisc = `${msgmanifeto} ${cfop.dados_ad_fisc} ${obsitemfator}`;

                    if (adfisc.trim()) {
                        NFe.tagInfAdic({
                            infAdFisco: `${adfisc.trim()}`,
                            //  infCpl: ''
                        })
                    }


                    NFe.tagInfRespTec({ CNPJ: "92113026000164", xContato: "PRODASIQ Desenvolvimento de Sistema Eireli", email: "contato@prodasiq.com", fone: "555133913625" })

                    const xmlGerado = NFe.xml(); // XML gerado ainda não assinado
                    console.log(xmlGerado);
                    const xmlAssinado = await eTools.xmlSign(xmlGerado); // XML assinado

                    const valid = await eTools.validarNFe(xmlAssinado)

                    let resultadoEnvio = "";
                    let jsonRetorno = "";
                    let retEmail = [];
                    if (valid) {
                        resultadoEnvio = await eTools.sefazEnviaLote(xmlAssinado, { idLote: 1, indSinc: 1 });

                        const retornoObj = await xml2json(resultadoEnvio);
                        const cStat = (retornoObj as any)?.retEnviNFe?.protNFe?.infProt?.cStat;
                        let idevent = '';
                        let nfeProc = '';
                        if (cStat === '100') {
                            nfeProc = Complements.toAuthorize(xmlAssinado, resultadoEnvio);
                            const infProt = (retornoObj as any)?.retEnviNFe?.protNFe?.infProt;
                            const idevento = await this.prisma.nfe_evento.create({
                                data: {
                                    chave_acesso: infProt?.chNFe,
                                    serie: transmissao.nfe.nfe_serie,
                                    cstat: infProt?.cStat,
                                    protocolo: infProt?.nProt,
                                    digVal: infProt?.digVal,
                                    caminho_xml: nfeProc, // XML completo da NF-e autorizada
                                    data_evento: new Date(infProt?.dhRecbto),
                                    xmotivo: infProt?.xMotivo,
                                    numero_nfe: transmissao.nfe.id,
                                    codigo_nfe: transmissao.nfe.nfe_codigo
                                    //id_nfe: transmissao.nfe.id, // certifique-se de que `id` da NFe esteja presente
                                },
                            });
                            idevent = idevento.id;

                            try {
                                const clienteDest = await this.prisma.fornecedor.findUnique({
                                    where: {
                                        codigo: transmissao.nfe.fornecedor_codigo,
                                        idemp: empresa.id
                                    }
                                });

                                if (clienteDest?.email) {
                                    await this.HandlerSendMailNFe({
                                        destinatarioEmail: clienteDest.email,
                                        xmlAutorizado: nfeProc, // O XML completo e autorizado
                                        empresaNome: empresa.xnome,
                                        numeroNota: Number(transmissao.nfe.nfe_codigo),
                                        serieNota: transmissao.nfe.nfe_serie,
                                        idempre: empresa.id,
                                    });
                                    retEmail.push({ email: clienteDest.email, status: 'enviado' });
                                } else {
                                    console.warn(`NF-e ${transmissao.nfe.nfe_codigo} autorizada, mas o cliente não possui e-mail cadastrado.`);
                                    retEmail.push({ email: '', status: 'não enviado - sem e-mail cadastrado' });
                                }
                            } catch (emailError) {
                                // Logar o erro de e-mail mas não interromper o fluxo principal
                                console.error(`ERRO AO ENVIAR E-MAIL da NF-e ${transmissao.nfe.nfe_codigo}:`, emailError.message);
                                // Você pode adicionar o erro ao objeto de resultado se desejar
                                // resultados[resultados.length - 1].erro += ` | Falha no envio de e-mail: ${emailError.message}`;
                                retEmail.push({ email: clienteDest?.email || '', status: 'erro ao enviar - ' + (emailError.message || emailError) });
                            }

                            // mandar a nota para o sistema legado
                            const notaPayload: NotaFiscalPayload[] = [
                                {
                                    series: chaveManifeto.codrepresentante,
                                    chave_acesso: infProt?.chNFe,
                                    xml: nfeProc,
                                },
                            ];
                            const nomepasta = await this.pegarTresPrimeirosSemEspaco(empresa.xnome);
                            const resultado = await this.manifestoFtpService.enviarNotaParaSistemaLegado(
                                nomepasta.toLowerCase(),
                                notaPayload,
                                );

                        } else {
                            const infProt = (retornoObj as any)?.retEnviNFe?.protNFe?.infProt;
                            const idevento = await this.prisma.nfe_evento.create({
                                data: {
                                    chave_acesso: infProt?.chNFe,
                                    serie: transmissao.nfe.nfe_serie,
                                    cstat: infProt?.cStat,
                                    protocolo: infProt?.nProt,
                                    digVal: infProt?.digVal,
                                    caminho_xml: xmlAssinado, // XML completo da NF-e autorizada
                                    data_evento: new Date(infProt?.dhRecbto),
                                    xmotivo: infProt?.xMotivo,
                                    numero_nfe: transmissao.nfe.id,
                                    codigo_nfe: transmissao.nfe.nfe_codigo
                                    // id_nfe: transmissao.nfe.id, // certifique-se de que `id` da NFe esteja presente
                                },
                            });
                            idevent = idevento.id;
                        }

                        jsonRetorno = JSON.stringify(retornoObj);

                        resultados.push({
                            nfe_codigo: transmissao.nfe.nfe_codigo,
                            idnfe: transmissao.nfe.id,
                            serie: transmissao.nfe.nfe_serie,
                            xml: nfeProc || xmlAssinado,
                            ideventos: idevent,
                            retorno: jsonRetorno,
                            status: 'sucesso',
                            erro: '',
                            email: retEmail
                        });

                    } else {
                        resultadoEnvio = valid;

                        resultados.push({
                            nfe_codigo: transmissao.nfe.nfe_codigo,
                            idnfe: transmissao.nfe.id,
                            serie: transmissao.nfe.nfe_serie,
                            xml: xmlGerado,
                            retorno: resultadoEnvio,
                            status: 'erro',
                            erro: resultadoEnvio,
                            email: [] as { email: string; status: string }[]
                        });
                    }

                } catch (error) {
                    //throw error;
                    console.log(error);
                    // resultados.push();
                    throw new HttpException({
                        nfe_codigo: transmissao.nfe.nfe_codigo,
                        idnfe: transmissao.nfe.id,
                        status: 'erro',
                        erro: error?.message ?? error,
                    }, HttpStatus.NOT_FOUND);
                }
            }

            return {
                message: resultados,
                info: ret,
            };

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            } else {

                const resp = {
                    msg: 'Ocorreu um erro durante a trasmição',
                    erro: error?.message ?? error
                }
                console.error('Error during push operation:', error);
                throw new HttpException(
                    resp,
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    isCpf(valor: string | undefined | null): valor is string {
        return !!valor && valor.trim().length === 11;
    }


    limpaCampoValorNFe(valor: string | number | null | undefined): string | number | null | undefined {
        if (typeof valor !== 'string') return valor;

        return valor
            .normalize('NFD')                 // separa acentos para remover caso necessário
            .replace(/[\u0300-\u036f]/g, '')  // remove diacríticos (opcional)
            .replace(/[^\x20-\x7EÀ-ÿ]/g, '')  // remove caracteres invisíveis ou de controle
            .replace(/\s+/g, ' ')             // normaliza espaços internos
            .trim();                          // remove espaço início e fim
    }

    async HandlerCancelamentoNFe(dados: CancelamentoDto, cnpj: string) {
        try {
            const empresa = await this.prisma.empresa.findFirst({
                where: { cnpj },
                include: { ConfiguracaoNFe: true },
            });

            if (!empresa) {
                throw new HttpException(`Empresa com CNPJ ${cnpj} não encontrada`, HttpStatus.NOT_FOUND);
            }

            const xmllintPath = join(process.cwd(), 'src', 'modules', 'sped-nfe-transmissor', 'libs', 'libxml', 'bin', 'xmllint.exe');
            const certBuffer = Buffer.isBuffer(empresa.ConfiguracaoNFe.certPfx)
                ? empresa.ConfiguracaoNFe.certPfx
                : Buffer.from(empresa.ConfiguracaoNFe.certPfx as any);
            const tempPfxPath = path.join(os.tmpdir(), `cert-${empresa.cnpj}.pfx`);
            fs.writeFileSync(tempPfxPath, new Uint8Array(certBuffer));

            const eTools = new Tools({
                mod: '55',
                xmllint: xmllintPath,
                UF: empresa.uf,
                tpAmb: 2,
                CSC: '',
                CSCid: '',
                versao: '4.00',
                timeout: 60000,
                openssl: null,
                CPF: '',
                CNPJ: empresa.cnpj,
            }, {
                pfx: tempPfxPath,
                senha: empresa.ConfiguracaoNFe.certPassword,
            });

            const jaExiste = await this.prisma.nfe_evento.findFirst({
                where: {
                    numero_nfe: dados.numero_nfe,
                    codigo_nfe: dados.codigo_nfe,
                    cstat: '101',
                    serie: dados.serie,
                }
            });

              const xmlAutorizado = await this.prisma.nfe_evento.findFirst({
                where: {
                    numero_nfe: dados.numero_nfe,
                    codigo_nfe: dados.codigo_nfe,
                    cstat: '100',
                    serie: dados.serie,
                }
            });
            //console.log(xmlAutorizado);
            if (jaExiste) {

                const xmlCancelado =  await this.gerarXmlCancelado(
                    xmlAutorizado.caminho_xml,
                    jaExiste.caminho_xml,
                );

                const notaPayload: NotaFiscalPayload[] = [
                    {
                        series: dados.codrepresentante,
                        chave_acesso: jaExiste.chave_acesso,
                        xml: String(xmlCancelado),
                    },
                ];
                const nomepasta = await this.pegarTresPrimeirosSemEspaco(empresa.xnome);
                const resultado = await this.manifestoFtpService.enviarNotaParaSistemaLegado(
                    nomepasta.toLowerCase(),
                    notaPayload,
                    );

                return {
                    sucesso: true,
                    cStat: jaExiste.cstat,
                    xMotivo: jaExiste.xmotivo,
                    procEvento: '',
                    ideventos: jaExiste.id,
                    evento: {
                        id: jaExiste.id,
                        id_evento: jaExiste.id,
                        chave_acesso: jaExiste.chave_acesso,
                        cstat: jaExiste.cstat,
                        protocolo: jaExiste.protocolo,
                        caminho_xml: "",
                        data_evento: jaExiste.data_evento ? new Date(jaExiste.data_evento).getTime() : undefined,
                        xMotivo: jaExiste.xmotivo ?? ''
                    }
                };
            }


            // 👉 Faz envio do evento e captura XML assinado + resposta da SEFAZ
            const xmlRespostaEvento = await eTools.sefazEvento({
                chNFe: dados.chNFe,
                tpEvento: '110111',
                nProt: dados.nProt,
                xJust: dados.justificativa
            });

            const retornoObj = await xml2json(xmlRespostaEvento);
            const cStat = (retornoObj as any)?.retEnvEvento?.retEvento?.infEvento?.cStat;

            if (cStat === '135') {
                // ✅ Extração do XML assinado do evento
                const xmlEventoAssinado = eTools.ultimoEventoXml ?? ''; // ajuste se você criou uma propriedade pública

                if (!xmlEventoAssinado) {
                    throw new Error('XML do evento assinado não encontrado');
                }

                // ✅ Gera procEventoNFe
                const xmlProcEvento = Complements.toProcEvento(xmlEventoAssinado, xmlRespostaEvento);

                // 👉 Exemplo: salvar no banco
                const idevento = await this.prisma.nfe_evento.create({
                    data: {
                        chave_acesso: dados.chNFe,
                        protocolo: (retornoObj as any)?.retEnvEvento.retEvento.infEvento.nProt,
                        data_evento: new Date((retornoObj as any)?.retEnvEvento.retEvento.infEvento.dhRegEvento),
                        caminho_xml: xmlProcEvento,
                        cstat: '101',
                        xmotivo: (retornoObj as any)?.retEnvEvento.retEvento.infEvento.xMotivo,
                        numero_nfe: dados.numero_nfe,
                        codigo_nfe: dados.codigo_nfe,
                        serie: dados.serie,
                    },
                });

                const xmlCancelado = await this.gerarXmlCancelado(
                    xmlAutorizado.caminho_xml,
                    xmlProcEvento,
                );

                const notaPayload: NotaFiscalPayload[] = [
                    {
                        series: dados.codrepresentante,
                        chave_acesso: dados.chNFe,
                        xml: String(xmlCancelado),
                    },
                ];

                const nomepasta = await this.pegarTresPrimeirosSemEspaco(empresa.xnome);
                const resultado = await this.manifestoFtpService.enviarNotaParaSistemaLegado(
                    nomepasta.toLowerCase(),
                    notaPayload,
                    );

                const idevent = idevento.id;

                return {
                    sucesso: true,
                    cStat: '101',
                    xMotivo: (retornoObj as any)?.retEnvEvento.retEvento.infEvento.xMotivo,
                    procEvento: xmlProcEvento,
                    ideventos: idevent,
                    evento: {
                        id: idevent,
                        id_evento: idevent,
                        chave_acesso: dados.chNFe,
                        cstat: '101',
                        protocolo: (retornoObj as any)?.retEnvEvento.retEvento.infEvento.nProt,
                        caminho_xml: "",
                        data_evento: (retornoObj as any)?.retEnvEvento.retEvento.infEvento.dhRegEvento
                            ? new Date((retornoObj as any)?.retEnvEvento.retEvento.infEvento.dhRegEvento).getTime()
                            : undefined,
                        xMotivo: (retornoObj as any)?.retEnvEvento.retEvento.infEvento.xMotivo
                    }
                };
            } else {
                return {
                    sucesso: false,
                    cStat,
                    xMotivo: (retornoObj as any)?.retEnvEvento?.retEvento?.infEvento?.xMotivo || 'Erro desconhecido',
                    raw: retornoObj,
                    evento: {}
                };
            }

        } catch (error) {
            throw new HttpException({
                msg: 'Ocorreu um erro durante o cancelamento',
                erro: error?.message || error,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async HandlerCartaCorrecao(dados: CartaCorrecaoDto, cnpj: string) {
        try {
            const empresa = await this.prisma.empresa.findFirst({
                where: { cnpj },
                include: { ConfiguracaoNFe: true },
            });

            if (!empresa) {
                throw new HttpException(`Empresa com CNPJ ${cnpj} não encontrada`, HttpStatus.NOT_FOUND);
            }

            const xmllintPath = join(process.cwd(), 'src', 'modules', 'sped-nfe-transmissor', 'libs', 'libxml', 'bin', 'xmllint.exe');
            const certBuffer = Buffer.isBuffer(empresa.ConfiguracaoNFe.certPfx)
                ? empresa.ConfiguracaoNFe.certPfx
                : Buffer.from(empresa.ConfiguracaoNFe.certPfx as any);
            const tempPfxPath = path.join(os.tmpdir(), `cert-${empresa.cnpj}.pfx`);
            fs.writeFileSync(tempPfxPath, new Uint8Array(certBuffer));

            const eTools = new Tools({
                mod: '55',
                xmllint: xmllintPath,
                UF: empresa.uf,
                tpAmb: 2,
                CSC: '',
                CSCid: '',
                versao: '4.00',
                timeout: 60000,
                openssl: null,
                CPF: '',
                CNPJ: empresa.cnpj,
            }, {
                pfx: tempPfxPath,
                senha: empresa.ConfiguracaoNFe.certPassword,
            });

            const jaExiste = await this.prisma.nfe_evento.findFirst({
                where: {
                    numero_nfe: dados.numero_nfe,
                    codigo_nfe: dados.codigo_nfe,
                    cstat: '135'
                }
            });

            if (jaExiste) {
                return {
                    sucesso: true,
                    cStat: jaExiste.cstat,
                    xMotivo: jaExiste.xmotivo,
                    procEvento: '',
                    ideventos: jaExiste.id,
                    evento: {
                        id: jaExiste.id,
                        id_evento: jaExiste.id,
                        chave_acesso: jaExiste.chave_acesso,
                        cstat: jaExiste.cstat,
                        protocolo: jaExiste.protocolo,
                        caminho_xml: "",
                        data_evento: jaExiste.data_evento ? new Date(jaExiste.data_evento).getTime() : undefined,
                        xMotivo: jaExiste.xmotivo ?? ''
                    }
                };
            }


            // 👉 Faz envio do evento e captura XML assinado + resposta da SEFAZ
            const xmlRespostaEvento = await eTools.sefazEvento({
                chNFe: dados.chNFe,
                tpEvento: '110110',
                xJust: dados.justificativa
            });

            const retornoObj = await xml2json(xmlRespostaEvento);
            const cStat = (retornoObj as any)?.retEnvEvento?.retEvento?.infEvento?.cStat;

            if (cStat === '135') {
                // Extração do XML assinado do evento
                const xmlEventoAssinado = eTools.ultimoEventoXml ?? ''; // ajuste se você criou uma propriedade pública

                if (!xmlEventoAssinado) {
                    throw new Error('XML do evento assinado não encontrado');
                }

                // Gera procEventoNFe
                const xmlProcEvento = Complements.toProcEvento(xmlEventoAssinado, xmlRespostaEvento);

                // salvar no banco
                const idevento = await this.prisma.nfe_evento.create({
                    data: {
                        chave_acesso: dados.chNFe,
                        protocolo: (retornoObj as any)?.retEnvEvento.retEvento.infEvento.nProt,
                        data_evento: new Date((retornoObj as any)?.retEnvEvento.retEvento.infEvento.dhRegEvento),
                        caminho_xml: xmlProcEvento,
                        cstat: (retornoObj as any)?.retEnvEvento?.retEvento?.infEvento?.cStat,
                        xmotivo: (retornoObj as any)?.retEnvEvento.retEvento.infEvento.xMotivo,
                        numero_nfe: dados.numero_nfe,
                        codigo_nfe: dados.codigo_nfe,
                        serie: dados.serie,
                    },
                });

                const idevent = idevento.id;

                return {
                    sucesso: true,
                    cStat: (retornoObj as any)?.retEnvEvento?.retEvento?.infEvento?.cStat,
                    xMotivo: (retornoObj as any)?.retEnvEvento.retEvento.infEvento.xMotivo,
                    procEvento: xmlProcEvento,
                    ideventos: idevent,
                    evento: {
                        id: idevent,
                        id_evento: idevent,
                        chave_acesso: dados.chNFe,
                        cstat: (retornoObj as any)?.retEnvEvento?.retEvento?.infEvento?.cStat,
                        protocolo: (retornoObj as any)?.retEnvEvento.retEvento.infEvento.nProt,
                        caminho_xml: "",
                        data_evento: (retornoObj as any)?.retEnvEvento.retEvento.infEvento.dhRegEvento
                            ? new Date((retornoObj as any)?.retEnvEvento.retEvento.infEvento.dhRegEvento).getTime()
                            : undefined,
                        xMotivo: (retornoObj as any)?.retEnvEvento.retEvento.infEvento.xMotivo
                    }
                };
            } else {
                return {
                    sucesso: false,
                    cStat,
                    xMotivo: (retornoObj as any)?.retEnvEvento?.retEvento?.infEvento?.xMotivo || 'Erro desconhecido',
                    raw: retornoObj,
                    evento: {}
                };
            }

        } catch (error) {
            throw new HttpException({
                msg: 'Ocorreu um erro durante a carta de correção',
                erro: error?.message || error,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async HandlerInutilizaNFe(dados: InutilizaDto, cnpj: string) {
        try {
            const empresa = await this.prisma.empresa.findFirst({
                where: { cnpj },
                include: { ConfiguracaoNFe: true },
            });

            if (!empresa) {
                throw new HttpException(`Empresa com CNPJ ${cnpj} não encontrada`, HttpStatus.NOT_FOUND);
            }

            const xmllintPath = join(process.cwd(), 'src', 'modules', 'sped-nfe-transmissor', 'libs', 'libxml', 'bin', 'xmllint.exe');
            const certBuffer = Buffer.isBuffer(empresa.ConfiguracaoNFe.certPfx)
                ? empresa.ConfiguracaoNFe.certPfx
                : Buffer.from(empresa.ConfiguracaoNFe.certPfx as any);

            const tempPfxPath = path.join(os.tmpdir(), `cert-${empresa.cnpj}.pfx`);
            fs.writeFileSync(tempPfxPath, new Uint8Array(certBuffer));

            const eTools = new Tools({
                mod: '55',
                xmllint: xmllintPath,
                UF: empresa.uf,
                tpAmb: 2,
                CSC: '',
                CSCid: '',
                versao: '4.00',
                timeout: 60000,
                openssl: null,
                CPF: '',
                CNPJ: empresa.cnpj,
            }, {
                pfx: tempPfxPath,
                senha: empresa.ConfiguracaoNFe.certPassword,
            });

            // 👉 Verifica se já foi inutilizado antes (caso sua lógica inclua isso)
            const jaExiste = await this.prisma.nfe_evento.findFirst({
                where: {
                    numero_nfe: dados.numero_nfe,
                    codigo_nfe: dados.codigo_nfe,
                    cstat: '102' // pode ser 135 também, dependendo de como você salva
                }
            });

            if (jaExiste) {
                return {
                    sucesso: true,
                    cStat: jaExiste.cstat,
                    xMotivo: jaExiste.xmotivo,
                    evento: {
                        id: jaExiste.id,
                        chave_acesso: jaExiste.chave_acesso,
                        cstat: jaExiste.cstat,
                        protocolo: jaExiste.protocolo,
                        data_evento: jaExiste.data_evento ? new Date(jaExiste.data_evento).getTime() : undefined,
                        xMotivo: jaExiste.xmotivo ?? ''
                    }
                };
            }

            // 📨 ENVIO para SEFAZ
            const xmlResposta = await eTools.sefazInutiliza({
                cUF: await UF2cUF[empresa.uf],
                ano: new Date().getFullYear().toString().slice(-2),
                CNPJ: empresa.cnpj,
                modelo: "55",
                serie: Number(dados.serie),
                nIni: Number(dados.codigo_nfe),
                nFin: Number(dados.codigo_nfe),
                xJust: dados.justificativa,
                tpAmb: empresa.ConfiguracaoNFe.tpAmb,
                versao: '4.00'
            });

            // 🧠 CONVERTE resposta XML em JSON
            const retornoObj = await xml2json(xmlResposta);
            const infInut = (retornoObj as any)?.retInutNFe?.infInut;
            const cStat = infInut?.cStat;
            const xMotivo = infInut?.xMotivo;
            const protocolo = infInut?.nProt;
            const dhRecbto = infInut?.dhRecbto;

            if (cStat === '102') {
                // Sucesso na inutilização
                const evento = await this.prisma.nfe_evento.create({
                    data: {
                        chave_acesso: '', // inutilização não tem chave de acesso
                        protocolo,
                        data_evento: new Date(dhRecbto),
                        caminho_xml: xmlResposta,
                        cstat: cStat,
                        xmotivo: xMotivo,
                        numero_nfe: dados.numero_nfe,
                        codigo_nfe: dados.codigo_nfe,
                        serie: dados.serie,
                    }
                });

                return {
                    sucesso: true,
                    cStat,
                    xMotivo,
                    procEvento: xmlResposta,
                    ideventos: evento.id,
                    evento: {
                        id: evento.id,
                        chave_acesso: '',
                        cstat: cStat,
                        protocolo,
                        data_evento: new Date(dhRecbto).getTime(),
                        xMotivo
                    }
                };

            } else if (cStat === '563') {
                // Rejeição: Já existe pedido
                return {
                    sucesso: false,
                    cStat,
                    xMotivo: "Já existe pedido de inutilização com a mesma faixa.",
                    status: 'ja_inutilizado',
                    raw: retornoObj
                };

            } else {
                // Outro erro qualquer
                return {
                    sucesso: false,
                    cStat,
                    xMotivo: xMotivo || 'Erro desconhecido',
                    status: 'erro',
                    raw: retornoObj
                };
            }

        } catch (error) {
            console.error('[Erro InutilizaNFe]', error);
            throw new HttpException({
                msg: 'Ocorreu um erro durante a inutilização',
                erro: error?.message || error,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async somenteNumeros(valor?: string | null): Promise<string> {
        return (valor || '').replace(/\D/g, '');
    }

    /**
    * @description Gera o DANFE em PDF, monta e envia o e-mail para o destinatário.
    */
    async HandlerSendMailNFe(dados: {
        destinatarioEmail: string;
        xmlAutorizado: string;
        empresaNome: string;
        numeroNota: number;
        serieNota: string;
        idempre: string;
    }) {
        try {
            console.log(`Iniciando geração do DANFE e envio de e-mail para ${dados.destinatarioEmail}...`);

            // 1. Gerar o PDF do DANFE a partir do XML autorizado
            // A biblioteca já oferece uma função para isso, que retorna um Buffer do PDF.
            const pdfBuffer = await DANFe({ xml: String(dados.xmlAutorizado) });

            // 2. Definir o nome dos arquivos em anexo
            const nomeBaseArquivo = `NFe-${dados.serieNota}-${String(dados.numeroNota).padStart(9, '0')}`;
            const nomeXml = `${nomeBaseArquivo}.xml`;
            const nomePdf = `${nomeBaseArquivo}.pdf`;

            // 3. Montar o corpo do e-mail
            const subject = `NF-e Recebida: ${dados.empresaNome} - Nota Fiscal Nº ${dados.numeroNota}`;
            const textBody = `Olá,\n\nVocê está recebendo a Nota Fiscal Eletrônica (NF-e) número ${dados.numeroNota}, série ${dados.serieNota}, emitida por ${dados.empresaNome}.\n\nO DANFE (em PDF) e o arquivo XML da nota fiscal seguem em anexo.\n\nAtenciosamente,\n${dados.empresaNome}`;
            const htmlBody = `
                <p>Olá,</p>
                <p>Você está recebendo a Nota Fiscal Eletrônica (NF-e) número <strong>${dados.numeroNota}</strong>, série <strong>${dados.serieNota}</strong>, emitida por <strong>${dados.empresaNome}</strong>.</p>
                <p>O DANFE (em PDF) e o arquivo XML da nota fiscal seguem em anexo.</p>


                <p>Atenciosamente,</p>
                <p><strong>${dados.empresaNome}</strong></p>
            `;

            // 4. Chamar o serviço de e-mail
            await this.mailService.sendNfeEmail({
                to: dados.destinatarioEmail,
                subject: subject,
                text: textBody,
                html: htmlBody,
                attachments: [
                    {
                        filename: nomePdf,
                        content: pdfBuffer, // Buffer do PDF gerado
                        contentType: 'application/pdf',
                    },
                    {
                        filename: nomeXml,
                        content: dados.xmlAutorizado, // String do XML
                        contentType: 'application/xml',
                    },
                ],
                idEmpresa: dados.idempre || '',
            });

        } catch (error) {
            console.error(`[HandlerSendMailNFe] Falha no processo de envio de e-mail:`, error);
            // Propaga o erro para que a função chamadora possa tratá-lo
            throw error;
        }
    }

    async HandlerReenvioEmail(dados: {
        email: string;
        chNFe: number;
        nProt: string;
        nfe_codigo: string;
        idempre: string;
    }) {
        try {
            console.log(dados);
            const empresa = await this.prisma.empresa.findUnique({
                where: { id: String(dados.idempre) },
            });

            if (!empresa) {
                throw new HttpException(`Empresa não encontrada`, HttpStatus.NOT_FOUND);
            }


            const dadosNfe = await this.prisma.nfe_evento.findFirst({
                where: {
                    codigo_nfe: String(dados.nfe_codigo),
                    protocolo: dados.nProt,
                    chave_acesso: String(dados.chNFe),
                    cstat: '100' // NF-e autorizada
                }
            });


            await this.HandlerSendMailNFe({
                destinatarioEmail: dados.email,
                xmlAutorizado: dadosNfe.caminho_xml, // O XML completo e autorizado
                empresaNome: empresa.xnome,
                numeroNota: Number(dados.nfe_codigo),
                serieNota: dadosNfe.serie,
                idempre: empresa.id,
            });

            return {
                sucesso: 'enviado com sucesso!'
            }
        } catch (error) {
            console.error(`[HandlerReenvioEmail] Falha no processo de envio de e-mail:`, error);
            // Propaga o erro para que a função chamadora possa tratá-lo
            throw error;
        }
    }

    /**
   * Modifica o XML de uma NFe autorizada para refletir o seu cancelamento.
   * @param nfeXml - O conteúdo XML da NFe originalmente autorizada.
   * @param cancelamentoXml - O conteúdo XML do evento de cancelamento (retEvento).
   * @returns O XML da NFe modificado para o estado de "cancelada".
   */
  async gerarXmlCancelado(nfeXml: string, cancelamentoXml: string): Promise<string> {

    //console.log(nfeXml);
    // Opções para a conversão XML <-> JSON
    const options: xmljs.Options.JS2XML & xmljs.Options.XML2JS = {
      compact: true, // Formato mais fácil de trabalhar
      ignoreComment: true,
      spaces: 4,
    };

    // 1. Converte ambos os XMLs para objetos JSON
    const nfeObj = xmljs.xml2js(nfeXml, { compact: true }) as any;
    const cancelamentoObj = xmljs.xml2js(cancelamentoXml, { compact: true }) as any;

    // 2. Extrai o protocolo da NFe original e sua chave
    // O caminho no JSON compacto é nfeProc.protNFe
    const protNFe = nfeObj['nfeProc']['protNFe'];
    if (!protNFe) {
      throw new Error('XML da NFe não parece estar protocolado (falta a tag <protNFe>).');
    }
    const chaveNFeOriginal = protNFe['infProt']['chNFe']._text;

    // 3. Itera sobre os eventos de cancelamento
    // O PHP usa `getElementsByTagName`, aqui vamos navegar pelo objeto JSON
    const eventos = Array.isArray(cancelamentoObj['procEventoNFe']['retEvento'])
        ? cancelamentoObj['procEventoNFe']['retEvento']
        : [cancelamentoObj['procEventoNFe']['retEvento']];

    let cancelamentoHomologado = false;

    for (const evento of eventos) {
      const infEvento = evento['infEvento'];
      const cStat = infEvento['cStat']._text;
      const tpEvento = infEvento['tpEvento']._text;
      const chaveEvento = infEvento['chNFe']._text;

      // 4. Valida se o evento é um cancelamento bem-sucedido para esta NFe
      const isStatusCancelamento = ['135', '136', '155'].includes(cStat);
      const isTipoEventoCancelamento = [EVT_CANCELA, EVT_CANCELASUBSTITUICAO].includes(tpEvento);

      if (isStatusCancelamento && isTipoEventoCancelamento && chaveEvento === chaveNFeOriginal) {
        const nProtCancelamento = infEvento['nProt']._text;

        // 5. Modifica o objeto JSON da NFe original com os dados do cancelamento
        protNFe['infProt']['cStat']._text = '101'; // Código para "Cancelamento de NF-e homologado"
        protNFe['infProt']['xMotivo']._text = 'Cancelamento de NF-e homologado';
        protNFe['infProt']['nProt']._text = nProtCancelamento; // Usa o protocolo do evento de cancelamento

        cancelamentoHomologado = true;
        break; // Sai do loop assim que encontrar o evento válido
      }
    }

    if (!cancelamentoHomologado) {
      // Se nenhum evento de cancelamento válido foi encontrado, retorna o XML original sem modificações
      // ou lança um erro, dependendo da sua regra de negócio.
      console.warn('Nenhum evento de cancelamento válido encontrado para a NFe. O XML não foi modificado.');
      return nfeXml;
    }

    // 6. Converte o objeto JSON modificado de volta para XML
    const xmlCancelado = xmljs.js2xml(nfeObj, options);

    return xmlCancelado;
  }

  async pegarTresPrimeirosSemEspaco(texto:String): Promise<string> {
    if (!texto) return "";

    return texto
        .replace(/\s+/g, "")   // remove todos os espaços
        .slice(0, 3)           // pega os 3 primeiros caracteres
        .toLowerCase();        // converte para minúsculo
    }

}
