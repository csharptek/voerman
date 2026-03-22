import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken, JwtPayload } from '../lib/jwt'
import { unauthorized, forbidden } from '../lib/response'

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) throw unauthorized()

  const token = authHeader.slice(7)
  try {
    req.user = verifyAccessToken(token)
    next()
  } catch {
    throw unauthorized('Invalid or expired token')
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') throw forbidden('Admin access required')
  next()
}

export function requireVoermanAdmin(req: Request, _res: Response, next: NextFunction) {
  // Voerman staff have a special role - for now same as ADMIN
  // Can be extended with a VOERMAN_ADMIN role later
  if (req.user?.role !== 'ADMIN') throw forbidden('Voerman admin access required')
  next()
}
