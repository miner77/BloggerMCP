import { z } from "zod";
import { revertPost } from "../blogger/bloggerClient.js";
import { summarizePost, textResult, ToolRegistrar } from "./types.js";

export const registerRevertBloggerPost: ToolRegistrar = (server) => {
  server.registerTool(
    "revert_blogger_post",
    {
      title: "Revert Blogger post to draft",
      description: "Change a published Blogger post back to draft status.",
      inputSchema: {
        postId: z.string().min(1),
        blogId: z.string().optional(),
        confirmRevert: z.literal(true).describe("Must be true to confirm reverting to draft.")
      }
    },
    async (input) => {
      const post = await revertPost({ postId: input.postId, blogId: input.blogId });

      return textResult({
        status: "post_reverted",
        post: summarizePost(post as { id?: string | null; title?: string | null; url?: string | null; status?: string | null; published?: string | null; updated?: string | null })
      });
    }
  );
};
