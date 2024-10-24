# prompt-security-node

Unofficial Node.js SDK for [Prompt Security](https://prompt.security)'s Protection Service API.

> **Note**: This is a community-maintained package and is not officially supported by Prompt Security.

## Features

- 🛡️ Full TypeScript support with detailed types
- 🚀 Promise-based API
- ⚡ Simple, intuitive interface
- 🔍 Comprehensive error handling
- 📝 Built-in request/response validation

## Installation

```bash
npm install prompt-security-node
```

## Quick Start

```typescript
import { PromptSecurity, ProtectActions } from 'prompt-security-node';

const ps = new PromptSecurity({
  appId: 'your-app-id',
});

try {
  const result = await ps.protectPrompt({
    prompt: "User message here",
    systemPrompt: "System instructions here",
  });

  switch (result.action) {
    case ProtectActions.MODIFY:
      console.log('Modified text:', result.modifiedText);
      break;
    case ProtectActions.BLOCK:
      console.log('Content blocked:', result.violations);
      break;
    case ProtectActions.LOG:
      console.log('Content logged');
      break;
  }
} catch (error) {
  if (error instanceof PromptSecurityError) {
    console.error(`Error (${error.code}):`, error.message);
  }
}
```

## API Reference

### Configuration

Create a new instance of the SDK:

```typescript
const ps = new PromptSecurity({
  appId: string;          // Required: Your Prompt Security APP-ID
  endpoint?: string;      // Optional: API endpoint (default: 'https://eu.prompt.security/api/protect')
  timeout?: number;       // Optional: Request timeout in ms (default: 3000)
});
```

### Methods

#### protectPrompt

Protect a single prompt:

```typescript
const result = await ps.protectPrompt({
  prompt: string;           // Required: The prompt text to protect
  systemPrompt?: string;    // Optional: System prompt/instructions
  metadata?: {              // Optional: Additional metadata
    user?: string;
    userGroups?: string[];
    conversationId?: string;
    policyName?: string;
    monitorOnly?: boolean;
    ipAddress?: string;
    country?: string;
    llmModel?: string;
  }
});
```

#### protectResponse

Protect an LLM response:

```typescript
const result = await ps.protectResponse({
  response: string;         // Required: The response text to protect
  promptResponseId?: string;// Optional: ID linking to previous prompt
  metadata?: {             // Optional: Additional metadata
    // ... same as protectPrompt
  }
});
```

#### protectMultiplePrompts

Protect multiple prompts at once:

```typescript
const result = await ps.protectMultiplePrompts({
  prompts: string[];       // Required: Array of prompts to protect
  systemPrompt?: string;   // Optional: System prompt/instructions
  metadata?: {            // Optional: Additional metadata
    // ... same as protectPrompt
  }
});
```

### Response Structure

All protection methods return a `ProtectResult`:

```typescript
interface ProtectResult {
  action: 'log' | 'block' | 'modify';  // Required action
  conversationId: string;              // Conversation identifier
  latency: number;                     // Processing time in ms
  requestId: string;                   // Unique request identifier
  violations?: string[];               // Any detected violations
  modifiedText?: string;               // Modified text (if action is 'modify')
}
```

### Error Handling

The SDK throws `PromptSecurityError` for various error conditions:

```typescript
try {
  const result = await ps.protectPrompt({...});
} catch (error) {
  if (error instanceof PromptSecurityError) {
    switch (error.code) {
      case ErrorCode.INVALID_CONFIG:
        // Handle configuration errors
        break;
      case ErrorCode.NETWORK_ERROR:
        // Handle network issues
        break;
      case ErrorCode.TIMEOUT:
        // Handle timeouts
        break;
      case ErrorCode.VALIDATION_ERROR:
        // Handle validation errors
        break;
      case ErrorCode.UNEXPECTED_ERROR:
        // Handle other errors
        break;
    }
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Lint
npm run lint
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [AdirD](https://github.com/AdirD)

// .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]

    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
    - run: npm ci
    - run: npm run build
    - run: npm test
    - run: npm run lint

// .github/workflows/publish.yml
name: Publish to NPM

on:
  release:
    types: [created]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20.x'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm test
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}