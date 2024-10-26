import { PromptSecurity } from '../src/prompt-security';
import dotenv from 'dotenv';
dotenv.config();  // Add this at the top

/**
 * Debug/Development Tests
 * 
 * These tests are always skipped by default.
 * To use them for debugging:
 * 1. Replace 'your-app-id' with your Prompt Security APP-ID
 * 2. Remove .skip from the describe block you want to run
 * 3. Run: npx jest client.debug.spec.ts
 */

describe.skip('Debug: PromptSecurity API', () => {
  const client = new PromptSecurity({
    appId: 'your-app-id',  // 👈 Replace with your APP-ID
    endpoint: 'https://eu.prompt.security',
    // timeout: 5000, // Optional: customize timeout
  });

  it('debug protect prompt', async () => {
    const result = await client.protectPrompt({
      prompt: 'Your test prompt here',
      systemPrompt: 'Optional system prompt',
      metadata: {
        user: 'test-user',
        conversationId: 'test-123',
      },
    });

    console.log('Protect Prompt Result:', JSON.stringify(result, null, 2));
  });

  it('debug protect response', async () => {
    const result = await client.protectResponse({
      response: 'Your test response here',
      promptResponseId: 'optional-previous-prompt-id',
    });

    console.log('Protect Response Result:', JSON.stringify(result, null, 2));
  });

  it('debug protect multiple prompts', async () => {
    const result = await client.protectMultiplePrompts({
      prompts: [
        'First test prompt',
        'Second test prompt',
        'Third test prompt'
      ],
      systemPrompt: 'Optional system prompt',
    });

    console.log('Protect Multiple Prompts Result:', JSON.stringify(result, null, 2));
  });
});