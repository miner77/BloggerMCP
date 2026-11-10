import { z } from "zod";
import { createPage } from "../blogger/bloggerClient.js";
import { summarizePost, textResult, ToolRegistrar } from "./types.js";

export const registerCreateBloggerPage: ToolRegistrar = (server) => {
  server.registerTool(
    "create_blogger_page",
    {
      title: "Create Blogger page",
      description: "Create a Blogger page from Markdown.",
      inputSchema: {
        title: z.string().min(1),
        markdown: z.string().min(1),
        blogId: z.string().optional()
      }
    },
    async (input) => {
      const page = await createPage({
        title: input.title,
        markdown: input.markdown,
        blogId: input.blogId
      });

      return textResult({
        status: "page_created",
        page: summarizePost(page as { id?: string | null; title?: string | null; url?: string | null; status?: string | null; published?: string | null; updated?: string | null })
      });
    }
  );
};
