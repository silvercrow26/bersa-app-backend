import { Schema, model, Types } from 'mongoose'
import { ESTADO_PEDIDO_INTERNO } from './pedido-interno.types'

/* =====================================================
   Subdocumento: Item de Pedido Interno
===================================================== */

const PedidoInternoItemSchema = new Schema(
  {
    productoId: {
      type: Types.ObjectId,
      ref: 'Producto',
      required: true,
    },

    cantidadSolicitada: {
      type: Number,
      required: true,
      min: 1,
    },

    unidadPedido: {
      type: String,
      required: true,
    },

    factorUnidad: {
      type: Number,
      required: true,
      min: 1,
    },

    cantidadBaseSolicitada: {
      type: Number,
      required: true,
      min: 1,
    },

    /**
     * Cantidad efectivamente preparada por la sucursal abastecedora.
     * Puede ser menor a la solicitada o incluso no existir.
     */
    cantidadPreparada: {
      type: Number,
      min: 0,
    },
  },
  { _id: false }
)

/* =====================================================
   Schema principal: Pedido Interno
===================================================== */

const PedidoInternoSchema = new Schema(
  {
    sucursalSolicitanteId: {
      type: Types.ObjectId,
      ref: 'Sucursal',
      required: true,
    },

    sucursalAbastecedoraId: {
      type: Types.ObjectId,
      ref: 'Sucursal',
      required: true,
    },

    estado: {
      type: String,
      enum: Object.values(ESTADO_PEDIDO_INTERNO),
      default: ESTADO_PEDIDO_INTERNO.CREADO,
      required: true,
    },

    items: {
      type: [PedidoInternoItemSchema],
      required: true,
      validate: {
        validator: (items: unknown[]) => items.length > 0,
        message: 'El pedido interno debe tener al menos un item',
      },
    },
  },
  {
    timestamps: true,
  }
)

/* =====================================================
   Model
===================================================== */

export const PedidoInternoModel = model(
  'PedidoInterno',
  PedidoInternoSchema
)