#!/usr/bin/env node
/**
 * MCP RAG Template Server
 *
 * This is a template for building MCP servers with RAG capabilities.
 * Customize the tools, skills, and knowledge base for your domain.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { config } from "dotenv";
import { toolDefinitions, handleToolCall } from "./tools/index.js";
import { getSkillsResources, readSkillContent } from "./utils/skills.js";

// Load environment variables
config();

const SERVER_NAME = process.env.MCP_SERVER_NAME || "mcp-rag-template";
const SERVER_VERSION = process.env.MCP_SERVER_VERSION || "1.0.0";

// Create MCP server
const server = new Server(
  {
    name: SERVER_NAME,
    version: SERVER_VERSION,
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: toolDefinitions };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const result = await handleToolCall(name, args || {});
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [{ type: "text", text: `Error: ${errorMessage}` }],
      isError: true,
    };
  }
});

// List available resources (Skills)
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return { resources: await getSkillsResources() };
});

// Read resource content
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  const content = await readSkillContent(uri);

  return {
    contents: [
      {
        uri,
        mimeType: "text/markdown",
        text: content,
      },
    ],
  };
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`${SERVER_NAME} v${SERVER_VERSION} running on stdio`);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
