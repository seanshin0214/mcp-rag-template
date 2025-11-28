# MCP RAG Template

A template for building Model Context Protocol (MCP) servers with RAG (Retrieval-Augmented Generation) capabilities using ChromaDB.

## Features

- **MCP Server**: Full implementation with tools and resources
- **RAG with ChromaDB**: Vector search for knowledge retrieval
- **Skills System**: Markdown-based persona and expertise definition
- **TypeScript**: Type-safe implementation
- **Easy Customization**: Well-organized structure for your domain

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     MCP RAG Template                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Skills (Hot Layer)      Tools (Interface)     Knowledge   │
│   ┌─────────────┐        ┌─────────────┐       (RAG Layer)  │
│   │ 01_IDENTITY │        │search_knowl.│       ┌─────────┐  │
│   │ 02_DOMAIN   │   →    │list_collect.│   →   │ChromaDB │  │
│   │ 03_METHODS  │        │get_guide    │       │Vector DB│  │
│   └─────────────┘        └─────────────┘       └─────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Clone and Setup

```bash
git clone https://github.com/seanshin0214/mcp-rag-template.git
cd mcp-rag-template

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Build
npm run build
```

### 2. Add Your Knowledge

1. Add markdown files to `knowledge/` directories
2. Add skill files to `skills/` directory
3. Run embedding: `npm run embed`

### 3. Configure Claude Desktop

Add to `claude_desktop_config.json`:

**Windows:**
```json
{
  "mcpServers": {
    "my-assistant": {
      "command": "node",
      "args": ["C:\\path\\to\\mcp-rag-template\\dist\\index.js"],
      "env": {
        "CHROMA_PATH": "C:\\path\\to\\mcp-rag-template\\chroma-data"
      }
    }
  }
}
```

**macOS/Linux:**
```json
{
  "mcpServers": {
    "my-assistant": {
      "command": "node",
      "args": ["/path/to/mcp-rag-template/dist/index.js"],
      "env": {
        "CHROMA_PATH": "/path/to/mcp-rag-template/chroma-data"
      }
    }
  }
}
```

## Project Structure

```
mcp-rag-template/
├── src/
│   ├── index.ts          # MCP server entry point
│   ├── db/
│   │   └── chromadb.ts   # ChromaDB client
│   ├── tools/
│   │   └── index.ts      # Tool definitions & handlers
│   ├── utils/
│   │   └── skills.ts     # Skills resource handler
│   └── scripts/
│       └── embed.ts      # Knowledge embedding script
├── skills/               # AI persona & expertise (Resources)
│   └── 01_IDENTITY.md
├── knowledge/            # Domain knowledge (for RAG)
│   ├── general/
│   └── guides/
├── package.json
├── tsconfig.json
└── .env.example
```

## Customization Guide

### Adding Tools

Edit `src/tools/index.ts`:

```typescript
// 1. Add tool definition
export const toolDefinitions = [
  // ... existing tools
  {
    name: "my_new_tool",
    description: "Description of what this tool does",
    inputSchema: {
      type: "object",
      properties: {
        param1: { type: "string", description: "Parameter description" }
      },
      required: ["param1"]
    }
  }
];

// 2. Add handler in handleToolCall switch
case "my_new_tool":
  return handleMyNewTool(args);

// 3. Implement handler
async function handleMyNewTool(args: Record<string, unknown>) {
  // Your implementation
}
```

### Adding Skills

Create markdown files in `skills/` directory:

```markdown
# My Domain Expertise

## Overview
Define your AI's expertise here...

## Capabilities
- Capability 1
- Capability 2

## Guidelines
How the AI should respond...
```

### Adding Knowledge

1. Create markdown files in `knowledge/` subdirectories
2. Update `EMBED_CONFIG` in `src/scripts/embed.ts`
3. Run `npm run embed`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript |
| `npm run dev` | Development with hot reload |
| `npm run start` | Run compiled server |
| `npm run embed` | Embed knowledge into ChromaDB |
| `npm run lint` | Run ESLint |
| `npm run clean` | Remove dist directory |

## Examples

### QualMaster (Qualitative Research)
https://github.com/seanshin0214/qualmaster-mcp

### QuantMaster (Quantitative Research)
https://github.com/seanshin0214/quantmaster-mcp

## License

MIT License - See [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with [Model Context Protocol](https://modelcontextprotocol.io/) and [ChromaDB](https://www.trychroma.com/)
