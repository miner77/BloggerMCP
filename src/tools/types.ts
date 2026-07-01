import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export type ToolRegistrar = (server: McpServer) => void;

export function textResult(payload: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: typeof payload === "string" ? payload : JSON.stringify(payload, null, 2)
      }
    ]
  };
}

export function summarizePost(post: {
  id?: string | null;
  title?: string | null;
  url?: string | null;
  status?: string | null;
  published?: string | null;
  updated?: string | null;
}) {
  return {
    id: post.id,
    title: post.title,
    url: post.url,
    status: post.status,
    published: post.published,
    updated: post.updated
  };
}

export function normalizeLabels(labels?: string[], maxLabels = 3): string[] | undefined {
  if (!labels) return undefined;
  const normalized = labels
    .map((label) => label.trim())
    .filter(Boolean);
  return Array.from(new Set(normalized)).slice(0, maxLabels);
}
