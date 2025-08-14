/**
 * 🚀 CROPGENIUS API RESPONSE HANDLER
 * Standardized API response handling for production
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId?: string;
    version?: string;
  };
}

export class ApiResponseHandler {
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }

  static error(code: string, message: string, status = 500, details?: any): ApiResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }

  static validation(field: string, message: string): ApiResponse {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Validation failed for field "${field}": ${message}`,
        details: { field, message }
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }

  static loading(): ApiResponse {
    return {
      success: false,
      error: {
        code: 'LOADING',
        message: 'Request is being processed...'
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }
}