import { z } from "zod";
import { getBlog } from "../blogger/bloggerClient.js";
import { textResult, ToolRegistrar } from "./types.js";

export const registerGetBloggerBlog: ToolRegistrar = (server) => {
  server.registerTool(
    "get_blogger_blog",
    {
      title: "Get Blogger blog",
      description: "Retrieve Blogger blog metadata by blog ID.",
      inputSchema: {
        blogId: z.string().optional()
      }
    },
    async (input) => {
      const blog = await getBlog({ blogId: input.blogId });
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
