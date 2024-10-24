import { ApiResponse, ProtectResult } from '../types/responses';
import { PromptSecurityError, ErrorCode } from '../errors';

export const toApiRequest = <T extends Record<string, any>>(data: T): Record<string, any> => {
  return Object.entries(data).reduce((acc, [key, value]) => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    acc[snakeKey] = value;
    return acc;
  }, {} as Record<string, any>);
};

export const transformApiResponse = (apiResponse: ApiResponse): ProtectResult => {
  if (apiResponse.status === 'failed' || !apiResponse.result) {
    throw new PromptSecurityError(
      apiResponse.reason || 'API request failed',
      ErrorCode.UNEXPECTED_ERROR
    );
  }

  return {
    action: apiResponse.result.prompt.action,
    violations: apiResponse.result.prompt.violations,
    modifiedText: apiResponse.result.prompt.modified_text,
    conversationId: apiResponse.result.conversation_id,
    latency: apiResponse.result.latency,
    requestId: apiResponse.result.prompt_response_id,
  };
};