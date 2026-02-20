import { Types } from 'mongoose'
import { AperturaCajaModel } from '../aperturaCaja/aperturaCaja.model'
import { VentaModel } from '../../venta/venta.model'

interface ListarAperturasAdminInput {
  from?: Date
  to?: Date
  page?: number
  limit?: number
}

export const listarAperturasAdmin = async (
  filtros: ListarAperturasAdminInput
) => {

  const query: any = {}

  if (filtros.from || filtros.to) {
    query.fechaApertura = {}
    if (filtros.from) query.fechaApertura.$gte = filtros.from
    if (filtros.to) query.fechaApertura.$lte = filtros.to
  }

  const page = filtros.page ?? 1
  const limit = filtros.limit ?? 10
  const skip = (page - 1) * limit

  const [aperturas, total] = await Promise.all([
    AperturaCajaModel.find(query)
      .sort({ fechaApertura: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    AperturaCajaModel.countDocuments(query),
  ])

  const data = []

  for (const apertura of aperturas) {

    const ventas = await VentaModel.find({
      aperturaCajaId: apertura._id,
    })
      .sort({ createdAt: 1 })
      .lean()

    const totalCobrado = ventas.reduce(
      (sum, v) => sum + (v.totalCobrado || 0),
      0
    )

    data.push({
      aperturaId: apertura._id,
      fechaApertura: apertura.fechaApertura,
      fechaCierre: apertura.fechaCierre,
      estado: apertura.estado,

      totalVentas: ventas.length,
      totalCobrado,

      ventas,
    })
  }

  return {
    data,
    page,
    totalPages: Math.ceil(total / limit),
  }
}