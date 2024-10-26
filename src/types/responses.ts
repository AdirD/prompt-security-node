export type ProtectAction = "log" | "block" | "modify";

export interface ProtectResult {
  action: ProtectAction;
  conversationId: string;
  latency: number;
  requestId: string;
  violations?: string[];
  modifiedText?: string;
}

export interface ApiResponse {
  status: "success" | "failed";
  reason: string | null;
  result?: {
    conversation_id: string;
    latency: number;
    prompt_response_id: string;
    prompt: {
      action: ProtectAction;
      violations?: string[];
      modified_text?: string;
    };
  };
}
