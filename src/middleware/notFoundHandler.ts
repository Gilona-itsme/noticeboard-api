import { type Request, type Response, type NextFunction } from "express";


 const notFoundHandler = (req: Request, res: Response) => {
    res.status(404).json({
      error: 'Route not found',
      path: req.path,
      method: req.method,
    })
  }


export default notFoundHandler;