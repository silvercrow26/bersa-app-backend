/* =====================================================
   Estados de despacho interno
===================================================== */

/**
 * Estados posibles de un Despacho Interno.
 *
 * IMPORTANTE:
 * - El despacho representa el acto de ENVÍO.
 * - La recepción NO cambia este estado.
 * - La recepción se refleja exclusivamente vía Movimiento (kardex).
 */
export const ESTADO_DESPACHO_INTERNO = {
  DESPACHADO: 'DESPACHADO',

  /**
   * Anulado por error administrativo antes o después del registro,
   * sin impacto en stock adicional.
   */
  ANULADO: 'ANULADO',
} as const

export type EstadoDespachoInterno =
  (typeof ESTADO_DESPACHO_INTERNO)[keyof typeof ESTADO_DESPACHO_INTERNO]

/* =====================================================
   Item despachado
===================================================== */

export interface DespachoInternoItem {
  productoId: string

  /** Cantidad enviada en la unidad indicada */
  cantidadDespachada: number

  /** Unidad usada para el despacho (ej: CAJA, UNIDAD) */
  unidadPedido: string

  /** Factor de conversión a unidad base */
  factorUnidad: number

  /** Cantidad enviada en unidad base */
  cantidadBaseDespachada: number
}

/* =====================================================
   Documento despacho interno
===================================================== */

export interface DespachoInterno {
  id: string

  /**
   * Pedido interno asociado (opcional).
   * Puede no existir en despachos manuales o urgentes.
   */
  pedidoInternoId?: string | null

  /** Sucursal que envía (normalmente MAIN) */
  sucursalOrigenId: string

  /** Sucursal que recibe */
  sucursalDestinoId: string

  estado: EstadoDespachoInterno

  items: DespachoInternoItem[]

  createdAt: string
  updatedAt: string
}