import { Schema, model, Types } from 'mongoose'
import { TIPO_GUIA_DESPACHO } from './guia-despacho.types'

/* =====================================================
   Subdocumento Item
===================================================== */

const GuiaDespachoItemSchema = new Schema(
  {
    productoId: {
      type: Types.ObjectId,
      ref: 'Producto',
      required: true,
    },
    nombreProducto: {
      type: String,
      required: true,
    },
    cantidad: {
      type: Number,
      required: true,
      min: 1,
    },
    unidad: {
      type: String,
      required: true,
    },
  },
  { _id: false }
)

/* =====================================================
   Schema Guía de Despacho
===================================================== */

const GuiaDespachoSchema = new Schema(
  {
    numero: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },

    tipo: {
      type: String,
      enum: Object.values(TIPO_GUIA_DESPACHO),
      required: true,
    },

    despachoInternoId: {
      type: Types.ObjectId,
      ref: 'DespachoInterno',
      required: true,
      unique: true,
    },

    /* ===============================
       Origen
    =============================== */
    sucursalOrigenId: {
      type: Types.ObjectId,
      ref: 'Sucursal',
      required: true,
    },
    nombreOrigen: {
      type: String,
      required: true,
    },
    direccionOrigen: {
      type: String,
      required: true,
    },

    /* ===============================
       Destino
    =============================== */
    sucursalDestinoId: {
      type: Types.ObjectId,
      ref: 'Sucursal',
      required: true,
    },
    nombreDestino: {
      type: String,
      required: true,
    },
    direccionDestino: {
      type: String,
      required: true,
    },

    items: {
      type: [GuiaDespachoItemSchema],
      required: true,
    },

    observacion: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

export const GuiaDespachoModel = model(
  'GuiaDespacho',
  GuiaDespachoSchema
)