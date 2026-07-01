import { z } from "zod";
import { updatePost } from "../blogger/bloggerClient.js";
import { renderImageHtml } from "../image/imageStorage.js";
import { storeImages } from "../image/localImageProvider.js";
import { summarizePost, textResult, ToolRegistrar } from "./types.js";

export const registerUpdateBloggerPost: ToolRegistrar = (server) => {
  server.registerTool(
    "update_blogger_post",
    {
      title: "Update Blogger post",
      description: "Patch an existing Blogger post. Does not publish drafts.",
      inputSchema: {
        postId: z.string().min(1),
        blogId: z.string().optional(),
        title: z.string().optional(),
        markdown: z.string().optional(),
        labels: z.array(z.string()).optional(),
        imageUrls: z.array(z.string()).optional(),
        imagePaths: z.array(z.string()).optional(),
        altTexts: z.array(z.string()).optional(),
        gallery: z.boolean().optional().default(true)
      }
    },
    async (input) => {
      const imageResult = await storeImages(input);
      const post = await updatePost({
        postId: input.postId,
        title: input.title,
        markdown: input.markdown,
        labels: input.labels,
        blogId: input.blogId,
        imageHtml: renderImageHtml(imageResult.images, { gallery: input.gallery })
      });

      return textResult({
        status: "post_updated",
        post: summarizePost(post),
        images: imageResult.images,
        warnings: imageResult.warnings
      });
    }
  );
};
