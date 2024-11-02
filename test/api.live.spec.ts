import { PromptSecurity } from '../src/prompt-security';
import dotenv from 'dotenv';
dotenv.config();

describe('Live: PromptSecurity API', () => {
  // 👇 Replace with your own settings or create a .env with the secrets
  const client = new PromptSecurity({
    appId: process.env.PROMPT_SECURITY_APP_ID as string,
    endpoint: process.env.PROMPT_SECURITY_ENDPOINT as string,
  });

  it('debug protect prompt', async () => {
    const resultRequest = await client.protectPrompt({
      prompt: 'Your test prompt here',
      systemPrompt: 'Optional system prompt',
    });
    const resultResponse = await client.protectResponse({
      response: 'Your test prompt here',
      systemPrompt: 'Optional system prompt',
      metadata: {
        promptResponseId: resultRequest.promptResponseId,
      }
    });


    console.log('Protect Prompt Result:', JSON.stringify(resultResponse, null, 2));
    console.log('Protect Prompt Request Result:', JSON.stringify(resultRequest, null, 2));
  });

  it('debug protect response', async () => {
    const result = await client.protectResponse({
      response: 'Your test response here',
      metadata: {
        promptResponseId: 'optional-previous-prompt-id',
      }
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