import axios from 'axios';
import { PromptSecurity } from '../src/prompt-security';
import { ProtectActions } from '../src/constants';
import { PromptSecurityError, ErrorCode } from '../src/errors';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PromptSecurity Client Integration', () => {
  const mockSuccessResponse = {
    data: {
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
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('creates client with default configuration', () => {
      const client = new PromptSecurity({ appId: 'test-app-id' });
      expect(client).toBeInstanceOf(PromptSecurity);
    });

    it('throws error on invalid configuration', () => {
      expect(() => new PromptSecurity({ appId: '' }))
        .toThrow(PromptSecurityError);
    });
  });

  describe('API Interaction', () => {
    const client = new PromptSecurity({ appId: 'test-app-id' });

    describe('protectPrompt', () => {
      it('sends correct request format', async () => {
        mockedAxios.post.mockResolvedValueOnce(mockSuccessResponse);

        await client.protectPrompt({
          prompt: 'Test prompt',
          systemPrompt: 'Be nice',
          metadata: {
            user: 'test-user',
            conversationId: 'conv-123',
          },
        });

        expect(mockedAxios.post).toHaveBeenCalledWith(
          'https://eu.prompt.security/api/protect',
          {
            prompt: 'Test prompt',
            system_prompt: 'Be nice',
            user: 'test-user',
            conversation_id: 'conv-123',
          },
          expect.objectContaining({
            headers: {
              'APP-ID': 'test-app-id',
              'Content-Type': 'application/json',
            },
          })
        );
      });

      it('returns properly transformed response', async () => {
        mockedAxios.post.mockResolvedValueOnce(mockSuccessResponse);

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
        });
      });
    });

    describe('protectResponse', () => {
      it('handles response protection request', async () => {
        mockedAxios.post.mockResolvedValueOnce(mockSuccessResponse);

        await client.protectResponse({
          response: 'Test response',
          promptResponseId: 'prev-123',
          metadata: {
            user: 'test-user',
          },
        });

        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.any(String),
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
      it('handles multiple prompts request', async () => {
        mockedAxios.post.mockResolvedValueOnce(mockSuccessResponse);

        await client.protectMultiplePrompts({
          prompts: ['Prompt 1', 'Prompt 2'],
          systemPrompt: 'Be nice',
        });

        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.any(String),
          {
            prompts: ['Prompt 1', 'Prompt 2'],
            system_prompt: 'Be nice',
          },
          expect.any(Object)
        );
      });
    });
  });

  describe('Error Handling', () => {
    const client = new PromptSecurity({ 
      appId: 'test-app-id',
      timeout: 3000,
    });

    it('handles timeout errors', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        code: 'ECONNABORTED',
        message: 'timeout of 3000ms exceeded',
      });

      await expect(client.protectPrompt({
        prompt: 'test',
      })).rejects.toThrow(new PromptSecurityError(
        'Request timed out',
        ErrorCode.TIMEOUT,
        expect.anything()
      ));
    });

    it('handles API errors', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          status: 'failed',
          reason: 'Invalid request',
          result: null,
        },
      });

      await expect(client.protectPrompt({
        prompt: 'test',
      })).rejects.toThrow(PromptSecurityError);
    });

    it('handles network errors', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

      await expect(client.protectPrompt({
        prompt: 'test',
      })).rejects.toThrow(PromptSecurityError);
    });
  });
});