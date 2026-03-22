import { Response } from 'express'

export function ok<T>(res: Response, data: T, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data })
}

export function created<T>(res: Response, data: T) {
  return ok(res, data, 201)
}

export function noContent(res: Response) {
  return res.status(204).send()
}

export function paginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  })
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: unknown[]
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const notFound = (resource = 'Resource') =>
  new ApiError(404, `${resource} not found`)

export const forbidden = (msg = 'Forbidden') =>
  new ApiError(403, msg)

export const unauthorized = (msg = 'Unauthorized') =>
  new ApiError(401, msg)

export const badRequest = (msg: string, errors?: unknown[]) =>
  new ApiError(400, msg, errors)
