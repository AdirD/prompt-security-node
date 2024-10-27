export class PromptSecurityError extends Error {
  constructor(message: string) {
    super(`PromptSecurityError: ${message}`);
    this.name = 'PromptSecurityError';
  }
}

export class PromptSecurityAPIError extends PromptSecurityError {
  constructor(message: string) {
    super(`API Error: ${message}`);
    this.name = 'PromptSecurityAPIError';
  }
}

export class PromptSecurityTimeoutError extends PromptSecurityError {
  constructor(message: string) {
    super(`Timeout Error: ${message}`);
    this.name = 'PromptSecurityTimeoutError';
  }
}
