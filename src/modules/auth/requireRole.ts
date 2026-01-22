import { Request, Response, NextFunction } from 'express'

export function requireRole(
  roles: Array<'ADMIN' | 'ENCARGADO' | 'BODEGUERO' | 'CAJERO'>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user

    if (!user) {
      return res.status(401).json({ message: 'No autorizado' })
    }

    if (!roles.includes(user.rol as any)) {
      return res.status(403).json({
        message: 'No tienes permisos para esta acción',
      })
    }

    next()
  }
}