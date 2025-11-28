/**
 * Skills (Resources) Handler
 *
 * Skills are markdown files that define your AI assistant's persona and expertise.
 * They are served as MCP Resources for context injection.
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = path.join(__dirname, "../../skills");

export interface SkillResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

/**
 * Get all available skills as MCP resources
 */
export async function getSkillsResources(): Promise<SkillResource[]> {
  if (!existsSync(SKILLS_DIR)) {
    return [];
  }

  const files = readdirSync(SKILLS_DIR).filter((f) => f.endsWith(".md"));

  return files.map((file) => {
    const name = file.replace(".md", "").replace(/_/g, " ");
    return {
      uri: `skill://${file}`,
      name: `Skill: ${name}`,
      description: `${name} expertise and guidelines`,
      mimeType: "text/markdown",
    };
  });
}

/**
 * Read skill content by URI
 */
export async function readSkillContent(uri: string): Promise<string> {
  const filename = uri.replace("skill://", "");
  const filepath = path.join(SKILLS_DIR, filename);

  if (!existsSync(filepath)) {
    throw new Error(`Skill not found: ${filename}`);
  }

  return readFileSync(filepath, "utf-8");
}

/**
 * Get all skills content combined (for system prompt)
 */
export async function getAllSkillsContent(): Promise<string> {
  if (!existsSync(SKILLS_DIR)) {
    return "";
  }

  const files = readdirSync(SKILLS_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();

  const contents = files.map((file) => {
    const filepath = path.join(SKILLS_DIR, file);
    return readFileSync(filepath, "utf-8");
  });

  return contents.join("\n\n---\n\n");
}
