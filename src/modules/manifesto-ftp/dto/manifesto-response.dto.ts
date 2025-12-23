
export interface ManifestoItem {
  data: string;          // "2023-10-26"
  n_manifesto: string;   // "12345"
  n_item: string;        // "1"
  cod_produto: string;   // "PROD001"
  qtd_prod: string;      // "10.00"
  vlr_unit: string;      // "9.99"
  fatorBcIcmsRet: string;// "0"
  fatorVlrIcmsRet: string;// "0"
  chave_acesso: string; // "12345678901234567890123456789012345678901234"
  codrepresentante?: string; // Código do representante (opcional)
  msg?: string;          // Mensagem de erro ou aviso
}

// A resposta pode ser um array de itens ou um objeto com uma única mensagem
export type ManifestoResponse = ManifestoItem[];
