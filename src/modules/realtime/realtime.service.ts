import { Request, Response } from 'express'
import { RealtimeEventPayload } from './realtime.types'

type Client = {
  res: Response
  heartbeat: NodeJS.Timeout
}

const clientsBySucursal = new Map<string, Set<Client>>()

const HEARTBEAT_INTERVAL = 25_000

export function registerSSEClient(
  req: Request,
  res: Response,
  sucursalId: string
) {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  res.flushHeaders?.()

  const client: Client = {
    res,
    heartbeat: setInterval(() => {
      res.write(': heartbeat\n\n')
    }, HEARTBEAT_INTERVAL),
  }

  if (!clientsBySucursal.has(sucursalId)) {
    clientsBySucursal.set(sucursalId, new Set())
  }

  clientsBySucursal.get(sucursalId)!.add(client)

  req.on('close', () => {
    clearInterval(client.heartbeat)
    clientsBySucursal.get(sucursalId)?.delete(client)

    if (clientsBySucursal.get(sucursalId)?.size === 0) {
      clientsBySucursal.delete(sucursalId)
    }
  })
}

/**
 * Emite evento SSE
 */
export function emitRealtimeEvent(payload: RealtimeEventPayload) {
  // 🔥 EVENTOS GLOBALES (PRODUCTOS)
  if (payload.sucursalId === 'GLOBAL') {
    for (const clients of clientsBySucursal.values()) {
      for (const client of clients) {
        client.res.write(
          `data: ${JSON.stringify(payload)}\n\n`
        )
      }
    }

    console.log(`[SSE] ${payload.type} → GLOBAL`)
    return
  }

  // 🎯 EVENTOS POR SUCURSAL (CAJA)
  const clients = clientsBySucursal.get(payload.sucursalId)
  if (!clients) return

  for (const client of clients) {
    client.res.write(
      `data: ${JSON.stringify(payload)}\n\n`
    )
  }

  console.log(
    `[SSE] ${payload.type} → sucursal ${payload.sucursalId} (${clients.size})`
  )
}