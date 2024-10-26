import axios from 'axios';
import { z } from 'zod';
import { ApiResponse, ProtectResult } from './types/responses';
import {
  ProtectPromptRequest,
  ProtectResponseRequest,
  ProtectMultiplePromptsRequest,
} from './types/requests';
import { PromptSecurityConfig } from './types/config';
import { PromptSecurityError } from './errors';
import { toApiRequest, transformApiResponse } from './utils/transform';

export class PromptSecurity {
  private readonly appId: string;
  private readonly endpoint: string;
  private readonly timeout: number;

  constructor(config: PromptSecurityConfig) {
    if (!config.appId) {
      throw new PromptSecurityError('appId is required');
    }

    if (
      !config.endpoint ||
      !z.string().url().safeParse(config.endpoint).success
    ) {
      throw new PromptSecurityError('endpoint must be a valid url');
    }

    this.appId = config.appId;
    this.endpoint = config.endpoint;
    this.timeout = config.timeout || 3000;
  }

  private async makeRequest(data: Record<string, any>): Promise<ProtectResult> {
    try {
      const response = await axios.post<ApiResponse>(
        this.endpoint,
        toApiRequest(data),
        {
          headers: {
            'APP-ID': this.appId,
            'Content-Type': 'application/json',
          },
          timeout: this.timeout,
        }
      );

      if (response.data.status === 'failed') {
        throw new PromptSecurityError(
          response.data.reason || 'API request failed'
        );
      }

      return transformApiResponse(response.data);
    } catch (error) {
      // TODO: more information about structure of errors from Prompt Security
      if (error instanceof PromptSecurityError) {
        throw error;
      }

      throw new PromptSecurityError(
        error instanceof Error ? error.message : 'Request failed'
      );
    }
  }

  async protectPrompt(request: ProtectPromptRequest): Promise<ProtectResult> {
    const requestData = {
      prompt: request.prompt,
      systemPrompt: request.systemPrompt,
      ...request.metadata,
    };

    return this.makeRequest(requestData);
  }

  async protectResponse(
    request: ProtectResponseRequest
  ): Promise<ProtectResult> {
    const requestData = {
      response: request.response,
      promptResponseId: request.promptResponseId,
      ...request.metadata,
    };

    return this.makeRequest(requestData);
  }

  async protectMultiplePrompts(
    request: ProtectMultiplePromptsRequest
  ): Promise<ProtectResult> {
    const requestData = {
      prompts: request.prompts,
      systemPrompt: request.systemPrompt,
      ...request.metadata,
    };

    return this.makeRequest(requestData);
  }
}
