import axios from 'axios';
import { z } from 'zod';
import { ApiResponse, ProtectResult } from './types/responses';
import {
  ProtectPromptRequest,
  ProtectResponseRequest,
  ProtectMultiplePromptsRequest,
  ProtectRequest,
} from './types/requests';
import { PromptSecurityConfig } from './types/config';
import { PromptSecurityAPIError, PromptSecurityError, PromptSecurityTimeoutError } from './errors';
import { toApiRequest, fromApiResponse } from './utils/transform';

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
    this.endpoint = new URL('/api/protect', config.endpoint).toString();
    this.timeout = config.timeout || 3000;
  }

  private async makeRequest(data: ProtectRequest): Promise<ProtectResult> {
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

      return fromApiResponse(response.data);
    } catch (error: any) {
      // TODO: Need more examples of how the REST API fails to determine the error message
      if (error instanceof PromptSecurityAPIError) {
        throw error;
      }

      if (error.code === 'ECONNABORTED') {
        throw new PromptSecurityTimeoutError(error.message);
      }

      throw new PromptSecurityError( error.message );
    }
  }

  async protectPrompt(request: ProtectPromptRequest): Promise<ProtectResult> {
    return this.makeRequest(request);
  }

  async protectResponse( request: ProtectResponseRequest ): Promise<ProtectResult> {
    return this.makeRequest(request);
  }

  async protectMultiplePrompts( request: ProtectMultiplePromptsRequest ): Promise<ProtectResult> {
    return this.makeRequest(request);
  }
}
