import axios, { AxiosError } from 'axios';
import { z } from 'zod';
import { 
  ApiResponse,
  ApiResponseSchema,
  ProtectResult
} from './types/responses';
import {
    ProtectPromptRequest,
    ProtectResponseRequest,
    ProtectMultiplePromptsRequest,
} from './types/requests';
import {
    ConfigSchema,
    PromptSecurityConfig,
} from './types/config';
import { PromptSecurityError, ErrorCode } from './errors';
import { toApiRequest, transformApiResponse } from './utils/transform';

export class PromptSecurity {
  private readonly config: Required<PromptSecurityConfig>;

  constructor(config: PromptSecurityConfig) {
    try {
      this.config = ConfigSchema.parse({
        ...config,
        timeout: config.timeout ?? 3000,
      }) as Required<PromptSecurityConfig>;
    } catch (error) {
      throw new PromptSecurityError(
        'Invalid configuration provided',
        ErrorCode.INVALID_CONFIG,
        error
      );
    }
  }

  private async makeRequest(data: Record<string, any>): Promise<ProtectResult> {
    try {
      const response = await axios.post<ApiResponse>(
        this.config.endpoint,
        toApiRequest(data),
        {
          headers: {
            'APP-ID': this.config.appId,
            'Content-Type': 'application/json',
          },
          timeout: this.config.timeout,
        }
      );

      const apiResponse = ApiResponseSchema.parse(response.data);
      return transformApiResponse(apiResponse);

    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new PromptSecurityError(
          'Invalid API response format',
          ErrorCode.VALIDATION_ERROR,
          error
        );
      }
      if (error instanceof AxiosError) {
        if (error.code === 'ECONNABORTED') {
          throw new PromptSecurityError(
            'Request timed out',
            ErrorCode.TIMEOUT,
            error
          );
        }
        throw new PromptSecurityError(
          'Network error occurred',
          ErrorCode.NETWORK_ERROR,
          error
        );
      }
      throw new PromptSecurityError(
        'Unexpected error occurred',
        ErrorCode.UNEXPECTED_ERROR,
        error
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

  async protectResponse(request: ProtectResponseRequest): Promise<ProtectResult> {
    const requestData = {
      response: request.response,
      promptResponseId: request.promptResponseId,
      ...request.metadata,
    };

    return this.makeRequest(requestData);
  }

  async protectMultiplePrompts(request: ProtectMultiplePromptsRequest): Promise<ProtectResult> {
    const requestData = {
      prompts: request.prompts,
      systemPrompt: request.systemPrompt,
      ...request.metadata,
    };

    return this.makeRequest(requestData);
  }
}