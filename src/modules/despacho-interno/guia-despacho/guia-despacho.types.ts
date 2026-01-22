/* =====================================================
   Guía de Despacho Interna
===================================================== */

export const TIPO_GUIA_DESPACHO = {
  TRASLADO_INTERNO: 'TRASLADO_INTERNO',
} as const

export type TipoGuiaDespacho =
  (typeof TIPO_GUIA_DESPACHO)[keyof typeof TIPO_GUIA_DESPACHO]

/* =====================================================
   Item de la guía
===================================================== */

export interface GuiaDespachoItem {
  productoId: string
  nombreProducto: string
  cantidad: number
  unidad: string
}

/* =====================================================
   Documento Guía de Despacho
===================================================== */

export interface GuiaDespacho {
  id: string

  /** Número correlativo interno */
  numero: number

  tipo: TipoGuiaDespacho

  /** Despacho que origina la guía */
  despachoInternoId: string

  /** Origen */
  sucursalOrigenId: string
  nombreOrigen: string
  direccionOrigen: string

  /** Destino */
  sucursalDestinoId: string
  nombreDestino: string
  direccionDestino: string

  items: GuiaDespachoItem[]

  observacion?: string

  createdAt: string
}