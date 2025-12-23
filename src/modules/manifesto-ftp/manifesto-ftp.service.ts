import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { firstValueFrom } from 'rxjs';
import { ManifestoResponse, ManifestoItem } from './dto/manifesto-response.dto';

export interface NotaFiscalPayload {
  series: string;
  chave_acesso: string;
  xml: string; // O conteúdo do XML como string
}

@Injectable()
export class ManifestoFtpService {

    /**
   * Envia os dados da nota fiscal para o endpoint PHP legado.
   * @param empresa - O código/nome da empresa para a URL.
   * @param notas - Um array de objetos contendo os dados da(s) nota(s).
   */
  async enviarNotaParaSistemaLegado(empresa: string, notas: NotaFiscalPayload[]): Promise<any> {
    // 1. Define a URL do endpoint PHP
    const url = `http://prodapro.com/atualiza/clientes/nfe/${empresa}/php/recebe-exec.php`;

    // 2. Prepara os dados para a requisição (payload )
    // O script PHP espera os dados via $_REQUEST, o que geralmente significa
    // que eles podem ser enviados como 'application/x-www-form-urlencoded'.
    const params = new URLSearchParams();
    params.append('act', 'inserirnota');

    // O PHP espera um array chamado 'arr'. Vamos formatar os dados.
    notas.forEach((nota, index) => {
      params.append(`arr[${index}][series]`, nota.series);
      params.append(`arr[${index}][chave_acesso]`, nota.chave_acesso);
      params.append(`arr[${index}][xml]`, nota.xml);
    });

    try {
      // 3. Envia a requisição POST
      console.log('Enviando dados para:', url);
      const response = await axios.post(url, params, {
        headers: {
          // Define o cabeçalho para que o PHP interprete corretamente os dados
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // 4. Retorna a resposta do servidor PHP
      // O script PHP retorna um JSON, então o axios já deve fazer o parse automaticamente.
      console.log('Resposta do sistema legado:', response.data);
      return response.data;

    } catch (error) {
      console.error('Erro ao se comunicar com o sistema legado:', error.message);

      // Você pode querer lançar uma exceção específica do NestJS aqui
      // Ex: throw new HttpException('Falha na comunicação com o ERP', HttpStatus.BAD_GATEWAY);
      throw new Error('Não foi possível enviar a nota para o sistema legado.');
    }
  }

  /**
   * Busca novos manifestos (arquivos XML) processados pelo sistema legado.
   * @param empresa - O código/nome da empresa para a URL.
   * @param serie - A série da nota para a busca.
   */
  async buscarManifestosDoSistemaLegado(empresa: string, serie: string): Promise<ManifestoResponse> {
    // 1. Define a URL e os parâmetros da requisição
    const url = `http://prodapro.com/atualiza/clientes/nfe/${empresa}/php/recebe-exec.php`;

    // Como o PHP usa $_REQUEST, podemos usar parâmetros de query na URL (GET )
    // ou no corpo (POST). GET é mais comum para buscas.
    const params = {
      act: 'manifestacao',
      serie: serie,
    };

    try {
      // 2. Envia a requisição GET com os parâmetros
      console.log(`Buscando manifestos na série ${serie} para a empresa ${empresa}...`);
      const response = await axios.get<ManifestoResponse>(url, { params });

      // 3. Valida e retorna a resposta
      const data = response.data;
      console.log('Resposta do sistema legado:', data);

      // O script PHP pode retornar um array com um único objeto contendo `msg`.
      // Verificamos se a busca não retornou resultados ou se houve um erro.
      if (Array.isArray(data) && data.length > 0 && data[0].msg) {
        console.warn(`Mensagem do sistema legado: ${data[0].msg}`);
        // Retornamos um array vazio para indicar que não há manifestos para importar,
        // mas a comunicação foi bem-sucedida.
        return [];
      }

      // Se tudo correu bem, `data` deve ser um array de `ManifestoItem`
      return data;

    } catch (error) {
      console.error('Erro ao buscar manifestos no sistema legado:', error.message);

      // Lança uma exceção padrão do NestJS
      throw new HttpException(
        'Falha na comunicação com o sistema legado ao buscar manifestos.',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
