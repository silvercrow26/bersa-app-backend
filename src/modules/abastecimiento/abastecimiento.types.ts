import { Types } from 'mongoose'

/**
 * Tipos de operaciones de abastecimiento
 * (acción del usuario, no kardex)
 */
export enum TIPO_ABASTECIMIENTO {
  INGRESO_STOCK = 'INGRESO_STOCK',
  TRANSFERENCIA = 'TRANSFERENCIA',
  AJUSTE = 'AJUSTE',
}

/* ===============================
   Item de Abastecimiento (INPUT)
   - Snapshot 2026
=============================== */

export interface AbastecimientoItemInput {
  productoId: Types.ObjectId
  cantidad: number

  // 👇 SNAPSHOT DE PROVEEDOR (NUEVO)
  proveedorId?: Types.ObjectId
  proveedorNombre?: string
}

/* ===============================
   Input para Ingreso de Stock
   - NO hay proveedor global
=============================== */

export interface CrearIngresoStockInput {
  sucursalDestinoId: Types.ObjectId
  observacion?: string
  createdBy: Types.ObjectId

  items: AbastecimientoItemInput[]
}