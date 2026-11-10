import { z } from "zod";
import { deletePage } from "../blogger/bloggerClient.js";
import { textResult, ToolRegistrar } from "./types.js";

export const registerDeleteBloggerPage: ToolRegistrar = (server) => {
  server.registerTool(
    "delete_blogger_page",
    {
      title: "Delete Blogger page",
      description: "Delete a Blogger page permanently.",
      inputSchema: {
        pageId: z.string().min(1),
        blogId: z.string().optional()
      }
    },
    async (input) => {
      await deletePage({ pageId: input.pageId, blogId: input.blogId });
      return textResult({
        status: "page_deleted",
        pageId: input.pageId
      });
    }
  );
};
