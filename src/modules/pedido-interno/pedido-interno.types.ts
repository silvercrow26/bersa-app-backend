/* =====================================================
   Estados del pedido interno (RUNTIME + TYPE)
===================================================== */

/**
 * Estados posibles de un Pedido Interno.
 * - CREADO: Pedido generado por sucursal solicitante
 * - PREPARADO: Pedido parcialmente o totalmente preparado por sucursal MAIN
 * - DESPACHADO: Pedido despachado (puede ser parcial)
 */
export const ESTADO_PEDIDO_INTERNO = {
  CREADO: 'CREADO',
  PREPARADO: 'PREPARADO',
  DESPACHADO: 'DESPACHADO',
} as const

/**
 * Tipo derivado del enum de estados
 */
export type EstadoPedidoInterno =
  (typeof ESTADO_PEDIDO_INTERNO)[keyof typeof ESTADO_PEDIDO_INTERNO]

/* =====================================================
   Item de pedido interno
===================================================== */

export interface PedidoInternoItem {
  productoId: string

  /** Cantidad solicitada en la unidad pedida */
  cantidadSolicitada: number

  /** Unidad en que se solicita (ej: CAJA, UNIDAD) */
  unidadPedido: string

  /** Factor de conversión a unidad base */
  factorUnidad: number

  /** Cantidad solicitada en unidad base */
  cantidadBaseSolicitada: number

  /** Cantidad realmente preparada (puede ser menor o inexistente) */
  cantidadPreparada?: number
}

/* =====================================================
   Documento pedido interno
===================================================== */

export interface PedidoInterno {
  id: string

  /** Sucursal que solicita el pedido */
  sucursalSolicitanteId: string

  /** Sucursal que abastece (normalmente MAIN) */
  sucursalAbastecedoraId: string

  estado: EstadoPedidoInterno

  items: PedidoInternoItem[]

  createdAt: string
  updatedAt: string
}