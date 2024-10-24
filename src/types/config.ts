import { z } from 'zod';

export const ConfigSchema = z.object({
  appId: z.string(),
  endpoint: z.string().url(),
  timeout: z.number().positive(),
});

export type PromptSecurityConfig = z.infer<typeof ConfigSchema>;