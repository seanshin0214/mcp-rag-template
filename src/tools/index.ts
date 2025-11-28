/**
 * MCP Tools Definition
 *
 * Define your tools here. Each tool should have:
 * - name: Unique identifier
 * - description: What the tool does
 * - inputSchema: JSON Schema for parameters
 */

import { z } from "zod";
import { searchKnowledge, listCollections } from "../db/chromadb.js";

// Tool definitions for MCP
export const toolDefinitions = [
  {
    name: "search_knowledge",
    description: "Search the knowledge base for relevant information",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query",
        },
        collection: {
          type: "string",
          description: "Collection to search (optional)",
        },
        limit: {
          type: "number",
          description: "Number of results (default: 5)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "list_collections",
    description: "List all available knowledge collections",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_guide",
    description: "Get a detailed guide on a specific topic",
    inputSchema: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description: "Topic to get guide for",
        },
      },
      required: ["topic"],
    },
  },
  // Add more tools here for your domain
  // Example:
  // {
  //   name: "analyze_data",
  //   description: "Analyze data using domain-specific methods",
  //   inputSchema: { ... }
  // }
];

// Tool handlers
export async function handleToolCall(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case "search_knowledge":
      return handleSearchKnowledge(args);

    case "list_collections":
      return handleListCollections();

    case "get_guide":
      return handleGetGuide(args);

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// Handler implementations
async function handleSearchKnowledge(
  args: Record<string, unknown>
): Promise<unknown> {
  const query = args.query as string;
  const collection = (args.collection as string) || "default";
  const limit = (args.limit as number) || 5;

  const results = await searchKnowledge(query, collection, limit);

  return {
    query,
    collection,
    results: results.map((r) => ({
      content: r.content,
      relevance: 1 - r.distance, // Convert distance to relevance score
      metadata: r.metadata,
    })),
    count: results.length,
  };
}

async function handleListCollections(): Promise<unknown> {
  const collections = await listCollections();

  return {
    collections,
    count: collections.length,
  };
}

async function handleGetGuide(args: Record<string, unknown>): Promise<unknown> {
  const topic = args.topic as string;

  // Search for guide content
  const results = await searchKnowledge(topic, "guides", 3);

  if (results.length === 0) {
    return {
      topic,
      found: false,
      message: `No guide found for topic: ${topic}`,
      suggestions: [
        "Try a different search term",
        "Check available collections with list_collections",
      ],
    };
  }

  return {
    topic,
    found: true,
    content: results[0].content,
    relatedTopics: results.slice(1).map((r) => r.metadata.title || "Related"),
  };
}
