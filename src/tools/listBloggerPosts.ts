import { z } from "zod";
import { listPosts } from "../blogger/bloggerClient.js";
import { summarizePost, textResult, ToolRegistrar } from "./types.js";

const statusSchema = z.enum(["draft", "live", "scheduled"]);

export const registerListBloggerPosts: ToolRegistrar = (server) => {
  server.registerTool(
    "list_blogger_posts",
    {
      title: "List Blogger posts",
      description: "List recent Blogger posts or drafts.",
      inputSchema: {
        blogId: z.string().optional(),
        status: z.array(statusSchema).optional().describe("Defaults to draft and live."),
        maxResults: z.number().int().min(1).max(50).optional().default(10)
      }
    },
    async (input) => {
      const result = await listPosts({
        blogId: input.blogId,
        status: input.status ?? ["draft", "live"],
        maxResults: input.maxResults
      });

      return textResult({
        status: "ok",
        posts: (result.items ?? []).map(summarizePost)
      });
    }
  );
};
