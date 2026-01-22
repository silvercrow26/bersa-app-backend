import { PedidoInternoModel } from './pedido-interno.model'
import { ESTADO_PEDIDO_INTERNO } from './pedido-interno.types'
import ProductoModel from '../producto/producto.model'

interface CrearPedidoInternoInput {
  sucursalSolicitanteId: string
  sucursalAbastecedoraId: string
  items: {
    productoId: string
    cantidadSolicitada: number
  }[]
}

/* =====================================================
   Crear pedido interno
===================================================== */
export async function crearPedidoInterno(
  input: CrearPedidoInternoInput
) {
  /* ===============================
     Validaciones base
  =============================== */

  if (
    input.sucursalSolicitanteId ===
    input.sucursalAbastecedoraId
  ) {
    throw new Error(
      'Sucursal solicitante y abastecedora no pueden ser la misma'
    )
  }

  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new Error(
      'El pedido debe contener al menos un item'
    )
  }

  /* ===============================
     Procesar items
  =============================== */

  const itemsProcesados: {
    productoId: any
    cantidadSolicitada: number
    unidadPedido: string
    factorUnidad: number
    cantidadBaseSolicitada: number
  }[] = []

  for (const item of input.items) {
    const producto = await ProductoModel.findById(
      item.productoId
    )

    if (!producto) {
      throw new Error(
        `Producto no encontrado: ${item.productoId}`
      )
    }

    /**
     * ⚠️ BUG REAL SOLUCIONADO AQUÍ
     * unidadLogistica puede existir pero venir incompleta ({})
     */
    const unidadLogistica =
      producto.unidadLogistica &&
      typeof producto.unidadLogistica.factorUnidad === 'number' &&
      producto.unidadLogistica.factorUnidad > 0
        ? producto.unidadLogistica
        : {
            unidadPedido: 'UNIDAD',
            factorUnidad: 1,
            etiquetaVisible: 'unidad',
          }

    const factor = unidadLogistica.factorUnidad

    const cantidadBaseSolicitada =
      item.cantidadSolicitada * factor

    if (
      Number.isNaN(cantidadBaseSolicitada) ||
      cantidadBaseSolicitada <= 0
    ) {
      throw new Error(
        `Cantidad inválida para producto ${producto.nombre}`
      )
    }

    itemsProcesados.push({
      productoId: producto._id,
      cantidadSolicitada: item.cantidadSolicitada,
      unidadPedido: unidadLogistica.unidadPedido,
      factorUnidad: factor,
      cantidadBaseSolicitada,
    })
  }

  /* ===============================
     Crear pedido
  =============================== */

  return PedidoInternoModel.create({
    sucursalSolicitanteId:
      input.sucursalSolicitanteId,
    sucursalAbastecedoraId:
      input.sucursalAbastecedoraId,
    estado: ESTADO_PEDIDO_INTERNO.CREADO,
    items: itemsProcesados,
  })
}

/* =====================================================
   Pedidos por sucursal solicitante
===================================================== */
export function getPedidosPorSolicitante(
  sucursalId: string
) {
  return PedidoInternoModel.find({
    sucursalSolicitanteId: sucursalId,
  }).sort({ createdAt: -1 })
}

/* =====================================================
   Pedidos por sucursal abastecedora (MAIN)
===================================================== */
export function getPedidosPorAbastecedora(
  sucursalId: string
) {
  return PedidoInternoModel.find({
    sucursalAbastecedoraId: sucursalId,
  }).sort({ createdAt: -1 })
}

/* =====================================================
   Preparar pedido interno
===================================================== */
export async function prepararPedidoInterno(
  pedidoId: string,
  itemsPreparados: {
    productoId: string
    cantidadPreparada: number
  }[],
  sucursalAbastecedoraId: string
) {
  const pedido = await PedidoInternoModel.findById(
    pedidoId
  )

  if (!pedido) {
    throw new Error('Pedido no encontrado')
  }

  if (
    pedido.sucursalAbastecedoraId.toString() !==
    sucursalAbastecedoraId
  ) {
    throw new Error(
      'No autorizado para preparar este pedido'
    )
  }

  if (pedido.estado !== ESTADO_PEDIDO_INTERNO.CREADO) {
    throw new Error(
      'El pedido no puede ser preparado en este estado'
    )
  }

  pedido.items.forEach(item => {
    const preparado = itemsPreparados.find(
      i =>
        i.productoId ===
        item.productoId.toString()
    )

    item.cantidadPreparada =
      preparado?.cantidadPreparada ?? 0
  })

  pedido.estado = ESTADO_PEDIDO_INTERNO.PREPARADO
  await pedido.save()

  return pedido
}