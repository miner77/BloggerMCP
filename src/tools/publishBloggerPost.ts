import { z } from "zod";
import { publishPost } from "../blogger/bloggerClient.js";
import { summarizePost, textResult, ToolRegistrar } from "./types.js";

export const registerPublishBloggerPost: ToolRegistrar = (server) => {
  server.registerTool(
    "publish_blogger_post",
    {
      title: "Publish Blogger post",
      description: "Explicitly publish a Blogger draft. This is never called by draft-creation tools.",
      inputSchema: {
        postId: z.string().min(1),
        blogId: z.string().optional(),
        confirmPublish: z.literal(true).describe("Must be true to confirm intentional publishing.")
      }
    },
    async (input) => {
      const post = await publishPost({ postId: input.postId, blogId: input.blogId });
      return textResult({
        status: "post_published",
        post: summarizePost(post)
      });
    }
  );
};
