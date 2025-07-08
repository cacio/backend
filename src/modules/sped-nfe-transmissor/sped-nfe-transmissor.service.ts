import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/datrabase/PrismaService';
import { Make, Tools, xml2json, Complements } from 'node-sped-nfe-custom';
import { join } from 'path'
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { TransmissaoNfeDto, CancelamentoDto } from './DTO/transmissao-nfe.dto';
import { format } from 'date-fns-tz';
import { limparCamposZero } from '../../utils/limpar-campos-zero';
@Injectable()
export class SpedNfeTransmissorService {
    constructor(private prisma: PrismaService) { }

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

            const certBuffer = Buffer.isBuffer(empresa.ConfiguracaoNFe.certPfx)
                ? empresa.ConfiguracaoNFe.certPfx
                : Buffer.from(empresa.ConfiguracaoNFe.certPfx as any)

            // Cria um caminho temporário único para o arquivo .pfx
            const tempPfxPath = path.join(os.tmpdir(), `cert-${empresa.cnpj}.pfx`);

            fs.writeFileSync(tempPfxPath, certBuffer);

            let eTools = new Tools({
                mod: '55',
                xmllint: xmllintPath, // path to xmllint binary or leave as empty string if not used
                UF: empresa.uf,
                tpAmb: 2,
                CSC: '', // Código de Segurança do Contribuinte (emissor)
                CSCid: '', // Identificador do CSC
                versao: '4.00',
                timeout: 60000,
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
                            cstat: '100' // NF-e autorizada
                        }
                    });

                    if (jaExiste) {
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
                    //console.log(transmissao.nfe.nfe_codigo);

                    NFe.tagIde({
                        cUF: String(empresa.cmun).substring(0, 2),
                        cNF: String(transmissao.nfe.nfe_codigo).padStart(8, "0"),
                        natOp: cfop.Nome,
                        mod: "55",
                        serie: String(Number(transmissao.nfe.nfe_serie)),
                        nNF: transmissao.nfe.nfe_numeracao,
                        dhEmi: format(new Date(transmissao.nfe.nfe_dtemis), "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: 'America/Sao_Paulo' }),
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
                        nro: empresa.nro,
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

                    NFe.tagDest({
                        //CPF: clienteDest.cpf,
                        CNPJ: clienteDest.cnpj,
                        xNome: `(${clienteDest.cod_retaquarda}) ${clienteDest.xnome}`,
                        indIEDest: clienteDest.ie ? 1 : 2,
                        IE: clienteDest.ie,
                        //ISUF: clienteDest.isuf,
                        email: clienteDest.email
                    });

                    NFe.tagEnderDest({
                        xLgr: clienteDest.xlgr,
                        nro: clienteDest.nro,
                        xBairro: clienteDest.xbairro,
                        cMun: clienteDest.cmun,
                        xMun: clienteDest.xmun,
                        UF: clienteDest.uf,
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
                                cProd: p.produtos_codigo,
                                cEAN: dadosproduto?.cean == '0' || dadosproduto?.cean == '' ? 'SEM GTIN' : dadosproduto?.cean,
                                xProd: dadosproduto?.xprod ?? '',
                                NCM: String(dadosproduto?.ncm ?? '').padStart(8, "0"),
                                cBenef: cfop?.CBENEF || dadosproduto?.CBENEF || '',
                                //EXTIPI: '',
                                CFOP: p.nfe_cfop,
                                uCom: dadosproduto?.unMedida ?? 'UN',
                                qCom: p.nfe_quantidade,
                                vUnCom: p.nfe_valorunitario,
                                vProd: p.nfe_subtotal,
                                cEANTrib: dadosproduto?.ceantrib ?? 'SEM GTIN',
                                uTrib: dadosproduto?.unMedida ?? 'UN',
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

                            console.log(String(CSTIPI).padStart(2, "0"));
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
                                CST: String(CSTPISCOFINS).padStart(2, "0"),
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

                            console.log(String(CSTPISCOFINS).padStart(2, "0"));

                            NFe.taginfAdProd(index, {
                                infAdProd: `PC:${p.nfe_pecas}`
                            });
                        } catch (error) {
                            if (error instanceof HttpException) {
                                throw error;
                            } else {
                                console.error('Error during push operation:', error);
                                throw new HttpException(
                                    'Ocorreu um erro durante a trasmição',
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

                    NFe.tagDetPag([{ tPag: tpag, vPag: valorpag }]);
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

                    const xmlAssinado = await eTools.xmlSign(xmlGerado); // XML assinado

                    const valid = await eTools.validarNFe(xmlAssinado)

                    let resultadoEnvio = "";
                    let jsonRetorno = "";

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
                            xml: nfeProc || xmlAssinado,
                            ideventos: idevent,
                            retorno: jsonRetorno,
                            status: 'sucesso',
                            erro: '',
                        });

                    } else {
                        resultadoEnvio = valid;

                        resultados.push({
                            nfe_codigo: transmissao.nfe.nfe_codigo,
                            idnfe: transmissao.nfe.id,
                            xml: xmlGerado,
                            retorno: resultadoEnvio,
                            status: 'erro',
                            erro: resultadoEnvio,
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
                    erro: error
                }
                console.error('Error during push operation:', error);
                throw new HttpException(
                    resp,
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
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
            fs.writeFileSync(tempPfxPath, certBuffer);

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
                    cstat: '101'
                }
            });

            if(jaExiste){
                return {
                    sucesso: true,
                    cStat:jaExiste.cstat,
                    xMotivo:jaExiste.xmotivo,
                    procEvento: '',
                    ideventos: jaExiste.id,
                    evento: {
                        id: jaExiste.id,
                        id_evento: jaExiste.id,
                        chave_acesso: jaExiste.chave_acesso,
                        cstat:  jaExiste.cstat,
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

                const idevent = idevento.id;

                return {
                    sucesso: true,
                    cStat:'101',
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
                    evento:{}
                };
            }

        } catch (error) {
            throw new HttpException({
                msg: 'Ocorreu um erro durante o cancelamento',
                erro: error?.message || error,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async somenteNumeros(valor?: string | null): Promise<string> {
        return (valor || '').replace(/\D/g, '');
    }

}
