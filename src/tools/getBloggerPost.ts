import { z } from "zod";
import { getPost } from "../blogger/bloggerClient.js";
import { summarizePost, textResult, ToolRegistrar } from "./types.js";

export const registerGetBloggerPost: ToolRegistrar = (server) => {
  server.registerTool(
    "get_blogger_post",
    {
      title: "Get Blogger post",
      description: "Retrieve a single Blogger post by ID.",
      inputSchema: {
        postId: z.string().min(1),
        blogId: z.string().optional(),
        fetchBody: z.boolean().optional().default(false)
      }
    },
    async (input) => {
      const post = await getPost({
        postId: input.postId,
        blogId: input.blogId,
        fetchBody: input.fetchBody
      });

      return textResult({
        status: "ok",
        post: summarizePost(post as { id?: string | null; title?: string | null; url?: string | null; status?: string | null; published?: string | null; updated?: string | null })
      });
    }
  );
};
