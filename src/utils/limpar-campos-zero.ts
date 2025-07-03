export function limparCamposZero(obj: Record<string, any>) {
  for (const key in obj) {
    const valor = obj[key];

    if (
      valor === 0 ||
      valor === 0.0 ||
      valor === '0' ||
      valor === '0.00' ||
      parseFloat(valor) === 0
    ) {
      delete obj[key];
    }
  }
  return obj;
}
