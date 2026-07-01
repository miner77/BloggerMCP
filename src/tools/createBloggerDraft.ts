import { z } from "zod";
import { createDraft } from "../blogger/bloggerClient.js";
import { normalizeLabels, summarizePost, textResult, ToolRegistrar } from "./types.js";

export const registerCreateBloggerDraft: ToolRegistrar = (server) => {
  server.registerTool(
    "create_blogger_draft",
    {
      title: "Create Blogger draft",
      description: "Create a Blogger draft from Markdown. Upload images manually in the Blogger editor.",
      inputSchema: {
        title: z.string().min(1),
        markdown: z.string().min(1),
        labels: z.array(z.string()).max(3).optional(),
        blogId: z.string().optional()
      }
    },
    async (input) => {
      const post = await createDraft({
        title: input.title,
        markdown: input.markdown,
        labels: normalizeLabels(input.labels),
        blogId: input.blogId
      });

      return textResult({
        status: "draft_created",
        post: summarizePost(post)
      });
    }
  );
};
