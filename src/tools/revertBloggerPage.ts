import { z } from "zod";
import { revertPage } from "../blogger/bloggerClient.js";
import { summarizePost, textResult, ToolRegistrar } from "./types.js";

export const registerRevertBloggerPage: ToolRegistrar = (server) => {
  server.registerTool(
    "revert_blogger_page",
    {
      title: "Revert Blogger page to draft",
      description: "Change a published Blogger page back to draft status.",
      inputSchema: {
        pageId: z.string().min(1),
        blogId: z.string().optional(),
        confirmRevert: z.literal(true).describe("Must be true to confirm reverting to draft.")
      }
    },
    async (input) => {
      const page = await revertPage({ pageId: input.pageId, blogId: input.blogId });

      return textResult({
        status: "page_reverted",
        page: summarizePost(page as { id?: string | null; title?: string | null; url?: string | null; status?: string | null; published?: string | null; updated?: string | null })
      });
    }
  );
};
