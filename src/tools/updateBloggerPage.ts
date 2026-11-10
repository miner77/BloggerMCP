import { z } from "zod";
import { updatePage } from "../blogger/bloggerClient.js";
import { summarizePost, textResult, ToolRegistrar } from "./types.js";

export const registerUpdateBloggerPage: ToolRegistrar = (server) => {
  server.registerTool(
    "update_blogger_page",
    {
      title: "Update Blogger page",
      description: "Patch an existing Blogger page.",
      inputSchema: {
        pageId: z.string().min(1),
        blogId: z.string().optional(),
        title: z.string().optional(),
        markdown: z.string().optional()
      }
    },
    async (input) => {
      const page = await updatePage({
        pageId: input.pageId,
        title: input.title,
        markdown: input.markdown,
        blogId: input.blogId
      });

      return textResult({
        status: "page_updated",
        page: summarizePost(page as { id?: string | null; title?: string | null; url?: string | null; status?: string | null; published?: string | null; updated?: string | null })
      });
    }
  );
};
