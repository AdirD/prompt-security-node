import { Action, ApiResponse, ProtectResult } from '../types/responses';
import { objectToSnake } from 'ts-case-convert';
import { ProtectRequest, ProtectType } from '../types/requests';

export const toApiRequest = (data: ProtectRequest) => {
  const { metadata, ...rest } = data;
  return objectToSnake({
    ...rest,
    ...metadata
  });
};

export const fromApiResponse = (apiResponse: ApiResponse, protectType: ProtectType): ProtectResult => {

  return {
    action: apiResponse?.result?.[protectType]?.action as Action,
    violations: apiResponse?.result?.[protectType]?.violations as string[],
    modifiedText: apiResponse?.result?.[protectType]?.modified_text ?? null,
    conversationId: apiResponse?.result?.conversation_id,
    latency: apiResponse?.result?.latency,
    promptResponseId: apiResponse?.result?.prompt_response_id,
    raw: apiResponse,
  };
};