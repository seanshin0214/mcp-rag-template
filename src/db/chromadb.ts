/**
 * ChromaDB Client for RAG operations
 *
 * This module handles vector storage and retrieval.
 * Customize collections for your domain knowledge.
 */

import { ChromaClient } from "chromadb";
import path from "path";

// Initialize ChromaDB client
const chromaPath = process.env.CHROMA_PATH || "./chroma-data";

let client: ChromaClient | null = null;

export async function getChromaClient(): Promise<ChromaClient> {
  if (!client) {
    client = new ChromaClient({
      path: chromaPath,
    });
  }
  return client;
}

/**
 * Search knowledge base
 *
 * @param query - Search query
 * @param collection - Collection name to search
 * @param nResults - Number of results to return
 */
export async function searchKnowledge(
  query: string,
  collection: string = "default",
  nResults: number = 5
): Promise<SearchResult[]> {
  try {
    const chromaClient = await getChromaClient();
    const col = await chromaClient.getOrCreateCollection({ name: collection });

    const results = await col.query({
      queryTexts: [query],
      nResults,
    });

    if (!results.documents?.[0]) {
      return [];
    }

    return results.documents[0].map((doc, idx) => ({
      content: doc || "",
      metadata: results.metadatas?.[0]?.[idx] || {},
      distance: results.distances?.[0]?.[idx] || 0,
    }));
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}

/**
 * Add document to knowledge base
 *
 * @param collection - Collection name
 * @param id - Document ID
 * @param content - Document content
 * @param metadata - Document metadata
 */
export async function addDocument(
  collection: string,
  id: string,
  content: string,
  metadata: Record<string, string> = {}
): Promise<void> {
  const chromaClient = await getChromaClient();
  const col = await chromaClient.getOrCreateCollection({ name: collection });

  await col.add({
    ids: [id],
    documents: [content],
    metadatas: [metadata],
  });
}

/**
 * List all collections
 */
export async function listCollections(): Promise<string[]> {
  const chromaClient = await getChromaClient();
  const collections = await chromaClient.listCollections();
  return collections.map((c: unknown) => {
    if (typeof c === "string") return c;
    if (c && typeof c === "object" && "name" in c) return (c as { name: string }).name;
    return String(c);
  });
}

// Types
export interface SearchResult {
  content: string;
  metadata: Record<string, unknown>;
  distance: number;
}
