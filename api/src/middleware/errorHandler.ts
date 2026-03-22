import { Request, Response, NextFunction } from 'express'
import { ApiError } from '../lib/response'
import { Prisma } from '@prisma/client'

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Known API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    })
  }

  // Prisma unique constraint
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const field = (err.meta?.target as string[])?.join(', ') ?? 'field'
      return res.status(409).json({
        success: false,
        message: `A record with this ${field} already exists`,
      })
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Record not found' })
    }
  }

  // Validation errors from express-validator
  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: err.message })
  }

  // Unknown errors
  console.error('Unhandled error:', err)
  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  })
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ success: false, message: 'Route not found' })
}
