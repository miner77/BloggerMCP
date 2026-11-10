import { z } from "zod";
import { searchPosts } from "../blogger/bloggerClient.js";
import { summarizePost, textResult, ToolRegistrar } from "./types.js";

export const registerSearchBloggerPosts: ToolRegistrar = (server) => {
  server.registerTool(
    "search_blogger_posts",
    {
      title: "Search Blogger posts",
      description: "Search Blogger posts by query string.",
      inputSchema: {
        q: z.string().min(1).describe("Search query"),
        blogId: z.string().optional(),
        fetchBodies: z.boolean().optional().default(false)
      }
    },
    async (input) => {
      const result = await searchPosts({
        q: input.q,
        blogId: input.blogId,
        fetchBodies: input.fetchBodies
      });

      return textResult({
        status: "ok",
        posts: (result.items ?? []).map(summarizePost)
      });
    }
  );
};
