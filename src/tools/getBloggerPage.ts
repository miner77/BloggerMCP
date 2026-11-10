import { z } from "zod";
import { getPage } from "../blogger/bloggerClient.js";
import { summarizePost, textResult, ToolRegistrar } from "./types.js";

export const registerGetBloggerPage: ToolRegistrar = (server) => {
  server.registerTool(
    "get_blogger_page",
    {
      title: "Get Blogger page",
      description: "Retrieve a single Blogger page by ID.",
      inputSchema: {
        pageId: z.string().min(1),
        blogId: z.string().optional()
      }
    },
    async (input) => {
      const page = await getPage({
        pageId: input.pageId,
        blogId: input.blogId
      });

      return textResult({
        status: "ok",
        page: summarizePost(page as { id?: string | null; title?: string | null; url?: string | null; status?: string | null; published?: string | null; updated?: string | null })
      });
    }
  );
};
