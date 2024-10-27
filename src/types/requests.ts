export type ProtectType = 'prompt' | 'response' | 'prompts';

export interface PromptMetadata {
  user?: string;
  userGroups?: string[];
  conversationId?: string;
  policyName?: string;
  monitorOnly?: boolean;
  ipAddress?: string;
  country?: string;
  llmModel?: string;
}

export interface BaseRequest {
  systemPrompt?: string;
  metadata?: PromptMetadata;
}

export interface ProtectPromptRequest extends BaseRequest {
  prompt: string;
}

export interface ProtectResponseRequest {
  response: string;
  promptResponseId?: string;
  metadata?: PromptMetadata;
}

export interface ProtectMultiplePromptsRequest extends BaseRequest {
  prompts: string[];
}

export type ProtectRequest = 
  | ProtectPromptRequest 
  | ProtectResponseRequest 
  | ProtectMultiplePromptsRequest;

