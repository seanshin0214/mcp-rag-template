#!/usr/bin/env tsx
/**
 * Knowledge Embedding Script
 *
 * Run this script to embed your markdown files into ChromaDB.
 * Usage: npm run embed
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { addDocument, getChromaClient } from "../db/chromadb.js";
import { config } from "dotenv";

config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE_DIR = path.join(__dirname, "../../knowledge");

interface EmbedConfig {
  collection: string;
  directory: string;
}

// Configure which directories map to which collections
const EMBED_CONFIG: EmbedConfig[] = [
  { collection: "default", directory: "general" },
  { collection: "guides", directory: "guides" },
  // Add more mappings for your domain
  // { collection: "methods", directory: "methods" },
  // { collection: "examples", directory: "examples" },
];

async function embedDirectory(config: EmbedConfig): Promise<number> {
  const dirPath = path.join(KNOWLEDGE_DIR, config.directory);

  if (!existsSync(dirPath)) {
    console.log(`Directory not found: ${config.directory} (skipping)`);
    return 0;
  }

  const files = readdirSync(dirPath).filter((f) => f.endsWith(".md"));
  let count = 0;

  for (const file of files) {
    const filepath = path.join(dirPath, file);
    const content = readFileSync(filepath, "utf-8");
    const id = `${config.directory}/${file}`;

    // Extract title from markdown
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : file.replace(".md", "");

    await addDocument(config.collection, id, content, {
      source: file,
      directory: config.directory,
      title,
    });

    count++;
    console.log(`  Embedded: ${id}`);
  }

  return count;
}

async function main() {
  console.log("Starting knowledge embedding...\n");

  // Initialize ChromaDB
  await getChromaClient();

  let totalCount = 0;

  for (const config of EMBED_CONFIG) {
    console.log(`Processing collection: ${config.collection}`);
    const count = await embedDirectory(config);
    totalCount += count;
    console.log(`  Added ${count} documents\n`);
  }

  console.log(`\nDone! Embedded ${totalCount} total documents.`);
}

main().catch((error) => {
  console.error("Embedding error:", error);
  process.exit(1);
});
