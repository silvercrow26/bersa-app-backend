/* ===============================
   Models
=============================== */
import { GuiaDespachoModel } from './guia-despacho.model'
import SucursalModel from '../../sucursal/sucursal.model'
import ProductoModel from '../../producto/producto.model'
import { ContadorModel } from './contador.model'

/* ===============================
   Types
=============================== */
import { TIPO_GUIA_DESPACHO } from './guia-despacho.types'
import { DespachoInternoModel } from '../despacho-interno.model';

/* =====================================================
   Obtener número correlativo
===================================================== */
async function obtenerSiguienteNumeroGuia(): Promise<number> {
  const contador = await ContadorModel.findOneAndUpdate(
    { _id: 'GUIA_DESPACHO' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  )

  return contador.seq
}

/* =====================================================
   Crear Guía de Despacho desde Despacho Interno
===================================================== */
export async function crearGuiaDespachoDesdeDespacho(
  despachoInternoId: string,
  observacion?: string
) {
  const despacho = await DespachoInternoModel.findById(
    despachoInternoId
  )

  if (!despacho) {
    throw new Error('Despacho interno no encontrado')
  }

  /* Evitar duplicar guías */
  const existente = await GuiaDespachoModel.findOne({
    despachoInternoId: despacho._id,
  })

  if (existente) {
    return existente
  }

  const sucursalOrigen = await SucursalModel.findById(
    despacho.sucursalOrigenId
  )
  const sucursalDestino = await SucursalModel.findById(
    despacho.sucursalDestinoId
  )

  if (!sucursalOrigen || !sucursalDestino) {
    throw new Error(
      'Sucursal origen o destino no encontrada'
    )
  }

  /* ===============================
     Construir items
  =============================== */
  const items = []

  for (const item of despacho.items) {
    const producto = await ProductoModel.findById(
      item.productoId
    )

    if (!producto) {
      throw new Error(
        `Producto no encontrado: ${item.productoId}`
      )
    }

    items.push({
      productoId: producto._id,
      nombreProducto: producto.nombre,
      cantidad: item.cantidadDespachada,
      unidad: item.unidadPedido,
    })
  }

  const numero = await obtenerSiguienteNumeroGuia()

  /* ===============================
     Crear guía
  =============================== */
  const guia = await GuiaDespachoModel.create({
    numero,
    tipo: TIPO_GUIA_DESPACHO.TRASLADO_INTERNO,

    despachoInternoId: despacho._id,

    sucursalOrigenId: despacho.sucursalOrigenId,
    nombreOrigen: sucursalOrigen.nombre,
    direccionOrigen: sucursalOrigen.direccion,

    sucursalDestinoId: despacho.sucursalDestinoId,
    nombreDestino: sucursalDestino.nombre,
    direccionDestino: sucursalDestino.direccion,

    items,
    observacion,
  })

  return guia
}