const mockAxiosPost = jest.fn();
const mockIsAxiosError = jest.fn();

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: mockAxiosPost,
  },
  isAxiosError: mockIsAxiosError,
}));

import { PromptSecurity } from '../src/prompt-security';
import { ApiResponse } from '../src/types/responses';
import { PromptSecurityError } from '../src/errors';

describe('PromptSecurity Client Integration', () => {
  const mockSuccessResponse: ApiResponse = {
    status: 'success',
    reason: null,
    result: {
      conversation_id: '123',
      latency: 100,
      prompt_response_id: '456',
      prompt: {
        action: 'modify',
        violations: ['test violation'],
        modified_text: 'modified content',
      },
    },
  };

  const validConfig = {
    appId: 'test-app-id',
    endpoint: 'https://eu.prompt.security/',
    timeout: 3000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('creates client with default configuration', () => {
      const client = new PromptSecurity(validConfig);
      expect(client).toBeInstanceOf(PromptSecurity);
    });

    it('throws error on missing appId', () => {
      expect(() => new PromptSecurity({ ...validConfig, appId: '' })).toThrow(
        PromptSecurityError
      );
    });

    it('throws error on invalid endpoint', () => {
      expect(
        () => new PromptSecurity({ ...validConfig, endpoint: 'invalid-url' })
      ).toThrow(PromptSecurityError);
    });
  });

  describe('protectPrompt', () => {
    const client = new PromptSecurity(validConfig);

    it('sends correct request format', async () => {
      mockAxiosPost.mockResolvedValueOnce({ data: mockSuccessResponse });

      await client.protectPrompt({
        prompt: 'Test prompt',
        systemPrompt: 'Be nice',
        metadata: {
          user: 'test-user',
          conversationId: 'conv-123',
        },
      });

      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://eu.prompt.security/api/protect',
        {
          prompt: 'Test prompt',
          system_prompt: 'Be nice',
          user: 'test-user',
          conversation_id: 'conv-123',
        },
        {
          headers: {
            'APP-ID': 'test-app-id',
            'Content-Type': 'application/json',
          },
          timeout: 3000,
        }
      );
    });

    it('returns transformed response', async () => {
      mockAxiosPost.mockResolvedValueOnce({ data: mockSuccessResponse });

      const result = await client.protectPrompt({
        prompt: 'Test prompt',
      });

      expect(result).toEqual({
        action: 'modify',
        conversationId: '123',
        latency: 100,
        requestId: '456',
        violations: ['test violation'],
        modifiedText: 'modified content',
        raw: mockSuccessResponse,
      });
    });
  });

  describe('protectResponse', () => {
    const client = new PromptSecurity(validConfig);

    it('sends correct request format', async () => {
      mockAxiosPost.mockResolvedValueOnce({ data: mockSuccessResponse });

      await client.protectResponse({
        response: 'Test response',
        promptResponseId: 'prev-123',
        metadata: {
          user: 'test-user',
        },
      });

      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://eu.prompt.security/api/protect',
        {
          response: 'Test response',
          prompt_response_id: 'prev-123',
          user: 'test-user',
        },
        expect.any(Object)
      );
    });
  });

  describe('protectMultiplePrompts', () => {
    const client = new PromptSecurity(validConfig);

    it('sends correct request format', async () => {
      mockAxiosPost.mockResolvedValueOnce({ data: mockSuccessResponse });

      await client.protectMultiplePrompts({
        prompts: ['Prompt 1', 'Prompt 2'],
        systemPrompt: 'Be nice',
      });

      expect(mockAxiosPost).toHaveBeenCalledWith(
        'https://eu.prompt.security/api/protect',
        {
          prompts: ['Prompt 1', 'Prompt 2'],
          system_prompt: 'Be nice',
        },
        expect.any(Object)
      );
    });
  });

  describe('Error Handling', () => {
    const client = new PromptSecurity(validConfig);

    it('handles axios error', async () => {
      mockAxiosPost.mockRejectedValueOnce({
        code: 'ECONNABORTED',
        message: 'Request timedout after 3000ms',
      });

      await expect(
        client.protectPrompt({
          prompt: 'test',
        })
      ).rejects.toThrow('Request timedout after 3000ms');
    });

    it('handles API errors with reason', async () => {
      mockAxiosPost.mockResolvedValueOnce({
        data: {
          status: 'failed',
          reason: 'Invalid request',
        },
      });

      await expect(
        client.protectPrompt({
          prompt: 'test',
        })
      ).rejects.toThrow('API Error: Invalid request');
    });

    it('handles API errors without response', async () => {
      mockAxiosPost.mockResolvedValueOnce({
        data: {
          status: 'failed',
          reason: undefined,
        },
      });

      await expect(
        client.protectPrompt({
          prompt: 'test',
        })
      ).rejects.toThrow('API Error: API request failed');
    });

    it('handles unknown errors', async () => {
      mockAxiosPost.mockRejectedValueOnce(new Error('Unknown error'));

      await expect(
        client.protectPrompt({
          prompt: 'test',
        })
      ).rejects.toThrow('PromptSecurityError: Unknown error');
    });
  });
});
