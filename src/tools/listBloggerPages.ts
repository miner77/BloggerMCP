import { z } from "zod";
import { listPages } from "../blogger/bloggerClient.js";
import { summarizePost, textResult, ToolRegistrar } from "./types.js";

export const registerListBloggerPages: ToolRegistrar = (server) => {
  server.registerTool(
    "list_blogger_pages",
    {
      title: "List Blogger pages",
      description: "List recent Blogger pages.",
      inputSchema: {
        blogId: z.string().optional(),
        maxResults: z.number().int().min(1).max(50).optional().default(10)
      }
    },
    async (input) => {
      const result = await listPages({
        blogId: input.blogId,
        maxResults: input.maxResults
      });

      return textResult({
        status: "ok",
        pages: (result.items ?? []).map((p) =>
          summarizePost(p as { id?: string | null; title?: string | null; url?: string | null; status?: string | null; published?: string | null; updated?: string | null })
        )
      });
    }
  );
};
