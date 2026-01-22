import { Types } from 'mongoose'

/* ===============================
   Models
=============================== */
import { DespachoInternoModel } from './despacho-interno.model'
import { ESTADO_DESPACHO_INTERNO } from './despacho-interno.types'

import { PedidoInternoModel } from '../pedido-interno/pedido-interno.model'
import { ESTADO_PEDIDO_INTERNO } from '../pedido-interno/pedido-interno.types'

import SucursalModel from '../sucursal/sucursal.model'

/* ===============================
   Stock / Kardex
=============================== */
import { registrarMovimiento } from '../movimiento/movimiento.service'
import {
  TIPO_MOVIMIENTO,
  SUBTIPO_MOVIMIENTO,
} from '../movimiento/movimiento.model'

/* =====================================================
   DESPACHO DESDE PEDIDO INTERNO
===================================================== */
export async function despacharPedidoInterno(
  pedidoInternoId: string,
  sucursalOrigenId: string
) {
  const pedido = await PedidoInternoModel.findById(pedidoInternoId)

  if (!pedido) {
    throw new Error('Pedido no encontrado')
  }

  if (pedido.estado !== ESTADO_PEDIDO_INTERNO.PREPARADO) {
    throw new Error('El pedido no está preparado para despacho')
  }

  if (pedido.sucursalAbastecedoraId.toString() !== sucursalOrigenId) {
    throw new Error('No autorizado para despachar este pedido')
  }

  const itemsDespacho = pedido.items
    .map(item => {
      const cantidad = item.cantidadPreparada ?? 0
      if (cantidad <= 0) return null

      return {
        productoId: item.productoId,
        cantidadDespachada: cantidad,
        unidadPedido: item.unidadPedido,
        factorUnidad: item.factorUnidad,
        cantidadBaseDespachada: cantidad * item.factorUnidad,
      }
    })
    .filter(Boolean) as {
      productoId: Types.ObjectId
      cantidadDespachada: number
      unidadPedido: string
      factorUnidad: number
      cantidadBaseDespachada: number
    }[]

  if (itemsDespacho.length === 0) {
    throw new Error('No hay items preparados para despachar')
  }

  const despacho = await DespachoInternoModel.create({
    pedidoInternoId: pedido._id,
    sucursalOrigenId: pedido.sucursalAbastecedoraId,
    sucursalDestinoId: pedido.sucursalSolicitanteId,
    estado: ESTADO_DESPACHO_INTERNO.DESPACHADO,
    items: itemsDespacho,
  })

  /* ===============================
     Kardex (EGRESO origen)
  =============================== */
  for (const item of itemsDespacho) {
    await registrarMovimiento({
      tipoMovimiento: TIPO_MOVIMIENTO.EGRESO,
      subtipoMovimiento: SUBTIPO_MOVIMIENTO.TRANSFERENCIA_ENVIO,

      productoId: item.productoId,
      sucursalId: pedido.sucursalAbastecedoraId,

      cantidad: item.cantidadBaseDespachada,

      referencia: {
        tipo: 'TRANSFERENCIA',
        id: despacho._id,
      },

      observacion: 'Despacho interno desde pedido',
    })
  }

  pedido.estado = ESTADO_PEDIDO_INTERNO.DESPACHADO
  await pedido.save()

  return despacho
}

/* =====================================================
   DESPACHO MANUAL / URGENTE
===================================================== */
export async function crearDespachoManual(input: {
  sucursalOrigenId: string
  sucursalDestinoId: string
  items: {
    productoId: string
    cantidad: number
    unidadPedido: string
    factorUnidad: number
  }[]
  observacion?: string
}) {
  if (input.items.length === 0) {
    throw new Error('El despacho no puede estar vacío')
  }

  const itemsDespacho = input.items.map(item => ({
    productoId: new Types.ObjectId(item.productoId),
    cantidadDespachada: item.cantidad,
    unidadPedido: item.unidadPedido,
    factorUnidad: item.factorUnidad,
    cantidadBaseDespachada: item.cantidad * item.factorUnidad,
  }))

  const despacho = await DespachoInternoModel.create({
    pedidoInternoId: null,
    sucursalOrigenId: input.sucursalOrigenId,
    sucursalDestinoId: input.sucursalDestinoId,
    estado: ESTADO_DESPACHO_INTERNO.DESPACHADO,
    items: itemsDespacho,
  })

  /* ===============================
     Kardex (EGRESO origen)
  =============================== */
  for (const item of itemsDespacho) {
    await registrarMovimiento({
      tipoMovimiento: TIPO_MOVIMIENTO.EGRESO,
      subtipoMovimiento: SUBTIPO_MOVIMIENTO.TRANSFERENCIA_ENVIO,

      productoId: item.productoId,
      sucursalId: new Types.ObjectId(input.sucursalOrigenId),

      cantidad: item.cantidadBaseDespachada,

      referencia: {
        tipo: 'TRANSFERENCIA',
        id: despacho._id,
      },

      observacion: input.observacion ?? 'Despacho interno manual',
    })
  }

  return despacho
}

/* =====================================================
   RECEPCIÓN DE DESPACHO (SOLO KARDEX)
===================================================== */
export async function recibirDespachoInterno(
  despachoId: string,
  sucursalDestinoId: string,
  itemsRecibidos: {
    productoId: string
    cantidadRecibida: number
  }[],
  observacion?: string
) {
  const despacho = await DespachoInternoModel.findById(despachoId)

  if (!despacho) {
    throw new Error('Despacho no encontrado')
  }

  if (despacho.sucursalDestinoId.toString() !== sucursalDestinoId) {
    throw new Error('No autorizado para recibir este despacho')
  }

  for (const item of despacho.items) {
    const recibido = itemsRecibidos.find(
      i => i.productoId === item.productoId.toString()
    )

    const cantidadRecibida = recibido?.cantidadRecibida ?? 0

    if (cantidadRecibida > 0) {
      await registrarMovimiento({
        tipoMovimiento: TIPO_MOVIMIENTO.INGRESO,
        subtipoMovimiento: SUBTIPO_MOVIMIENTO.TRANSFERENCIA_RECEPCION,

        productoId: item.productoId,
        sucursalId: new Types.ObjectId(sucursalDestinoId),

        cantidad: cantidadRecibida * item.factorUnidad,

        referencia: {
          tipo: 'TRANSFERENCIA',
          id: despacho._id,
        },

        observacion: observacion ?? 'Recepción despacho interno',
      })
    }
  }

  return { ok: true }
}

/* =====================================================
   LISTAR DESPACHOS
===================================================== */
export async function listarDespachosInternos(input: {
  rol: 'ADMIN' | 'BODEGUERO' | 'ENCARGADO'
  sucursalId: string
}) {
  const { rol, sucursalId } = input

  if (rol === 'ADMIN') {
    return DespachoInternoModel.find()
      .populate('sucursalOrigenId', 'nombre')
      .populate('sucursalDestinoId', 'nombre')
      .sort({ createdAt: -1 })
  }

  const sucursal = await SucursalModel.findById(sucursalId)
  if (!sucursal) {
    throw new Error('Sucursal no encontrada')
  }

  if (rol === 'BODEGUERO' && sucursal.esPrincipal) {
    return DespachoInternoModel.find({
      sucursalOrigenId: sucursalId,
    })
      .populate('sucursalOrigenId', 'nombre')
      .populate('sucursalDestinoId', 'nombre')
      .sort({ createdAt: -1 })
  }

  return DespachoInternoModel.find({
    sucursalDestinoId: sucursalId,
  })
    .populate('sucursalOrigenId', 'nombre')
    .populate('sucursalDestinoId', 'nombre')
    .sort({ createdAt: -1 })
}