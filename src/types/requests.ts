import { z } from 'zod';

export const PromptMetadataSchema = z.object({
  user: z.string().optional(),
  userGroups: z.array(z.string()).optional(),
  conversationId: z.string().optional(),
  policyName: z.string().optional(),
  monitorOnly: z.boolean().optional(),
  ipAddress: z.string().optional(),
  country: z.string().optional(),
  llmModel: z.string().optional(),
});

export const BaseRequestSchema = z.object({
  systemPrompt: z.string().optional(),
  metadata: PromptMetadataSchema.optional(),
});

export const ProtectPromptRequestSchema = BaseRequestSchema.extend({
  prompt: z.string(),
});

export const ProtectResponseRequestSchema = z.object({
  response: z.string(),
  promptResponseId: z.string().optional(),
  metadata: PromptMetadataSchema.optional(),
});

export const ProtectMultiplePromptsRequestSchema = BaseRequestSchema.extend({
  prompts: z.array(z.string()).min(1),
});

export type PromptMetadata = z.infer<typeof PromptMetadataSchema>;
export type ProtectPromptRequest = z.infer<typeof ProtectPromptRequestSchema>;
export type ProtectResponseRequest = z.infer<typeof ProtectResponseRequestSchema>;
export type ProtectMultiplePromptsRequest = z.infer<typeof ProtectMultiplePromptsRequestSchema>;
