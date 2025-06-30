import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/datrabase/PrismaService';
import { Make, Tools, xml2json } from 'node-sped-nfe';
import { join } from 'path'
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { TransmissaoNfeDto } from './DTO/transmissao-nfe.dto';


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
                    NFe.tagInfNFe({ Id: `NFe${transmissao.evento.chave_acesso}`, versao: '4.00' });

                    const cfop = await this.prisma.cfop_natura.findFirst({
                        where: {
                            Codigo: transmissao.nfe.nfe_natureza_operacao
                        }
                    });


                    NFe.tagIde({
                        cUF: String(empresa.cmun).substring(0, 2),
                        cNF: transmissao.nfe.nfe_codigo,
                        natOp: cfop.Nome,
                        mod: "55",
                        serie: transmissao.nfe.nfe_serie,
                        nNF: transmissao.nfe.nfe_numeracao,
                        dhEmi: new Date(transmissao.nfe.nfe_dtemis).toISOString(),
                        tpNF: "1",
                        idDest: "1",
                        cMunFG: empresa.cmun,
                        tpImp: "3",
                        tpEmis: "1",
                        cDV: String(transmissao.evento.chave_acesso).substring(-1),
                        tpAmb: empresa.ConfiguracaoNFe.tpAmb,
                        finNFe: "1",
                        indFinal: "0",
                        indPres: "9",
                        indIntermed: "0",
                        procEmi: "0",
                        verProc: "4.13"
                    });

                    NFe.tagEmit({
                        CNPJ: empresa.cnpj,
                        xNome: empresa.xnome,
                        xFant: empresa.xfant,
                        IE: empresa.ie,
                        CRT: empresa.crt
                    });

                    NFe.tagEnderEmit({
                        xLgr: empresa.xlgr,
                        nro: empresa.nro,
                        xBairro: empresa.xbairro,
                        cMun: empresa.cmun,
                        xMun: empresa.xmun,
                        UF: empresa.nro,
                        CEP: empresa.cep,
                        cPais: empresa.cpais,
                        xPais: empresa.xpais,
                        fone: empresa.fone
                    });

                    const clienteDest = await this.prisma.fornecedor.findUnique({
                        where: {
                            codigo: transmissao.nfe.fornecedor_codigo,
                            idemp: empresa.id
                        }
                    })

                    NFe.tagDest({
                        CPF: clienteDest.cpf,
                        CNPJ: clienteDest.cnpj,
                        xNome: `(${clienteDest.cod_retaquarda}) ${clienteDest.xnome}`,
                        IE: clienteDest.ie,
                        ISUF: clienteDest.isuf,
                        indIEDest: clienteDest.ie ? 1 : 2,
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
                    const listaProdutos = await Promise.all(
                        produtos.map(async (p, index) => {
                            const dadosproduto = await this.prisma.produtos.findUnique({
                                where: {
                                    codigo: p.codigo,
                                    idemp: empresa.id
                                }
                            });

                            const valor_qv = parseFloat(String(p.nfe_quantidade)) * parseFloat(String(p.nfe_valorunitario));
                            const vator = parseFloat(String(transmissao.nfe.nfe_voutros)) / parseFloat(String(transmissao.nfe.nfe_total_produtos));
                            const prod_voutros = parseFloat((vator * valor_qv).toFixed(2));
                            tot_prod_voutros += prod_voutros;

                            const dadosmanifesto = transmissao.manifestos.find((mani) =>
                                mani.n_manifesto == transmissao.nfe.nfe_manifesto && mani.cod_produto == p.codigo
                            );

                            return {
                                item: index + 1,
                                cProd: p.codigo,
                                cEAN: dadosproduto?.cean ?? 'SEM GTIN',
                                xProd: dadosproduto?.xprod ?? '',
                                NCM: String(dadosproduto?.ncm ?? '').padStart(8, "0"),
                                cBenef: cfop?.CBENEF || dadosproduto?.CBENEF || '',
                                EXTIPI: '',
                                CFOP: p.nfe_cfop,
                                uCom: dadosproduto?.unMedida ?? 'UN',
                                qCom: p.nfe_quantidade,
                                vUnCom: p.nfe_valorunitario,
                                vProd: p.nfe_subtotal,
                                cEANTrib: dadosproduto?.ceantrib ?? 'SEM GTIN',
                                uTrib: dadosproduto?.unMedida ?? 'UN',
                                qTrib: p.nfe_quantidade,
                                vUnTrib: p.nfe_valorunitario,
                                vFrete: 0,
                                vSeg: 0,
                                vDesc: 0,
                                vOutro: prod_voutros || 0,
                                indTot: 1,
                                xPed: transmissao.nfe.nfe_manifesto || '',
                                nItemPed: dadosmanifesto?.n_item || '',
                                nFCI: ''
                            };
                        })
                    );

                    NFe.tagProd(listaProdutos);

                    produtos.forEach(async (_, index) => {
                        const dadosproduto = await this.prisma.produtos.findUnique({
                            where: {
                                codigo: _.codigo,
                                idemp: empresa.id
                            }
                        });

                        NFe.taginfAdProd(index,{
                            item:index + 1,
                            infAdProd:`PC:${_.nfe_pecas}`
                        });

                        let csticms = 0;
                        if(cfop.calculasn == 'N'){
                            csticms = Number(cfop.aliquotaICMS) > 0 ? Number(cfop.CSTICMS) : Number(dadosproduto.CSTICMS);
                        }else{
                            csticms = Number(cfop.CSTPISCOFINS) > 0 ? Number(cfop.CSTPISCOFINS) : Number(dadosproduto.CSTPISCOFINS_S);
                        }

                        NFe.tagProdICMS(index+1,{
                            item: index + 1,
                            orig:'0',
                            CST:csticms

                        })

                        //NFe.tagProdICMSSN(index+1, { orig: "0", CSOSN: "400" });

                        /*NFe.tagProdPIS(index+1, {
                        CST: "49",
                        qBCProd: 0,
                        vAliqProd: 0,
                        vPIS: 0,
                        });

                        NFe.tagProdCOFINS(index+1, {
                        CST: "49",
                        qBCProd: 0,
                        vAliqProd: 0,
                        vCOFINS: 0,
                        });*/
                  });

                } catch (error) {
                    resultados.push({
                        nfe_codigo: transmissao.nfe.nfe_codigo,
                        status: 'erro',
                        erro: error.message,
                    });

                }



            }

            return {
                message: 'SEFAZ está em operação',
                info: ret,
            };

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
    }

}
