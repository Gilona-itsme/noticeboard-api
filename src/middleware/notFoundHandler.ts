import type { RequestHandler } from 'express';

const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.path,
    method: req.method,
  });
};

export default notFoundHandler;