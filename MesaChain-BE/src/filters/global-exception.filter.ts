import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
  
  @Catch()
  export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);
  
    catch(exception: unknown, host: ArgumentsHost): void {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>();
  
      const timestamp = new Date().toISOString();
      const path = request.url;
      const method = request.method;
  
      // Default error response
      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Internal server error';
      let error = 'InternalServerError';
      let details: any = null;
  
      // Handle different types of exceptions
      if (exception instanceof HttpException) {
        // NestJS HTTP exceptions (BadRequestException, NotFoundException, etc.)
        status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
        
        if (typeof exceptionResponse === 'object') {
          message = (exceptionResponse as any).message || exception.message;
          error = (exceptionResponse as any).error || exception.name;
          details = (exceptionResponse as any).details || null;
        } else {
          message = exceptionResponse as string;
          error = exception.name;
        }
      } else if (exception instanceof PrismaClientKnownRequestError) {
        // Prisma database errors
        status = this.handlePrismaError(exception);
        message = this.getPrismaErrorMessage(exception);
        error = 'DatabaseError';
        details = {
          code: exception.code,
          target: exception.meta?.target,
        };
      } else if (exception instanceof Error) {
        // Generic errors
        message = exception.message;
        error = exception.name;
        
        // Handle specific error types
        if (exception.name === 'ValidationError') {
          status = HttpStatus.BAD_REQUEST;
          error = 'ValidationError';
        } else if (exception.name === 'UnauthorizedError') {
          status = HttpStatus.UNAUTHORIZED;
          error = 'UnauthorizedError';
        } else if (exception.name === 'ForbiddenError') {
          status = HttpStatus.FORBIDDEN;
          error = 'ForbiddenError';
        }
      }
  
      // Create standardized error response
      const errorResponse = {
        success: false,
        error: {
          type: error,
          message,
          details,
        },
        timestamp,
        path,
        method,
        statusCode: status,
      };
  
      // Log the error with appropriate level
      const logContext = {
        method,
        path,
        statusCode: status,
        error: error,
        message,
        timestamp,
        ...(details && { details }),
      };
  
      if (status >= 500) {
        // Server errors - log as error with full stack trace
        this.logger.error(
          `${method} ${path} - ${status} ${error}: ${message}`,
          exception instanceof Error ? exception.stack : JSON.stringify(exception),
          logContext,
        );
      } else if (status >= 400) {
        // Client errors - log as warning
        this.logger.warn(
          `${method} ${path} - ${status} ${error}: ${message}`,
          logContext,
        );
      } else {
        // Other cases - log as info
        this.logger.log(
          `${method} ${path} - ${status} ${error}: ${message}`,
          logContext,
        );
      }
  
      // Send error response
      response.status(status).json(errorResponse);
    }
  
    private handlePrismaError(exception: PrismaClientKnownRequestError): number {
      switch (exception.code) {
        case 'P2002':
          // Unique constraint violation
          return HttpStatus.CONFLICT;
        case 'P2025':
          // Record not found
          return HttpStatus.NOT_FOUND;
        case 'P2003':
          // Foreign key constraint violation
          return HttpStatus.BAD_REQUEST;
        case 'P2004':
          // Constraint violation
          return HttpStatus.BAD_REQUEST;
        case 'P1001':
          // Database connection error
          return HttpStatus.SERVICE_UNAVAILABLE;
        case 'P1002':
          // Database timeout
          return HttpStatus.REQUEST_TIMEOUT;
        default:
          return HttpStatus.INTERNAL_SERVER_ERROR;
      }
    }
  
    private getPrismaErrorMessage(exception: PrismaClientKnownRequestError): string {
      switch (exception.code) {
        case 'P2002':
          const target = exception.meta?.target as string[];
          return `Resource already exists. ${target ? `Duplicate field(s): ${target.join(', ')}` : ''}`;
        case 'P2025':
          return 'Record not found or could not be deleted';
        case 'P2003':
          return 'Foreign key constraint violation';
        case 'P2004':
          return 'Constraint violation on the database';
        case 'P1001':
          return 'Cannot reach database server';
        case 'P1002':
          return 'Database server timeout';
        default:
          return 'Database operation failed';
      }
    }
  }