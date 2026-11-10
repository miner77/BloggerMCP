import { z } from "zod";
import { listBlogsByUser } from "../blogger/bloggerClient.js";
import { textResult, ToolRegistrar } from "./types.js";

export const registerListBlogsByUser: ToolRegistrar = (server) => {
  server.registerTool(
    "list_blogs_by_user",
    {
      title: "List blogs by user",
      description: "List Blogger blogs owned by a user.",
      inputSchema: {
        userId: z.string().min(1).describe("The Google user ID")
      }
    },
    async (input) => {
      const result = await listBlogsByUser({ userId: input.userId });
      return textResult({
        status: "ok",
        blogs: (result.items ?? []).map((b) => ({
          id: b.id,
          name: b.name,
          description: b.description,
          url: b.url,
          locale: b.locale ?? undefined,
          published: b.published,
          updated: b.updated
        }))
      });
    }
  );
};
