---
name: be-mcp-server
description: "Scaffold an MCP server with stdio/HTTP transports, resource/tool/prompt definitions with Zod schemas"
user_invocable: true
arguments:
  - name: name
    description: "MCP server name (e.g., 'code-analysis', 'db-query')"
    required: true
  - name: capabilities
    description: "Comma-separated capabilities: tools, resources, prompts"
    required: false
  - name: transport
    description: "stdio (default), http, or both"
    required: false
---

# Scaffold MCP Server

Build a Model Context Protocol server with proper transport, schema validation, and tool/resource definitions.

## Workflow

1. **Architecture** (be-architect): Design MCP server structure
   - Define tools, resources, and prompts
   - Design input/output schemas for each capability
   - Plan transport layer (stdio for CLI, HTTP for web)
   - Write spec to `.claude/specs/be-mcp-{name}.md`

2. **Implementation** (be-implementer): Build the server
   - MCP SDK integration (@modelcontextprotocol/sdk)
   - Transport setup (StdioServerTransport / HTTP)
   - Tool handlers with proper error handling
   - Resource providers with URI templates

3. **Validation** (be-validator): Schema enforcement
   - Zod schemas for all tool inputs/outputs
   - Input sanitization for user-provided content
   - Error responses in MCP-compatible format

4. **Testing** (be-tester): Contract tests
   - Tool invocation tests
   - Resource read tests
   - Transport-level tests

## Arguments

- **name**: `$ARGUMENTS.name` — Server name
- **capabilities**: `$ARGUMENTS.capabilities` — tools, resources, prompts (default: tools)
- **transport**: `$ARGUMENTS.transport` — stdio, http, or both (default: stdio)

## MCP Server Template

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const server = new McpServer({
  name: '$ARGUMENTS.name',
  version: '1.0.0',
});

// Register tools
server.tool('tool-name', 'Description', {
  input: z.object({ query: z.string() }),
}, async ({ input }) => {
  // Implementation
  return { content: [{ type: 'text', text: 'result' }] };
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

## Execution

Start by spawning be-architect with:
```
Design an MCP server: $ARGUMENTS.name
Capabilities: ${ARGUMENTS.capabilities || "tools"}
Transport: ${ARGUMENTS.transport || "stdio"}

Requirements:
- Use @modelcontextprotocol/sdk
- Zod schemas for all tool inputs
- Proper error handling with MCP error codes
- pino logging (stderr for stdio transport)

Provide the server spec, then delegate:
1. be-implementer for server implementation
2. be-validator for input/output schemas (parallel)
3. be-tester for tool invocation tests
```
