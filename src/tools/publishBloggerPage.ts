import { z } from "zod";
import { publishPage } from "../blogger/bloggerClient.js";
import { summarizePost, textResult, ToolRegistrar } from "./types.js";

export const registerPublishBloggerPage: ToolRegistrar = (server) => {
  server.registerTool(
    "publish_blogger_page",
    {
      title: "Publish Blogger page",
      description: "Explicitly publish a Blogger page draft.",
      inputSchema: {
        pageId: z.string().min(1),
        blogId: z.string().optional(),
        confirmPublish: z.literal(true).describe("Must be true to confirm intentional publishing.")
      }
    },
    async (input) => {
      const page = await publishPage({ pageId: input.pageId, blogId: input.blogId });

      return textResult({
        status: "page_published",
        page: summarizePost(page as { id?: string | null; title?: string | null; url?: string | null; status?: string | null; published?: string | null; updated?: string | null })
      });
    }
  );
};
