import { z } from 'zod';
import { ProtectActions } from '../constants';

export const ProtectResultSchema = z.object({
  action: z.enum([ProtectActions.LOG, ProtectActions.BLOCK, ProtectActions.MODIFY]),
  conversationId: z.string(),
  latency: z.number(),
  requestId: z.string(),
  violations: z.array(z.string()).optional(),
  modifiedText: z.string().optional(),
});

export const ApiResultSchema = z.object({
  conversation_id: z.string(),
  latency: z.number(),
  prompt_response_id: z.string(),
  prompt: z.object({
    action: z.enum([ProtectActions.LOG, ProtectActions.BLOCK, ProtectActions.MODIFY]),
    violations: z.array(z.string()).optional(),
    modified_text: z.string().optional(),
  }),
});

export const ApiResponseSchema = z.object({
  status: z.enum(['success', 'failed']),
  reason: z.string().nullable(),
  result: ApiResultSchema.optional(),
});

export type ProtectResult = z.infer<typeof ProtectResultSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;