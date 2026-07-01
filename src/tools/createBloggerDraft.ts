import { z } from "zod";
import { createDraft } from "../blogger/bloggerClient.js";
import { renderImageHtml } from "../image/imageStorage.js";
import { storeImages } from "../image/localImageProvider.js";
import { normalizeLabels, summarizePost, textResult, ToolRegistrar } from "./types.js";

export const registerCreateBloggerDraft: ToolRegistrar = (server) => {
  server.registerTool(
    "create_blogger_draft",
    {
      title: "Create Blogger draft",
      description: "Create a Blogger draft from Markdown, optionally inserting image URLs or local images.",
      inputSchema: {
        title: z.string().min(1),
        markdown: z.string().min(1),
        labels: z.array(z.string()).max(3).optional(),
        blogId: z.string().optional(),
        imageUrls: z.array(z.string()).optional(),
        imagePaths: z.array(z.string()).optional(),
        altTexts: z.array(z.string()).optional(),
        gallery: z.boolean().optional().default(true)
      }
    },
    async (input) => {
      const imageResult = await storeImages(input);
      const post = await createDraft({
        title: input.title,
        markdown: input.markdown,
        labels: normalizeLabels(input.labels),
        blogId: input.blogId,
        imageHtml: renderImageHtml(imageResult.images, { gallery: input.gallery })
      });

      return textResult({
        status: "draft_created",
        post: summarizePost(post),
        images: imageResult.images,
        warnings: imageResult.warnings
      });
    }
  );
};
