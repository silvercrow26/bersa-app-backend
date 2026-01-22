/**
 * Define cómo se pide y despacha un producto
 * (no afecta POS ni precios)
 */
export enum UnidadLogistica {
  UNIDAD = 'UNIDAD',
  PAQUETE = 'PAQUETE',
  CAJA = 'CAJA',
  MANGA = 'MANGA',
  SACO = 'SACO',
}

export interface ConfiguracionLogisticaProducto {
  unidadPedido: UnidadLogistica
  factorUnidad: number
  etiquetaVisible: string
}