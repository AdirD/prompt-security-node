export enum ErrorCode {
    INVALID_CONFIG = 'INVALID_CONFIG',
    INVALID_REQUEST = 'INVALID_REQUEST',
    NETWORK_ERROR = 'NETWORK_ERROR',
    TIMEOUT = 'TIMEOUT',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    UNEXPECTED_ERROR = 'UNEXPECTED_ERROR'
  }
  
  export class PromptSecurityError extends Error {
    constructor(
      message: string, 
      public readonly code: ErrorCode,
      public readonly cause?: unknown
    ) {
      super(message);
      this.name = 'PromptSecurityError';
    }
  }