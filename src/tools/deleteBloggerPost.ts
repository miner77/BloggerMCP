import { z } from "zod";
import { deletePost } from "../blogger/bloggerClient.js";
import { textResult, ToolRegistrar } from "./types.js";

export const registerDeleteBloggerPost: ToolRegistrar = (server) => {
  server.registerTool(
    "delete_blogger_post",
    {
      title: "Delete Blogger post",
      description: "Delete a Blogger post permanently.",
      inputSchema: {
        postId: z.string().min(1),
        blogId: z.string().optional()
      }
    },
    async (input) => {
      await deletePost({ postId: input.postId, blogId: input.blogId });
      return textResult({
        status: "post_deleted",
        postId: input.postId
      });
    }
  );
};
