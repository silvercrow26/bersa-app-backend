import { Schema, model, Types } from 'mongoose'
import { TIPO_ABASTECIMIENTO } from './abastecimiento.types'

/* ===============================
   Subdocumento Item (2026)
   - Snapshot completo
=============================== */

export interface AbastecimientoItem {
  productoId: Types.ObjectId
  cantidad: number

  // 👇 SNAPSHOT DE PROVEEDOR
  proveedorId?: Types.ObjectId
  proveedorNombre?: string
}

/* ===============================
   Documento principal
=============================== */

export interface Abastecimiento {
  _id: Types.ObjectId

  tipo: TIPO_ABASTECIMIENTO

  sucursalOrigenId?: Types.ObjectId
  sucursalDestinoId: Types.ObjectId

  observacion?: string

  items: AbastecimientoItem[]

  createdBy: Types.ObjectId
  fecha: Date
  createdAt: Date
}

/* ===============================
   Schema Item
=============================== */

const abastecimientoItemSchema =
  new Schema<AbastecimientoItem>(
    {
      productoId: {
        type: Schema.Types.ObjectId,
        ref: 'Producto',
        required: true,
      },
      cantidad: {
        type: Number,
        required: true,
        min: 1,
      },

      // 👇 CAMPOS CLAVE (ANTES FALTABAN)
      proveedorId: {
        type: Schema.Types.ObjectId,
        ref: 'Proveedor',
      },
      proveedorNombre: {
        type: String,
        trim: true,
      },
    },
    { _id: false }
  )

/* ===============================
   Schema principal
=============================== */

const abastecimientoSchema =
  new Schema<Abastecimiento>(
    {
      tipo: {
        type: String,
        enum: Object.values(TIPO_ABASTECIMIENTO),
        required: true,
      },

      sucursalOrigenId: {
        type: Schema.Types.ObjectId,
        ref: 'Sucursal',
      },

      sucursalDestinoId: {
        type: Schema.Types.ObjectId,
        ref: 'Sucursal',
        required: true,
        index: true,
      },

      observacion: {
        type: String,
      },

      items: {
        type: [abastecimientoItemSchema],
        required: true,
        default: [],
      },

      createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true,
      },

      fecha: {
        type: Date,
        default: Date.now,
        index: true,
      },
    },
    {
      timestamps: {
        createdAt: true,
        updatedAt: false,
      },
    }
  )

export const AbastecimientoModel = model<Abastecimiento>(
  'Abastecimiento',
  abastecimientoSchema
)