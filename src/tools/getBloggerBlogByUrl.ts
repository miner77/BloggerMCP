import { z } from "zod";
import { getBlogByUrl } from "../blogger/bloggerClient.js";
import { textResult, ToolRegistrar } from "./types.js";

export const registerGetBloggerBlogByUrl: ToolRegistrar = (server) => {
  server.registerTool(
    "get_blogger_blog_by_url",
    {
      title: "Get Blogger blog by URL",
      description: "Retrieve Blogger blog metadata by blog URL.",
      inputSchema: {
        url: z.string().min(1).describe("The full Blogger blog URL")
      }
    },
    async (input) => {
      const blog = await getBlogByUrl({ url: input.url });
      return textResult({
        status: "ok",
        blog: {
          id: blog.id,
          name: blog.name,
          description: blog.description,
          url: blog.url,
          locale: blog.locale ?? undefined,
          published: blog.published,
          updated: blog.updated
        }
      });
    }
  );
};
