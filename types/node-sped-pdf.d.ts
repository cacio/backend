declare module 'node-sped-pdf' {
  export function DANFe(params: {
    xml: string;
    consulta?: string;
    logo?: string;
  }): Promise<Buffer>;

  export function DANFCe(params: {
    xml: string;
    consulta?: string;
    logo?: string;
  }): Promise<Buffer>;
}
