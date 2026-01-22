import { Request, Response } from 'express'
import {
  crearPedidoInterno,
  getPedidosPorSolicitante,
  getPedidosPorAbastecedora,
  prepararPedidoInterno,
} from './pedido-interno.service'

/* =====================================================
   Crear pedido interno
===================================================== */
export async function crearPedido(
  req: Request,
  res: Response
) {
  try {
    const { sucursalAbastecedoraId, items } = req.body

    if (!sucursalAbastecedoraId) {
      return res.status(400).json({
        message: 'Sucursal abastecedora es requerida',
      })
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'El pedido debe contener al menos un item',
      })
    }

    const pedido = await crearPedidoInterno({
      sucursalSolicitanteId: req.user!.sucursalId,
      sucursalAbastecedoraId,
      items,
    })

    res.status(201).json(pedido)
  } catch (error: any) {
    res.status(400).json({
      message: error.message ?? 'Error al crear pedido interno',
    })
  }
}

/* =====================================================
   Listar pedidos creados por mi sucursal
===================================================== */
export async function listarPedidosPropios(
  req: Request,
  res: Response
) {
  try {
    const pedidos = await getPedidosPorSolicitante(
      req.user!.sucursalId
    )

    res.json(pedidos)
  } catch (error: any) {
    res.status(400).json({
      message: error.message ?? 'Error al listar pedidos propios',
    })
  }
}

/* =====================================================
   Listar pedidos que debo abastecer
===================================================== */
export async function listarPedidosRecibidos(
  req: Request,
  res: Response
) {
  try {
    const pedidos = await getPedidosPorAbastecedora(
      req.user!.sucursalId
    )

    res.json(pedidos)
  } catch (error: any) {
    res.status(400).json({
      message: error.message ?? 'Error al listar pedidos recibidos',
    })
  }
}

/* =====================================================
   Preparar pedido interno
===================================================== */
export async function prepararPedido(
  req: Request,
  res: Response
) {
  try {
    const { items } = req.body

    if (!Array.isArray(items)) {
      return res.status(400).json({
        message: 'Items a preparar inválidos',
      })
    }

    const pedido = await prepararPedidoInterno(
      req.params.id,
      items,
      req.user!.sucursalId
    )

    res.json(pedido)
  } catch (error: any) {
    res.status(400).json({
      message: error.message ?? 'Error al preparar pedido',
    })
  }
}