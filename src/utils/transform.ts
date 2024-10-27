import { ApiResponse, ProtectResult } from '../types/responses';
import { PromptSecurityAPIError } from '../errors';
import { objectToSnake } from 'ts-case-convert';
import { ProtectRequest } from '../types/requests';

export const toApiRequest = (data: ProtectRequest) => {
  const { metadata, ...rest } = data;
  return objectToSnake({
    ...rest,
    ...metadata
  });
};

export const fromApiResponse = (apiResponse: ApiResponse): ProtectResult => {
  if (apiResponse.status === 'failed' || !apiResponse.result) {
    throw new PromptSecurityAPIError(
      apiResponse.reason || 'API request failed',
    );
  }

  return {
    action: apiResponse?.result?.prompt?.action,
    violations: apiResponse?.result?.prompt?.violations,
    modifiedText: apiResponse?.result?.prompt?.modified_text,
    conversationId: apiResponse?.result?.conversation_id,
    latency: apiResponse?.result?.latency,
    requestId: apiResponse?.result?.prompt_response_id,
    raw: apiResponse,
  };
};