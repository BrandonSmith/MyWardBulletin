import { toast } from 'react-toastify';

export interface ErrorInfo {
  message: string;
  code?: string;
  context?: string;
  timestamp: Date;
  userAgent?: string;
  url?: string;
}

export class AppError extends Error {
  public code: string;
  public context: string;
  public isUserFriendly: boolean;
  public shouldRetry: boolean;
  public retryCount: number;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    context: string = 'general',
    isUserFriendly: boolean = false,
    shouldRetry: boolean = false
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.context = context;
    this.isUserFriendly = isUserFriendly;
    this.shouldRetry = shouldRetry;
    this.retryCount = 0;
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network connection failed', context: string = 'network') {
    super(message, 'NETWORK_ERROR', context, true, true);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context: string = 'validation') {
    super(message, 'VALIDATION_ERROR', context, true, false);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', context: string = 'auth') {
    super(message, 'AUTH_ERROR', context, true, false);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', context: string = 'database') {
    super(message, 'DATABASE_ERROR', context, false, true);
  }
}

// Error message mappings
const ERROR_MESSAGES: Record<string, string> = {
  // Network errors
  'NETWORK_ERROR': 'Connection failed. Please check your internet connection and try again.',
  'TIMEOUT_ERROR': 'The request took too long. Please try again.',
  'CONNECTION_REFUSED': 'Unable to connect to the server. Please try again later.',
  
  // Authentication errors
  'AUTH_ERROR': 'Please sign in again to continue.',
  'INVALID_CREDENTIALS': 'Invalid email or password. Please try again.',
  'SESSION_EXPIRED': 'Your session has expired. Please sign in again.',
  'UNAUTHORIZED': 'You are not authorized to perform this action.',
  
  // Validation errors
  'VALIDATION_ERROR': 'Please check your input and try again.',
  'REQUIRED_FIELD': 'This field is required.',
  'INVALID_EMAIL': 'Please enter a valid email address.',
  'INVALID_FORMAT': 'Please check the format and try again.',
  
  // Database errors
  'DATABASE_ERROR': 'Unable to save your data. Please try again.',
  'DUPLICATE_ENTRY': 'This item already exists.',
  'NOT_FOUND': 'The requested item was not found.',
  'CONSTRAINT_VIOLATION': 'Unable to save due to data constraints.',
  
  // File errors
  'FILE_TOO_LARGE': 'The file is too large. Please choose a smaller file.',
  'INVALID_FILE_TYPE': 'Please choose a valid file type.',
  'UPLOAD_FAILED': 'File upload failed. Please try again.',
  
  // General errors
  'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again.',
  'SERVICE_UNAVAILABLE': 'The service is temporarily unavailable. Please try again later.',
  'RATE_LIMIT_EXCEEDED': 'Too many requests. Please wait a moment and try again.',
};

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error context information
export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  timestamp: Date;
  url: string;
  userAgent: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: ErrorInfo[] = [];
  private maxLogSize = 100;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Handle and log errors
  handleError(
    error: Error | AppError,
    context?: Partial<ErrorContext>,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM
  ): void {
    const errorInfo = this.createErrorInfo(error, context);
    
    // Log the error
    this.logError(errorInfo, severity);
    
    // Show user-friendly message
    this.showUserMessage(error, severity);
    
    // Report to external service (if configured)
    this.reportError(errorInfo, severity);
  }

  // Create error info object
  private createErrorInfo(error: Error | AppError, context?: Partial<ErrorContext>): ErrorInfo {
    const errorContext: ErrorContext = {
      component: context?.component || 'unknown',
      action: context?.action || 'unknown',
      userId: context?.userId,
      sessionId: context?.sessionId,
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...context
    };

    return {
      message: error.message,
      code: error instanceof AppError ? error.code : 'UNKNOWN_ERROR',
      context: error instanceof AppError ? error.context : 'general',
      timestamp: errorContext.timestamp,
      userAgent: errorContext.userAgent,
      url: errorContext.url
    };
  }

  // Log error locally
  private logError(errorInfo: ErrorInfo, severity: ErrorSeverity): void {
    const logEntry = {
      ...errorInfo,
      severity,
      timestamp: errorInfo.timestamp
    };

    this.errorLog.push(logEntry);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }

    // Console logging in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error (${severity}): ${errorInfo.code}`);
      console.error('Message:', errorInfo.message);
      console.error('Context:', errorInfo.context);
      console.error('URL:', errorInfo.url);
      console.error('Timestamp:', errorInfo.timestamp);
      console.groupEnd();
    }
  }

  // Show user-friendly message
  private showUserMessage(error: Error | AppError, severity: ErrorSeverity): void {
    const message = this.getUserFriendlyMessage(error);
    
    switch (severity) {
      case ErrorSeverity.LOW:
        toast.info(message, { autoClose: 3000 });
        break;
      case ErrorSeverity.MEDIUM:
        toast.error(message, { autoClose: 5000 });
        break;
      case ErrorSeverity.HIGH:
        toast.error(message, { autoClose: 8000 });
        break;
      case ErrorSeverity.CRITICAL:
        toast.error(message, { autoClose: false });
        break;
    }
  }

  // Get user-friendly error message
  getUserFriendlyMessage(error: Error | AppError): string {
    if (error instanceof AppError && error.isUserFriendly) {
      return error.message;
    }

    const code = error instanceof AppError ? error.code : 'UNKNOWN_ERROR';
    return ERROR_MESSAGES[code] || ERROR_MESSAGES['UNKNOWN_ERROR'];
  }

  // Report error to external service
  private reportError(errorInfo: ErrorInfo, severity: ErrorSeverity): void {
    // In a real application, you would send this to an error reporting service
    // like Sentry, LogRocket, or your own error tracking system
    
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
      console.warn('Error would be reported to external service:', {
        errorInfo,
        severity
      });
    }
  }

  // Get error log
  getErrorLog(): ErrorInfo[] {
    return [...this.errorLog];
  }

  // Clear error log
  clearErrorLog(): void {
    this.errorLog = [];
  }

  // Check if error is retryable
  isRetryable(error: Error | AppError): boolean {
    if (error instanceof AppError) {
      return error.shouldRetry;
    }
    
    // Default retryable errors
    const retryableErrors = [
      'Network Error',
      'Failed to fetch',
      'Connection timeout',
      'Service Unavailable'
    ];
    
    return retryableErrors.some(retryableError => 
      error.message.includes(retryableError)
    );
  }

  // Get retry delay based on retry count
  getRetryDelay(retryCount: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
    const baseDelay = 1000;
    const maxDelay = 30000;
    const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
    
    // Add some jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * delay;
    return delay + jitter;
  }
}

// Convenience functions
export const errorHandler = ErrorHandler.getInstance();

export const handleError = (
  error: Error | AppError,
  context?: Partial<ErrorContext>,
  severity?: ErrorSeverity
) => errorHandler.handleError(error, context, severity);

export const getUserFriendlyMessage = (error: Error | AppError): string => 
  errorHandler.getUserFriendlyMessage(error);

export const isRetryable = (error: Error | AppError): boolean => 
  errorHandler.isRetryable(error);

export const getRetryDelay = (retryCount: number): number => 
  errorHandler.getRetryDelay(retryCount);

// Async error wrapper
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: Partial<ErrorContext>,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error as Error, context, severity);
      throw error;
    }
  };
};

// Retry wrapper with exponential backoff
export const withRetry = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  maxRetries: number = 3,
  context?: Partial<ErrorContext>
) => {
  return async (...args: T): Promise<R> => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries || !isRetryable(error as Error)) {
          handleError(error as Error, {
            ...context,
            action: `${context?.action || 'operation'}_retry_failed`
          });
          throw error;
        }
        
        // Wait before retrying
        const delay = getRetryDelay(attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Log retry attempt
        console.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
      }
    }
    
    throw lastError!;
  };
}; 