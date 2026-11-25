
import { type Request, type Response, type NextFunction } from "express";

const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', error)

  const prismaErrorMap: Record<string, { status: number; message: string }> = {
    P2025: { status: 404, message: 'No entry found' },
    P2003: { status: 400, message: "Linked record does not exist" },
    P2002: { status: 400, message: 'Record with such data already exists' },
    P2026: { status: 400, message: 'Unique constraint violation' },
    P2014: { status: 400, message: "Error linking records" },
    P2009: { status: 400, message: 'Data validation error' },
  }

  if ('code' in error && typeof error.code === 'string') {
    const mappedError = prismaErrorMap[error.code]
    if (mappedError) {
      const { status, message } = mappedError
      return res.status(status).json({
        error: message,
        code: error.code,
      })
    }
  }

  if (error instanceof SyntaxError && 'status' in error && (error as any).status === 400 && 'body' in error) {
    return res.status(400).json({
      error: 'Invalid JSON in request body',
    })
  }

  res.status(500).json({
    error: 'Internal server error',
  })
}

export default errorHandler;
