import { z } from "zod";
import { updatePost } from "../blogger/bloggerClient.js";
import { normalizeLabels, summarizePost, textResult, ToolRegistrar } from "./types.js";

export const registerUpdateBloggerPost: ToolRegistrar = (server) => {
  server.registerTool(
    "update_blogger_post",
    {
      title: "Update Blogger post",
      description: "Patch an existing Blogger post. Does not publish drafts.",
      inputSchema: {
        postId: z.string().min(1),
        blogId: z.string().optional(),
        title: z.string().optional(),
        markdown: z.string().optional(),
        labels: z.array(z.string()).max(3).optional()
      }
    },
    async (input) => {
      const post = await updatePost({
        postId: input.postId,
        title: input.title,
        markdown: input.markdown,
        labels: normalizeLabels(input.labels),
        blogId: input.blogId
      });

      return textResult({
        status: "post_updated",
        post: summarizePost(post)
      });
    }
  );
};
