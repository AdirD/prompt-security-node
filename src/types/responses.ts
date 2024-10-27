export type Action = 'log' | 'block' | 'modify';

export interface ProtectResult {
  action: Action;
  conversationId: string;
  latency: number;
  promptResponseId: string;
  violations: string[] | null;
  modifiedText: string | null;
  raw: any;
}

export interface ApiResponse {
  status: 'success' | 'failed';
  reason: string | null;
  result: {
    conversation_id: string;
    latency: number;
    prompt_response_id: string;
    // TODO: Break down the ApiResponse per the different request
    prompt?: ProtectResultScanners;
    response?: ProtectResultScanners;
    prompts?: ProtectResultScanners;
  };
}

export interface ProtectResultScanners {
  action: Action;
  violations: string[] | null;
  modified_text: string | null;
}