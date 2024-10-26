export class PromptSecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PromptSecurityError';
  }
}
