import { toApiRequest, fromApiResponse } from '../src/utils/transform';
import { ApiResponse } from '../src/types/responses';
import { ProtectPromptRequest, ProtectMultiplePromptsRequest } from '../src/types/requests';

describe('Transform Utils', () => {
  describe('toApiRequest', () => {
    it('transforms single prompt request with all fields', () => {
      const input: ProtectPromptRequest = {
        prompt: 'Hello world',
        systemPrompt: 'Be helpful',
        metadata: {
          userGroups: ['admin', 'user'],
          conversationId: 'conv123',
          policyName: 'default',
          monitorOnly: true,
          ipAddress: '127.0.0.1',
          country: 'US',
          llmModel: 'gpt4'
        }
      };

      expect(toApiRequest(input)).toEqual({
        prompt: 'Hello world',
        system_prompt: 'Be helpful',
        user_groups: ['admin', 'user'],
        conversation_id: 'conv123',
        policy_name: 'default',
        monitor_only: true,
        ip_address: '127.0.0.1',
        country: 'US',
        llm_model: 'gpt4'
      });
    });

    it('transforms multiple prompts request', () => {
      const input: ProtectMultiplePromptsRequest = {
        prompts: ['Hello', 'World'],
        systemPrompt: 'Be nice',
        metadata: {
          userGroups: ['user'],
          conversationId: 'batch123'
        }
      };

      expect(toApiRequest(input)).toEqual({
        prompts: ['Hello', 'World'],
        system_prompt: 'Be nice',
        user_groups: ['user'],
        conversation_id: 'batch123',
      });
    });

    it('handles request with minimal fields', () => {
      const input: ProtectPromptRequest = {
        prompt: 'Hello'
      };

      expect(toApiRequest(input)).toEqual({
        prompt: 'Hello'
      });
    });

    it('preserves undefined values', () => {
      const input: ProtectPromptRequest = {
        prompt: 'Hello',
        systemPrompt: undefined,
        metadata: {
          user: undefined,
          conversationId: undefined
        }
      };

      expect(toApiRequest(input)).toEqual({
        prompt: 'Hello',
        system_prompt: undefined,
        user: undefined,
        conversation_id: undefined,
      });
    });
  });

  describe('fromApiResponse', () => {
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

    it('transforms successful response with all fields', () => {
      const result = fromApiResponse(mockSuccessResponse, 'prompt');

      expect(result).toEqual({
        action: 'modify',
        violations: ['test violation'],
        modifiedText: 'modified content',
        conversationId: '123',
        latency: 100,
        promptResponseId: '456',
        raw: mockSuccessResponse,
      });
    });

    it('transforms response with undefined fields', () => {
      const response: ApiResponse = {
        status: 'success',
        reason: null,
        result: {
          conversation_id: '123',
          latency: 100,
          prompt_response_id: '456',
          prompt: {
            action: 'log',
            violations: [],
            modified_text: null,
          },
        },
      };

      const result = fromApiResponse(response, 'prompt');

      expect(result).toEqual({
        action: 'log',
        violations: [],
        modifiedText: null,
        conversationId: '123',
        latency: 100,
        promptResponseId: '456',
        raw: response,
      });
    });
  });
});