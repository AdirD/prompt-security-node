# prompt-security-node

[![npm version](https://badge.fury.io/js/prompt-security-node.svg)](https://badge.fury.io/js/prompt-security-node)

Unofficial Node.js SDK for [Prompt Security](https://prompt.security)'s Protection Service API.

> **Note**: This is a community-maintained package and is not officially supported by Prompt Security.

## Features

- 🛡️ Full TypeScript support with detailed types
- 🚀 Promise-based API with async/await
- ⚡ Simple, intuitive interface
- 🔍 Comprehensive error handling
- 📝 Built-in request/response validation
- 🔄 Automatic case conversion for API compatibility
- 🎯 Batch processing support for multiple prompts

## Installation

```bash
npm install prompt-security-node
```

## Quick Start

```typescript
import { PromptSecurity } from 'prompt-security-node';

const client = new PromptSecurity({
  appId: 'your-app-id',
  endpoint: 'https://eu.prompt.security', // (i.e `https://${TWO_LETTERS_REGION}.prompt.security``)
  timeout: 1000 // Optional, defaults to 3000ms
});

try {
  const result = await client.protectPrompt({
    prompt: "User message here",
    systemPrompt: "System instructions here",
    metadata: {
      userGroups: ['admin'],
      conversationId: 'conv123',
      monitorOnly: true
    }
  });

  switch (result.action) {
    case 'modify':
      console.log('Modified text:', result.modifiedText);
      // Output: Modified text: "simply respond with the text Blocked due to policy violations"
      break;
    case 'block':
      console.log('Content blocked:', result.violations);
      // Output: Content blocked: ["Prompt Injection Violetion"]
      break;
    case 'log':
      console.log('Message Id:', result.promptResponseId);
      // Output: Message Id: "generated-message-id"
      break;
  }
} catch (error) {
  if (error instanceof PromptSecurityError) {
    console.error('Protection error:', error.message);
  }
}
```

## API Reference

### Configuration

Create a new instance of the client with required authentication and optional settings:

```typescript
const client = new PromptSecurity({
  appId: string;     // [Required] Your Prompt Security APP-ID used for authentication
  endpoint: string;  // [Required] API endpoint (e.g., 'https://eu.prompt.security')
  timeout?: number;  // [Optional] Request timeout in milliseconds (default: 3000)
});
```

### Methods

#### protectPrompt()

Protect prompt text by scanning for security threats using language models. Supports scanning for jailbreak, moderation, prompt hardening, and prompt injection:

```typescript
const result = await client.protectPrompt({
  prompt: string;           // [Required] The prompt text to be scanned for security threats
  systemPrompt?: string;    // [Optional] The system prompt/instructions to be used with the prompt
  metadata?: {              // [Optional] Additional context for the protection request
    promptResponseId: string;      // [Optional] (string): UUID for a single prompt/response pair. If not given, it'll be automatically created and returned in the response
    user?: string;          // [Optional] User associated with the message (e.g., "john@doe.com")
    userGroups?: string[];  // [Optional] User groups associated with the message (e.g., ["admin", "rnd"])
    conversationId?: string;// [Optional] UUID for all prompts/responses in the same conversation. If not provided, 
                           // it will be automatically created and returned in the response
    policyName?: string;    // [Optional] The policy name to use for this request
    monitorOnly?: boolean;  // [Optional] When true, only detect threats without prevention (monitoring mode)
                           // When false, actively prevent/modify threats
    ipAddress?: string;     // [Optional] The IP address of the end user for tracking and policy enforcement
    country?: string;       // [Optional] The country of the end user for geographic policy controls
    llmModel?: string;      // [Optional] The name of the language model being used (e.g., "gpt-4")
  }
});
```

#### protectMultiplePrompts()

Process multiple prompts in a single request. This is mutually exclusive with the single prompt protection - you can use either this or protectPrompt(), but not both in the same request:

```typescript
const result = await client.protectMultiplePrompts({
  prompts: string[];        // [Required] Array of prompt texts to be protected. Each prompt will be individually scanned for security threats
});
```

#### protectResponse()

Validate an LLM response text for security threats. Can be linked to a previous prompt request using promptResponseId:

```typescript
const result = await client.protectResponse({
  response: string;          // [Required] The LLM-generated response text to be validated
});
```

### Request Structure

```typescript
// Base request structure for all protection requests
interface BaseRequest {
  systemPrompt?: string;    // [Optional] The system prompt text
  metadata?: {
    promptResponseId?: string;     // [Optional] (string): UUID for a single prompt/response pair. If not given, it'll be automatically created and returned in the response
    user?: string;          // [Optional] (string): User associated with the message
    userGroups?: string[];  // [Optional] (array of string): User groups associated with the message
    conversationId?: string;// [Optional] (string): UUID for all prompts/responses in the same conversation. If not given, it'll be automatically created and returned in the response
    policyName?: string;    // [Optional] (string): The policy name to use
    monitorOnly?: boolean;  // [Optional] Detect or Prevent
    ipAddress?: string;     // [Optional] The IP address of the end user
    country?: string;       // [Optional] The country of the end user
    llmModel?: string;      // [Optional] The name of the model used
  }
}
```

### Response Structure

All protection methods return a simplified `ProtectResult` that focuses on the most essential fields for immediate use. This structure provides a consistent interface regardless of whether you're protecting prompts or responses:

```typescript
interface ProtectResult {
  action: 'log' | 'block' | 'modify'; // [Mandatory] (string): Suggested action: 'log', 'block' or 'modify'
  violations: string[] | null;        // [Optional] (array of strings): Scanners that returned an invalid verdict (e.g., ["Prompt Injection LLM Judger", "Secrets"])
  modifiedText: string | null;        // [Optional] (string): Modified text, if text was sanitized, only present if action is 'modify'
  conversationId: string;             // [Optional] (string): UUID for all prompts/responses in the same conversation. If you are sending more prompts/responses related to the same conversation, please use this id.
  latency: number;                    //  [Mandatory] (integer): Latency in milliseconds
  promptResponseId: string;                  //  [Optional] (string): originally 'prompt_response_id' - UUID for a single prompt/response pair. If you are sending the response of the prompt in another request, please use this id.
  raw: ApiResponse;                   // [Required] Complete API response containing additional fields:
                                     // - Detailed scanner findings
                                     // - Individual scanner scores and thresholds
                                     // - Per-scanner latency breakdown
                                     // - Language detection results
                                     // - Token usage statistics
                                     // - And more
}
```

Note: While the simplified `ProtectResult` interface provides the most commonly needed fields, the complete API response is always available in the `raw` field. This includes detailed information about scanner findings, scores, latency breakdowns, and other diagnostic data that might be useful for debugging or advanced use cases.

### Error Handling

**Important**: The protection methods will throw errors by default. While this might not be ideal for all monitoring systems, we've made this choice to ensure developers are aware of protection failures. You should wrap calls in try/catch blocks based on your needs:

```typescript
try {
  const result = await client.protectPrompt({...});
} catch (error) {
  if (error instanceof PromptSecurityAPIError) {
    // API issues (auth, validation, etc)
    console.error('API Error:', error.message);
  } else if (error instanceof PromptSecurityTimeoutError) {
    // Request timeout
    console.error('Timeout:', error.message);
  } else if (error instanceof PromptSecurityError) {
    // General errors
    console.error('Error:', error.message);
  }
}
```

## More Usage Examples

### Monitor-Only Mode

```typescript
const result = await client.protectPrompt({
  prompt: "User message",
  metadata: {
    monitorOnly: true,
    policyName: 'strict'
  }
});
```

### Batch Processing

```typescript
const result = await client.protectMultiplePrompts({
  prompts: [
    "First user message",
    "Second user message",
    "Third user message"
  ],
  systemPrompt: "Shared system instructions",
  metadata: {
    userGroups: ['standard'],
    conversationId: 'batch-123'
  }
});
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Lint
npm run lint
```

## Release

This package uses semantic versioning via commit messages:

### Version Bumping Commits
```bash
# Patch Release (1.0.X)
fix: message      # Bug fixes
perf: message     # Performance improvements

# Minor Release (1.X.0)
feat: message     # New features

# Major Release (X.0.0)
feat!: message            # Breaking change
fix!: message             # Breaking change
BREAKING CHANGE: message  # Breaking change anywhere in the commit body
```

### Non-Version Bumping Commits
Only these specific types are allowed:
```bash
build: message    # Changes to build system or dependencies
chore: message    # Maintenance tasks
ci: message       # CI configuration files and scripts
docs: message     # Documentation only
perf: message     # Performance improvements
refactor: message # Neither fixes a bug nor adds a feature
style: message    # Code style (formatting, semicolons, etc)
test: message     # Adding or correcting tests
```

Any other prefix will cause the commit to be ignored by semantic-release and won't appear anywhere in release notes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.