import { z } from "zod";
import { storeImages } from "../image/localImageProvider.js";
import { textResult, ToolRegistrar } from "./types.js";

export const registerUploadPostImage: ToolRegistrar = (server) => {
  server.registerTool(
    "upload_post_image",
    {
      title: "Prepare post image",
      description: "Convert image URLs or local image paths into URLs that can be inserted in Blogger HTML.",
      inputSchema: {
        imageUrls: z.array(z.string()).optional(),
        imagePaths: z.array(z.string()).optional(),
        altTexts: z.array(z.string()).optional()
      }
    },
    async (input) => {
      const result = await storeImages(input);
      return textResult({ status: "ok", ...result });
    }
  );
};
