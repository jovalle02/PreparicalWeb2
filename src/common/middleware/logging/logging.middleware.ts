import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    // Capturar cuando la respuesta termina
    res.on('finish', () => {
      const { statusCode } = res;
      const processingTime = Date.now() - startTime;
      
      // Log
      const logMessage = `[${new Date().toISOString()}] ${method} ${originalUrl} - Status: ${statusCode} - Time: ${processingTime}ms`;
      
      console.log(logMessage);
    });

    next();
  }
}